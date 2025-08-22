"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Define the CustomerDetails schema
const CustomerSchema = new mongoose_1.Schema({
    leadId: { type: String, required: true },
    customerPhoneNo: { type: String, required: true },
    customerGroup: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    customerSubGroup: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    segment: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    proposalDate: { type: String, required: true },
    proposal: { type: String },
    title: { type: String, enum: ["Mr.", "Ms.", "Mrs.", "Dr."], required: true },
    customerContactName: { type: String, required: true },
    emailId: { type: String },
    customerAddress: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    pinCode: { type: String, required: true },
    verify: { type: Boolean, default: false },
    salesPersonId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    }
}, { timestamps: true });
// Create and export the CustomerDetails model
const CustomerModel = mongoose_1.default.model("CustomerDetails", CustomerSchema);
exports.default = CustomerModel;
