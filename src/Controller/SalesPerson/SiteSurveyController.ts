import { Request, Response } from "express"
import SiteSurveyModel from "../../Model/SiteSurvey"
import { dbError, InputValidator } from "../../Lib/Utils/ErrorHandler"
import { Res } from "../../Lib/DataTypes/Common"
import { ResponseCode } from "../../Lib/Utils/ResponseCode"
import { SiteSurveyRequestsDataType } from "../../Lib/DataTypes/Requests/SiteSurvey"
import { SiteSurveyModelDataType } from "../../Lib/DataTypes/Models/SiteSurvey"
import mongoose from "mongoose"

// Create a new SiteSurvey
export const CreateSiteSurvey = (req: Request<any, any, SiteSurveyRequestsDataType>, res: Response<Res<SiteSurveyModelDataType>>): void => {
	InputValidator(req.body, {
		customerId: "required|string",
		length: "required|number|min:1",
		width: "required|number|min:1",
		images: "array",
		obstacleCheck: "required|boolean",
		shadowAnalysis: "required|boolean",
		roofSurfaceType: "required|string",
		totalRoofs: "required|number|min:1",
		roofAccessibility: "required|string",
		sensationLoadKW: "required|number|min:1",
		solarCapacity: "number",
		electricityBillImages: "array",
		gensatAvailable: "boolean"
	})
		.then(() => {
			const siteSurvey = new SiteSurveyModel({ ...req.body, salesPersonId: req.User?._id })
			siteSurvey.save()
				.then((savedSurvey) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						data: savedSurvey,
						message: "Site survey created successfully"
					})
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => {
			res.status(ResponseCode.VALIDATION_ERROR).json({
				status: false,
				message: error
			})
		})
}

// Update an existing SiteSurvey by ID
export const CreateSiteSurveySecend = (req: Request<{ id: string }, any, SiteSurveyRequestsDataType>, res: Response<Res<SiteSurveyModelDataType>>): void => {
	InputValidator(req.body, {
		distance: "string",
		surfaceSoil: "string",
		roofSurface: "string",
		loanRequired: "boolean",
		subsidy: "boolean|required",
		conductPipe: "boolean",
		carsOwned: "string",
		acPremises: "string",
		gridInverters: "string|required"
	})
		.then(() => {
			const { id } = req.params
			const siteSurveyData = req.body

			SiteSurveyModel.findByIdAndUpdate(id, siteSurveyData, { new: true })
				.then((updatedSurvey) => {
					if (updatedSurvey) {
						res.status(ResponseCode.SUCCESS).json({
							status: true,
							data: updatedSurvey,
							message: "Site survey updated successfully"
						})
					} else {
						res.status(ResponseCode.VALIDATION_ERROR).json({
							status: false,
							message: "Site survey not found"
						})
					}
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => {
			res.status(ResponseCode.VALIDATION_ERROR).json({
				status: false,
				message: error
			})
		})
}

// Update an existing SiteSurvey by ID
export const UpdateSiteSurvey = (req: Request<{ id: string }, any, SiteSurveyRequestsDataType>, res: Response<Res<SiteSurveyModelDataType>>): void => {
	InputValidator(req.body, {
		length: "number",
		width: "number",
		images: "array",
		obstacleCheck: "boolean",
		shadowAnalysis: "boolean",
		roofSurfaceType: "string",
		totalRoofs: "number",
		roofAccessibility: "string",
		sensationLoadKW: "number",
		solarCapacity: "number",
		electricityBillImages: "array",
		gensatAvailable: "boolean"
	})
		.then(() => {
			const { id } = req.params
			const siteSurveyData = req.body

			SiteSurveyModel.findByIdAndUpdate(id, siteSurveyData, { new: true })
				.then((updatedSurvey) => {
					if (updatedSurvey) {
						res.status(ResponseCode.SUCCESS).json({
							status: true,
							data: updatedSurvey,
							message: "Site survey updated successfully"
						})
					} else {
						res.status(ResponseCode.VALIDATION_ERROR).json({
							status: false,
							message: "Site survey not found"
						})
					}
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => {
			res.status(ResponseCode.VALIDATION_ERROR).json({
				status: false,
				message: error
			})
		})
}

// Get all SiteSurveys
export const GetAllSiteSurveys = (_req: Request, res: Response<Res<SiteSurveyModelDataType[]>>): void => {
	SiteSurveyModel.find({})
		.then((siteSurveys) => {
			res.status(ResponseCode.SUCCESS).json({
				status: true,
				data: siteSurveys,
				message: "Site surveys retrieved successfully"
			})
		})
		.catch((error) => dbError(error, res))
}

// Get a single SiteSurvey by ID
export const GetSiteSurveyById = (req: Request<{ id: string }>, res: Response<Res<SiteSurveyModelDataType>>): void => {
	const { id } = req.params

	SiteSurveyModel.findById(id)
		.then((siteSurvey) => {
			if (siteSurvey) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: siteSurvey,
					message: "Site survey retrieved successfully"
				})
			} else {
				res.status(ResponseCode.VALIDATION_ERROR).json({
					status: false,
					message: "Site survey not found"
				})
			}
		})
		.catch((error) => dbError(error, res))
}

export const GetSiteSurveyByCustomer = (req: Request<{ id: string }>, res: Response<Res<SiteSurveyModelDataType>>): void => {
	SiteSurveyModel.aggregate([
		{
			$match: {
				customerId: new mongoose.Types.ObjectId(req.params.id)
			}
		}
	])
		.then((siteSurvey) => {
			if (siteSurvey && siteSurvey.length) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: siteSurvey[0],
					message: "Site survey retrieved successfully"
				})
			} else {
				res.status(ResponseCode.VALIDATION_ERROR).json({
					status: false,
					message: "Site survey not found"
				})
			}
		})
		.catch((error) => dbError(error, res))
}

// Delete a SiteSurvey by ID
export const DeleteSiteSurvey = (req: Request<{ id: string }>, res: Response<Res<null | SiteSurveyModelDataType>>): void => {
	const { id } = req.params
	SiteSurveyModel.findByIdAndDelete(id)
		.then((deletedSurvey) => {
			if (deletedSurvey) {
				res.status(ResponseCode.SUCCESS).json({
					status: true,
					data: deletedSurvey,
					message: "Site survey deleted successfully"
				})
			} else {
				res.status(ResponseCode.VALIDATION_ERROR).json({
					status: false,
					message: "Site survey not found"
				})
			}
		})
		.catch((error) => dbError(error, res))
}
