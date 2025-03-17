import mongoose from "mongoose"

export interface CustomerRequestsDataType {
    leadId: string;
    customerPhoneNo: string;
    customerGroup: string;
    customerSubGroup: string;
    segment: string;
    proposalDate: string;
    proposal: string;
    title: "Mr." | "Ms." | "Mrs." | "Dr.";
    customerContactName: string;
    emailId: string;
    customerAddress: string;
    state: string;
    district: string;
    pinCode: string;

    salesPersonId: mongoose.Schema.Types.ObjectId; // Optional field
}