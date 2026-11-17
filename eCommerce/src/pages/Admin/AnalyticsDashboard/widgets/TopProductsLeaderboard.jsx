import React, { useState, useMemo } from "react";
import { Card, Select, Progress, Skeleton, Tooltip } from "antd";
import { TrophyFilled, FireOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTopProducts } from "@/apis/analytics.api";
import { analyticsKeys } from "@/constants/queryKeys";

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

const TopProductsLeaderboard = ({ className = "", isLoading: externalLoading = false }) => {
  // Dropdown states for leaderboard filtering (API query params)
  const [days, setDays] = useState(30);
  const [limit, setLimit] = useState(5);

  const queryParams = useMemo(() => ({ limit, days }), [limit, days]);

  // Query top products data from backend API
  // GET /api/v1/analytics/products/top?limit=...&days=...
  const {
    data: topProductsResponse,
    isLoading: isQueryLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: analyticsKeys.topProducts(queryParams),
    queryFn: () => getTopProducts(queryParams),
  });

  const isLoading = externalLoading || isQueryLoading;

  // Normalize product list from backend response
  const products = useMemo(() => {
    const rawList = Array.isArray(topProductsResponse?.data)
      ? topProductsResponse.data
      : Array.isArray(topProductsResponse?.data?.items)
      ? topProductsResponse.data.items
      : Array.isArray(topProductsResponse?.data?.products)
      ? topProductsResponse.data.products
      : Array.isArray(topProductsResponse)
      ? topProductsResponse
      : [];

    return rawList.map((item, index) => ({
      productId: item.productId ?? item.id ?? `prod-${index + 1}`,
      productName: item.productName ?? item.name ?? "Unknown Product",
      unitsSold: Number(
        item.unitsSold ?? item.totalSold ?? item.quantitySold ?? item.totalUnits ?? 0
      ),
      totalRevenue: Number(item.totalRevenue ?? item.revenue ?? 0),
    }));
  }, [topProductsResponse]);

  // Maximum units sold in this batch to calibrate relative progress percentage
  const maxUnits = useMemo(() => {
    if (!products.length) return 1;
    const max = Math.max(...products.map((p) => p.unitsSold));
    return max > 0 ? max : 1;
  }, [products]);

  if (isLoading) {
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
            <div className="flex items-center gap-2">
              <Select
                value={days}
                disabled
                className="text-sm min-w-[70px]"
                options={[
                  { value: 7, label: "7d" },
                  { value: 30, label: "30d" },
                  { value: 90, label: "90d" },
                ]}
              />
              <Select
                value={limit}
                disabled
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
        <div className="flex-1 p-2 flex flex-col gap-4 max-h-[380px] overflow-hidden">
          {Array.from({ length: Math.min(limit, 6) }).map((_, idx) => (
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

  if (isError) {
    return (
      <Card
        className={`shadow-sm border-gray-100 rounded-xl ${className}`}
        styles={{ body: { flex: 1, display: "flex", flexDirection: "column", padding: "16px 20px" } }}
        title={
          <div className="flex items-center gap-2 py-1">
            <FireOutlined className="text-[#ee4d2d]" />
            <span className="text-base font-bold text-gray-900">
              Top Products
            </span>
          </div>
        }
      >
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10 text-center">
          <p className="text-xs text-gray-500">Failed to load top products.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[#ee4d2d] hover:bg-[#d03e1f] rounded-lg transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`shadow-sm border-gray-100 rounded-xl ${className}`}
      styles={{ body: { flex: 1, display: "flex", flexDirection: "column", padding: "16px 20px", minHeight: 0 } }}
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
      {/* Product Leaderboard List with Pure Flexbox Layout & Smooth Scroll for Top 10 */}
      <div
        className="flex-1 min-h-0 max-h-[380px] overflow-y-auto pr-1.5 flex flex-col divide-y divide-gray-50 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
        style={{ maxHeight: 380 }}
      >
        {products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
            <span className="text-gray-400 text-xs">No products sold in this period</span>
          </div>
        ) : (
          products.map((item, index) => {
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
          })
        )}
      </div>
    </Card>
  );
};

export default TopProductsLeaderboard;
