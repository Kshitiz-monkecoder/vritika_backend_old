import { Request, Response } from "express"
import UserModel from "../../Model/User"
import { Res } from "../../Lib/DataTypes/Common"
import { UserModelType } from "../../Lib/DataTypes/Models/User"
import mongoose, { Document } from "mongoose"
import SalesPersonModel from "../../Model/SalesPerson"
import { SalesPersonModelDataType } from "../../Lib/DataTypes/Models/SalesPerson"
import CustomerModel from "../../Model/Customer"
import { CustomerModelDataType } from "../../Lib/DataTypes/Models/Customer"

export const GetAllAdmins = (
	req: Request,
	res: Response<Res<UserModelType<Document>[]>>
): void => {
	UserModel.aggregate([
		{ $match: { userType: "Admin" } },
		{ $project: { __v: 0, token: 0 } }
	])
		.then((admins) => {
			res.status(200).json({
				status: true,
				data: admins,
				message: "Admins retrieved successfully"
			})
		})
		.catch((error) => {
			res.status(500).json({ status: false, message: "Error retrieving admins", error })
		})
}

export const GetSalesPersonByAdmin = (
	req: Request<{ id: string }>,
	res: Response<Res<SalesPersonModelDataType[]>>
): void => {
	const adminId = req.params.id

	UserModel.findOne({ _id: new mongoose.Types.ObjectId(adminId), userType: "Admin" })
		.then((admin) => {
			if (!admin) {
				return res.status(404).json({ status: false, message: "Admin not found" })
			}

			SalesPersonModel.aggregate([
				{ $match: { referralCode: admin.code } },
				{
					$project: {
						token: 0,
						__v: 0
					}
				}
			])
				.then((salesPerson) => {
					if (!salesPerson) {
						return res
							.status(404)
							.json({ status: false, message: "Salesperson not found" })
					}

					res.status(200).json({
						status: true,
						data: salesPerson,
						message: "Salesperson retrieved successfully"
					})
				})
				.catch((error) => {
					res
						.status(500)
						.json({ status: false, message: "Error retrieving salesperson", error })
				})
		})
		.catch((error) => {
			res.status(500).json({ status: false, message: "Error retrieving admin", error })
		})
}

export const GetCustomersBySalesPerson = (
	req: Request<{ id: string }>,
	res: Response<Res<CustomerModelDataType[]>>
): void => {
	const salesPersonId = new mongoose.Types.ObjectId(req.params.id)

	CustomerModel.aggregate([
		{ $match: { salesPersonId: salesPersonId, userType: "Customer" } },
		{
			$project: {
				token: 0,
				__v: 0
			}
		}
	])
		.then((customers) => {
			res.status(200).json({
				status: true,
				data: customers,
				message: "Customers retrieved successfully"
			})
		})
		.catch((error) => {
			res
				.status(500)
				.json({ status: false, message: "Error retrieving customers", error })
		})
}
