import React, { useState, useMemo } from "react";
import { Card, Select, Progress, Skeleton, Tooltip } from "antd";
import { TrophyFilled, FireOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

// Mock Top Selling Products dataset strictly matching API specification:
// GET /api/v1/analytics/products/top
// Params: limit (Integer 5 | 10), days (Integer 7 | 30 | 90)
const MOCK_TOP_PRODUCTS_DATABASE = {
  7: [
    {
      productId: "prod-1",
      productName: "Wireless Noise-Cancelling Headphones Pro",
      unitsSold: 98,
      totalRevenue: 19599.0,
    },
    {
      productId: "prod-2",
      productName: "Mechanical Gaming Keyboard RGB Backlit",
      unitsSold: 74,
      totalRevenue: 8880.0,
    },
    {
      productId: "prod-3",
      productName: "Ultra-wide Curved Gaming Monitor 34\"",
      unitsSold: 46,
      totalRevenue: 22999.0,
    },
    {
      productId: "prod-4",
      productName: "Ergonomic Vertical Wireless Mouse",
      unitsSold: 42,
      totalRevenue: 2099.0,
    },
    {
      productId: "prod-5",
      productName: "Fast Wireless Charging Stand 15W",
      unitsSold: 38,
      totalRevenue: 1329.0,
    },
    {
      productId: "prod-6",
      productName: "USB-C Multi-port Adapter Hub 7-in-1",
      unitsSold: 35,
      totalRevenue: 1749.0,
    },
    {
      productId: "prod-7",
      productName: "Smart Fitness Watch with Heart Rate Monitor",
      unitsSold: 31,
      totalRevenue: 6199.0,
    },
    {
      productId: "prod-8",
      productName: "True Wireless Earbuds with ANC",
      unitsSold: 28,
      totalRevenue: 3359.0,
    },
    {
      productId: "prod-9",
      productName: "Aluminum Laptop Stand Adjustable",
      unitsSold: 24,
      totalRevenue: 1199.0,
    },
    {
      productId: "prod-10",
      productName: "HD 1080P Web Camera with Privacy Shutter",
      unitsSold: 21,
      totalRevenue: 1259.0,
    },
  ],
  30: [
    {
      productId: "prod-1",
      productName: "Wireless Noise-Cancelling Headphones Pro",
      unitsSold: 342,
      totalRevenue: 68399.0,
    },
    {
      productId: "prod-3",
      productName: "Ultra-wide Curved Gaming Monitor 34\"",
      unitsSold: 215,
      totalRevenue: 107499.0,
    },
    {
      productId: "prod-2",
      productName: "Mechanical Gaming Keyboard RGB Backlit",
      unitsSold: 198,
      totalRevenue: 23760.0,
    },
    {
      productId: "prod-7",
      productName: "Smart Fitness Watch with Heart Rate Monitor",
      unitsSold: 164,
      totalRevenue: 32799.0,
    },
    {
      productId: "prod-4",
      productName: "Ergonomic Vertical Wireless Mouse",
      unitsSold: 142,
      totalRevenue: 7099.0,
    },
    {
      productId: "prod-6",
      productName: "USB-C Multi-port Adapter Hub 7-in-1",
      unitsSold: 128,
      totalRevenue: 6399.0,
    },
    {
      productId: "prod-8",
      productName: "True Wireless Earbuds with ANC",
      unitsSold: 119,
      totalRevenue: 14279.0,
    },
    {
      productId: "prod-5",
      productName: "Fast Wireless Charging Stand 15W",
      unitsSold: 105,
      totalRevenue: 3675.0,
    },
    {
      productId: "prod-9",
      productName: "Aluminum Laptop Stand Adjustable",
      unitsSold: 89,
      totalRevenue: 4449.0,
    },
    {
      productId: "prod-10",
      productName: "HD 1080P Web Camera with Privacy Shutter",
      unitsSold: 76,
      totalRevenue: 4559.0,
    },
  ],
  90: [
    {
      productId: "prod-3",
      productName: "Ultra-wide Curved Gaming Monitor 34\"",
      unitsSold: 720,
      totalRevenue: 359999.0,
    },
    {
      productId: "prod-1",
      productName: "Wireless Noise-Cancelling Headphones Pro",
      unitsSold: 680,
      totalRevenue: 135999.0,
    },
    {
      productId: "prod-2",
      productName: "Mechanical Gaming Keyboard RGB Backlit",
      unitsSold: 540,
      totalRevenue: 64800.0,
    },
    {
      productId: "prod-7",
      productName: "Smart Fitness Watch with Heart Rate Monitor",
      unitsSold: 490,
      totalRevenue: 97999.0,
    },
    {
      productId: "prod-4",
      productName: "Ergonomic Vertical Wireless Mouse",
      unitsSold: 410,
      totalRevenue: 20499.0,
    },
    {
      productId: "prod-6",
      productName: "USB-C Multi-port Adapter Hub 7-in-1",
      unitsSold: 380,
      totalRevenue: 18999.0,
    },
    {
      productId: "prod-8",
      productName: "True Wireless Earbuds with ANC",
      unitsSold: 320,
      totalRevenue: 38399.0,
    },
    {
      productId: "prod-5",
      productName: "Fast Wireless Charging Stand 15W",
      unitsSold: 290,
      totalRevenue: 10150.0,
    },
    {
      productId: "prod-9",
      productName: "Aluminum Laptop Stand Adjustable",
      unitsSold: 250,
      totalRevenue: 12499.0,
    },
    {
      productId: "prod-10",
      productName: "HD 1080P Web Camera with Privacy Shutter",
      unitsSold: 210,
      totalRevenue: 12599.0,
    },
  ],
};

const TopProductsLeaderboard = ({ className = "", isLoading = false }) => {
  // Dropdown states for leaderboard filtering
  const [days, setDays] = useState(30);
  const [limit, setLimit] = useState(5);

  // Retrieve slice according to selected days & limit
  const products = useMemo(() => {
    const list = MOCK_TOP_PRODUCTS_DATABASE[days] || MOCK_TOP_PRODUCTS_DATABASE[30];
    return list.slice(0, limit);
  }, [days, limit]);

  // Maximum units sold in this batch to calibrate relative progress percentage
  const maxUnits = useMemo(() => {
    if (!products.length) return 1;
    return Math.max(...products.map((p) => p.unitsSold));
  }, [products]);

  // Medal / rank badge renderer
  const renderRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-white font-bold text-xs flex items-center justify-center shadow-sm">
          <TrophyFilled className="text-[11px]" />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-400 to-slate-200 text-white font-bold text-xs flex items-center justify-center shadow-sm">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-700 to-orange-300 text-white font-bold text-xs flex items-center justify-center shadow-sm">
          3
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 font-semibold text-xs flex items-center justify-center">
        {rank}
      </span>
    );
  };

  if (isLoading) {
    return (
      <Card
        className={`shadow-sm border-gray-100 rounded-xl ${className}`}
        title={<span className="font-semibold text-gray-800">Top Selling Products</span>}
        styles={{ body: { flex: 1, display: "flex", flexDirection: "column" } }}
      >
        <div className="flex-1 p-4 flex flex-col justify-around gap-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <Skeleton.Avatar active size="small" shape="circle" />
              <div className="flex-1">
                <Skeleton.Input active size="small" block />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`shadow-sm border-gray-100 rounded-xl ${className}`}
      styles={{ body: { flex: 1, display: "flex", flexDirection: "column", padding: "16px 20px" } }}
      title={
        <div className="flex flex-wrap items-center justify-between gap-2 py-1">
          <div className="flex items-center gap-2">
            <FireOutlined className="text-[#ee4d2d]" />
            <span className="text-base font-bold text-gray-900">
              Top Products
            </span>
          </div>

          {/* Card Header Filter Controls */}
          <div className="flex items-center gap-2">
            <Select
              value={days}
              onChange={setDays}
              className="text-sm min-w-[70px]"
              options={[
                { value: 7, label: "7d" },
                { value: 30, label: "30d" },
                { value: 90, label: "90d" },
              ]}
            />
            <Select
              value={limit}
              onChange={setLimit}
              className="text-sm min-w-[85px]"
              options={[
                { value: 5, label: "Top 5" },
                { value: 10, label: "Top 10" },
              ]}
            />
          </div>
        </div>
      }
    >
      {/* Product Leaderboard List with Pure Flexbox Layout */}
      <div className="flex-1 flex flex-col justify-between divide-y divide-gray-50">
        {products.map((item, index) => {
          const rank = index + 1;
          const percentage = Math.round((item.unitsSold / maxUnits) * 100);

          return (
            <div
              key={item.productId}
              className="py-3 first:pt-1 last:pb-1 flex items-center gap-3 hover:bg-gray-50/60 rounded-lg px-1.5 transition-colors"
            >
              {/* Rank Badge */}
              <div className="shrink-0">{renderRankBadge(rank)}</div>

              {/* Product Info & Relative Units Progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <Tooltip title={item.productName}>
                    <Link
                      to={`/admin/products?search=${encodeURIComponent(item.productName)}`}
                      className="text-xs font-semibold text-gray-800 hover:text-[#ee4d2d] truncate block"
                    >
                      {item.productName}
                    </Link>
                  </Tooltip>
                  <span className="text-xs font-bold text-gray-900 shrink-0">
                    ${item.totalRevenue.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1">
                    <Progress
                      percent={percentage}
                      showInfo={false}
                      strokeColor={rank === 1 ? "#ee4d2d" : "#3b82f6"}
                      trailColor="#f3f4f6"
                      size={["100%", 5]}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-gray-700 shrink-0">
                    {item.unitsSold} sold
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TopProductsLeaderboard;
