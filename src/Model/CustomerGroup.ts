import { Schema, model } from "mongoose"
import { CustomerGroupModelDataType } from "../Lib/DataTypes/Models/Customer"

const CustomerGroupSchema = new Schema<CustomerGroupModelDataType>({
	name: { type: String, required: true }
})

const CustomerGroupModel = model<CustomerGroupModelDataType>("CustomerGroup", CustomerGroupSchema)
export default CustomerGroupModel
