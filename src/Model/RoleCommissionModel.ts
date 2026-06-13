// src/Model/RoleCommissionModel.ts

import { Schema, model, Document, Types } from "mongoose"

interface RoleCommissionDataType extends Document {
  roleName: string
  commission: number        // purana field — rakho for backward compat
  commissionPercentage: number  // yeh chahiye CommissionController ko
  level: number             // yeh chahiye CommissionController ko
  type: string              // "sales-person" | "admin" etc.
  status: boolean           // boolean chahiye, string nahi
  adminId: Types.ObjectId
  description: string
}

const RoleCommissionSchema = new Schema<RoleCommissionDataType>(
  {
    roleName:             { type: String,  required: true },
    commission:           { type: Number,  required: true },   // purana field
    commissionPercentage: { type: Number,  default: 0 },       // naya alias
    level:                { type: Number,  default: 1 },
    type:                 { type: String,  default: "sales-person" },
    status:               { type: Schema.Types.Mixed, default: false }, // accept both string & boolean
    adminId:              { type: Schema.Types.ObjectId },
    description:          { type: String,  default: "" },
  },
  { timestamps: true }
)

// Virtual: agar commissionPercentage nahi set toh commission se le lo
RoleCommissionSchema.pre("find", function () {})
RoleCommissionSchema.post(["find", "findOne"], function (docs: any) {
  if (!docs) return
  const arr = Array.isArray(docs) ? docs : [docs]
  arr.forEach((doc: any) => {
    if (doc && doc.commissionPercentage == null) {
      doc.commissionPercentage = doc.commission ?? 0
    }
    // status normalize: "active"/"Active"/true → true
    if (typeof doc.status === "string") {
      doc.status = doc.status.toLowerCase() === "active" || doc.status === "true"
    }
  })
})

const RoleCommissionModel = model<RoleCommissionDataType>("RoleCommission", RoleCommissionSchema)

export default RoleCommissionModel