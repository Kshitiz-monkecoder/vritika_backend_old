"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Analyticscontroller_1 = require("../Controller/Admin/Analyticscontroller");
const AnalyticsRouter = (0, express_1.Router)();
// All routes are read-only. They sit under /admin/analytics/* in the final URL
// because Index.ts mounts this router under /admin (see step 2 below).
AnalyticsRouter.get("/analytics/dashboard-summary", Analyticscontroller_1.getDashboardSummary);
AnalyticsRouter.get("/analytics/agents", Analyticscontroller_1.getAgentsAnalytics);
AnalyticsRouter.get("/analytics/salespersons", Analyticscontroller_1.getSalespersonsAnalytics);
AnalyticsRouter.get("/analytics/network-tree", Analyticscontroller_1.getNetworkTree);
AnalyticsRouter.get("/analytics/commission-summary", Analyticscontroller_1.getCommissionSummary);
exports.default = AnalyticsRouter;
