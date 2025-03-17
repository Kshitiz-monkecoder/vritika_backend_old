import mongoose, { Document } from "mongoose"
import { CustomerModelDataType } from "./Customer"

export interface QuotationModelType extends Document {
  salesPersonId: mongoose.Schema.Types.ObjectId; // Optional field
  customerId: mongoose.Schema.Types.ObjectId | CustomerModelDataType;
  SiteSurveyId: mongoose.Schema.Types.ObjectId;
  sytemType: string;
  data: any[];
}

