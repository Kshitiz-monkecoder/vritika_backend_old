import { Request, Response } from "express"
import {
	SalesPersonCreateRequests,
	SalesPersonOtpRequests,
	SalesPersonVerifyOtpRequests
} from "../../Lib/DataTypes/Requests/Auth/SalesPerson"
import { Res } from "../../Lib/DataTypes/Common"
import { ResponseCode } from "../../Lib/Utils/ResponseCode"
import { dbError, InputValidator } from "../../Lib/Utils/ErrorHandler"
import { configDotenv } from "dotenv"
import SalesPersonModel from "../../Model/SalesPerson"
import { CreateToken } from "../../Lib/Utils/Middleware"
import mongoose from "mongoose"
import { UserLoginResponse } from "../../Lib/DataTypes/Responses/Auth/User"
import OTPVerificationModel from "../../Model/OTPverification"
import { SendOTPwhatsApp } from "../../Lib/Utils/AuthOtp"

configDotenv()


export const SalesPersonOtpSent = (
	req: Request<any, any, SalesPersonOtpRequests>,
	res: Response<Res>
) => {
	InputValidator(req.body, {
		phoneNumber: "required|string"
	})
		.then(() => {
			const { phoneNumber } = req.body
			SendOTPwhatsApp(phoneNumber)
				.then(() => {
					res
						.status(ResponseCode.SUCCESS)
						.json({ status: true, message: "OTP sent successfully" })
				})
				.catch((error) => {
					res
						.status(ResponseCode.SERVER_ERROR)
						.json({ status: false, message: "Error sending OTP", error })
				})
		})
		.catch((error) => {
			res.status(ResponseCode.VALIDATION_ERROR).json({
				status: false,
				message: error
			})
		})
}

export const SalesPersonVerifyOtp = (
	req: Request<any, any, SalesPersonVerifyOtpRequests>,
	res: Response<Res>
) => {
	InputValidator(req.body, {
		phoneNumber: "required|string",
		otp: "required|string"
	})
		.then(() => {
			const { phoneNumber, otp } = req.body
			console.log("phoneNumber", phoneNumber, otp)
			OTPVerificationModel.findOne({
				otp,
				phoneNumber,
				status: true
			})
				.then((response) => {
					if (response) {
						response.updateOne({
							$set: {
								status: false
							}
						})
						SalesPersonLogin(phoneNumber, res)
					} else {
						res.status(ResponseCode.AUTH_ERROR).json({
							status: false,
							message: "Invalid otp. please check your code and try again"
						})
					}
				})
				.catch((error) => {
					res
						.status(ResponseCode.SERVER_ERROR)
						.json({ status: false, message: "Error sending OTP", error })
				})
		})
		.catch((error) => {
			res.status(ResponseCode.VALIDATION_ERROR).json({
				status: false,
				message: error
			})
		})
}

const SalesPersonLogin = (phoneNumber: string, res: Response<Res<UserLoginResponse>>) => {
	SalesPersonModel.findOne({ phoneNumber })
		.then((then) => {
			if (then) {
				const token = CreateToken(
					{
						_id: then._id,
						phoneNumber: phoneNumber
					},
					"sales-person"
				)

				const response: Res<UserLoginResponse> = {
					data: {
						token,
						userData: {
							phoneNumber: then.phoneNumber,
							selfie: then.selfie,
							name: then.name
						}
					},
					status: true,
					message: "Login Success"
				}
				res.status(ResponseCode.SUCCESS).json(response)
			} else {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "OTP Verify successfully",
					data: {
						userData: {
							phoneNumber: phoneNumber
						}
					}
				})
			}
		})
		.catch(() => {
			res.status(ResponseCode.SUCCESS).json({
				status: true,
				message: "OTP Verify successfully",
				data: {
					userData: {
						phone: phoneNumber
					}
				}
			})
		})
}

export const CreateSalesPerson = (
	req: Request<any, any, SalesPersonCreateRequests>,
	res: Response<Res<UserLoginResponse>>
) => {
	try {
		const _id = new mongoose.Types.ObjectId()
		const token = CreateToken(
			{
				_id,
				phoneNumber: req.body.phoneNumber
			},
			"sales-person"
		)

		const ModelData = new SalesPersonModel({ ...req.body, token })
		ModelData.save()
			.then((userData) => {
				const response: Res<UserLoginResponse> = {
					data: {
						token,
						userData: {
							phoneNumber: userData.phoneNumber,
							selfie: userData.selfie,
							name: userData.name
						}
					},
					status: true,
					message: "Success"
				}
				res.status(ResponseCode.SUCCESS).json(response)
			})
			.catch((error) => {
				dbError(error, res)
			})
	} catch (error: any) {
		res.status(ResponseCode.VALIDATION_ERROR).json({
			status: false,
			message: error
		})
	}
}
