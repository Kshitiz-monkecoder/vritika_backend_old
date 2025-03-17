import { type Response } from "express"
import { Res } from "../Lib/DataTypes/Common"
import { UploadToS3 } from "../Lib/Utils/FileUpload"
import { ResponseCode } from "../Lib/Utils/ResponseCode"
import { dbError } from "../Lib/Utils/ErrorHandler"

export const UploadDocoment = (req: any, res: Response<Res>): void => {
	if (typeof (req.file) !== "undefined" && typeof (req.file.mimetype) !== "undefined" && typeof (req.file.buffer) !== "undefined") {
		UploadToS3(req.file.buffer, req.file.mimetype, `client/${req?.user?._id}/${req.params.loction}`)
			.then((data) => {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data,
					message: "succesfull Upload Your File"
				})
			}).catch((error: any) => {
				console.log("error", error)
				dbError(error, res)
			})
	} else {
		res.status(ResponseCode.VALIDATION_ERROR).json({
			status: false,
			message: "File is Not Found"
		})
	}
}