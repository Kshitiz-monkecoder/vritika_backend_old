import { Schema, model } from "mongoose"
import { CustomeSegmentModelDataType } from "../Lib/DataTypes/Models/Customer"


const SegmentSchema = new Schema<CustomeSegmentModelDataType>({
	name: { type: String, required: true },
	sub_group_id: { type: Schema.Types.ObjectId, ref: "CustomerSubGroup", required: true }
})

const CustomeSegmentModel = model<CustomeSegmentModelDataType>("CustomeSegment", SegmentSchema)
export default CustomeSegmentModel
