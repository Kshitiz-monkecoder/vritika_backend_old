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
			const salesPerson = new SalesPersonModel({ ...req.body })

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

			SalesPersonModel.findByIdAndUpdate(id, req.body, { new: true })
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
							message: "SalesPerson not found",
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

// Get all SalesPersons
export const GetAllSalesPersons = (_req: Request, res: Response<Res<SalesPersonModelDataType[]>>): void => {
	SalesPersonModel.aggregate([
		{
			$project: {
				token: 0
			}
		}
	])
		.then((salesPersons) => {
			res.status(ResponseCode.SUCCESS).json({
				status: true,
				data: salesPersons,
				message: "SalesPersons retrieved successfully",
			})
		})
		.catch((error) => {
			dbError(error, res)
		})
}

// Retrieve a single SalesPerson by ID
export const GetSalesPersonById = (
	req: Request<{ id: string }>,
	res: Response<Res<SalesPersonModelDataType>>
): void => {
	const { id } = req.params

	SalesPersonModel.findById(id)
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
					message: "SalesPerson not found",
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

	SalesPersonModel.findByIdAndDelete(id)
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
					message: "SalesPerson not found",
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}
