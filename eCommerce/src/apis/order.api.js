import { api } from ".";
import { ApiConstant } from "../constants/api.constant";

const orderApi = () => ({
  createOrder: async ({ data, idempotencyKey }) =>
    api.post(ApiConstant.orders.base, data, {
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    }),
  getMyOrders: async () => api.get(ApiConstant.orders.myOrders),
  getOrderById: async (orderId) => api.get(ApiConstant.orders.getById(orderId)),
  cancelOrder: async (orderId) => api.patch(ApiConstant.orders.cancel(orderId)),
  getAllOrders: async (params) => api.get(ApiConstant.orders.base, { params }),
  updateOrderStatus: async (orderId, data) =>
    api.patch(ApiConstant.orders.updateStatus(orderId), data),
});

export const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} = orderApi();
