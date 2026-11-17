import React, { useMemo } from "react";
import { Card, Skeleton } from "antd";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { getSalesTrend } from "@/apis/analytics.api";
import { analyticsKeys } from "@/constants/queryKeys";

// Custom interactive chart tooltip with sleek typography
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const revItem = payload.find((p) => p.dataKey === "revenue");
    const orderItem = payload.find((p) => p.dataKey === "orderCount");
    const fullDate = payload[0]?.payload?.date || label;

    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-100 text-xs min-w-[170px]">
        <div className="font-semibold text-gray-700 pb-2 mb-2 border-b border-gray-100">
          {dayjs(fullDate).format("ddd, MMM D, YYYY")}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-gray-500 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ee4d2d] inline-block" />
              Revenue:
            </span>
            <span className="font-bold text-gray-900 text-sm">
              ${revItem?.value != null ? Number(revItem.value).toLocaleString() : "0"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-gray-500 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              Orders:
            </span>
            <span className="font-bold text-gray-900 text-sm">
              {orderItem?.value != null ? orderItem.value : 0} orders
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const SalesTrendChart = ({ dateRange, isLoading: externalLoading = false, className = "" }) => {
  // Format date range params (clamped to max 90 days per backend API contract)
  const { dateParams, rawDays, totalDays, adjustedStart } = useMemo(() => {
    const end = dateRange?.[1] ? dayjs(dateRange[1]) : dayjs();
    const start = dateRange?.[0] ? dayjs(dateRange[0]) : end.subtract(29, "day");

    const daysCount = Math.max(end.diff(start, "day") + 1, 1);
    const clampedDays = Math.min(daysCount, 90);
    const calculatedStart = daysCount > 90 ? end.subtract(89, "day") : start;

    return {
      dateParams: {
        from: calculatedStart.format("YYYY-MM-DD"),
        to: end.format("YYYY-MM-DD"),
      },
      rawDays: daysCount,
      totalDays: clampedDays,
      adjustedStart: calculatedStart,
    };
  }, [dateRange]);

  // Query sales trend data from backend API
  const {
    data: trendResponse,
    isLoading: isQueryLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: analyticsKeys.salesTrend(dateParams),
    queryFn: () => getSalesTrend(dateParams),
    enabled: Boolean(dateParams?.from && dateParams?.to),
  });

  const isLoading = externalLoading || isQueryLoading;

  // Process and zero-fill daily data synchronized with the date range
  const trendData = useMemo(() => {
    // Extract list from various possible backend response envelopes
    const rawList = Array.isArray(trendResponse?.data)
      ? trendResponse.data
      : Array.isArray(trendResponse?.data?.trend)
      ? trendResponse.data.trend
      : Array.isArray(trendResponse?.data?.dailyTrends)
      ? trendResponse.data.dailyTrends
      : Array.isArray(trendResponse)
      ? trendResponse
      : [];

    // Map existing records by date string for O(1) matching
    const dataMap = new Map();
    rawList.forEach((item) => {
      const dStr = item.date || item.orderDate || item.day;
      if (dStr) {
        const formattedKey = dayjs(dStr).format("YYYY-MM-DD");
        dataMap.set(formattedKey, {
          revenue: Number(item.totalRevenue ?? item.revenue ?? 0),
          orderCount: Number(
            item.totalOrders ?? item.orderCount ?? item.ordersCount ?? item.orders ?? 0
          ),
        });
      }
    });

    // Build continuous timeline with zero-filling for gaps
    const list = [];
    for (let i = 0; i < totalDays; i++) {
      const d = adjustedStart.add(i, "day");
      const key = d.format("YYYY-MM-DD");
      const matched = dataMap.get(key);

      list.push({
        date: key,
        formattedDate:
          totalDays <= 1 ? d.format("MMM DD, YYYY") : d.format("MMM DD"),
        revenue: matched ? matched.revenue : 0,
        orderCount: matched ? matched.orderCount : 0,
      });
    }

    return list;
  }, [trendResponse, totalDays, adjustedStart]);

  // Aggregate totals for the selected window
  const totals = useMemo(() => {
    return trendData.reduce(
      (acc, item) => {
        acc.revenue += item.revenue;
        acc.orders += item.orderCount;
        return acc;
      },
      { revenue: 0, orders: 0 }
    );
  }, [trendData]);

  if (isLoading) {
    return (
      <Card
        className={`shadow-sm border-gray-100 rounded-xl ${className}`}
        title={
          <div className="py-1">
            <div className="text-base font-bold text-gray-900">
              Daily Sales & Order Trend
            </div>
            <div className="text-xs text-gray-400 font-normal mt-0.5">
              Continuous confirmed sales volume & revenue progression
            </div>
          </div>
        }
      >
        <div className="min-h-[320px] flex flex-col justify-center gap-4 py-8 px-4">
          <Skeleton.Input active block style={{ minHeight: 24, width: "40%" }} />
          <Skeleton.Button active block style={{ minHeight: 220, borderRadius: 8 }} />
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card
        className={`shadow-sm border-gray-100 rounded-xl ${className}`}
        title={
          <div className="py-1">
            <div className="text-base font-bold text-gray-900">
              Daily Sales & Order Trend
            </div>
            <div className="text-xs text-gray-400 font-normal mt-0.5">
              Continuous confirmed sales volume & revenue progression
            </div>
          </div>
        }
      >
        <div className="min-h-[320px] flex flex-col items-center justify-center gap-3 py-8 text-center">
          <p className="text-sm text-gray-500">Failed to load sales trend data.</p>
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

  const daysLength = trendData.length || 1;

  return (
    <Card
      className={`shadow-sm border-gray-100 rounded-xl ${className}`}
      styles={{ body: { flex: 1, display: "flex", flexDirection: "column" } }}
      title={
        <div className="py-1">
          <div className="text-base font-bold text-gray-900">
            Daily Sales & Order Trend
          </div>
          <div className="text-xs text-gray-400 font-normal mt-0.5">
            Continuous confirmed sales volume & revenue progression
            {rawDays > 90 ? " (showing last 90 days)" : " for selected period"}
          </div>
        </div>
      }
    >
      {/* Top summary ribbon synchronized with global filter */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 pb-4 mb-2 border-b border-gray-50 text-xs">
        <div>
          <span className="text-gray-400 block">Period Revenue</span>
          <span className="text-lg font-bold text-[#ee4d2d]">
            ${totals.revenue.toLocaleString()}
          </span>
        </div>
        <div className="hidden sm:block self-stretch w-[1px] bg-gray-200 my-0.5" />
        <div>
          <span className="text-gray-400 block">Total Confirmed Orders</span>
          <span className="text-lg font-bold text-blue-600">
            {totals.orders.toLocaleString()}
          </span>
        </div>
        <div className="hidden sm:block self-stretch w-[1px] bg-gray-200 my-0.5" />
        <div>
          <span className="text-gray-400 block">Avg. Daily Revenue</span>
          <span className="text-lg font-bold text-gray-800">
            ${Math.round(totals.revenue / daysLength).toLocaleString()}
          </span>
        </div>
      </div>

      {/* DualAxes Composed Chart with Accent Area (Revenue) + Line (Order Count) */}
      <div className="w-full min-h-[320px] py-2">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={trendData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="shopeeRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ee4d2d" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ee4d2d" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />

            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              interval={daysLength > 45 ? 8 : daysLength > 20 ? 3 : daysLength > 10 ? 1 : 0}
            />

            {/* Left Y-Axis: Revenue ($) styled with accent */}
            <YAxis
              yAxisId="revenue"
              orientation="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#ee4d2d", fontSize: 11 }}
              tickFormatter={(val) =>
                val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`
              }
            />

            {/* Right Y-Axis: Order Count */}
            <YAxis
              yAxisId="orders"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#3b82f6", fontSize: 11 }}
              tickFormatter={(val) => `${val}`}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
            />

            {/* Revenue Area (Left Axis) - Shopee Accent (#ee4d2d) */}
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              name="Revenue ($)"
              stroke="#ee4d2d"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#shopeeRevenueGradient)"
            />

            {/* Order Count Line (Right Axis) */}
            <Line
              yAxisId="orders"
              type="monotone"
              dataKey="orderCount"
              name="Order Count"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={daysLength <= 30 ? { r: 2.5, fill: "#3b82f6" } : false}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default SalesTrendChart;
