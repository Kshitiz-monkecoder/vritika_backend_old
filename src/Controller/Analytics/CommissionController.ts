import { Request, Response } from "express"
import mongoose from "mongoose"
import RoleCommissionModel from "../../Model/RoleCommissionModel"
import SalesPersonModel from "../../Model/SalesPerson"
import CustomerModel from "../../Model/Customer"
import QuotationModel from "../../Model/Quotation"
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
// CONVENTION BRIDGE
// The old backend's RoleCommissionModel stores commission per level using:
//   { level: Number, commissionPercentage: Number, status: Boolean, adminId, ... }
//
// This builds a Map<level, commissionPercentage> for fast lookup.
// When multiple configs exist for the same level (across different admins),
// we use the most recently created one (last-write-wins).
// ─────────────────────────────────────────────────────────────────────────────

interface OldCommissionDoc {
	_id: mongoose.Types.ObjectId
	level: number
	commissionPercentage: number
	status: boolean
	adminId: mongoose.Types.ObjectId
	type: string
	description?: string
	createdAt?: Date
}

function buildLevelToCommissionMap(
	commissions: OldCommissionDoc[]
): Map<number, OldCommissionDoc> {
	const map = new Map<number, OldCommissionDoc>()

	// Only use active commissions (status: true) for sales-person type
	const active = commissions
		.filter((c) => c.status === true && c.type === "sales-person")
		.sort(
			(a: any, b: any) =>
				new Date(a.createdAt ?? 0).getTime() -
				new Date(b.createdAt ?? 0).getTime()
		)

	for (const doc of active) {
		// Later entries overwrite earlier ones — newest config wins per level
		map.set(doc.level, doc)
	}

	return map
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED: compute total revenue per SP from Quotation.data[]
// Returns a Map: spId.toString() → totalRevenue
// ─────────────────────────────────────────────────────────────────────────────

async function computeRevenuePerSp(
	spIds: mongoose.Types.ObjectId[]
): Promise<Map<string, number>> {
	const result = await QuotationModel.aggregate([
		{ $match: { salesPersonId: { $in: spIds } } },
		{ $unwind: { path: "$data", preserveNullAndEmptyArrays: true } },
		{
			$group: {
				_id: "$salesPersonId",
				totalRevenue: {
					$sum: {
						$multiply: [
							{ $toDouble: { $ifNull: ["$data.price", 0] } },
							{ $toDouble: { $ifNull: ["$data.quantity", 1] } }
						]
					}
				}
			}
		}
	])

	const revenueMap = new Map<string, number>()
	;(result as any[]).forEach((item) => {
		revenueMap.set(item._id.toString(), Math.round(item.totalRevenue * 100) / 100)
	})

	return revenueMap
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GET /super-admin/analytics/commission-overview
// Commission rate config with SP count per level.
// Shows configured rates and how many SPs fall under each level.
// ─────────────────────────────────────────────────────────────────────────────

export const GetCommissionOverview = (
	req: Request,
	res: Response<Res>
): void => {
	resolveSpScope()
		.then((spIds) => {
			Promise.all([

				// All commission configs (sales-person type)
				RoleCommissionModel.find({ type: "sales-person" }).sort({ createdAt: 1 }).lean(),

				// SP count grouped by level, scoped to all SPs
				SalesPersonModel.aggregate([
					{ $match: { _id: { $in: spIds } } },
					{
						$group: {
							_id: "$level",
							total: { $sum: 1 },
							active: {
								$sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] }
							},
							inactive: {
								$sum: { $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0] }
							},
							pending: {
								$sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
							}
						}
					},
					{ $sort: { _id: 1 } }
				])

			])
				.then(([commissions, spByLevel]) => {
					const levelMap = buildLevelToCommissionMap(commissions as unknown as OldCommissionDoc[])

					// Build SP level map for quick lookup
					const spLevelMap = new Map<number, any>()
					;(spByLevel as any[]).forEach((item) => {
						spLevelMap.set(item._id, item)
					})

					// Build enriched level breakdown (levels 1–5)
					const levels = []
					for (let level = 1; level <= 5; level++) {
						const commission = levelMap.get(level)
						const spStats = spLevelMap.get(level) ?? {
							total: 0,
							active: 0,
							inactive: 0,
							pending: 0
						}

						// Only include levels that have either SPs or a commission config
						if (commission || spStats.total > 0) {
							levels.push({
								level,
								commissionRate: commission
									? {
										id: commission._id,
										roleName: `Level ${level}`,
										percentage: commission.commissionPercentage,
										status: commission.status ? "Active" : "Inactive"
									}
									: null,
								salesPersons: {
									total: spStats.total,
									active: spStats.active,
									inactive: spStats.inactive,
									pending: spStats.pending
								},
								configured: !!commission
							})
						}
					}

					// Summary: which active levels have no config?
					const unconfiguredLevels = levels
						.filter((l) => !l.configured && l.salesPersons.total > 0)
						.map((l) => l.level)

					// Expose raw commission config in a frontend-friendly shape
					const commissionConfig = (commissions as unknown as OldCommissionDoc[]).map((c) => ({
						id: c._id,
						level: c.level,
						roleName: `Level ${c.level}`,
						percentage: c.commissionPercentage,
						status: c.status ? "Active" : "Inactive",
						type: c.type,
						description: (c as any).description ?? ""
					}))

					res.status(ResponseCode.SUCCESS).json({
						status: true,
						message: "Commission overview fetched successfully",
						data: {
							summary: {
								totalCommissionRules: (commissions as any[]).length,
								activeRules: (commissions as unknown as OldCommissionDoc[]).filter(
									(c) => c.status === true
								).length,
								totalSpsScoped: spIds.length,
								unconfiguredLevels,
								configurationComplete: unconfiguredLevels.length === 0
							},
							levels,
							commissionConfig
						}
					})
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => dbError(error, res))
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET /super-admin/analytics/commission-estimated-payouts
// Per-SP estimated commission payout.
// Query params:
//   limit  — how many SPs to return (default 50, max 200)
//   sortBy — "commission" | "customers" | "revenue" (default: commission)
// ─────────────────────────────────────────────────────────────────────────────

export const GetEstimatedPayouts = (
	req: Request,
	res: Response<Res>
): void => {
	const limit = Math.min(200, parseInt(req.query.limit as string) || 50)
	const sortBy = (req.query.sortBy as string) || "commission"

	const validSortFields = ["commission", "customers", "revenue"]
	if (!validSortFields.includes(sortBy)) {
		res.status(ResponseCode.BAD_REQUEST).json({
			status: false,
			message: "Invalid sortBy. Use: commission, customers, revenue"
		})
		return
	}

	resolveSpScope()
		.then(async (spIds) => {
			if (spIds.length === 0) {
				return res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Estimated payouts fetched successfully",
					data: { salesPersons: [], summary: { totalSps: 0, totalRevenue: 0, totalEstimatedPayout: 0, spsWithoutCommissionConfig: 0 } }
				})
			}

			const [commissions, revenueMap, salesPersons, customerCounts] =
				await Promise.all([
					RoleCommissionModel.find({ type: "sales-person" }).sort({ createdAt: 1 }).lean(),
					computeRevenuePerSp(spIds),

					SalesPersonModel.find(
						{ _id: { $in: spIds } },
						{
							_id: 1,
							name: 1,
							email: 1,
							phoneNumber: 1,
							level: 1,
							status: 1,
							adminId: 1
						}
					).lean(),

					// Customer count per SP
					CustomerModel.aggregate([
						{ $match: { salesPersonId: { $in: spIds } } },
						{
							$group: {
								_id: "$salesPersonId",
								count: { $sum: 1 }
							}
						}
					]).then((agg) => {
						const map = new Map<string, number>()
						;(agg as any[]).forEach((item) => map.set(item._id.toString(), item.count))
						return map
					})
				])

			const levelMap = buildLevelToCommissionMap(commissions as unknown as OldCommissionDoc[])

			const enriched = (salesPersons as any[]).map((sp) => {
				const revenue = revenueMap.get(sp._id.toString()) ?? 0
				const config = levelMap.get(sp.level)
				const rate = config?.commissionPercentage ?? 0
				const estimatedCommission = Math.round(revenue * (rate / 100) * 100) / 100
				const customerCount = customerCounts.get(sp._id.toString()) ?? 0

				return {
					salesPersonId: sp._id,
					name: sp.name,
					email: sp.email,
					phone: sp.phoneNumber,
					level: sp.level,
					status: sp.status,
					customerCount,
					totalRevenue: revenue,
					commissionRate: rate,
					estimatedCommission,
					hasCommissionConfig: !!config
				}
			})

			// Sort
			if (sortBy === "revenue") {
				enriched.sort((a, b) => b.totalRevenue - a.totalRevenue)
			} else if (sortBy === "customers") {
				enriched.sort((a, b) => b.customerCount - a.customerCount)
			} else {
				enriched.sort((a, b) => b.estimatedCommission - a.estimatedCommission)
			}

			const paginated = enriched.slice(0, limit)

			const totalEstimatedPayout = enriched.reduce(
				(acc, sp) => acc + sp.estimatedCommission,
				0
			)
			const totalRevenue = enriched.reduce(
				(acc, sp) => acc + sp.totalRevenue,
				0
			)

			res.status(ResponseCode.SUCCESS).json({
				status: true,
				message: "Estimated payouts fetched successfully",
				data: {
					salesPersons: paginated,
					summary: {
						totalSps: enriched.length,
						totalRevenue: Math.round(totalRevenue * 100) / 100,
						totalEstimatedPayout: Math.round(totalEstimatedPayout * 100) / 100,
						spsWithoutCommissionConfig: enriched.filter(
							(sp) => !sp.hasCommissionConfig
						).length
					}
				}
			})
		})
		.catch((error) => dbError(error, res))
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET /super-admin/analytics/commission-by-level
// Level-wise aggregated estimated payout — bar chart data.
// ─────────────────────────────────────────────────────────────────────────────

export const GetCommissionByLevel = (
	req: Request,
	res: Response<Res>
): void => {
	resolveSpScope()
		.then((spIds) => {
			if (spIds.length === 0) {
				return res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Commission by level fetched successfully",
					data: []
				})
			}

			Promise.all([
				RoleCommissionModel.find({ type: "sales-person" }).sort({ createdAt: 1 }).lean(),
				computeRevenuePerSp(spIds),
				SalesPersonModel.find(
					{ _id: { $in: spIds } },
					{ _id: 1, level: 1, status: 1 }
				).lean()
			])
				.then(([commissions, revenueMap, salesPersons]) => {
					const levelMap = buildLevelToCommissionMap(commissions as unknown as OldCommissionDoc[])

					// Aggregate revenue and commission per level
					const levelStats = new Map<
						number,
						{
							totalRevenue: number
							totalCommission: number
							spCount: number
							activeSps: number
							commissionRate: number
							roleName: string
						}
					>()

					;(salesPersons as any[]).forEach((sp) => {
						const revenue = revenueMap.get(sp._id.toString()) ?? 0
						const config = levelMap.get(sp.level)
						const rate = config?.commissionPercentage ?? 0
						const commission = Math.round(revenue * (rate / 100) * 100) / 100

						if (!levelStats.has(sp.level)) {
							levelStats.set(sp.level, {
								totalRevenue: 0,
								totalCommission: 0,
								spCount: 0,
								activeSps: 0,
								commissionRate: rate,
								roleName: config ? `Level ${sp.level}` : `Level ${sp.level} (no config)`
							})
						}

						const entry = levelStats.get(sp.level)!
						entry.totalRevenue += revenue
						entry.totalCommission += commission
						entry.spCount += 1
						if (sp.status === "Active") entry.activeSps += 1
					})

					// Convert to sorted array
					const result = Array.from(levelStats.entries())
						.sort((a, b) => a[0] - b[0])
						.map(([level, stats]) => ({
							level,
							roleName: stats.roleName,
							commissionRate: stats.commissionRate,
							spCount: stats.spCount,
							activeSps: stats.activeSps,
							totalRevenue: Math.round(stats.totalRevenue * 100) / 100,
							totalEstimatedCommission: Math.round(stats.totalCommission * 100) / 100,
							avgCommissionPerSp:
								stats.spCount > 0
									? Math.round((stats.totalCommission / stats.spCount) * 100) / 100
									: 0
						}))

					// Grand totals
					const grandTotal = result.reduce(
						(acc, item) => {
							acc.totalRevenue += item.totalRevenue
							acc.totalCommission += item.totalEstimatedCommission
							return acc
						},
						{ totalRevenue: 0, totalCommission: 0 }
					)

					res.status(ResponseCode.SUCCESS).json({
						status: true,
						message: "Commission by level fetched successfully",
						data: {
							byLevel: result,
							grandTotal: {
								totalRevenue: Math.round(grandTotal.totalRevenue * 100) / 100,
								totalEstimatedCommission: Math.round(grandTotal.totalCommission * 100) / 100
							}
						}
					})
				})
				.catch((error) => dbError(error, res))
		})
		.catch((error) => dbError(error, res))
}