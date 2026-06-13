import { Request, Response } from "express"
import SalesPersonModel from "../../Model/SalesPerson"
import CustomerModel from "../../Model/Customer"
import SiteSurveyModel from "../../Model/SiteSurvey"
import QuotationModel from "../../Model/Quotation"
import { Res } from "../../Lib/DataTypes/Common"
import { ResponseCode } from "../../Lib/Utils/ResponseCode"
import { dbError } from "../../Lib/Utils/ErrorHandler"
import mongoose from "mongoose"

// ─────────────────────────────────────────────────────────────────────────────
// SCOPE RESOLVER
// These endpoints require no login — they always return ALL salespersons.
// The resolver is kept for structural consistency and future role-gating.
// ─────────────────────────────────────────────────────────────────────────────

async function resolveSpScope(): Promise<mongoose.Types.ObjectId[]> {
	const sps = await SalesPersonModel.find({}, { _id: 1 }).lean()
	return sps.map((sp) => sp._id as mongoose.Types.ObjectId)
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: month label expression used across pipelines
// Produces "2025-04" style labels, zero-padded
// ─────────────────────────────────────────────────────────────────────────────

const monthLabelExpression = {
	$concat: [
		{ $toString: "$_id.year" },
		"-",
		{
			$cond: {
				if: { $lt: ["$_id.month", 10] },
				then: { $concat: ["0", { $toString: "$_id.month" }] },
				else: { $toString: "$_id.month" }
			}
		}
	]
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /super-admin/analytics/monthly-trends
// Customers, site surveys, and quotations grouped by month.
// Query params:
//   months — how many months back (default 6, max 24)
// ─────────────────────────────────────────────────────────────────────────────

export const GetMonthlyTrends = (
	req: Request,
	res: Response<Res>
): void => {
	const months = Math.min(24, parseInt(req.query.months as string) || 6)

	const since = new Date()
	since.setMonth(since.getMonth() - months)
	since.setDate(1)
	since.setHours(0, 0, 0, 0)

	resolveSpScope()
		.then((spIds) => {
			if (spIds.length === 0) {
				return res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Monthly trends fetched successfully",
					data: []
				})
			}

			const dateMatch = { createdAt: { $gte: since } }
			const spMatch = { salesPersonId: { $in: spIds } }

			const groupByMonth = {
				_id: {
					year: { $year: "$createdAt" },
					month: { $month: "$createdAt" }
				},
				count: { $sum: 1 }
			}

			const sortAndProject = [
				{ $sort: { "_id.year": 1, "_id.month": 1 } as Record<string, 1 | -1> },
				{
					$project: {
						_id: 0,
						month: monthLabelExpression,
						count: "$count"
					}
				}
			]

			Promise.all([

				CustomerModel.aggregate([
					{ $match: { ...spMatch, ...dateMatch } },
					{ $group: groupByMonth },
					...sortAndProject
				]),

				SiteSurveyModel.aggregate([
					{ $match: { ...spMatch, ...dateMatch } },
					{ $group: groupByMonth },
					...sortAndProject
				]),

				QuotationModel.aggregate([
					{ $match: { ...spMatch, ...dateMatch } },
					{ $group: groupByMonth },
					...sortAndProject
				])

			])
				.then(([customers, siteSurveys, quotations]) => {
					// Merge all series into a single month-keyed array for the frontend
					const monthMap = new Map<string, { month: string; customers: number; siteSurveys: number; quotations: number }>()

					;(customers as any[]).forEach((item) => {
						monthMap.set(item.month, { month: item.month, customers: item.count, siteSurveys: 0, quotations: 0 })
					})
					;(siteSurveys as any[]).forEach((item) => {
						const entry = monthMap.get(item.month) ?? { month: item.month, customers: 0, siteSurveys: 0, quotations: 0 }
						entry.siteSurveys = item.count
						monthMap.set(item.month, entry)
					})
					;(quotations as any[]).forEach((item) => {
						const entry = monthMap.get(item.month) ?? { month: item.month, customers: 0, siteSurveys: 0, quotations: 0 }
						entry.quotations = item.count
						monthMap.set(item.month, entry)
					})

					const merged = Array.from(monthMap.values()).sort((a, b) =>
						a.month.localeCompare(b.month)
					)

					res.status(ResponseCode.SUCCESS).json({
						status: true,
						message: "Monthly trends fetched successfully",
						data: merged
					})
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => dbError(error, res))
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /super-admin/analytics/state-heatmap
// Customer count and survey/quotation coverage per state.
// Returns sorted by customer count descending.
// ─────────────────────────────────────────────────────────────────────────────

export const GetStateHeatmap = (
	req: Request,
	res: Response<Res>
): void => {
	resolveSpScope()
		.then((spIds) => {
			if (spIds.length === 0) {
				return res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "State heatmap fetched successfully",
					data: []
				})
			}

			CustomerModel.aggregate([
				{ $match: { salesPersonId: { $in: spIds } } },

				// Join site survey per customer
				{
					$lookup: {
						from: "sitesurveys",
						localField: "_id",
						foreignField: "customerId",
						as: "survey"
					}
				},

				// Join quotation per customer
				{
					$lookup: {
						from: "quotations",
						localField: "_id",
						foreignField: "customerId",
						as: "quotation"
					}
				},

				// Group by state
				{
					$group: {
						_id: "$state",
						totalCustomers: { $sum: 1 },
						verifiedCustomers: {
							$sum: { $cond: [{ $eq: ["$verify", true] }, 1, 0] }
						},
						withSurvey: {
							$sum: {
								$cond: [{ $gt: [{ $size: "$survey" }, 0] }, 1, 0]
							}
						},
						withQuotation: {
							$sum: {
								$cond: [{ $gt: [{ $size: "$quotation" }, 0] }, 1, 0]
							}
						}
					}
				},

				{ $sort: { totalCustomers: -1 } },

				{
					$project: {
						_id: 0,
						state: { $ifNull: ["$_id", "Unknown"] },
						totalCustomers: "$totalCustomers",
						verifiedCustomers: "$verifiedCustomers",
						withSurvey: "$withSurvey",
						withQuotation: "$withQuotation",
						conversionRate: {
							$round: [
								{
									$cond: [
										{ $gt: ["$totalCustomers", 0] },
										{
											$multiply: [
												{ $divide: ["$withQuotation", "$totalCustomers"] },
												100
											]
										},
										0
									]
								},
								1
							]
						}
					}
				}
			])
				.then((stateData) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						message: "State heatmap fetched successfully",
						data: stateData
					})
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => dbError(error, res))
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /super-admin/analytics/conversion-funnel
// Full platform funnel: Customers → Surveyed → Quoted → Converted
// ─────────────────────────────────────────────────────────────────────────────

export const GetConversionFunnel = (
	req: Request,
	res: Response<Res>
): void => {
	resolveSpScope()
		.then((spIds) => {
			if (spIds.length === 0) {
				return res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Conversion funnel fetched successfully",
					data: buildEmptyFunnel()
				})
			}

			const spMatch = { salesPersonId: { $in: spIds } }

			Promise.all([
				CustomerModel.countDocuments(spMatch),
				SiteSurveyModel.countDocuments(spMatch),
				QuotationModel.countDocuments(spMatch),

				// "Fully converted" = customer who has BOTH a survey AND a quotation
				CustomerModel.aggregate([
					{ $match: spMatch },
					{
						$lookup: {
							from: "sitesurveys",
							localField: "_id",
							foreignField: "customerId",
							as: "survey"
						}
					},
					{
						$lookup: {
							from: "quotations",
							localField: "_id",
							foreignField: "customerId",
							as: "quotation"
						}
					},
					{
						$match: {
							"survey.0": { $exists: true },
							"quotation.0": { $exists: true }
						}
					},
					{ $count: "count" }
				])
			])
				.then(([totalCustomers, totalSurveys, totalQuotations, convertedAgg]) => {
					const converted = (convertedAgg as any[])[0]?.count ?? 0

					const stages = [
						{ stage: "Customers Added",    count: totalCustomers },
						{ stage: "Site Survey Done",   count: totalSurveys },
						{ stage: "Quotation Created",  count: totalQuotations },
						{ stage: "Fully Converted",    count: converted }
					]

					const funnel = stages.map((s, i) => {
						const prev = i === 0 ? totalCustomers : stages[i - 1].count
						const dropOff = Math.max(0, prev - s.count)
						const dropOffRate =
							prev > 0 ? `${Math.round((dropOff / prev) * 1000) / 10}%` : "0%"
						const cumulativeRate =
							totalCustomers > 0
								? `${Math.round((s.count / totalCustomers) * 1000) / 10}%`
								: "0%"
						return { stage: s.stage, count: s.count, dropOff, dropOffRate, cumulativeRate }
					})

					res.status(ResponseCode.SUCCESS).json({
						status: true,
						message: "Conversion funnel fetched successfully",
						data: {
							funnel,
							summary: {
								totalCustomers,
								overallConversionRate:
									totalCustomers > 0
										? `${Math.round((converted / totalCustomers) * 1000) / 10}%`
										: "0%",
								surveyCompletionRate:
									totalCustomers > 0
										? `${Math.round((totalSurveys / totalCustomers) * 1000) / 10}%`
										: "0%",
								quotationRate:
									totalCustomers > 0
										? `${Math.round((totalQuotations / totalCustomers) * 1000) / 10}%`
										: "0%"
							}
						}
					})
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => dbError(error, res))
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET /super-admin/analytics/revenue-trend
// Monthly revenue from Quotation.data[] line items.
// Query params:
//   months — how many months back (default 6, max 24)
// ─────────────────────────────────────────────────────────────────────────────

export const GetRevenueTrend = (
	req: Request,
	res: Response<Res>
): void => {
	const months = Math.min(24, parseInt(req.query.months as string) || 6)

	const since = new Date()
	since.setMonth(since.getMonth() - months)
	since.setDate(1)
	since.setHours(0, 0, 0, 0)

	resolveSpScope()
		.then((spIds) => {
			if (spIds.length === 0) {
				return res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Revenue trend fetched successfully",
					data: { trend: [], summary: { totalRevenue: 0, totalQuotations: 0, avgRevenuePerQuotation: 0 } }
				})
			}

			QuotationModel.aggregate([
				{ $match: { salesPersonId: { $in: spIds }, createdAt: { $gte: since } } },

				// Explode data[] to compute revenue per line item
				{ $unwind: { path: "$data", preserveNullAndEmptyArrays: true } },

				{
					$group: {
						_id: {
							quotationId: "$_id",
							year: { $year: "$createdAt" },
							month: { $month: "$createdAt" }
						},
						revenue: {
							$sum: {
								$multiply: [
									{ $toDouble: { $ifNull: ["$data.price", 0] } },
									{ $toDouble: { $ifNull: ["$data.quantity", 1] } }
								]
							}
						}
					}
				},

				// Roll up per month
				{
					$group: {
						_id: { year: "$_id.year", month: "$_id.month" },
						totalRevenue: { $sum: "$revenue" },
						quotationCount: { $sum: 1 }
					}
				},

				{ $sort: { "_id.year": 1, "_id.month": 1 } as Record<string, 1 | -1> },

				{
					$project: {
						_id: 0,
						month: monthLabelExpression,
						totalRevenue: { $round: ["$totalRevenue", 2] },
						quotationCount: "$quotationCount",
						revenue: { $round: ["$totalRevenue", 2] }
					}
				}
			])
				.then((trend) => {
					const grandTotal = (trend as any[]).reduce(
						(acc, item) => {
							acc.totalRevenue += item.totalRevenue
							acc.totalQuotations += item.quotationCount
							return acc
						},
						{ totalRevenue: 0, totalQuotations: 0 }
					)

					res.status(ResponseCode.SUCCESS).json({
						status: true,
						message: "Revenue trend fetched successfully",
						data: {
							trend,
							summary: {
								totalRevenue: Math.round(grandTotal.totalRevenue * 100) / 100,
								totalQuotations: grandTotal.totalQuotations,
								avgRevenuePerQuotation:
									grandTotal.totalQuotations > 0
										? Math.round(
											(grandTotal.totalRevenue / grandTotal.totalQuotations) * 100
										  ) / 100
										: 0
							}
						}
					})
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => dbError(error, res))
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GET /super-admin/analytics/top-performers
// Top N SalesPersons ranked by customers added or revenue.
// Query params:
//   limit  — how many SPs to return (default 10, max 50)
//   sortBy — "customers" | "quotations" | "revenue" (default: revenue)
// ─────────────────────────────────────────────────────────────────────────────

export const GetTopPerformers = (
	req: Request,
	res: Response<Res>
): void => {
	const limit = Math.min(50, parseInt(req.query.limit as string) || 10)
	const sortBy = (req.query.sortBy as string) || "revenue"

	const validSortFields = ["customers", "quotations", "revenue"]
	if (!validSortFields.includes(sortBy)) {
		res.status(ResponseCode.BAD_REQUEST).json({
			status: false,
			message: "Invalid sortBy. Use: customers, quotations, revenue"
		})
		return
	}

	resolveSpScope()
		.then((spIds) => {
			if (spIds.length === 0) {
				return res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Top performers fetched successfully",
					data: []
				})
			}

			SalesPersonModel.aggregate([
				{ $match: { _id: { $in: spIds } } },

				// Customers count
				{
					$lookup: {
						from: "customerdetails",
						localField: "_id",
						foreignField: "salesPersonId",
						as: "customers"
					}
				},

				// Quotations + revenue
				{
					$lookup: {
						from: "quotations",
						localField: "_id",
						foreignField: "salesPersonId",
						as: "quotations"
					}
				},

				// Surveys count
				{
					$lookup: {
						from: "sitesurveys",
						localField: "_id",
						foreignField: "salesPersonId",
						as: "surveys"
					}
				},

				// Compute revenue from Quotation.data[]
				{
					$addFields: {
						customerCount: { $size: "$customers" },
						surveyCount: { $size: "$surveys" },
						quotationCount: { $size: "$quotations" },
						revenue: {
							$reduce: {
								input: {
									$reduce: {
										input: "$quotations",
										initialValue: [] as any[],
										in: {
											$concatArrays: [
												"$$value",
												{ $ifNull: ["$$this.data", []] }
											]
										}
									}
								},
								initialValue: 0,
								in: {
									$add: [
										"$$value",
										{
											$multiply: [
												{ $toDouble: { $ifNull: ["$$this.price", 0] } },
												{ $ifNull: ["$$this.quantity", 1] }
											]
										}
									]
								}
							}
						}
					}
				},

				// Sort by requested field
				{
					$sort: ((): Record<string, 1 | -1> => {
						if (sortBy === "quotations") return { quotationCount: -1 }
						if (sortBy === "revenue") return { revenue: -1 }
						return { customerCount: -1 }
					})()
				},

				{ $limit: limit },

				// Round revenue
				{
					$addFields: {
						revenue: { $round: ["$revenue", 2] }
					}
				},

				// Exclude sensitive fields
				{
					$project: {
						token: 0,
						__v: 0,
						password: 0,
						aadharCardFront: 0,
						aadharCardBack: 0,
						panCardFront: 0,
						cancelChequePhoto: 0,
						selfie: 0,
						customers: 0,
						quotations: 0,
						surveys: 0
					}
				}
			])
				.then((performers) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						message: "Top performers fetched successfully",
						data: performers
					})
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => dbError(error, res))
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. GET /super-admin/analytics/system-type-breakdown
// Distribution of Quotation.sytemType values (On-Grid, Off-Grid, Hybrid etc.)
// ─────────────────────────────────────────────────────────────────────────────

export const GetSystemTypeBreakdown = (
	req: Request,
	res: Response<Res>
): void => {
	resolveSpScope()
		.then((spIds) => {
			if (spIds.length === 0) {
				return res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "System type breakdown fetched successfully",
					data: []
				})
			}

			QuotationModel.aggregate([
				{ $match: { salesPersonId: { $in: spIds } } },
				{
					$group: {
						_id: { $ifNull: ["$sytemType", "Unknown"] },
						count: { $sum: 1 }
					}
				},
				{ $sort: { count: -1 } },
				{
					$project: {
						_id: 0,
						systemType: "$_id",
						count: "$count"
					}
				}
			])
				.then((breakdown) => {
					const total = (breakdown as any[]).reduce(
						(acc, item) => acc + item.count,
						0
					)

					const withPct = (breakdown as any[]).map((item) => ({
						...item,
						percentage:
							total > 0
								? Math.round((item.count / total) * 1000) / 10
								: 0
					}))

					res.status(ResponseCode.SUCCESS).json({
						status: true,
						message: "System type breakdown fetched successfully",
						data: {
							breakdown: withPct,
							total
						}
					})
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => dbError(error, res))
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildEmptyFunnel() {
	const stages = [
		"Customers Added",
		"Site Survey Done",
		"Quotation Created",
		"Fully Converted"
	]
	return {
		funnel: stages.map((stage) => ({
			stage,
			count: 0,
			dropOff: 0,
			dropOffRate: "0%",
			cumulativeRate: "0%"
		})),
		summary: {
			totalCustomers: 0,
			overallConversionRate: "0%",
			surveyCompletionRate: "0%",
			quotationRate: "0%"
		}
	}
}