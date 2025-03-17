import mongoose, { Document, Types } from "mongoose"

// Define the CustomerDetails interface to extend Mongoose's Document
export interface CustomerModelDataType extends Document {
    leadId: string;
    customerPhoneNo: string;
    customerGroup: Types.ObjectId;
    customerSubGroup: Types.ObjectId;
    segment: Types.ObjectId;
    proposalDate: string;
    proposal: string;
    title: "Mr." | "Ms." | "Mrs." | "Dr.";
    customerContactName: string;
    emailId: string;
    customerAddress: string;
    state: string;
    district: string;
    pinCode: string;
    verify: boolean

    salesPersonId: mongoose.Schema.Types.ObjectId; // Optional field
}


export interface CustomerGroupModelDataType extends Document {
    name: string;
}


export interface CustomerSubGroupModelDataType extends Document {
    name: string;
    group_id: Types.ObjectId; // Reference to CustomerGroup
}

export interface CustomeSegmentModelDataType extends Document {
    name: string;
    sub_group_id: Types.ObjectId; // Reference to CustomerSubGroup
}