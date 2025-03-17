"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CustomerGroupSchema = new mongoose_1.Schema({
    name: { type: String, required: true }
});
const CustomerGroupModel = (0, mongoose_1.model)("CustomerGroup", CustomerGroupSchema);
exports.default = CustomerGroupModel;
