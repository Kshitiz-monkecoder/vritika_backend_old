import mongoose, { Schema } from "mongoose"
import { BrandModelType } from "../Lib/DataTypes/Models/Brand"


// Define the Brand schema
const BrandSchema = new Schema<BrandModelType>(
	{
		brandName: {
			type: String,
			required: true,
			unique: true // Ensure the brand name is unique
		},
		brandDetails: {
			type: String,
			required: true
		},
		productCategory: {
			type: [String],
			required: true
		},
		quality: {
			type: String,
			required: true
		},
		image: {
			type: String,
			default: "https://via.placeholder.com/150" // Default placeholder image
		}
	},
	{ timestamps: true }
)

// Create and export the Brand model
const BrandModel = mongoose.model<BrandModelType>("Brand", BrandSchema)
export default BrandModel
