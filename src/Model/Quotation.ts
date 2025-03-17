import mongoose, { Schema } from "mongoose"
import { QuotationModelType } from "../Lib/DataTypes/Models/Quotation"

const QuotationSchema = new Schema<QuotationModelType>({
	salesPersonId: {
		type: mongoose.Schema.Types.ObjectId,
	},
	SiteSurveyId: {
		type: mongoose.Schema.Types.ObjectId,
	},
	customerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "CustomerDetails"
	},
	sytemType: {
		type: String
	},
	data: {
		type: []
	}
},{timestamps: true})

const QuotationModel = mongoose.model<QuotationModelType>("Quotation", QuotationSchema)
export default QuotationModel