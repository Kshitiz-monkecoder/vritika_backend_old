"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommissionSummary = exports.getNetworkTree = exports.getSalespersonsAnalytics = exports.getAgentsAnalytics = exports.getDashboardSummary = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ResponseCode_1 = require("../../Lib/Utils/ResponseCode");
const SalesPerson_1 = __importDefault(require("../../Model/SalesPerson"));
const Quotation_1 = __importDefault(require("../../Model/Quotation"));
const RoleCommissionModel_1 = __importDefault(require("../../Model/RoleCommissionModel"));
// ─── Shared helpers ────────────────────────────────────────────────────────────
/** Builds a Mongoose date range match from optional query params */
function buildDateFilter(date_from, date_to) {
    if (!date_from && !date_to)
        return {};
    const createdAt = {};
    if (date_from)
        createdAt.$gte = new Date(date_from);
    if (date_to)
        createdAt.$lte = new Date(`${date_to}T23:59:59.999Z`);
    return { createdAt };
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
};
// ─── 1. GET /api/v1/admin/analytics/dashboard-summary ─────────────────────────
const getDashboardSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { date_from, date_to } = req.query;
    try {
        const adminObjectId = new mongoose_1.default.Types.ObjectId(adminId);
        const dateFilter = buildDateFilter(date_from, date_to);
        // All SalesPersons belonging to this admin
        const allSPs = yield SalesPerson_1.default.find({ adminId: adminObjectId })
            .select("_id level status")
            .lean();
        const allIds = allSPs.map((sp) => sp._id);
        const totalAgents = allSPs.length;
        const activeAgents = allSPs.filter((sp) => sp.status === "Active").length;
        const totalSalespersons = allSPs.length;
        // Active salespersons = those with at least 1 quotation in the date range
        const activeSpAgg = yield Quotation_1.default.aggregate([
            {
                $match: Object.assign({ salesPersonId: { $in: allIds } }, dateFilter),
            },
            { $group: { _id: "$salesPersonId" } },
        ]);
        const activeSalespersons = activeSpAgg.length;
        // Quotation totals
        const quotationAgg = yield Quotation_1.default.aggregate([
            {
                $match: Object.assign({ salesPersonId: { $in: allIds } }, dateFilter),
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    totalValue: { $sum: quotationValueExpr },
                },
            },
        ]);
        const totalQuotationValue = (_c = (_b = quotationAgg[0]) === null || _b === void 0 ? void 0 : _b.totalValue) !== null && _c !== void 0 ? _c : 0;
        const quotationTotal = (_e = (_d = quotationAgg[0]) === null || _d === void 0 ? void 0 : _d.total) !== null && _e !== void 0 ? _e : 0;
        // Revenue trend — grouped by month
        const revenueTrend = yield Quotation_1.default.aggregate([
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
        ]);
        // Top salesperson by total quotation value
        const topSpAgg = yield Quotation_1.default.aggregate([
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
        ]);
        const topSalesperson = topSpAgg[0]
            ? {
                _id: topSpAgg[0]._id.toString(),
                name: (_f = topSpAgg[0].name) !== null && _f !== void 0 ? _f : "—",
                orderValue: topSpAgg[0].orderValue,
            }
            : null;
        // Commission payable = sum of all active role commission percentages
        const roles = yield RoleCommissionModel_1.default.find({ status: "Active" }).lean();
        const totalCommissionPayable = roles.reduce((acc, r) => { var _a; return acc + ((_a = r.commission) !== null && _a !== void 0 ? _a : 0); }, 0);
        // TODO: WalletLedger collection does not exist yet — returning 0
        // Replace once the WalletLedger model is created and confirmed with backend team
        const holdingWallet = 0;
        const actualWallet = 0;
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
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
                    pending: 0, // TODO: update once Quotation.status values are confirmed
                    approved: 0,
                    converted: 0,
                },
            },
        });
    }
    catch (error) {
        console.error("[AnalyticsController] getDashboardSummary:", error);
        res.status(ResponseCode_1.ResponseCode.SERVER_ERROR).json({
            status: false,
            message: "Failed to fetch dashboard summary",
        });
    }
});
exports.getDashboardSummary = getDashboardSummary;
// ─── 2. GET /api/v1/admin/analytics/agents ─────────────────────────────────────
const getAgentsAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { date_from, date_to, level, status, page = "1", limit = "20", } = req.query;
    try {
        const adminObjectId = new mongoose_1.default.Types.ObjectId(adminId);
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
        const skip = (pageNum - 1) * limitNum;
        // Build agent filter — all SalesPersons under this admin
        const agentFilter = { adminId: adminObjectId };
        if (level)
            agentFilter.level = parseInt(level, 10);
        if (status)
            agentFilter.status = status;
        const [agents, total] = yield Promise.all([
            SalesPerson_1.default.find(agentFilter)
                .select("_id name level status parentSalesPerson createdAt")
                .populate("parentSalesPerson", "name level")
                .sort({ level: 1, createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            SalesPerson_1.default.countDocuments(agentFilter),
        ]);
        const agentIds = agents.map((a) => a._id);
        // Direct child count per agent
        const childCounts = yield SalesPerson_1.default.aggregate([
            { $match: { parentSalesPerson: { $in: agentIds } } },
            { $group: { _id: "$parentSalesPerson", count: { $sum: 1 } } },
        ]);
        const childCountMap = {};
        childCounts.forEach((c) => {
            childCountMap[c._id.toString()] = c.count;
        });
        // Quotation metrics per agent
        const dateFilter = buildDateFilter(date_from, date_to);
        const quotationAgg = yield Quotation_1.default.aggregate([
            {
                $match: Object.assign({ salesPersonId: { $in: agentIds } }, dateFilter),
            },
            {
                $group: {
                    _id: "$salesPersonId",
                    quotationCount: { $sum: 1 },
                    quotationValue: { $sum: quotationValueExpr },
                },
            },
        ]);
        const quotationMap = {};
        quotationAgg.forEach((q) => {
            quotationMap[q._id.toString()] = {
                quotationCount: q.quotationCount,
                quotationValue: q.quotationValue,
            };
        });
        // Commission percent by level (role-based, not per-agent)
        const roles = yield RoleCommissionModel_1.default.find({ status: "Active" }).lean();
        const commissionByLevel = {};
        roles.forEach((r, i) => {
            var _a;
            commissionByLevel[i + 1] = (_a = r.commission) !== null && _a !== void 0 ? _a : 0;
        });
        const enrichedAgents = agents.map((agent) => {
            var _a, _b, _c, _d, _e;
            const idStr = agent._id.toString();
            const q = (_a = quotationMap[idStr]) !== null && _a !== void 0 ? _a : { quotationCount: 0, quotationValue: 0 };
            const commissionPercent = (_b = commissionByLevel[agent.level]) !== null && _b !== void 0 ? _b : 0;
            const commissionEarned = Math.round(q.quotationValue * (commissionPercent / 100));
            const parent = agent.parentSalesPerson;
            return {
                _id: agent._id,
                name: agent.name,
                level: agent.level,
                status: agent.status,
                parentName: (_c = parent === null || parent === void 0 ? void 0 : parent.name) !== null && _c !== void 0 ? _c : "—",
                totalSubAgents: (_d = childCountMap[idStr]) !== null && _d !== void 0 ? _d : 0,
                totalSalespersons: (_e = childCountMap[idStr]) !== null && _e !== void 0 ? _e : 0,
                quotationCount: q.quotationCount,
                quotationValue: q.quotationValue,
                orderCount: q.quotationCount,
                orderValue: q.quotationValue,
                conversionRate: q.quotationCount > 0
                    ? Math.round((q.quotationCount / q.quotationCount) * 1000) / 10
                    : 0,
                commissionPercent,
                commissionEarned,
            };
        });
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            message: "Agents analytics fetched successfully",
            data: { agents: enrichedAgents, total },
        });
    }
    catch (error) {
        console.error("[AnalyticsController] getAgentsAnalytics:", error);
        res.status(ResponseCode_1.ResponseCode.SERVER_ERROR).json({
            status: false,
            message: "Failed to fetch agents analytics",
        });
    }
});
exports.getAgentsAnalytics = getAgentsAnalytics;
// ─── 3. GET /api/v1/admin/analytics/salespersons ───────────────────────────────
const getSalespersonsAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { date_from, date_to, agent_id, status, page = "1", limit = "20", } = req.query;
    try {
        const adminObjectId = new mongoose_1.default.Types.ObjectId(adminId);
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
        const skip = (pageNum - 1) * limitNum;
        const spFilter = { adminId: adminObjectId };
        if (status)
            spFilter.status = status;
        if (agent_id)
            spFilter.parentSalesPerson = new mongoose_1.default.Types.ObjectId(agent_id);
        const [salespersons, total] = yield Promise.all([
            SalesPerson_1.default.find(spFilter)
                .select("_id name level status parentSalesPerson createdAt")
                .populate("parentSalesPerson", "name level")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),
            SalesPerson_1.default.countDocuments(spFilter),
        ]);
        const spIds = salespersons.map((s) => s._id);
        const dateFilter = buildDateFilter(date_from, date_to);
        const quotationAgg = yield Quotation_1.default.aggregate([
            {
                $match: Object.assign({ salesPersonId: { $in: spIds } }, dateFilter),
            },
            {
                $group: {
                    _id: "$salesPersonId",
                    quotationCount: { $sum: 1 },
                    quotationValue: { $sum: quotationValueExpr },
                },
            },
        ]);
        const quotationMap = {};
        quotationAgg.forEach((q) => {
            quotationMap[q._id.toString()] = {
                quotationCount: q.quotationCount,
                quotationValue: q.quotationValue,
            };
        });
        const roles = yield RoleCommissionModel_1.default.find({ status: "Active" }).lean();
        const commissionByLevel = {};
        roles.forEach((r, i) => {
            var _a;
            commissionByLevel[i + 1] = (_a = r.commission) !== null && _a !== void 0 ? _a : 0;
        });
        const enriched = salespersons.map((sp) => {
            var _a, _b, _c, _d;
            const idStr = sp._id.toString();
            const q = (_a = quotationMap[idStr]) !== null && _a !== void 0 ? _a : { quotationCount: 0, quotationValue: 0 };
            const commissionPercent = (_b = commissionByLevel[sp.level]) !== null && _b !== void 0 ? _b : 0;
            const commissionEarned = Math.round(q.quotationValue * (commissionPercent / 100));
            const parent = sp.parentSalesPerson;
            return {
                _id: sp._id,
                name: sp.name,
                status: sp.status,
                owningAgentName: (_c = parent === null || parent === void 0 ? void 0 : parent.name) !== null && _c !== void 0 ? _c : "—",
                owningAgentLevel: (_d = parent === null || parent === void 0 ? void 0 : parent.level) !== null && _d !== void 0 ? _d : null,
                quotationCount: q.quotationCount,
                quotationValue: q.quotationValue,
                orderCount: q.quotationCount,
                orderValue: q.quotationValue,
                conversionRate: 0, // TODO: update once order status values are confirmed
                commissionEarned,
                holdingWallet: 0, // TODO: WalletLedger not yet created
                actualWallet: 0,
            };
        });
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            message: "Salespersons analytics fetched successfully",
            data: { salespersons: enriched, total },
        });
    }
    catch (error) {
        console.error("[AnalyticsController] getSalespersonsAnalytics:", error);
        res.status(ResponseCode_1.ResponseCode.SERVER_ERROR).json({
            status: false,
            message: "Failed to fetch salespersons analytics",
        });
    }
});
exports.getSalespersonsAnalytics = getSalespersonsAnalytics;
// ─── 4. GET /api/v1/admin/analytics/network-tree ───────────────────────────────
const getNetworkTree = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { parent_id } = req.query;
    try {
        const adminObjectId = new mongoose_1.default.Types.ObjectId(adminId);
        // Fetch all SalesPersons under this admin (flat)
        const allSPs = yield SalesPerson_1.default.find({ adminId: adminObjectId })
            .select("_id name level status parentSalesPerson")
            .lean();
        const allIds = allSPs.map((sp) => sp._id);
        // Enrich with quotation value per node
        const quotationAgg = yield Quotation_1.default.aggregate([
            { $match: { salesPersonId: { $in: allIds } } },
            {
                $group: {
                    _id: "$salesPersonId",
                    quotationValue: { $sum: quotationValueExpr },
                    quotationCount: { $sum: 1 },
                },
            },
        ]);
        const quotationMap = {};
        quotationAgg.forEach((q) => {
            quotationMap[q._id.toString()] = {
                quotationValue: q.quotationValue,
                quotationCount: q.quotationCount,
            };
        });
        const nodeMap = {};
        allSPs.forEach((sp) => {
            var _a;
            const q = (_a = quotationMap[sp._id.toString()]) !== null && _a !== void 0 ? _a : {
                quotationValue: 0,
                quotationCount: 0,
            };
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
            };
        });
        // Lazy-load mode: return only children of a specific parent node
        if (parent_id) {
            const children = Object.values(nodeMap).filter((n) => n.parentId === parent_id);
            res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
                status: true,
                message: "Network tree fetched successfully",
                data: { tree: children },
            });
            return;
        }
        // Full tree: nest children into their parents
        const roots = [];
        Object.values(nodeMap).forEach((node) => {
            if (!node.parentId || !nodeMap[node.parentId]) {
                roots.push(node);
            }
            else {
                nodeMap[node.parentId].children.push(node);
            }
        });
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            message: "Network tree fetched successfully",
            data: { tree: roots },
        });
    }
    catch (error) {
        console.error("[AnalyticsController] getNetworkTree:", error);
        res.status(ResponseCode_1.ResponseCode.SERVER_ERROR).json({
            status: false,
            message: "Failed to fetch network tree",
        });
    }
});
exports.getNetworkTree = getNetworkTree;
// ─── 5. GET /api/v1/admin/analytics/commission-summary ─────────────────────────
const getCommissionSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { date_from, date_to, agent_id } = req.query;
    try {
        const adminObjectId = new mongoose_1.default.Types.ObjectId(adminId);
        const roles = yield RoleCommissionModel_1.default.find({ status: "Active" }).lean();
        const totalAssigned = roles.reduce((acc, r) => { var _a; return acc + ((_a = r.commission) !== null && _a !== void 0 ? _a : 0); }, 0);
        const commissionByLevel = {};
        roles.forEach((r, i) => {
            var _a;
            commissionByLevel[i + 1] = (_a = r.commission) !== null && _a !== void 0 ? _a : 0;
        });
        const spFilter = { adminId: adminObjectId };
        if (agent_id)
            spFilter.parentSalesPerson = new mongoose_1.default.Types.ObjectId(agent_id);
        const allSPs = yield SalesPerson_1.default.find(spFilter)
            .select("_id name level")
            .lean();
        const allIds = allSPs.map((sp) => sp._id);
        const spMap = {};
        allSPs.forEach((sp) => {
            spMap[sp._id.toString()] = { name: sp.name, level: sp.level };
        });
        const dateFilter = buildDateFilter(date_from, date_to);
        const quotationAgg = yield Quotation_1.default.aggregate([
            {
                $match: Object.assign({ salesPersonId: { $in: allIds } }, dateFilter),
            },
            {
                $group: {
                    _id: "$salesPersonId",
                    totalValue: { $sum: quotationValueExpr },
                },
            },
            { $sort: { totalValue: -1 } },
            { $limit: 10 },
        ]);
        const topEarners = quotationAgg.map((q) => {
            var _a, _b;
            const sp = spMap[q._id.toString()];
            const commPct = sp ? ((_a = commissionByLevel[sp.level]) !== null && _a !== void 0 ? _a : 0) : 0;
            return {
                _id: q._id,
                name: (_b = sp === null || sp === void 0 ? void 0 : sp.name) !== null && _b !== void 0 ? _b : "—",
                type: "salesperson",
                earned: Math.round(q.totalValue * (commPct / 100)),
            };
        });
        const totalUtilized = topEarners.reduce((acc, e) => acc + e.earned, 0);
        // TODO: WalletLedger not yet created — returning 0 for wallet fields
        const holdingWalletTotal = 0;
        const actualWalletTotal = 0;
        res.status(ResponseCode_1.ResponseCode.SUCCESS).json({
            status: true,
            message: "Commission summary fetched successfully",
            data: {
                totalAssigned,
                totalUtilized,
                remainingPercent: totalAssigned > 0
                    ? Math.round(((totalAssigned - totalUtilized) / totalAssigned) * 1000) / 10
                    : 100,
                holdingWalletTotal,
                actualWalletTotal,
                topEarners,
                ledger: [], // TODO: implement once WalletLedger collection is confirmed
            },
        });
    }
    catch (error) {
        console.error("[AnalyticsController] getCommissionSummary:", error);
        res.status(ResponseCode_1.ResponseCode.SERVER_ERROR).json({
            status: false,
            message: "Failed to fetch commission summary",
        });
    }
});
exports.getCommissionSummary = getCommissionSummary;
