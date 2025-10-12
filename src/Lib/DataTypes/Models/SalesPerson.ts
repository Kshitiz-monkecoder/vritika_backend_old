import { Document } from "mongoose"
import mongoose from "mongoose"

export interface SalesPersonModelDataType extends Document {
    name: string;
    phoneNumber: string;
    email: string;
    address: string;
    selfie: string;  // Image URL or base64 string for selfie
    aadharCardNumber: string;
    aadharCardFront: string; // URL or base64 string for Aadhar front side
    aadharCardBack: string;  // URL or base64 string for Aadhar back side
    panCardNumber: string;
    panCardFront: string;    // URL or base64 string for PAN card front side
    bankAccountNumber: string;
    bankIfscCode: string;
    bankAccountName: string;
    cancelChequePhoto: string; // URL or base64 string for Cancel Cheque/Passbook photo
    status: "Inactive" | "Active" | "Pending";  // Enum for status
    verify: boolean
    referralCode: string
    token?: string
    comparePassword?(candidatePassword: string): boolean
    createdBy?: mongoose.Types.ObjectId // Reference to Admin or SalesPerson who created this
    createdByType?: "Admin" | "SalesPerson" // Type of creator
    level: number // Level in hierarchy: 1-5 (Max level is 5)
    parentSalesPerson?: mongoose.Types.ObjectId // Reference to parent SalesPerson if created by SalesPerson
    adminId: mongoose.Types.ObjectId // Reference to the Admin who owns this entire hierarchy
}
