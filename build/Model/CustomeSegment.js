"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SegmentSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    sub_group_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "CustomerSubGroup", required: true }
});
const CustomeSegmentModel = (0, mongoose_1.model)("CustomeSegment", SegmentSchema);
exports.default = CustomeSegmentModel;
