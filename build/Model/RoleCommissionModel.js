"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const RoleCommissionSchema = new mongoose_1.Schema({
    roleName: { type: String, required: true },
    commission: { type: Number, required: true },
    status: { type: String, required: true }
}, { timestamps: true });
const RoleCommissionModel = (0, mongoose_1.model)("RoleCommission", RoleCommissionSchema);
exports.default = RoleCommissionModel;
