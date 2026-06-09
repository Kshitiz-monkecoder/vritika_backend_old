import { Router } from "express"
import {
  getDashboardSummary,
  getAgentsAnalytics,
  getSalespersonsAnalytics,
  getNetworkTree,
  getCommissionSummary,
} from "../Controller/Admin/Analyticscontroller"
 
const AnalyticsRouter: Router = Router()
 
// All routes are read-only. They sit under /admin/analytics/* in the final URL
// because Index.ts mounts this router under /admin (see step 2 below).
AnalyticsRouter.get("/analytics/dashboard-summary", getDashboardSummary)
AnalyticsRouter.get("/analytics/agents",             getAgentsAnalytics)
AnalyticsRouter.get("/analytics/salespersons",       getSalespersonsAnalytics)
AnalyticsRouter.get("/analytics/network-tree",       getNetworkTree)
AnalyticsRouter.get("/analytics/commission-summary", getCommissionSummary)
 
export default AnalyticsRouter
 