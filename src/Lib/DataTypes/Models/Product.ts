import mongoose, { Document } from "mongoose"

export interface ProductModelType extends Document {
    image?: string; // Optional field
    productName: string;
    type: string;
    productType: string;
    spvBrand: mongoose.Schema.Types.ObjectId; // Optional field
    spvType: string; // Optional field
    phase: string; // Optional field
    capacity: string; // Optional field
    spvCapacity: string; // Optional field
    price: number;
    service: string; // Optional field
    thickness: string; // Optional field
    category: string
    sellinPrice: string
    unit: string
    free: string
    width: string
    height: string
    weight: string
    deception: string
}
