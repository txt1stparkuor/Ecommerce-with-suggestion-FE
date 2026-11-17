import { api } from ".";
import { ApiConstant } from "../constants/api.constant";

const analyticsApi = () => ({
  getSalesSummary: async (params) =>
    api.get(ApiConstant.analytics.salesSummary, { params }),
  getPendingOrdersCount: async () =>
    api.get(ApiConstant.analytics.pendingCount),
  getSalesTrend: async (params) =>
    api.get(ApiConstant.analytics.salesTrend, { params }),
  getTopProducts: async (params) =>
    api.get(ApiConstant.analytics.topProducts, { params }),
  getLowStockProducts: async (params) =>
    api.get(ApiConstant.analytics.lowStock, { params }),
});

export const {
  getSalesSummary,
  getPendingOrdersCount,
  getSalesTrend,
  getTopProducts,
  getLowStockProducts,
} = analyticsApi();
