import { Request, Response } from "express"
import { dbError, InputValidator } from "../../Lib/Utils/ErrorHandler"
import { BrandModelType } from "../../Lib/DataTypes/Models/Brand"
import { Res } from "../../Lib/DataTypes/Common"
import BrandModel from "../../Model/Brand"
import { ResponseCode } from "../../Lib/Utils/ResponseCode"
import { BrandRequestDataType } from "../../Lib/DataTypes/Requests/Admin/Brand"

// Add a new brand
export const CreateBrand = (req: Request<any, any, BrandRequestDataType>, res: Response<Res<BrandModelType>>): void => {
	InputValidator(req.body, {
		brandName: "required|string",
		brandDetails: "required|string",
		productCategory: "required|array",
		quality: "required|string",
		image: "string"
	})
		.then(() => {
			const brand = new BrandModel({ ...req.body })

			brand.save()
				.then((savedBrand) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						data: savedBrand,
						message: "Brand created successfully",
					})
				})
				.catch((error) => {
					dbError(error, res)
				})
		})
		.catch((error) => {
			res.status(ResponseCode.VALIDATION_ERROR).json({
				status: false,
				message: error,
			})
		})
}

// Update an existing brand by ID
export const UpdateBrand = (req: Request<{ id: string }, any, BrandRequestDataType>, res: Response<Res<BrandModelType>>): void => {
	InputValidator(req.body, {
		brandName: "string",
		brandDetails: "string",
		productCategory: "array",
		quality: "string",
		image: "string"
	})
		.then(() => {
			const { id } = req.params
			const brandData = req.body

			BrandModel.findByIdAndUpdate(id, brandData, { new: true })
				.then((updatedBrand) => {
					if (updatedBrand) {
						res.status(ResponseCode.SUCCESS).json({
							status: true,
							data: updatedBrand,
							message: "Brand updated successfully",
						})
					} else {
						res.status(ResponseCode.VALIDATION_ERROR).json({
							status: false,
							message: "Brand not found",
						})
					}
				})
				.catch((error) => {
					dbError(error, res)
				})
		})
		.catch((error) => {
			res.status(ResponseCode.VALIDATION_ERROR).json({
				status: false,
				message: error,
			})
		})
}

// Get all brands
export const GetAllBrands = (_req: Request, res: Response<Res<BrandModelType[]>>): void => {
	BrandModel.find({})
		.then((brands) => {
			res.status(ResponseCode.SUCCESS).json({
				status: true,
				data: brands,
				message: "Brands retrieved successfully",
			})
		})
		.catch((error) => {
			dbError(error, res)
		})
}

// Get a single brand by ID
export const GetBrandById = (req: Request<{ id: string }>, res: Response<Res<BrandModelType>>): void => {
	const { id } = req.params

	BrandModel.findById(id)
		.then((brand) => {
			if (brand) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: brand,
					message: "Brand retrieved successfully",
				})
			} else {
				res.status(ResponseCode.VALIDATION_ERROR).json({
					status: false,
					message: "Brand not found",
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}

// Delete a brand by ID
export const DeleteBrand = (req: Request<{ id: string }>, res: Response<Res<null | BrandModelType>>): void => {
	const { id } = req.params

	BrandModel.findByIdAndDelete(id)
		.then((deletedBrand) => {
			if (deletedBrand) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: deletedBrand,
					message: "Brand deleted successfully",
				})
			} else {
				res.status(ResponseCode.VALIDATION_ERROR).json({
					status: false,
					message: "Brand not found",
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}
