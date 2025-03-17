import { type Request, type Response } from "express"
import { Res } from "../../Lib/DataTypes/Common"
import mongoose from "mongoose"
import { ResponseCode } from "../../Lib/Utils/ResponseCode"
import { dbError } from "../../Lib/Utils/ErrorHandler"

export const GetAllState = (req: Request, res: Response<Res>): void => {
	try {
		const collection = mongoose.connection.db?.collection("states")
		collection?.find({})
			.sort({ name: 1 })
			.toArray()
			.then((data) => {
				res.status(ResponseCode.SUCCESS)
					.json({
						status: true,
						data,
						message: "States retrieved successfully"
					})
			})
			.catch((error) => {
				dbError(error, res)
			})
	} catch (error) {
		dbError(error, res)
	}
}
