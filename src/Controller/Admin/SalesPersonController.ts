import { Request, Response } from "express"
import { Res } from "../../Lib/DataTypes/Common" // Assuming this is your custom response type
import { ResponseCode } from "../../Lib/Utils/ResponseCode" // Custom response codes utility
import { dbError, InputValidator } from "../../Lib/Utils/ErrorHandler" // Error handling utils
import { SalesPersonModelDataType } from "../../Lib/DataTypes/Models/SalesPerson"
import { SalesPersonRequestDataType } from "../../Lib/DataTypes/Requests/Admin/SalesPerson"
import SalesPersonModel from "../../Model/SalesPerson"

// Add a new SalesPerson
export const AddSalesPerson = async (
	req: Request<any, any, SalesPersonRequestDataType>,
	res: Response<Res<SalesPersonModelDataType>>
): Promise<void> => {
	InputValidator(req.body, {
		name: "required|string",
		phoneNumber: "required|string",
		email: "required|string|email",
		address: "required|string",
		selfie: "required|string",
		aadharCardNumber: "required|string",
		aadharCardFront: "required|string",
		aadharCardBack: "required|string",
		panCardNumber: "required|string",
		panCardFront: "required|string",
		bankAccountNumber: "required|string",
		bankIfscCode: "required|string",
		bankAccountName: "required|string",
		cancelChequePhoto: "required|string",
		status: "required|string|in:Inactive,Active,Pending"
	})
		.then(() => {
			// Get Admin ID from authenticated user
			const adminId = (req as any).user?._id
			
			const salesPerson = new SalesPersonModel({ 
				...req.body,
				createdBy: adminId, // Reference to Admin who created this SalesPerson
				createdByType: "User", // Admin is of type "User"
				level: 1, // First level - created by Admin
				parentSalesPerson: null, // No parent since created by Admin
				adminId: adminId // Admin who owns this entire hierarchy
			})

			salesPerson
				.save()
				.then((savedSalesPerson) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						data: savedSalesPerson,
						message: "SalesPerson created successfully",
					})
				})
				.catch((error) => {
					dbError(error, res)
				})
		})
		.catch((error) => {
			res.status(ResponseCode.VALIDATION_ERROR).json({
				status: false,
				message: error,
			})
		})
}

// Update an existing SalesPerson by ID
export const UpdateSalesPerson = (
	req: Request<{ id: string }, any, Partial<SalesPersonRequestDataType>>,
	res: Response<Res<SalesPersonModelDataType>>
): void => {
	InputValidator(req.body, {
		name: "string",
		phoneNumber: "string",
		email: "string|email",
		address: "string",
		selfie: "string",
		aadharCardNumber: "string",
		aadharCardFront: "string",
		aadharCardBack: "string",
		panCardNumber: "string",
		panCardFront: "string",
		bankAccountNumber: "string",
		bankIfscCode: "string",
		bankAccountName: "string",
		cancelChequePhoto: "string",
		status: "string|in:Inactive,Active,Pending"
	})
		.then(() => {
			const { id } = req.params
			const adminId = (req as any).user?._id

			// Only update if this SalesPerson belongs to this Admin's hierarchy
			SalesPersonModel.findOneAndUpdate(
				{ _id: id, adminId: adminId },
				req.body,
				{ new: true }
			)
				.then((updatedSalesPerson) => {
					if (updatedSalesPerson) {
						res.status(ResponseCode.SUCCESS).json({
							status: true,
							data: updatedSalesPerson,
							message: "SalesPerson updated successfully",
						})
					} else {
						res.status(ResponseCode.NOT_FOUND_ERROR).json({
							status: false,
							message: "SalesPerson not found or you don't have permission",
						})
					}
				})
				.catch((error) => {
					dbError(error, res)
				})
		})
		.catch((error) => {
			res.status(ResponseCode.VALIDATION_ERROR).json({
				status: false,
				message: error,
			})
		})
}

// Get all SalesPersons created by this Admin (including all levels in hierarchy)
export const GetAllSalesPersons = async (req: Request, res: Response<Res<SalesPersonModelDataType[]>>): Promise<void> => {
	const adminId = (req as any).user?._id

	try {
		// Get all SalesPersons that belong to this Admin's hierarchy (using adminId)
		const allSalesPersons = await SalesPersonModel.find({
			adminId: adminId // Filter by adminId - much simpler and efficient!
		})
			.select("-token")
			.populate("parentSalesPerson", "name email level")
			.populate("createdBy", "name email")
			.sort({ level: 1, createdAt: 1 })

		res.status(ResponseCode.SUCCESS).json({
			status: true,
			data: allSalesPersons,
			message: `SalesPersons retrieved successfully (${allSalesPersons.length} total across all levels)`,
		})
	} catch (error) {
		dbError(error, res)
	}
}

// Retrieve a single SalesPerson by ID
export const GetSalesPersonById = (
	req: Request<{ id: string }>,
	res: Response<Res<SalesPersonModelDataType>>
): void => {
	const { id } = req.params
	const adminId = (req as any).user?._id

	// Only get if this SalesPerson belongs to this Admin's hierarchy
	SalesPersonModel.findOne({ _id: id, adminId: adminId })
		.populate("parentSalesPerson", "name email level")
		.populate("createdBy", "name email")
		.then((salesPerson) => {
			if (salesPerson) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: salesPerson,
					message: "SalesPerson retrieved successfully",
				})
			} else {
				res.status(ResponseCode.NOT_FOUND_ERROR).json({
					status: false,
					message: "SalesPerson not found or you don't have permission",
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}

// Delete a SalesPerson by ID
export const DeleteSalesPerson = (
	req: Request<{ id: string }>,
	res: Response<Res<null | SalesPersonModelDataType>>
): void => {
	const { id } = req.params
	const adminId = (req as any).user?._id

	// Only delete if this SalesPerson belongs to this Admin's hierarchy
	SalesPersonModel.findOneAndDelete({ _id: id, adminId: adminId })
		.then((deletedSalesPerson) => {
			if (deletedSalesPerson) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: deletedSalesPerson,
					message: "SalesPerson deleted successfully",
				})
			} else {
				res.status(ResponseCode.NOT_FOUND_ERROR).json({
					status: false,
					message: "SalesPerson not found or you don't have permission",
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}

// Admin: Get SalesPerson Hierarchy Tree
export const GetSalesPersonHierarchyTree = async (
	req: Request,
	res: Response<Res<any>>
): Promise<void> => {
	const adminId = (req as any).user?._id

	try {
		// Get all level 1 SalesPersons created by this Admin
		const hierarchyTree = await SalesPersonModel.aggregate([
			{
				$match: {
					adminId: adminId,
					level: 1
				}
			},
			{
				$graphLookup: {
					from: "salespersons",
					startWith: "$_id",
					connectFromField: "_id",
					connectToField: "parentSalesPerson",
					as: "descendants",
					maxDepth: 4, // Max depth is 4 (Level 1 → Level 5)
					depthField: "depth"
				}
			},
			{
				$project: {
					token: 0,
					password: 0,
					"descendants.token": 0,
					"descendants.password": 0
				}
			}
		])

		res.status(ResponseCode.SUCCESS).json({
			status: true,
			data: hierarchyTree,
			message: "SalesPerson hierarchy tree retrieved successfully (Max 5 levels)"
		})
	} catch (error) {
		dbError(error, res)
	}
}
