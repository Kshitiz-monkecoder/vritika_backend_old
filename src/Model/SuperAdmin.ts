import mongoose, { Document, Schema } from "mongoose"
import type { CommonModelType, UserModelType } from "../Lib/DataTypes/Models/User"
import passwordHash from "password-hash"

const SuperAdminSchema = new Schema<UserModelType<CommonModelType & Document>>(
	{
		name: {
			type: String,
			required: true
		},
		userType: {
			type: String,
			default: "SuperAdmin"
		},
		phone: {
			type: String
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: { type: String },
		image: {
			type: String,
			default:
        "https://e7.pngegg.com/pngimages/867/694/png-clipart-user-profile-default-computer-icons-network-video-recorder-avatar-cartoon-maker-blue-text.png"
		},
		token: { type: String },
		passbookImage: { type: String },
		isDeleted: { type: Boolean, default: false }
	},
	{ timestamps: true }
)

SuperAdminSchema.methods.comparePassword = function (candidatePassword: string): boolean {
	return passwordHash.verify(candidatePassword, this.password)
}

const SuperAdminModel = mongoose.model<UserModelType<CommonModelType & Document>>(
	"SuperAdmin",
	SuperAdminSchema
)
export default SuperAdminModel
