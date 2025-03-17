import { Schema, model } from "mongoose"
import { CustomerSubGroupModelDataType } from "../Lib/DataTypes/Models/Customer"

const CustomerSubGroupSchema = new Schema<CustomerSubGroupModelDataType>({
	name: { type: String, required: true },
	group_id: { type: Schema.Types.ObjectId, ref: "CustomerGroup", required: true }
})

const CustomerSubGroupModel = model<CustomerSubGroupModelDataType>(
	"CustomerSubGroup",
	CustomerSubGroupSchema
)
export default CustomerSubGroupModel
