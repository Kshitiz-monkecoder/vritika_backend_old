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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Define the Product schema
const ProductSchema = new mongoose_1.Schema({
    image: {
        type: String,
        default: "https://via.placeholder.com/150" // Default placeholder image
    },
    productName: {
        type: String
    },
    type: {
        type: String,
        required: true
    },
    productType: {
        type: String,
    },
    spvBrand: {
        type: mongoose_1.default.Schema.Types.ObjectId,
    },
    spvType: {
        type: String
    },
    phase: {
        type: String
    },
    capacity: {
        type: String
    },
    spvCapacity: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    service: {
        type: String
    },
    thickness: {
        type: String
    },
    category: {
        type: String
    },
    sellinPrice: {
        type: String
    },
    free: {
        type: String
    },
    unit: {
        type: String
    },
    width: {
        type: String
    },
    height: {
        type: String
    },
    weight: {
        type: String
    },
    deception: {
        type: String
    },
}, { timestamps: true });
// Create and export the Product model
const ProductModel = mongoose_1.default.model("Product", ProductSchema);
exports.default = ProductModel;
