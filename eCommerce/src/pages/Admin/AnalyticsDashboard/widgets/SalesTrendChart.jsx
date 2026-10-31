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
              ${revItem?.value?.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-gray-500 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              Orders:
            </span>
            <span className="font-bold text-gray-900 text-sm">
              {orderItem?.value} orders
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const SalesTrendChart = ({ dateRange, activeTab, isLoading = false, className = "" }) => {
  // Generate continuous daily data synchronized with the global dateRange
  const trendData = useMemo(() => {
    const end = dateRange?.[1] ? dayjs(dateRange[1]) : dayjs();
    const start = dateRange?.[0] ? dayjs(dateRange[0]) : end.subtract(29, "day");

    // Days count (clamped to max 90 days per backend API contract)
    const rawDays = Math.max(end.diff(start, "day") + 1, 1);
    const totalDays = Math.min(rawDays, 90);
    const adjustedStart =
      rawDays > 90 ? end.subtract(89, "day") : start;

    const list = [];
    for (let i = 0; i < totalDays; i++) {
      const d = adjustedStart.add(i, "day");
      const isWeekend = d.day() === 0 || d.day() === 6;

      // Realistic fluctuation with weekend peaks
      const baseOrders = isWeekend
        ? 22 + Math.floor(Math.sin(i * 0.5) * 6 + Math.random() * 8)
        : 14 + Math.floor(Math.cos(i * 0.4) * 4 + Math.random() * 6);
      const avgTicket = 92 + Math.floor(Math.random() * 35);
      const revenue = Math.round(baseOrders * avgTicket);

      list.push({
        date: d.format("YYYY-MM-DD"),
        formattedDate: totalDays <= 1 ? d.format("MMM DD, YYYY") : d.format("MMM DD"),
        revenue: revenue,
        orderCount: baseOrders,
      });
    }
    return list;
  }, [dateRange]);

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
        className="shadow-sm border-gray-100 rounded-xl"
        title={<span className="font-semibold text-gray-800">Sales & Order Trend</span>}
      >
        <div className="min-h-[320px] flex flex-col justify-center gap-4 py-8 px-4">
          <Skeleton.Input active block style={{ minHeight: 24, width: "40%" }} />
          <Skeleton.Button active block style={{ minHeight: 220, borderRadius: 8 }} />
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
            Continuous confirmed sales volume & revenue progression for selected period
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
