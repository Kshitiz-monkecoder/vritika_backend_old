import { Schema, model, Document } from "mongoose"

interface RoleCommissionDataType extends Document {
  roleName: string;
  commission: number;
  status: string;
}

const RoleCommissionSchema = new Schema<RoleCommissionDataType>(
	{
		roleName: { type: String, required: true },
		commission: { type: Number, required: true },
		status: { type: String, required: true }
	},
	{ timestamps: true }
)

const RoleCommissionModel = model<RoleCommissionDataType>("RoleCommission", RoleCommissionSchema)

export default RoleCommissionModel
