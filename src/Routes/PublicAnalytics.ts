import { Router } from 'express'
import {
    GetMonthlyTrends,
    GetStateHeatmap,
    GetConversionFunnel,
    GetRevenueTrend,
    GetTopPerformers,
    GetSystemTypeBreakdown
} from '../Controller/Analytics/AnalyticsController'
import {
    GetProductCatalogSummary,
    GetProductUsageInQuotations,
    GetTopProductsByRevenue,
    GetProductTypeRevenueBreakdown,
    GetBrandPerformance
} from '../Controller/Analytics/ProductStatsController'
import {
    GetCommissionOverview,
    GetEstimatedPayouts,
    GetCommissionByLevel
} from '../Controller/Analytics/CommissionController'
import { GetSuperAdminDashboard } from '../Controller/SuperAdmin/DashboardController'

const PublicAnalyticsRouter: Router = Router()

PublicAnalyticsRouter.get('/dashboard', GetSuperAdminDashboard)
PublicAnalyticsRouter.get('/analytics/monthly-trends', GetMonthlyTrends)
PublicAnalyticsRouter.get('/analytics/state-heatmap', GetStateHeatmap)
PublicAnalyticsRouter.get('/analytics/conversion-funnel', GetConversionFunnel)
PublicAnalyticsRouter.get('/analytics/revenue-trend', GetRevenueTrend)
PublicAnalyticsRouter.get('/analytics/top-performers', GetTopPerformers)
PublicAnalyticsRouter.get('/analytics/system-type-breakdown', GetSystemTypeBreakdown)
PublicAnalyticsRouter.get('/analytics/product-catalog-summary', GetProductCatalogSummary)
PublicAnalyticsRouter.get('/analytics/product-usage-in-quotations', GetProductUsageInQuotations)
PublicAnalyticsRouter.get('/analytics/top-products-by-revenue', GetTopProductsByRevenue)
PublicAnalyticsRouter.get('/analytics/product-type-revenue-breakdown', GetProductTypeRevenueBreakdown)
PublicAnalyticsRouter.get('/analytics/brand-performance', GetBrandPerformance)
PublicAnalyticsRouter.get('/analytics/commission-overview', GetCommissionOverview)
PublicAnalyticsRouter.get('/analytics/commission-estimated-payouts', GetEstimatedPayouts)
PublicAnalyticsRouter.get('/analytics/commission-by-level', GetCommissionByLevel)

export default PublicAnalyticsRouter
