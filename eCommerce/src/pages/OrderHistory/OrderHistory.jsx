import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Typography, Button, Image, Tag, Empty, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getMyOrders, cancelOrder } from "../../apis/order.api";
import { orderKeys } from "@/constants/queryKeys";

const { Title, Text } = Typography;

const OrderHistory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: orderKeys.myOrders(),
    queryFn: getMyOrders,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId) => cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.myOrders() });
      toast.success("Order cancelled successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to cancel order");
    },
  });

  const orders = data?.data || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <Spin size="large" />
        <p className="mt-4">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <Title level={4} type="danger">
          Error loading orders: {error.message}
        </Title>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <Empty description="You have no orders yet." />
        <Button
          type="primary"
          className="mt-4 bg-[#ee4d2d]"
          onClick={() => navigate("/products")}
        >
          Start Shopping
        </Button>
      </div>
    );
  }

  const getStatusTagColor = (status) => {
    switch (status) {
      case "PENDING":
        return "blue";
      case "SHIPPED":
        return "processing";
      case "DELIVERED":
        return "green";
      case "CANCELLED":
        return "red";
      default:
        return "default";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Title level={3} className="mb-6">
        My Orders
      </Title>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-6 rounded-sm shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
              <Text type="secondary" className="text-sm">
                Order Code: {order.orderCode}
              </Text>
              <Text type="secondary" className="text-sm">
                {new Date(order.createdAt).toLocaleString()}
              </Text>

              <Tag color={getStatusTagColor(order.status)}>{order.status}</Tag>
            </div>

            <div className="flex items-center gap-4 mb-4">
              {order.orderDetails.slice(0, 2).map((item) => (
                <Image
                  key={item.id}
                  src={item.productImageUrl}
                  alt={item.productName}
                  width={100}
                  height={100}
                  className="object-cover rounded-sm border border-gray-200"
                  preview={false}
                />
              ))}
              {order.orderDetails.length > 2 && (
                <Text className="text-gray-500">
                  + {order.orderDetails.length - 2} product
                  {order.orderDetails.length - 2 > 1 ? "s" : ""}
                </Text>
              )}
            </div>

            <div className="flex justify-between items-center mb-4">
              <Text className="text-gray-600">
                Total:{" "}
                <Text strong className="text-lg text-[#ee4d2d]">
                  ₹{order.totalAmount.toLocaleString()}
                </Text>
              </Text>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="primary"
                danger
                onClick={() => cancelOrderMutation.mutate(order.id)}
                loading={cancelOrderMutation.isPending}
                disabled={order.status === "CANCELLED"}
                className="w-full"
              >
                Cancel Order
              </Button>
              <Button
                onClick={() => navigate(`/orders/${order.id}`)} // Placeholder for order detail page
                className="w-full"
              >
                Show Order Detail
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
