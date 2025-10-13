import { Request, Response } from "express"
import UserModel from "../../Model/User"
import { ResponseCode } from "../../Lib/Utils/ResponseCode"
import { dbError, InputValidator } from "../../Lib/Utils/ErrorHandler"
import { UserRegisterRequest } from "../../Lib/DataTypes/Requests/Auth/User"
import passwordHash from "password-hash"
import { GenerateUniqueReferralCode } from "../../Lib/Utils/ReferralCode"

// SuperAdmin: Add a new Admin
export const AddAdmin = (
	req: Request<any, any, UserRegisterRequest>,
	res: Response
): void => {
	InputValidator(req.body, {
		name: "required|string",
		email: "required|email",
		phone: "required|string"
	})
		.then(async () => {
			const code = await GenerateUniqueReferralCode(8)
			
			// Get SuperAdmin ID from authenticated user (from middleware)
			const superAdminId = (req as any).user?._id
			
			const newAdmin = new UserModel({
				...req.body,
				code,
				userType: "Admin",
				createdBy: superAdminId // Reference to SuperAdmin
			})
			
			if (req.body.password) {
				newAdmin.password = passwordHash.generate(req.body.password)
			}

			newAdmin
				.save()
				.then((admin) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						data: admin,
						message: "Admin created successfully"
					})
				})
				.catch((error) => {
					dbError(error, res)
				})
		})
		.catch((error) => {
			console.log("error", error)
			res.status(ResponseCode.VALIDATION_ERROR).json({
				status: false,
				message: error
			})
		})
}

// SuperAdmin: Update an Admin by ID
export const UpdateAdmin = (
	req: Request<{ id: string }, any, UserRegisterRequest>,
	res: Response
): void => {
	const { id } = req.params

	InputValidator(req.body, {
		name: "string",
		email: "email",
		phone: "string"
	})
		.then(() => {
			const updatedData = {
				...req.body
			}

			// Only hash the password if it's being updated
			if (updatedData.password) {
				updatedData.password = passwordHash.generate(updatedData.password)
			}

			// Get SuperAdmin ID from authenticated user
			const superAdminId = (req as any).user?._id

			// Only update if this admin was created by this SuperAdmin
			UserModel.findOneAndUpdate(
				{ _id: id, createdBy: superAdminId },
				updatedData,
				{ new: true }
			)
				.then((admin) => {
					if (admin) {
						res.status(ResponseCode.SUCCESS).json({
							status: true,
							data: admin,
							message: "Admin updated successfully"
						})
					} else {
						res.status(ResponseCode.NOT_FOUND_ERROR).json({
							status: false,
							message: "Admin not found or you don't have permission to update this admin"
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
				message: error
			})
		})
}

// SuperAdmin: Get all Admins created by this SuperAdmin
export const GetAllAdmins = (req: Request, res: Response): void => {
	// Get SuperAdmin ID from authenticated user
	const superAdminId = (req as any).user?._id

	UserModel.find({ userType: "Admin", createdBy: superAdminId })
		.select("-password -token")
		.populate("createdBy", "name email")
		.then((admins) => {
			res.status(ResponseCode.SUCCESS).json({
				status: true,
				data: admins,
				message: "Admins retrieved successfully"
			})
		})
		.catch((error) => {
			dbError(error, res)
		})
}

// SuperAdmin: Get a single Admin by ID
export const GetAdminById = (req: Request<{ id: string }>, res: Response): void => {
	const { id } = req.params
	const superAdminId = (req as any).user?._id

	UserModel.findOne({ _id: id, createdBy: superAdminId })
		.select("-password -token")
		.populate("createdBy", "name email")
		.then((admin) => {
			if (admin) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: admin,
					message: "Admin retrieved successfully"
				})
			} else {
				res.status(ResponseCode.NOT_FOUND_ERROR).json({
					status: false,
					message: "Admin not found or you don't have permission"
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}

// SuperAdmin: Delete an Admin by ID
export const DeleteAdmin = (req: Request<{ id: string }>, res: Response): void => {
	const { id } = req.params
	const superAdminId = (req as any).user?._id

	UserModel.findOneAndDelete({ _id: id, createdBy: superAdminId })
		.then((deletedAdmin) => {
			if (deletedAdmin) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: deletedAdmin,
					message: "Admin deleted successfully"
				})
			} else {
				res.status(ResponseCode.NOT_FOUND_ERROR).json({
					status: false,
					message: "Admin not found or you don't have permission"
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}
