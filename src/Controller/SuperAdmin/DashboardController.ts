import { Request, Response } from "express"
import mongoose from "mongoose"
import UserModel from "../../Model/User"
import SalesPersonModel from "../../Model/SalesPerson"
import CustomerModel from "../../Model/Customer"
import SiteSurveyModel from "../../Model/SiteSurvey"
import QuotationModel from "../../Model/Quotation"
import { Res } from "../../Lib/DataTypes/Common"
import { ResponseCode } from "../../Lib/Utils/ResponseCode"
import { dbError } from "../../Lib/Utils/ErrorHandler"

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Builds an aggregation pipeline that buckets documents into the last N months.
 * Returns an array like: [{ month: "2025-01", count: 12 }, ...]
 */
function buildMonthlyTrendPipeline(matchStage: object, months: number = 6) {
	const since = new Date()
	since.setMonth(since.getMonth() - months)
	since.setDate(1)
	since.setHours(0, 0, 0, 0)

	return [
		{ $match: { ...matchStage, createdAt: { $gte: since } } },
		{
			$group: {
				_id: {
					year: { $year: "$createdAt" },
					month: { $month: "$createdAt" }
				},
				count: { $sum: 1 }
			}
		},
		{ $sort: { "_id.year": 1, "_id.month": 1 } as any },
		{
			$project: {
				_id: 0,
				month: {
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
				},
				count: "$count"
			}
		}
	]
}

// ─── Controller ──────────────────────────────────────────────────────────────

export const GetSuperAdminDashboard = (
	req: Request,
	res: Response<Res>
): void => {
	// No auth required — fetch ALL admins across the platform
	UserModel.find(
		{ userType: "Admin", isDeleted: false },
		{ _id: 1, code: 1 }
	)
		.lean()
		.then((admins) => {
			const adminIds = admins.map((a) => a._id)

			if (adminIds.length === 0) {
				return res.status(ResponseCode.SUCCESS).json({
					status: true,
					message: "Dashboard data fetched successfully",
					data: buildEmptyDashboard()
				})
			}

			Promise.all([

				// ── KPI 1: Admin counts (total, org type breakdown) ──────────
				UserModel.aggregate([
					{
						$match: {
							userType: "Admin",
							isDeleted: false
						}
					},
					{
						$group: {
							_id: "$adminType",
							count: { $sum: 1 }
						}
					}
				]),

				// ── KPI 2: SalesPerson counts by status ──────────────────────
				SalesPersonModel.aggregate([
					{ $match: { adminId: { $in: adminIds } } },
					{
						$group: {
							_id: "$status",
							count: { $sum: 1 }
						}
					}
				]),

				// ── KPI 3: Customer totals ────────────────────────────────────
				SalesPersonModel.aggregate([
					{ $match: { adminId: { $in: adminIds } } },
					{
						$lookup: {
							from: "customerdetails",
							localField: "_id",
							foreignField: "salesPersonId",
							as: "customers"
						}
					},
					{ $unwind: { path: "$customers", preserveNullAndEmptyArrays: true } },
					{
						$group: {
							_id: null,
							totalCustomers: { $sum: 1 },
							verifiedCustomers: {
								$sum: {
									$cond: [{ $eq: ["$customers.verify", true] }, 1, 0]
								}
							}
						}
					},
					{ $project: { _id: 0, totalCustomers: 1, verifiedCustomers: 1 } }
				]),

				// ── KPI 4: SiteSurvey totals ──────────────────────────────────
				SalesPersonModel.aggregate([
					{ $match: { adminId: { $in: adminIds } } },
					{
						$lookup: {
							from: "sitesurveys",
							localField: "_id",
							foreignField: "salesPersonId",
							as: "surveys"
						}
					},
					{ $unwind: { path: "$surveys", preserveNullAndEmptyArrays: true } },
					{
						$group: {
							_id: null,
							totalSurveys: { $sum: 1 },
							withLoan: {
								$sum: {
									$cond: [{ $eq: ["$surveys.loanRequired", true] }, 1, 0]
								}
							},
							withSubsidy: {
								$sum: {
									$cond: [{ $eq: ["$surveys.subsidy", true] }, 1, 0]
								}
							}
						}
					},
					{ $project: { _id: 0, totalSurveys: 1, withLoan: 1, withSubsidy: 1 } }
				]),

				// ── KPI 5: Quotation totals ───────────────────────────────────
				SalesPersonModel.aggregate([
					{ $match: { adminId: { $in: adminIds } } },
					{
						$lookup: {
							from: "quotations",
							localField: "_id",
							foreignField: "salesPersonId",
							as: "quotations"
						}
					},
					{ $unwind: { path: "$quotations", preserveNullAndEmptyArrays: true } },
					{
						$group: {
							_id: null,
							totalQuotations: { $sum: 1 }
						}
					},
					{ $project: { _id: 0, totalQuotations: 1 } }
				]),

				// ── TREND 1: Admin registrations — last 6 months ─────────────
				UserModel.aggregate(
					buildMonthlyTrendPipeline(
						{ userType: "Admin", isDeleted: false },
						6
					)
				),

				// ── TREND 2: SalesPerson registrations — last 6 months ────────
				SalesPersonModel.aggregate(
					buildMonthlyTrendPipeline(
						{ adminId: { $in: adminIds } },
						6
					)
				),

				// ── KPI 6: Top 5 Admins by SalesPerson count ─────────────────
				SalesPersonModel.aggregate([
					{ $match: { adminId: { $in: adminIds } } },
					{
						$group: {
							_id: "$adminId",
							salesPersonCount: { $sum: 1 },
							activeCount: {
								$sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] }
							}
						}
					},
					{ $sort: { salesPersonCount: -1 } },
					{ $limit: 5 },
					{
						$lookup: {
							from: "users",
							localField: "_id",
							foreignField: "_id",
							as: "admin"
						}
					},
					{ $unwind: "$admin" },
					{
						$project: {
							_id: 0,
							adminId: "$_id",
							adminName: "$admin.name",
							adminEmail: "$admin.email",
							adminType: "$admin.adminType",
							salesPersonCount: "$salesPersonCount",
							activeCount: "$activeCount"
						}
					}
				]),

				// ── KPI 7: SalesPerson level distribution ─────────────────────
				SalesPersonModel.aggregate([
					{ $match: { adminId: { $in: adminIds } } },
					{
						$group: {
							_id: "$level",
							count: { $sum: 1 }
						}
					},
					{ $sort: { _id: 1 } },
					{
						$project: {
							_id: 0,
							level: "$_id",
							count: "$count"
						}
					}
				])

			])
				.then(([
					adminTypeCounts,
					spStatusCounts,
					customerStats,
					surveyStats,
					quotationStats,
					adminTrend,
					spTrend,
					topAdmins,
					spLevelDist
				]) => {
					// ── Reshape admin type counts ──────────────────────────────
					const adminSummary = {
						total: admins.length,
						byType: adminTypeCounts.reduce(
							(acc: Record<string, number>, item: any) => {
								acc[item._id ?? "Unknown"] = item.count
								return acc
							},
							{} as Record<string, number>
						)
					}

					// ── Reshape SP status counts ────────────────────────────────
					const spSummary = {
						total: 0,
						active: 0,
						inactive: 0,
						pending: 0
					}
					spStatusCounts.forEach((item: any) => {
						const count = item.count as number
						spSummary.total += count
						if (item._id === "Active") spSummary.active = count
						else if (item._id === "Inactive") spSummary.inactive = count
						else if (item._id === "Pending") spSummary.pending = count
					})

					// ── Customer stats ─────────────────────────────────────────
					const custStats = customerStats[0] ?? {
						totalCustomers: 0,
						verifiedCustomers: 0
					}

					// ── Survey stats ───────────────────────────────────────────
					const survStats = surveyStats[0] ?? {
						totalSurveys: 0,
						withLoan: 0,
						withSubsidy: 0
					}

					// ── Quotation stats ────────────────────────────────────────
					const quotStats = quotationStats[0] ?? { totalQuotations: 0 }

					res.status(ResponseCode.SUCCESS).json({
						status: true,
						message: "Dashboard data fetched successfully",
						data: {
							kpis: {
								admins: adminSummary,
								salesPersons: spSummary,
								customers: {
									total: custStats.totalCustomers,
									verified: custStats.verifiedCustomers,
									unverified:
										custStats.totalCustomers - custStats.verifiedCustomers
								},
								siteSurveys: {
									total: survStats.totalSurveys,
									withLoan: survStats.withLoan,
									withSubsidy: survStats.withSubsidy
								},
								quotations: {
									total: quotStats.totalQuotations
								}
							},
							charts: {
								adminRegistrationTrend: adminTrend,
								salesPersonRegistrationTrend: spTrend,
								salesPersonLevelDistribution: spLevelDist
							},
							tables: {
								topAdminsBySalesPersonCount: topAdmins
							}
						}
					})
				})
				.catch((error) => {
					dbError(error, res)
				})
		})
		.catch((error) => {
			dbError(error, res)
		})
}

// ─── Empty dashboard ─────────────────────────────────────────────────────────

function buildEmptyDashboard() {
	return {
		kpis: {
			admins: { total: 0, byType: {} },
			salesPersons: { total: 0, active: 0, inactive: 0, pending: 0 },
			customers: { total: 0, verified: 0, unverified: 0 },
			siteSurveys: { total: 0, withLoan: 0, withSubsidy: 0 },
			quotations: { total: 0 }
		},
		charts: {
			adminRegistrationTrend: [],
			salesPersonRegistrationTrend: [],
			salesPersonLevelDistribution: []
		},
		tables: {
			topAdminsBySalesPersonCount: []
		}
	}
}