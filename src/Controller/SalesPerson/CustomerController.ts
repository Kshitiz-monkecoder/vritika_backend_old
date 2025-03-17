import { Request, Response } from "express"
import { dbError, InputValidator } from "../../Lib/Utils/ErrorHandler"
import { Res } from "../../Lib/DataTypes/Common"
import { ResponseCode } from "../../Lib/Utils/ResponseCode"
import {
	CustomerGroupModelDataType,
	CustomerModelDataType
} from "../../Lib/DataTypes/Models/Customer"
import { CustomerRequestsDataType } from "../../Lib/DataTypes/Requests/Customer"
import CustomerModel from "../../Model/Customer"
import CustomerGroupModel from "../../Model/CustomerGroup"
import CustomerSubGroupModel from "../../Model/CustomerSubGroup"
import mongoose from "mongoose"
import CustomeSegmentModel from "../../Model/CustomeSegment"
import { configDotenv } from "dotenv"
import { SalesPersonVerifyOtpRequests } from "../../Lib/DataTypes/Requests/Auth/SalesPerson"
import { SendOTPwhatsApp } from "../../Lib/Utils/AuthOtp"
import OTPVerificationModel from "../../Model/OTPverification"

configDotenv()

// Add a new customer
export const CreateCustomer = (
	req: Request<any, any, CustomerRequestsDataType>,
	res: Response<Res<CustomerModelDataType>>
): void => {
	InputValidator(req.body, {
		customerPhoneNo: "required|string",
		customerContactName: "required|string",
		leadId: "required|string",
		customerGroup: "required|string",
		customerSubGroup: "required|string",
		segment: "required|string",
		proposalDate: "required|string",
		// proposal: "required|string",
		title: "required|string|in:Mr.,Ms.,Mrs.,Dr.",
		// emailId: "required|string|email",
		customerAddress: "required|string",
		state: "required|string",
		district: "required|string",
		pinCode: "required|string"
	})
		.then(() => {
			const customer = new CustomerModel({
				...req.body,
				salesPersonId: req.User?._id
			})
			customer
				.save()
				.then((savedCustomer) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						data: savedCustomer,
						message: "Customer OTP sent successfully"
					})
					SendOTPwhatsApp(
						`91${savedCustomer.customerPhoneNo}`,
						"customerNumberVerification"
					)
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

export const CustomerVerifyOtp = (
	req: Request<any, any, SalesPersonVerifyOtpRequests>,
	res: Response<Res>
) => {
	InputValidator(req.body, {
		phoneNumber: "required|string",
		otp: "required|string",
		_id: "required|string"
	})
		.then(() => {
			const { phoneNumber, otp } = req.body
			console.log("otp", otp, `91${phoneNumber},`)
			OTPVerificationModel.findOne({
				otp: Number(otp),
				phoneNumber: `91${phoneNumber}`,
				status: true,
				type: "customerNumberVerification"
			})
				.then((response) => {
					if (response) {
						CustomerModel.findById(req.body._id)
							.then(async (data) => {
								if (data) {
									await data.updateOne({
										$set: {
											verify: true
										}
									})
									await response.updateOne({
										$set: {
											status: false
										}
									})
									res.status(ResponseCode.SUCCESS).json({
										status: true,
										message: "Customer OTP Verify successfully"
									})
								} else {
									res.status(ResponseCode.AUTH_ERROR).json({
										status: false,
										message: "No Customer Found, please check try again"
									})
								}
							})
							.catch(() => {
								res.status(ResponseCode.AUTH_ERROR).json({
									status: false,
									message: "Invalid otp. please check your code and try again"
								})
							})
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

// Update an existing customer by ID
export const UpdateCustomer = (
	req: Request<{ id: string }, any, CustomerRequestsDataType>,
	res: Response<Res<CustomerModelDataType>>
): void => {
	InputValidator(req.body, {
		leadId: "string",
		customerPhoneNo: "string",
		customerGroup: "string",
		customerSubGroup: "string",
		segment: "string",
		proposalDate: "string",
		proposal: "string",
		title: "string|in:Mr.,Ms.,Mrs.,Dr.",
		customerContactName: "string",
		emailId: "string|email",
		customerAddress: "string",
		state: "string",
		district: "string",
		pinCode: "string"
	})
		.then(() => {
			const { id } = req.params
			const customerData = req.body

			CustomerModel.findByIdAndUpdate(id, customerData, { new: true })
				.then((updatedCustomer) => {
					if (updatedCustomer) {
						res.status(ResponseCode.SUCCESS).json({
							status: true,
							data: updatedCustomer,
							message: "Customer updated successfully"
						})
					} else {
						res.status(ResponseCode.VALIDATION_ERROR).json({
							status: false,
							message: "Customer not found"
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

// Get all customers
export const GetAllCustomers = (
	_req: Request,
	res: Response<Res<CustomerModelDataType[]>>
): void => {
	CustomerModel.find({
		state: true,
		salesPersonId: new mongoose.Types.ObjectId(_req.User?._id)
	})
		.then((customers) => {
			res.status(ResponseCode.SUCCESS).json({
				status: true,
				data: customers,
				message: "Customers retrieved successfully"
			})
		})
		.catch((error) => {
			dbError(error, res)
		})
}

// Get a single customer by ID
export const GetCustomerById = (
	req: Request<{ id: string }>,
	res: Response<Res<CustomerModelDataType>>
): void => {
	const { id } = req.params

	CustomerModel.findById(id)
		.then((customer) => {
			if (customer) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: customer,
					message: "Customer retrieved successfully"
				})
			} else {
				res.status(ResponseCode.VALIDATION_ERROR).json({
					status: false,
					message: "Customer not found"
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}

// Delete a customer by ID
export const DeleteCustomer = (
	req: Request<{ id: string }>,
	res: Response<Res<null | CustomerModelDataType>>
): void => {
	const { id } = req.params

	CustomerModel.findByIdAndDelete(id)
		.then((deletedCustomer) => {
			if (deletedCustomer) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: deletedCustomer,
					message: "Customer deleted successfully"
				})
			} else {
				res.status(ResponseCode.VALIDATION_ERROR).json({
					status: false,
					message: "Customer not found"
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}

export const GetAllCustomerGroup = (
	req: Request,
	res: Response<Res<CustomerGroupModelDataType[]>>
) => {
	CustomerGroupModel.find({})
		.then((customerGroups) => {
			res.status(ResponseCode.SUCCESS).json({
				status: true,
				data: customerGroups,
				message: "Customer Groups retrieved successfully"
			})
		})
		.catch((error) => {
			dbError(error, res)
		})
}

export const GetAllCustomerSubGroup = (
	req: Request<any, any, { group_id: string }>,
	res: Response<Res<CustomerGroupModelDataType[]>>
) => {
	InputValidator(req.body, {
		group_id: "string|required"
	})
		.then(() => {
			CustomerSubGroupModel.find({
				group_id: new mongoose.Types.ObjectId(req.body.group_id)
			})
				.then((customerSubGroups) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						data: customerSubGroups,
						message: "Customer SubGroup retrieved successfully"
					})
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

export const GetAllCustomerSegment = (
	req: Request<any, any, { sub_group_id: string }>,
	res: Response<Res<CustomerGroupModelDataType[]>>
) => {
	InputValidator(req.body, {
		sub_group_id: "string|required"
	})
		.then(() => {
			CustomeSegmentModel.find({
				sub_group_id: new mongoose.Types.ObjectId(req.body.sub_group_id)
			})
				.then((customerSegment) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						data: customerSegment,
						message: "Customer Segment retrieved successfully"
					})
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

// Get customers created on a specific date
export const GetCustomersByDate = (
	req: Request<any, any, { date: string }>,
	res: Response<Res<CustomerModelDataType[]>>
): void => {
	InputValidator(req.body, {
		date: "required|string"
	})
		.then(() => {
			const { date } = req.body
			const startDate = new Date(date)
			const endDate = new Date(date)
			endDate.setDate(endDate.getDate() + 1)

			CustomerModel.aggregate([
				{
					$match: {
						salesPersonId: new mongoose.Types.ObjectId(req.User?._id)
					}
				},
				{
					$match: {
						createdAt: {
							$gte: startDate,
							$lt: endDate
						}
					}
				}
			])
				.then((customers) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						data: customers,
						message: "Customers retrieved successfully"
					})
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
