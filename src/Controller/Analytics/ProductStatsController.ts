import { Request, Response } from "express"
import mongoose, { PipelineStage } from "mongoose"
import ProductModel from "../../Model/Product"
import QuotationModel from "../../Model/Quotation"
import BrandModel from "../../Model/Brand"
import SalesPersonModel from "../../Model/SalesPerson"
import { Res } from "../../Lib/DataTypes/Common"
import { ResponseCode } from "../../Lib/Utils/ResponseCode"
import { dbError } from "../../Lib/Utils/ErrorHandler"

// ─────────────────────────────────────────────────────────────────────────────
// SCOPE RESOLVER
// No login required — always returns ALL salespersons.
// ─────────────────────────────────────────────────────────────────────────────

async function resolveSpScope(): Promise<mongoose.Types.ObjectId[]> {
	const sps = await SalesPersonModel.find({}, { _id: 1 }).lean()
	return sps.map((sp) => sp._id as mongoose.Types.ObjectId)
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: base pipeline stages for mining Quotation.data[]
// Unwinds data[], scopes by spIds, filters null/empty items,
// and computes a lineRevenue field on each item.
// ─────────────────────────────────────────────────────────────────────────────

function buildQuotationDataPipeline(
	spIds: mongoose.Types.ObjectId[]
): PipelineStage[] {
	return [
		// Scope to these quotations
		{ $match: { salesPersonId: { $in: spIds } } },

		// Explode data[] — one document per product line item
		{ $unwind: { path: "$data", preserveNullAndEmptyArrays: false } },

		// Drop items with no product info
		{
			$match: {
				"data.productName": {
					$exists: true,
					$nin: [null, ""]
				}
			}
		},

		// Normalize revenue per line item
		{
			$addFields: {
				"data.lineRevenue": {
					$multiply: [
						{ $toDouble: { $ifNull: ["$data.price", 0] } },
						{ $toDouble: { $ifNull: ["$data.quantity", 1] } }
					]
				}
			}
		}
	]
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /super-admin/analytics/product-catalog-summary
// Pure catalog stats — counts products by type, by category, price stats.
// ─────────────────────────────────────────────────────────────────────────────

export const GetProductCatalogSummary = (
	_req: Request,
	res: Response<Res>
): void => {
	Promise.all([

		// Total product count
		ProductModel.countDocuments(),

		// Count by product type
		ProductModel.aggregate([
			{
				$group: {
					_id: { $ifNull: ["$type", "Unknown"] },
					count: { $sum: 1 },
					avgPrice: { $avg: "$price" },
					minPrice: { $min: "$price" },
					maxPrice: { $max: "$price" }
				}
			},
			{ $sort: { count: -1 } },
			{
				$project: {
					_id: 0,
					type: "$_id",
					count: "$count",
					avgPrice: { $round: ["$avgPrice", 2] },
					minPrice: "$minPrice",
					maxPrice: "$maxPrice"
				}
			}
		]),

		// Count by category
		ProductModel.aggregate([
			{
				$match: {
					category: { $exists: true, $nin: [null, ""] }
				}
			},
			{
				$group: {
					_id: "$category",
					count: { $sum: 1 }
				}
			},
			{ $sort: { count: -1 } },
			{
				$project: {
					_id: 0,
					category: "$_id",
					count: "$count"
				}
			}
		]),

		// Overall price stats across whole catalog
		ProductModel.aggregate([
			{
				$group: {
					_id: null,
					avgPrice: { $avg: "$price" },
					minPrice: { $min: "$price" },
					maxPrice: { $max: "$price" },
					totalCatalogValue: { $sum: "$price" }
				}
			},
			{
				$project: {
					_id: 0,
					avgPrice: { $round: ["$avgPrice", 2] },
					minPrice: "$minPrice",
					maxPrice: "$maxPrice",
					totalCatalogValue: { $round: ["$totalCatalogValue", 2] }
				}
			}
		]),

		// Brand count
		BrandModel.countDocuments()

	])
		.then(([totalProducts, byType, byCategory, priceStats, totalBrands]) => {
			res.status(ResponseCode.SUCCESS).json({
				status: true,
				message: "Product catalog summary fetched successfully",
				data: {
					overview: {
						totalProducts,
						totalBrands,
						...((priceStats as any[])[0] ?? {
							avgPrice: 0,
							minPrice: 0,
							maxPrice: 0,
							totalCatalogValue: 0
						})
					},
					byType,
					byCategory
				}
			})
		})
		.catch((error) => dbError(error, res))
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /super-admin/analytics/product-usage-in-quotations
// Which product types and names appear most in quotations.
// Query params:
//   limit — top N product names (default 10, max 50)
// ─────────────────────────────────────────────────────────────────────────────

export const GetProductUsageInQuotations = (
	req: Request,
	res: Response<Res>
): void => {
	const limit = Math.min(50, parseInt(req.query.limit as string) || 10)

	resolveSpScope()
		.then((spIds) => {
			if (spIds.length === 0) {
				return res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Product usage fetched successfully",
					data: { byType: [], byProduct: [] }
				})
			}

			const basePipeline = buildQuotationDataPipeline(spIds)

			Promise.all([

				// Usage count grouped by product TYPE
				QuotationModel.aggregate([
					...basePipeline,
					{
						$group: {
							_id: { $ifNull: ["$data.type", "Unknown"] },
							usageCount: { $sum: 1 },
							totalQuantity: {
								$sum: { $toDouble: { $ifNull: ["$data.quantity", 1] } }
							},
							totalRevenue: { $sum: "$data.lineRevenue" }
						}
					},
					{ $sort: { usageCount: -1 } },
					{
						$project: {
							_id: 0,
							productType: "$_id",
							usageCount: "$usageCount",
							totalQuantity: { $round: ["$totalQuantity", 0] },
							totalRevenue: { $round: ["$totalRevenue", 2] }
						}
					}
				]),

				// Usage count grouped by product NAME (top N)
				QuotationModel.aggregate([
					...basePipeline,
					{
						$group: {
							_id: {
								productName: { $ifNull: ["$data.productName", "Unknown"] },
								productType: { $ifNull: ["$data.type", "Unknown"] }
							},
							usageCount: { $sum: 1 },
							totalQuantity: {
								$sum: { $toDouble: { $ifNull: ["$data.quantity", 1] } }
							},
							totalRevenue: { $sum: "$data.lineRevenue" }
						}
					},
					{ $sort: { usageCount: -1 } },
					{ $limit: limit },
					{
						$project: {
							_id: 0,
							productName: "$_id.productName",
							productType: "$_id.productType",
							usageCount: "$usageCount",
							totalQuantity: { $round: ["$totalQuantity", 0] },
							totalRevenue: { $round: ["$totalRevenue", 2] }
						}
					}
				])

			])
				.then(([byType, byProduct]) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						message: "Product usage fetched successfully",
						data: { byType, byProduct }
					})
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => dbError(error, res))
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /super-admin/analytics/top-products-by-revenue
// Top N products ranked by total revenue from quotation line items.
// Query params:
//   limit — top N (default 10, max 50)
//   type  — optional filter by product type e.g. "Solar Module"
// ─────────────────────────────────────────────────────────────────────────────

export const GetTopProductsByRevenue = (
	req: Request,
	res: Response<Res>
): void => {
	const limit = Math.min(50, parseInt(req.query.limit as string) || 10)
	const typeFilter = req.query.type as string | undefined

	resolveSpScope()
		.then((spIds) => {
			if (spIds.length === 0) {
				return res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Top products by revenue fetched successfully",
					data: []
				})
			}

			const basePipeline = buildQuotationDataPipeline(spIds)
			const typeFilterStage = typeFilter
				? [{ $match: { "data.type": typeFilter } }]
				: []

			QuotationModel.aggregate([
				...basePipeline,
				...typeFilterStage,
				{
					$group: {
						_id: {
							productName: { $ifNull: ["$data.productName", "Unknown"] },
							productType: { $ifNull: ["$data.type", "Unknown"] },
							capacity: { $ifNull: ["$data.capacity", null] }
						},
						totalRevenue: { $sum: "$data.lineRevenue" },
						totalQuantitySold: {
							$sum: { $toDouble: { $ifNull: ["$data.quantity", 1] } }
						},
						quotationCount: { $sum: 1 },
						avgUnitPrice: { $avg: { $toDouble: { $ifNull: ["$data.price", 0] } } }
					}
				},
				{ $sort: { totalRevenue: -1 } },
				{ $limit: limit },
				{
					$project: {
						_id: 0,
						productName: "$_id.productName",
						productType: "$_id.productType",
						capacity: "$_id.capacity",
						totalRevenue: { $round: ["$totalRevenue", 2] },
						totalQuantitySold: { $round: ["$totalQuantitySold", 0] },
						quotationCount: "$quotationCount",
						avgUnitPrice: { $round: ["$avgUnitPrice", 2] }
					}
				}
			])
				.then((products) => {
					res.status(ResponseCode.SUCCESS).json({
						status: true,
						message: "Top products by revenue fetched successfully",
						data: products
					})
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => dbError(error, res))
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET /super-admin/analytics/product-type-revenue-breakdown
// Revenue split across product types — pie/donut chart data.
// ─────────────────────────────────────────────────────────────────────────────

export const GetProductTypeRevenueBreakdown = (
	req: Request,
	res: Response<Res>
): void => {
	resolveSpScope()
		.then((spIds) => {
			if (spIds.length === 0) {
				return res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Product type revenue breakdown fetched successfully",
					data: { breakdown: [], totalRevenue: 0 }
				})
			}

			const basePipeline = buildQuotationDataPipeline(spIds)

			QuotationModel.aggregate([
				...basePipeline,
				{
					$group: {
						_id: { $ifNull: ["$data.type", "Unknown"] },
						revenue: { $sum: "$data.lineRevenue" },
						itemCount: { $sum: 1 }
					}
				},
				{ $sort: { revenue: -1 } },
				{
					$project: {
						_id: 0,
						productType: "$_id",
						revenue: { $round: ["$revenue", 2] },
						itemCount: "$itemCount"
					}
				}
			])
				.then((breakdown) => {
					const totalRevenue = (breakdown as any[]).reduce(
						(acc, item) => acc + item.revenue,
						0
					)

					const withPct = (breakdown as any[]).map((item) => ({
						...item,
						revenueShare:
							totalRevenue > 0
								? Math.round((item.revenue / totalRevenue) * 1000) / 10
								: 0
					}))

					res.status(ResponseCode.SUCCESS).json({
						status: true,
						message: "Product type revenue breakdown fetched successfully",
						data: {
							breakdown: withPct,
							totalRevenue: Math.round(totalRevenue * 100) / 100
						}
					})
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => dbError(error, res))
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GET /super-admin/analytics/brand-performance
// Per-brand stats: how many catalog products, how often quoted, total revenue.
// Joins Brand catalog → Product catalog → Quotation data[].
// ─────────────────────────────────────────────────────────────────────────────

export const GetBrandPerformance = (
	req: Request,
	res: Response<Res>
): void => {
	resolveSpScope()
		.then((spIds) => {
			if (spIds.length === 0) {
				return res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Brand performance fetched successfully",
					data: []
				})
			}

			const basePipeline = buildQuotationDataPipeline(spIds)

			// Step 1: Mine quotation data[] — get revenue and usage per productName
			QuotationModel.aggregate([
				...basePipeline,
				{
					$group: {
						_id: { $ifNull: ["$data.productName", "Unknown"] },
						timesQuoted: { $sum: 1 },
						totalRevenue: { $sum: "$data.lineRevenue" },
						totalQty: {
							$sum: { $toDouble: { $ifNull: ["$data.quantity", 1] } }
						}
					}
				}
			])
				.then((quotationStats) => {
					// Build lookup map: productName → quotation stats
					const quotationStatMap = new Map<string, any>()
					;(quotationStats as any[]).forEach((item) => {
						quotationStatMap.set(item._id, {
							timesQuoted: item.timesQuoted,
							totalRevenue: item.totalRevenue,
							totalQty: item.totalQty
						})
					})

					// Step 2: Pull brand + product catalog, merge quotation stats
					BrandModel.aggregate([
						{
							$lookup: {
								from: "products",
								localField: "_id",
								foreignField: "spvBrand",
								as: "products"
							}
						},
						{
							$project: {
								__v: 0,
								brandDetails: 0,
								"products.__v": 0
							}
						}
					])
						.then((brands) => {
							const enriched = (brands as any[]).map((brand) => {
								let brandTimesQuoted = 0
								let brandRevenue = 0
								let brandQty = 0

								const productsWithStats = brand.products.map((product: any) => {
									const stats = quotationStatMap.get(product.productName) ?? {
										timesQuoted: 0,
										totalRevenue: 0,
										totalQty: 0
									}
									brandTimesQuoted += stats.timesQuoted
									brandRevenue += stats.totalRevenue
									brandQty += stats.totalQty

									return {
										...product,
										timesQuoted: stats.timesQuoted,
										totalRevenue: Math.round(stats.totalRevenue * 100) / 100,
										totalQty: Math.round(stats.totalQty)
									}
								})

								return {
									brandId: brand._id,
									brandName: brand.brandName,
									quality: brand.quality,
									productCategories: brand.productCategory,
									catalogProductCount: brand.products.length,
									totalTimesQuoted: brandTimesQuoted,
									totalRevenue: Math.round(brandRevenue * 100) / 100,
									totalQuantitySold: Math.round(brandQty),
									products: productsWithStats
								}
							})

							enriched.sort((a, b) => b.totalRevenue - a.totalRevenue)

							res.status(ResponseCode.SUCCESS).json({
								status: true,
								message: "Brand performance fetched successfully",
								data: enriched
							})
						})
						.catch((error) => dbError(error, res))
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => dbError(error, res))
}