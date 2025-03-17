import { Request, Response } from "express"
import { dbError, InputValidator } from "../../Lib/Utils/ErrorHandler"
import { ProductModelType } from "../../Lib/DataTypes/Models/Product"
import { Res } from "../../Lib/DataTypes/Common"
import ProductModel from "../../Model/Product"
import { ResponseCode } from "../../Lib/Utils/ResponseCode"
import { ProductRequestDataType } from "../../Lib/DataTypes/Requests/Admin/Product"

// Add a new product
export const CreateProduct = (
	req: Request<any, any, ProductRequestDataType>,
	res: Response<Res<ProductModelType>>
): void => {
	InputValidator(req.body, {
		// productName: 'required|string',
		type: "required|string",
		price: "required|number",
	})
		.then(() => {
			const product = new ProductModel({ ...req.body })
			product
				.save()
				.then((savedProduct) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						data: savedProduct,
						message: "Product created successfully"
					})
				})
				.catch((error) => {
					dbError(error, res)
				})
		})
		.catch((error) => {
			res.status(ResponseCode.VALIDATION_ERROR).json({
				status: false,
				message: error
			})
		})
}

// Update an existing product by ID
export const UpdateProduct = (
	req: Request<{ id: string }, any, ProductRequestDataType>,
	res: Response<Res<ProductModelType>>
): void => {
	InputValidator(req.body, {
		productName: "string",
		type: "string",
		price: "number"
	})
		.then(() => {
			const { id } = req.params
			const productData = req.body

			ProductModel.findByIdAndUpdate(id, productData, { new: true })
				.then((updatedProduct) => {
					if (updatedProduct) {
						res.status(ResponseCode.SUCCESS).json({
							status: true,
							data: updatedProduct,
							message: "Product updated successfully"
						})
					} else {
						res.status(ResponseCode.VALIDATION_ERROR).json({
							status: false,
							message: "Product not found"
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
				message: error
			})
		})
}

// Retrieve all products
export const GetAllProducts = (
	_req: Request,
	res: Response<Res<ProductModelType[]>>
): void => {
	ProductModel.find()
		.then((products) => {
			res.status(ResponseCode.SUCCESS).json({
				status: true,
				data: products,
				message: "Products retrieved successfully"
			})
		})
		.catch((error) => {
			dbError(error, res)
		})
}

// Retrieve a single product by ID
export const GetProductById = (
	req: Request<{ id: string }>,
	res: Response<Res<ProductModelType>>
): void => {
	const { id } = req.params

	ProductModel.findById(id)
		.then((product) => {
			if (product) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: product,
					message: "Product retrieved successfully"
				})
			} else {
				res.status(ResponseCode.VALIDATION_ERROR).json({
					status: false,
					message: "Product not found"
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}

// Delete a product by ID
export const DeleteProduct = (
	req: Request<{ id: string }>,
	res: Response<Res<null | ProductModelType>>
): void => {
	const { id } = req.params

	ProductModel.findByIdAndDelete(id)
		.then((deletedProduct) => {
			if (deletedProduct) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: deletedProduct,
					message: "Product deleted successfully"
				})
			} else {
				res.status(ResponseCode.VALIDATION_ERROR).json({
					status: false,
					message: "Product not found"
				})
			}
		})
		.catch((error) => {
			dbError(error, res)
		})
}
