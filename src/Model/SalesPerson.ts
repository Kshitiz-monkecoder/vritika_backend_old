import mongoose, { Schema } from "mongoose"
import { SalesPersonModelDataType } from "../Lib/DataTypes/Models/SalesPerson"
import passwordHash from "password-hash"

// Define the SalesPerson schema
const SalesPersonSchema: Schema = new Schema<SalesPersonModelDataType>({
	name: { type: String, required: true },
	phoneNumber: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	address: { type: String, required: true },
	selfie: { type: String, required: true },  // URL or base64 image string
	aadharCardNumber: { type: String, required: true },
	aadharCardFront: { type: String, required: true },  // URL or base64 image string
	aadharCardBack: { type: String, required: true },   // URL or base64 image string
	panCardNumber: { type: String, required: true },
	panCardFront: { type: String, required: true },     // URL or base64 image string
	bankAccountNumber: { type: String, required: true },
	bankIfscCode: { type: String, required: true },
	bankAccountName: { type: String, required: true },
	cancelChequePhoto: { type: String, required: true },  // URL or base64 image string
	verify: { type: Boolean, default: false },
	referralCode: {type: String, default: ""},
	status: {
		type: String,
		enum: ["Inactive", "Active", "Pending"],
		default: "Pending"
	},
	token: { type: String }
}, { timestamps: true })

SalesPersonSchema.methods.comparePassword = function (candidatePassword: string): boolean {
	return passwordHash.verify(candidatePassword, this.password)
}

const SalesPersonModel = mongoose.model<SalesPersonModelDataType>("SalesPerson", SalesPersonSchema)

export default SalesPersonModel
