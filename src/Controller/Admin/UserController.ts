import { Request, Response } from "express"
import UserModel from "../../Model/User"
import { ResponseCode } from "../../Lib/Utils/ResponseCode" // Adjust the path according to your structure
import { dbError, InputValidator } from "../../Lib/Utils/ErrorHandler"
import { UserRegisterRequest } from "../../Lib/DataTypes/Requests/Auth/User"
import passwordHash from "password-hash"
import { GenerateUniqueReferralCode } from "../../Lib/Utils/ReferralCode"

// Add a new user
export const AddUser = (
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
			const newUser = new UserModel({
				...req.body,
				code
			})
			
			if (req.body.password) newUser.password = passwordHash.generate(req.body.password)				

			newUser
				.save()
				.then((user) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						data: user,
						message: "User created successfully"
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

// Update an existing user by ID
export const UpdateUser = (
	req: Request<{ id: string }, any, UserRegisterRequest>,
	res: Response
): void => {
	const { id } = req.params

	InputValidator(req.body, {
		firstName: "string",
		lastName: "string",
		type: "string",
		email: "email",
		password: "string"
	})
		.then(() => {
			const updatedData = {
				...req.body
			}

			// Only hash the password if it's being updated
			if (updatedData.password) {
				updatedData.password = passwordHash.generate(updatedData.password)
			}

			UserModel.findByIdAndUpdate(id, updatedData, { new: true })
				.then((user) => {
					if (user) {
						res.status(ResponseCode.SUCCESS).json({
							status: true,
							data: user,
							message: "User updated successfully"
						})
					} else {
						res.status(ResponseCode.VALIDATION_ERROR).json({
							status: false,
							message: "User not found"
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

// Retrieve all users
export const GetAllUsers = (_req: Request, res: Response): void => {
	UserModel.find({ userType: "Admin" })
		.then((users) => {
			res.status(ResponseCode.SUCCESS).json({
				status: true,
				data: users,
				message: "Users retrieved successfully"
			})
		})
		.catch((error) => {
			dbError(error, res)
		})
}

// Retrieve a single user by ID
export const GetUserById = (req: Request<{ id: string }>, res: Response): void => {
	const { id } = req.params

	UserModel.findById(id)
		.then((user) => {
			if (user) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: user,
					message: "User retrieved successfully"
				})
			} else {
				res.status(ResponseCode.VALIDATION_ERROR).json({
					status: false,
					message: "User not found"
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}

// Delete a user by ID
export const DeleteUser = (req: Request<{ id: string }>, res: Response): void => {
	const { id } = req.params

	UserModel.findByIdAndDelete(id)
		.then((deletedUser) => {
			if (deletedUser) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: deletedUser,
					message: "User deleted successfully"
				})
			} else {
				res.status(ResponseCode.VALIDATION_ERROR).json({
					status: false,
					message: "User not found"
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}
