import mongoose from "mongoose"

export type CommonModelType = {
    isDeleted?: boolean
}

export type UserModelType<T> = T & {
    name: string
    email: string
    phone: string

    image?: string
    userType: "SuperAdmin" | "Admin"

    password: string
    token: string
    comparePassword?(candidatePassword: string): boolean

    adminType: "Organisation" | "Individual";
    gstNo?: string;
    contactPersonName?: string;
    address: string;
    aadharCardNo: string;
    aadharCardImage: string[];
    panCardNo: string;
    panCardImage: string[];
    bankAccountNo: string;
    ifscCode: string;
    bankHolderName: string;
    passbookImage: string

    code: string
    createdBy?: mongoose.Types.ObjectId // Reference to SuperAdmin who created this Admin
}