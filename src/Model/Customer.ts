import mongoose, { Schema } from "mongoose"
import { CustomerModelDataType } from "../Lib/DataTypes/Models/Customer"

// Define the CustomerDetails schema
const CustomerSchema = new Schema<CustomerModelDataType>(
	{
		leadId: { type: String, required: true },
		customerPhoneNo: { type: String, required: true },
		customerGroup: { type: mongoose.Schema.Types.ObjectId, required: true },
		customerSubGroup: { type: mongoose.Schema.Types.ObjectId, required: true },
		segment: { type: mongoose.Schema.Types.ObjectId, required: true },
		proposalDate: { type: String, required: true },
		proposal: { type: String },
		title: { type: String, enum: ["Mr.", "Ms.", "Mrs.", "Dr."], required: true },
		customerContactName: { type: String, required: true },
		emailId: { type: String },
		customerAddress: { type: String, required: true },
		state: { type: String, required: true },
		district: { type: String, required: true },
		pinCode: { type: String, required: true },
		verify: { type: Boolean, default: false },


		salesPersonId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true
		}
	},
	{ timestamps: true }
)

// Create and export the CustomerDetails model
const CustomerModel = mongoose.model<CustomerModelDataType>("CustomerDetails", CustomerSchema)
export default CustomerModel
