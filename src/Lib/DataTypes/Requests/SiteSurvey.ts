import mongoose from "mongoose"

// Define the SiteSurvey interface extending Mongoose Document
export interface SiteSurveyRequestsDataType {
    length: number;
    width: number;
    images: string[];
    obstacleCheck: boolean;
    shadowAnalysis: boolean;
    roofSurfaceType: string;
    totalRoofs: number;
    roofAccessibility: string;
    sensationLoadKW: number;
    solarCapacity: number;
    electricityBillImages: string[];
    gensatAvailable: boolean;

    salesPersonId: mongoose.Schema.Types.ObjectId; // Optional field
}