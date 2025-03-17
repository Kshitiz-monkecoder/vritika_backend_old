import mongoose, { Schema } from "mongoose"
import { ProductModelType } from "../Lib/DataTypes/Models/Product"

// Define the Product schema
const ProductSchema = new Schema<ProductModelType>(
	{
		image: {
			type: String,
			default: "https://via.placeholder.com/150" // Default placeholder image
		},
		productName: {
			type: String
		},
		type: {
			type: String,
			required: true
		},
		productType: {
			type: String,
		},
		spvBrand: {
			type: mongoose.Schema.Types.ObjectId,
		},
		spvType: {
			type: String
		},
		phase: {
			type: String
		},
		capacity: {
			type: String
		},
		spvCapacity: {
			type: String
		},
		price: {
			type: Number,
			required: true
		},
		service: {
			type: String
		},
		thickness: {
			type: String
		},
		category: {
			type: String
		},
		sellinPrice: {
			type: String
		},
		free: {
			type: String
		},
		unit: {
			type: String
		},
		width: {
			type: String
		},
		height: {
			type: String
		},
		weight: {
			type: String
		},
		deception: {
			type: String
		},
	},
	{ timestamps: true }
)

// Create and export the Product model
const ProductModel = mongoose.model<ProductModelType>("Product", ProductSchema)
export default ProductModel
