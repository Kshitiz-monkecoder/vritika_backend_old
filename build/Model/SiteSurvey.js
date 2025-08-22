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
// Define the SiteSurvey schema
const SiteSurveySchema = new mongoose_1.Schema({
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    images: { type: [String] },
    obstacleCheck: { type: Boolean, required: true },
    shadowAnalysis: { type: Boolean, required: true },
    roofSurfaceType: { type: String, required: true },
    totalRoofs: { type: Number, required: true },
    roofAccessibility: { type: String, required: true },
    sensationLoadKW: { type: Number, required: true },
    solarCapacity: { type: Number },
    electricityBillImages: { type: [String] },
    gensatAvailable: { type: Boolean },
    salesPersonId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true
    },
    customerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    distance: { type: String },
    surfaceSoil: { type: String },
    roofSurface: { type: String },
    loanRequired: { type: Boolean },
    subsidy: { type: Boolean },
    conductPipe: { type: Boolean },
    carsOwned: { type: String },
    acPremises: { type: String },
    gridInverters: { type: String },
    coordinates: {
        type: { type: String, enum: ["Point"], required: true, default: "Point" },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
            default: [0, 0]
        },
        status: {
            type: String,
            default: "active" // Default value set to 'active'
        }
    },
    boxCoordinates: {
        type: (Array),
        default: []
    }
}, { timestamps: true });
// Create and export the SiteSurvey model
const SiteSurveyModel = mongoose_1.default.model("SiteSurvey", SiteSurveySchema);
exports.default = SiteSurveyModel;
