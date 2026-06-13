import { Request, Response } from "express"
import mongoose from "mongoose"
import { Res } from "../../Lib/DataTypes/Common"
import { ResponseCode } from "../../Lib/Utils/ResponseCode"
import SalesPersonModel from "../../Model/SalesPerson"
import QuotationModel from "../../Model/Quotation"
import RoleCommissionModel from "../../Model/RoleCommissionModel"

// ─── Shared helpers ────────────────────────────────────────────────────────────

/** Builds a Mongoose date range match from optional query params */
function buildDateFilter(
  date_from?: string,
  date_to?: string
): Record<string, unknown> {
  if (!date_from && !date_to) return {}
  const createdAt: Record<string, Date> = {}
  if (date_from) createdAt.$gte = new Date(date_from)
  if (date_to) createdAt.$lte = new Date(`${date_to}T23:59:59.999Z`)
  return { createdAt }
}

/**
 * Sums the totalPrice values inside Quotation.data[] (which is any[]).
 * Used identically in every aggregation pipeline.
 */
const quotationValueExpr = {
  $cond: [
    { $isArray: "$data" },
    {
      $reduce: {
        input: "$data",
        initialValue: 0,
        in: { $add: ["$$value", { $ifNull: ["$$this.totalPrice", 0] }] },
      },
    },
    0,
  ],
}

// ─── Response shapes ────────────────────────────────────────────────────────────

interface TopPerson {
  _id: string
  name: string
  orderValue: number
}

interface DashboardSummaryData {
  totalRevenue: number
  totalQuotationValue: number
  convertedOrderValue: number
  totalAgents: number
  activeAgents: number
  totalSalespersons: number
  activeSalespersons: number
  holdingWallet: number
  actualWallet: number
  totalCommissionPayable: number
  topAgent: TopPerson | null
  topSalesperson: TopPerson | null
  revenueTrend: { date: string; value: number }[]
  quotationFunnel: {
    created: number
    pending: number
    approved: number
    converted: number
  }
}

// ─── 1. GET /api/v1/admin/analytics/dashboard-summary ─────────────────────────

export const getDashboardSummary = async (
  req: Request,
  res: Response<Res<DashboardSummaryData>>
): Promise<void> => {
  const adminId = (req as any).user?._id
  const { date_from, date_to } = req.query as Record<string, string>

  try {
    const adminObjectId = new mongoose.Types.ObjectId(adminId)
    const dateFilter = buildDateFilter(date_from, date_to)

    // All SalesPersons belonging to this admin
    const allSPs = await SalesPersonModel.find({ adminId: adminObjectId })
      .select("_id level status")
      .lean()

    const allIds = allSPs.map((sp) => sp._id)
    const totalAgents = allSPs.length
    const activeAgents = allSPs.filter((sp) => sp.status === "Active").length
    const totalSalespersons = allSPs.length

    // Active salespersons = those with at least 1 quotation in the date range
    const activeSpAgg = await QuotationModel.aggregate([
      {
        $match: {
          salesPersonId: { $in: allIds },
          ...dateFilter,
        },
      },
      { $group: { _id: "$salesPersonId" } },
    ])
    const activeSalespersons = activeSpAgg.length

    // Quotation totals
    const quotationAgg = await QuotationModel.aggregate([
      {
        $match: {
          salesPersonId: { $in: allIds },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalValue: { $sum: quotationValueExpr },
        },
      },
    ])
    const totalQuotationValue: number = quotationAgg[0]?.totalValue ?? 0
    const quotationTotal: number = quotationAgg[0]?.total ?? 0

    // Revenue trend — grouped by month
    const revenueTrend = await QuotationModel.aggregate([
      { $match: { salesPersonId: { $in: allIds } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          value: { $sum: quotationValueExpr },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
      { $project: { _id: 0, date: "$_id", value: 1 } },
    ])

    // Top salesperson by total quotation value
    const topSpAgg = await QuotationModel.aggregate([
      { $match: { salesPersonId: { $in: allIds } } },
      {
        $group: {
          _id: "$salesPersonId",
          orderValue: { $sum: quotationValueExpr },
        },
      },
      { $sort: { orderValue: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "salespeople",
          localField: "_id",
          foreignField: "_id",
          as: "sp",
        },
      },
      { $unwind: { path: "$sp", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, name: "$sp.name", orderValue: 1 } },
    ])
    const topSalesperson: TopPerson | null = topSpAgg[0]
      ? {
          _id: topSpAgg[0]._id.toString(),
          name: topSpAgg[0].name ?? "—",
          orderValue: topSpAgg[0].orderValue,
        }
      : null

    // Commission payable = sum of all active role commission percentages
    const roles = await RoleCommissionModel.find({ status: "Active" }).lean()
    const totalCommissionPayable = roles.reduce(
      (acc, r) => acc + (r.commission ?? 0),
      0
    )

    // TODO: WalletLedger collection does not exist yet — returning 0
    // Replace once the WalletLedger model is created and confirmed with backend team
    const holdingWallet = 0
    const actualWallet = 0

    res.status(ResponseCode.SUCCESS).json({
      status: true,
      message: "Dashboard summary fetched successfully",
      data: {
        totalRevenue: totalQuotationValue,
        totalQuotationValue,
        convertedOrderValue: totalQuotationValue, // TODO: update once Order.value field confirmed
        totalAgents,
        activeAgents,
        totalSalespersons,
        activeSalespersons,
        holdingWallet,
        actualWallet,
        totalCommissionPayable,
        topAgent: null, // TODO: distinguish agents vs leaf salespersons once hierarchy is confirmed
        topSalesperson,
        revenueTrend,
        quotationFunnel: {
          created: quotationTotal,
          pending: 0,   // TODO: update once Quotation.status values are confirmed
          approved: 0,
          converted: 0,
        },
      },
    })
  } catch (error) {
    console.error("[AnalyticsController] getDashboardSummary:", error)
    res.status(ResponseCode.SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch dashboard summary",
    })
  }
}

// ─── 2. GET /api/v1/admin/analytics/agents ─────────────────────────────────────

export const getAgentsAnalytics = async (
  req: Request,
  res: Response
): Promise<void> => {
  const adminId = (req as any).user?._id
  const {
    date_from,
    date_to,
    level,
    status,
    page = "1",
    limit = "20",
  } = req.query as Record<string, string>

  try {
    const adminObjectId = new mongoose.Types.ObjectId(adminId)
    const pageNum = Math.max(parseInt(page, 10) || 1, 1)
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100)
    const skip = (pageNum - 1) * limitNum

    // Build agent filter — all SalesPersons under this admin
    const agentFilter: Record<string, unknown> = { adminId: adminObjectId }
    if (level) agentFilter.level = parseInt(level, 10)
    if (status) agentFilter.status = status

    const [agents, total] = await Promise.all([
      SalesPersonModel.find(agentFilter)
        .select("_id name level status parentSalesPerson createdAt")
        .populate("parentSalesPerson", "name level")
        .sort({ level: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SalesPersonModel.countDocuments(agentFilter),
    ])

    const agentIds = agents.map((a) => a._id)

    // Direct child count per agent
    const childCounts = await SalesPersonModel.aggregate([
      { $match: { parentSalesPerson: { $in: agentIds } } },
      { $group: { _id: "$parentSalesPerson", count: { $sum: 1 } } },
    ])
    const childCountMap: Record<string, number> = {}
    childCounts.forEach((c) => {
      childCountMap[c._id.toString()] = c.count
    })

    // Quotation metrics per agent
    const dateFilter = buildDateFilter(date_from, date_to)
    const quotationAgg = await QuotationModel.aggregate([
      {
        $match: {
          salesPersonId: { $in: agentIds },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$salesPersonId",
          quotationCount: { $sum: 1 },
          quotationValue: { $sum: quotationValueExpr },
        },
      },
    ])
    const quotationMap: Record<
      string,
      { quotationCount: number; quotationValue: number }
    > = {}
    quotationAgg.forEach((q) => {
      quotationMap[q._id.toString()] = {
        quotationCount: q.quotationCount,
        quotationValue: q.quotationValue,
      }
    })

    // Commission percent by level (role-based, not per-agent)
    const roles = await RoleCommissionModel.find({ status: "Active" }).lean()
    const commissionByLevel: Record<number, number> = {}
    roles.forEach((r, i) => {
      commissionByLevel[i + 1] = r.commission ?? 0
    })

    const enrichedAgents = agents.map((agent) => {
      const idStr = agent._id.toString()
      const q = quotationMap[idStr] ?? { quotationCount: 0, quotationValue: 0 }
      const commissionPercent = commissionByLevel[agent.level] ?? 0
      const commissionEarned = Math.round(
        q.quotationValue * (commissionPercent / 100)
      )
      const parent = agent.parentSalesPerson as any

      return {
        _id: agent._id,
        name: agent.name,
        level: agent.level,
        status: agent.status,
        parentName: parent?.name ?? "—",
        totalSubAgents: childCountMap[idStr] ?? 0,
        totalSalespersons: childCountMap[idStr] ?? 0,
        quotationCount: q.quotationCount,
        quotationValue: q.quotationValue,
        orderCount: q.quotationCount,
        orderValue: q.quotationValue,
        conversionRate:
          q.quotationCount > 0
            ? Math.round((q.quotationCount / q.quotationCount) * 1000) / 10
            : 0,
        commissionPercent,
        commissionEarned,
      }
    })

    res.status(ResponseCode.SUCCESS).json({
      status: true,
      message: "Agents analytics fetched successfully",
      data: { agents: enrichedAgents, total },
    })
  } catch (error) {
    console.error("[AnalyticsController] getAgentsAnalytics:", error)
    res.status(ResponseCode.SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch agents analytics",
    })
  }
}

// ─── 3. GET /api/v1/admin/analytics/salespersons ───────────────────────────────

export const getSalespersonsAnalytics = async (
  req: Request,
  res: Response
): Promise<void> => {
  const adminId = (req as any).user?._id
  const {
    date_from,
    date_to,
    agent_id,
    status,
    page = "1",
    limit = "20",
  } = req.query as Record<string, string>

  try {
    const adminObjectId = new mongoose.Types.ObjectId(adminId)
    const pageNum = Math.max(parseInt(page, 10) || 1, 1)
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100)
    const skip = (pageNum - 1) * limitNum

    const spFilter: Record<string, unknown> = { adminId: adminObjectId }
    if (status) spFilter.status = status
    if (agent_id)
      spFilter.parentSalesPerson = new mongoose.Types.ObjectId(agent_id)

    const [salespersons, total] = await Promise.all([
      SalesPersonModel.find(spFilter)
        .select("_id name level status parentSalesPerson createdAt")
        .populate("parentSalesPerson", "name level")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SalesPersonModel.countDocuments(spFilter),
    ])

    const spIds = salespersons.map((s) => s._id)
    const dateFilter = buildDateFilter(date_from, date_to)

    const quotationAgg = await QuotationModel.aggregate([
      {
        $match: {
          salesPersonId: { $in: spIds },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$salesPersonId",
          quotationCount: { $sum: 1 },
          quotationValue: { $sum: quotationValueExpr },
        },
      },
    ])
    const quotationMap: Record<
      string,
      { quotationCount: number; quotationValue: number }
    > = {}
    quotationAgg.forEach((q) => {
      quotationMap[q._id.toString()] = {
        quotationCount: q.quotationCount,
        quotationValue: q.quotationValue,
      }
    })

    const roles = await RoleCommissionModel.find({ status: "Active" }).lean()
    const commissionByLevel: Record<number, number> = {}
    roles.forEach((r, i) => {
      commissionByLevel[i + 1] = r.commission ?? 0
    })

    const enriched = salespersons.map((sp) => {
      const idStr = sp._id.toString()
      const q = quotationMap[idStr] ?? { quotationCount: 0, quotationValue: 0 }
      const commissionPercent = commissionByLevel[sp.level] ?? 0
      const commissionEarned = Math.round(
        q.quotationValue * (commissionPercent / 100)
      )
      const parent = sp.parentSalesPerson as any

      return {
        _id: sp._id,
        name: sp.name,
        status: sp.status,
        owningAgentName: parent?.name ?? "—",
        owningAgentLevel: parent?.level ?? null,
        quotationCount: q.quotationCount,
        quotationValue: q.quotationValue,
        orderCount: q.quotationCount,
        orderValue: q.quotationValue,
        conversionRate: 0, // TODO: update once order status values are confirmed
        commissionEarned,
        holdingWallet: 0, // TODO: WalletLedger not yet created
        actualWallet: 0,
      }
    })

    res.status(ResponseCode.SUCCESS).json({
      status: true,
      message: "Salespersons analytics fetched successfully",
      data: { salespersons: enriched, total },
    })
  } catch (error) {
    console.error("[AnalyticsController] getSalespersonsAnalytics:", error)
    res.status(ResponseCode.SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch salespersons analytics",
    })
  }
}

// ─── 4. GET /api/v1/admin/analytics/network-tree ───────────────────────────────

export const getNetworkTree = async (
  req: Request,
  res: Response
): Promise<void> => {
  const adminId = (req as any).user?._id
  const { parent_id } = req.query as Record<string, string>

  try {
    const adminObjectId = new mongoose.Types.ObjectId(adminId)

    // Fetch all SalesPersons under this admin (flat)
    const allSPs = await SalesPersonModel.find({ adminId: adminObjectId })
      .select("_id name level status parentSalesPerson")
      .lean()

    const allIds = allSPs.map((sp) => sp._id)

    // Enrich with quotation value per node
    const quotationAgg = await QuotationModel.aggregate([
      { $match: { salesPersonId: { $in: allIds } } },
      {
        $group: {
          _id: "$salesPersonId",
          quotationValue: { $sum: quotationValueExpr },
          quotationCount: { $sum: 1 },
        },
      },
    ])
    const quotationMap: Record<
      string,
      { quotationValue: number; quotationCount: number }
    > = {}
    quotationAgg.forEach((q) => {
      quotationMap[q._id.toString()] = {
        quotationValue: q.quotationValue,
        quotationCount: q.quotationCount,
      }
    })

    // Build id → node map
    interface TreeNode {
      _id: mongoose.Types.ObjectId
      name: string
      level: number
      status: string
      orderValue: number
      quotationValue: number
      conversionRate: number
      commissionEarned: number
      parentId: string | null
      children: TreeNode[]
    }

    const nodeMap: Record<string, TreeNode> = {}
    allSPs.forEach((sp) => {
      const q = quotationMap[sp._id.toString()] ?? {
        quotationValue: 0,
        quotationCount: 0,
      }
      nodeMap[sp._id.toString()] = {
        _id: sp._id,
        name: sp.name,
        level: sp.level,
        status: sp.status,
        orderValue: q.quotationValue,
        quotationValue: q.quotationValue,
        conversionRate: 0,
        commissionEarned: 0,
        parentId: sp.parentSalesPerson
          ? sp.parentSalesPerson.toString()
          : null,
        children: [],
      }
    })

    // Lazy-load mode: return only children of a specific parent node
    if (parent_id) {
      const children = Object.values(nodeMap).filter(
        (n) => n.parentId === parent_id
      )
      res.status(ResponseCode.SUCCESS).json({
        status: true,
        message: "Network tree fetched successfully",
        data: { tree: children },
      })
      return
    }

    // Full tree: nest children into their parents
    const roots: TreeNode[] = []
    Object.values(nodeMap).forEach((node) => {
      if (!node.parentId || !nodeMap[node.parentId]) {
        roots.push(node)
      } else {
        nodeMap[node.parentId].children.push(node)
      }
    })

    res.status(ResponseCode.SUCCESS).json({
      status: true,
      message: "Network tree fetched successfully",
      data: { tree: roots },
    })
  } catch (error) {
    console.error("[AnalyticsController] getNetworkTree:", error)
    res.status(ResponseCode.SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch network tree",
    })
  }
}

// ─── 5. GET /api/v1/admin/analytics/commission-summary ─────────────────────────

export const getCommissionSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  const adminId = (req as any).user?._id
  const { date_from, date_to, agent_id } = req.query as Record<string, string>

  try {
    const adminObjectId = new mongoose.Types.ObjectId(adminId)

    const roles = await RoleCommissionModel.find({ status: "Active" }).lean()
    const totalAssigned = roles.reduce((acc, r) => acc + (r.commission ?? 0), 0)

    const commissionByLevel: Record<number, number> = {}
    roles.forEach((r, i) => {
      commissionByLevel[i + 1] = r.commission ?? 0
    })

    const spFilter: Record<string, unknown> = { adminId: adminObjectId }
    if (agent_id)
      spFilter.parentSalesPerson = new mongoose.Types.ObjectId(agent_id)

    const allSPs = await SalesPersonModel.find(spFilter)
      .select("_id name level")
      .lean()
    const allIds = allSPs.map((sp) => sp._id)

    const spMap: Record<string, { name: string; level: number }> = {}
    allSPs.forEach((sp) => {
      spMap[sp._id.toString()] = { name: sp.name, level: sp.level }
    })

    const dateFilter = buildDateFilter(date_from, date_to)
    const quotationAgg = await QuotationModel.aggregate([
      {
        $match: {
          salesPersonId: { $in: allIds },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: "$salesPersonId",
          totalValue: { $sum: quotationValueExpr },
        },
      },
      { $sort: { totalValue: -1 } },
      { $limit: 10 },
    ])

    const topEarners = quotationAgg.map((q) => {
      const sp = spMap[q._id.toString()]
      const commPct = sp ? (commissionByLevel[sp.level] ?? 0) : 0
      return {
        _id: q._id,
        name: sp?.name ?? "—",
        type: "salesperson" as const,
        earned: Math.round(q.totalValue * (commPct / 100)),
      }
    })

    const totalUtilized = topEarners.reduce((acc, e) => acc + e.earned, 0)

    // TODO: WalletLedger not yet created — returning 0 for wallet fields
    const holdingWalletTotal = 0
    const actualWalletTotal = 0

    res.status(ResponseCode.SUCCESS).json({
      status: true,
      message: "Commission summary fetched successfully",
      data: {
        totalAssigned,
        totalUtilized,
        remainingPercent:
          totalAssigned > 0
            ? Math.round(
                ((totalAssigned - totalUtilized) / totalAssigned) * 1000
              ) / 10
            : 100,
        holdingWalletTotal,
        actualWalletTotal,
        topEarners,
        ledger: [], // TODO: implement once WalletLedger collection is confirmed
      },
    })
  } catch (error) {
    console.error("[AnalyticsController] getCommissionSummary:", error)
    res.status(ResponseCode.SERVER_ERROR).json({
      status: false,
      message: "Failed to fetch commission summary",
    })
  }
}




