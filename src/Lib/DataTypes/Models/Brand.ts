import { Document } from "mongoose"

export interface BrandModelType extends Document {
    brandName: string;
    brandDetails: string;
    productCategory: string[];
    quality: string;
    image: string;
}
