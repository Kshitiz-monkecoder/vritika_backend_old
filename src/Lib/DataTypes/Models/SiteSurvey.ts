import mongoose, { Document } from "mongoose"

// Define the SiteSurvey interface extending Mongoose Document
export interface SiteSurveyModelDataType extends Document {
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

  distance: string;
  surfaceSoil: string;
  roofSurface: string;
  loanRequired: boolean;
  subsidy: boolean;
  conductPipe: boolean;
  carsOwned: string;
  acPremises: string;
  gridInverters: string;

  salesPersonId: mongoose.Schema.Types.ObjectId; // Optional field
  customerId: mongoose.Schema.Types.ObjectId;

  coordinates?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  boxCoordinates?: Array<Array<number>>;
}
