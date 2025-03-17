import { Request, Response } from "express"
import { dbError, InputValidator } from "../../Lib/Utils/ErrorHandler"
import RoleCommissionModel from "../../Model/RoleCommissionModel"
import { ResponseCode } from "../../Lib/Utils/ResponseCode"
import { Res } from "../../Lib/DataTypes/Common"

// Add a new role commission
export const AddRoleCommission = (req: Request, res: Response<Res>): void => {
	InputValidator(req.body, {
		roleName: "required|string",
		commission: "required|number",
		status: "required|string"
	})
		.then(() => {
			const newRoleCommission = new RoleCommissionModel(req.body)
			newRoleCommission
				.save()
				.then((data) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						data,
						message: "Role commission created successfully"
					})
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => {
			res.status(ResponseCode.VALIDATION_ERROR).json({ status: false, message: error })
		})
}

// Get all role commissions
export const GetAllRoleCommissions = (_req: Request, res: Response<Res>): void => {
	RoleCommissionModel.find()
		.then((data) => {
			res.status(ResponseCode.SUCCESS).json({
				status: true,
				data,
				message: "Role commissions retrieved successfully"
			})
		})
		.catch((error) => dbError(error, res))
}

// Get a single role commission by ID
export const GetRoleCommissionById = (
	req: Request<{ id: string }>,
	res: Response<Res>
): void => {
	RoleCommissionModel.findById(req.params.id)
		.then((data) => {
			if (data) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data,
					message: "Role commission retrieved successfully"
				})
			} else {
				res
					.status(ResponseCode.NOT_FOUND_ERROR)
					.json({ status: false, message: "Role commission not found" })
			}
		})
		.catch((error) => dbError(error, res))
}

// Update a role commission by ID
export const UpdateRoleCommission = (
	req: Request<{ id: string }>,
	res: Response<Res>
): void => {
	InputValidator(req.body, {
		roleName: "string",
		commission: "number",
		status: "string"
	})
		.then(() => {
			RoleCommissionModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
				.then((data) => {
					if (data) {
						res.status(ResponseCode.SUCCESS).json({
							status: true,
							data,
							message: "Role commission updated successfully"
						})
					} else {
						res
							.status(ResponseCode.NOT_FOUND_ERROR)
							.json({ status: false, message: "Role commission not found" })
					}
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => {
			res.status(ResponseCode.VALIDATION_ERROR).json({ status: false, message: error })
		})
}

// Delete a role commission by ID
export const DeleteRoleCommission = (
	req: Request<{ id: string }>,
	res: Response<Res>
): void => {
	RoleCommissionModel.findByIdAndDelete(req.params.id)
		.then((data) => {
			if (data) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data,
					message: "Role commission deleted successfully"
				})
			} else {
				res
					.status(ResponseCode.NOT_FOUND_ERROR)
					.json({ status: false, message: "Role commission not found" })
			}
		})
		.catch((error) => dbError(error, res))
}
