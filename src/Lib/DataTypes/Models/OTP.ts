import { Document } from "mongoose"

export interface OTPVerificationDataType extends Document {
  phoneNumber: string;
  status: boolean;
  otp: number
  type: "salesPerson" | "customerNumberVerification" | "customerLogin";
  company: string;
}
