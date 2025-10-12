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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const password_hash_1 = __importDefault(require("password-hash"));
// Define the SalesPerson schema
const SalesPersonSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    selfie: { type: String, required: true }, // URL or base64 image string
    aadharCardNumber: { type: String, required: true },
    aadharCardFront: { type: String, required: true }, // URL or base64 image string
    aadharCardBack: { type: String, required: true }, // URL or base64 image string
    panCardNumber: { type: String, required: true },
    panCardFront: { type: String, required: true }, // URL or base64 image string
    bankAccountNumber: { type: String, required: true },
    bankIfscCode: { type: String, required: true },
    bankAccountName: { type: String, required: true },
    cancelChequePhoto: { type: String, required: true }, // URL or base64 image string
    verify: { type: Boolean, default: false },
    referralCode: { type: String, default: "" },
    status: {
        type: String,
        enum: ["Inactive", "Active", "Pending"],
        default: "Pending"
    },
    token: { type: String },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, refPath: "createdByType" }, // Dynamic reference to Admin or SalesPerson
    createdByType: { type: String, enum: ["User", "SalesPerson"], default: "User" }, // Type of creator
    level: { type: Number, default: 1, min: 1, max: 5 }, // Level in hierarchy (1-5, max is 5)
    parentSalesPerson: { type: mongoose_1.Schema.Types.ObjectId, ref: "SalesPerson" }, // Reference to parent SalesPerson
    adminId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true } // Admin who owns this hierarchy
}, { timestamps: true });
SalesPersonSchema.methods.comparePassword = function (candidatePassword) {
    return password_hash_1.default.verify(candidatePassword, this.password);
};
const SalesPersonModel = mongoose_1.default.model("SalesPerson", SalesPersonSchema);
exports.default = SalesPersonModel;
