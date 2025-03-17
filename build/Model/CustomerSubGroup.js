"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CustomerSubGroupSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    group_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "CustomerGroup", required: true }
});
const CustomerSubGroupModel = (0, mongoose_1.model)("CustomerSubGroup", CustomerSubGroupSchema);
exports.default = CustomerSubGroupModel;
