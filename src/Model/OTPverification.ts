import mongoose, { Schema } from "mongoose"
import { OTPVerificationDataType } from "../Lib/DataTypes/Models/OTP"

const OTPVerificationSchema: Schema = new Schema<OTPVerificationDataType>(
	{
		phoneNumber: { type: String, required: true },
		status: { type: Boolean, required: true, default: true },
		otp: { type: Number, require: true },
		type: {
			type: String,
			required: true,
			enum: ["salesPerson", "customerNumberVerification", "customerLogin"],
			default: "salesPerson"
		},
		company: { type: String, required: true, default: "whatsapp" }
	},
	{
		timestamps: true
	}
)

const OTPVerificationModel = mongoose.model<OTPVerificationDataType>(
	"OTPVerification",
	OTPVerificationSchema
)

export default OTPVerificationModel
