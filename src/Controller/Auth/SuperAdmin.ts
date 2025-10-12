import { Request, Response } from "express"
import {
	UserLoginRequest
} from "../../Lib/DataTypes/Requests/Auth/User"
import {
	UserLoginResponse
} from "../../Lib/DataTypes/Responses/Auth/User"
import SuperAdminModel from "../../Model/SuperAdmin"
import jwt from "jsonwebtoken"
import { dbError } from "../../Lib/Utils/ErrorHandler"
import { Res } from "../../Lib/DataTypes/Common"
import { ResponseCode } from "../../Lib/Utils/ResponseCode"

const createToken = (data: Record<string, any>): string => {
	return jwt.sign(data, process.env.JWT_SECRET ?? "")
}

const create = (
	req: Request<any, any, { email: string; password: string; name: string }>,
	res: Response<Res<any>>
): void => {
	const { email, password, name } = req.body

	// Check if SuperAdmin already exists
	SuperAdminModel.findOne({ email })
		.then((existingSuperAdmin) => {
			if (existingSuperAdmin) {
				res.status(ResponseCode.DUPLICATE_KEY_ERROR).json({
					status: false,
					message: "SuperAdmin with this email already exists"
				})
				return
			}

			// Create new SuperAdmin
			const newSuperAdmin = new SuperAdminModel({
				email,
				password,
				name,
				userType: "superadmin"
			})

			newSuperAdmin.save()
				.then((savedSuperAdmin) => {
					const response: Res<any> = {
						data: {
							_id: savedSuperAdmin._id,
							email: savedSuperAdmin.email,
							name: savedSuperAdmin.name,
							userType: savedSuperAdmin.userType
						},
						status: true,
						message: "SuperAdmin created successfully"
					}
					res.status(ResponseCode.SUCCESS).json(response)
				})
				.catch((error) => {
					dbError(error, res)
				})
		})
		.catch((error) => {
			dbError(error, res)
		})
}

const login = (
	req: Request<any, any, UserLoginRequest>,
	res: Response<Res<UserLoginResponse>>
): void => {
	const { email, password } = req.body

	SuperAdminModel.findOne({ email })
		.then((result) => {
			if (result && result.comparePassword && result.comparePassword(password)) {
				const response: Res<UserLoginResponse> = {
					data: {
						token: createToken({
							_id: result._id,
							email: result.email,
							type: result.userType
						}),
						userData: {
							_id: result._id,
							email: result.email,
							userType: result.userType,
							image: result.image,
							name: result.name
						}
					},
					status: true,
					message: "SuperAdmin login successful"
				}
				res.status(ResponseCode.SUCCESS).json(response)
			} else {
				res.status(ResponseCode.AUTH_ERROR).json({
					status: false,
					message: "Invalid credentials or SuperAdmin not found"
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}

const SuperAdminAuthController = {
	create,
	login
}

export default SuperAdminAuthController
