import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Typography, Tag, Image, Spin, Card, Descriptions } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { getOrderById } from "../../apis/order.api";
import { orderKeys } from "@/constants/queryKeys";

const { Title, Text } = Typography;

const OrderDetail = () => {
  const { orderId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
  });

  const order = data?.data;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <Title level={4} type="danger">
          Error loading order details
        </Title>
      </div>
    );
  }

  if (!order) return null;

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
      <div className="mb-6">
        <Link
          to="/my-orders"
          className="text-gray-500 hover:text-[#ee4d2d] flex items-center gap-2 mb-4"
        >
          <ArrowLeftOutlined /> Back to My Orders
        </Link>
        <div className="flex justify-between items-center">
          <Title level={3} className="!mb-0">
            Order Details
          </Title>
          <Tag
            color={getStatusTagColor(order.status)}
            className="text-base px-3 py-1"
          >
            {order.status}
          </Tag>
        </div>
      </div>

      {/* Section 1: Order Info */}
      <Card className="mb-6 shadow-sm rounded-sm border-gray-200">
        <Descriptions
          title="Order Information"
          bordered
          column={{ xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
        >
          <Descriptions.Item label="Order Code">
            {order.orderCode}
          </Descriptions.Item>
          <Descriptions.Item label="Order Date">
            {new Date(order.createdAt).toLocaleString()}
          </Descriptions.Item>

          <Descriptions.Item label="Shipping Address">
            {order.shippingAddress}
          </Descriptions.Item>
          <Descriptions.Item label="Total Amount">
            <Text className="text-xl font-bold text-[#ee4d2d]">
              ₹{order.totalAmount.toLocaleString()}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Section 2: Order Items */}
      <Card
        className="shadow-sm rounded-sm border-gray-200"
        title="Purchased Items"
      >
        <div className="flex flex-col gap-6">
          {order.orderDetails.map((item) => (
            <div
              key={item.id}
              className="flex flex-col md:flex-row gap-4 items-start md:items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0"
            >
              <Image
                src={item.productImageUrl}
                alt={item.productName}
                width={80}
                height={80}
                className="object-cover rounded-sm border border-gray-200"
              />
              <div className="flex-1">
                <Link
                  to={`/products/${item.productId}`}
                  className="text-base font-medium text-gray-800 hover:text-[#ee4d2d] line-clamp-2 mb-1"
                >
                  {item.productName}
                </Link>
                <Text type="secondary">Quantity: {item.quantity}</Text>
              </div>
              <div className="text-right min-w-[120px]">
                <div className="text-gray-500 text-sm">
                  ₹{item.price.toLocaleString()} / unit
                </div>
                <div className="text-[#ee4d2d] font-medium text-lg">
                  ₹{item.totalPrice.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default OrderDetail;
