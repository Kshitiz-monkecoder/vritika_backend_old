import mongoose, { Document, Schema } from "mongoose"
import type { CommonModelType, UserModelType } from "../Lib/DataTypes/Models/User"
import passwordHash from "password-hash"

const UserSchema = new Schema<UserModelType<CommonModelType & Document>>(
	{
		name: {
			type: String,
			required: true
		},
		userType: {
			type: String,
			default: "Admin"
		},
		phone: {
			type: String
		},
		email: {
			type: String,
			required: true
		},

		adminType: {
			type: String,
			required: true,
			enum: ["Organisation", "Individual"]
		},
		gstNo: { type: String },
		contactPersonName: { type: String },
		address: { type: String, required: true },
		aadharCardNo: { type: String, required: true },
		aadharCardImage: { type: [String], required: true },
		panCardNo: { type: String, required: true },
		panCardImage: { type: [String], required: true },
		bankAccountNo: { type: String, required: true },
		ifscCode: { type: String, required: true },
		bankHolderName: { type: String, required: true },
		code: { type: String },
		password: { type: String },
		image: {
			type: String,
			default:
        "https://e7.pngegg.com/pngimages/867/694/png-clipart-user-profile-default-computer-icons-network-video-recorder-avatar-cartoon-maker-blue-text.png"
		},
		token: { type: String },
		passbookImage: { type: String },
		createdBy: { type: Schema.Types.ObjectId, ref: "SuperAdmin" }, // Reference to SuperAdmin
		isDeleted: { type: Boolean, default: false }
	},
	{ timestamps: true }
)

UserSchema.methods.comparePassword = function (candidatePassword: string): boolean {
	return passwordHash.verify(candidatePassword, this.password)
}

const UserModel = mongoose.model<UserModelType<CommonModelType & Document>>(
	"User",
	UserSchema
)
export default UserModel
