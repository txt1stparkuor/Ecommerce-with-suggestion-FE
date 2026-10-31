import React, { useState } from "react";
import { DatePicker } from "antd";
import { CalendarOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import SalesTrendChart from "./widgets/SalesTrendChart";
import TopProductsLeaderboard from "./widgets/TopProductsLeaderboard";
import LowStockAlertTable from "./widgets/LowStockAlertTable";

const { RangePicker } = DatePicker;

const AnalyticsDashboard = () => {
  const navigate = useNavigate();

  // Active filter tab: "today" | "week" | "month" | "quarter" | "year" | "custom"
  const [activeTab, setActiveTab] = useState("week");
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Date range state
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("week"),
    dayjs().endOf("day"),
  ]);

  // Tab change handler
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "today") {
      setShowCustomPicker(false);
      setDateRange([dayjs().startOf("day"), dayjs().endOf("day")]);
    } else if (key === "week") {
      setShowCustomPicker(false);
      setDateRange([dayjs().startOf("week"), dayjs().endOf("day")]);
    } else if (key === "month") {
      setShowCustomPicker(false);
      setDateRange([dayjs().startOf("month"), dayjs().endOf("day")]);
    } else if (key === "quarter") {
      setShowCustomPicker(false);
      setDateRange([
        dayjs().subtract(3, "month").startOf("day"),
        dayjs().endOf("day"),
      ]);
    } else if (key === "year") {
      setShowCustomPicker(false);
      setDateRange([dayjs().startOf("year"), dayjs().endOf("day")]);
    } else if (key === "custom") {
      setShowCustomPicker(true);
    }
  };

  // Restrict to max 1-year span and disable future dates
  const disabledDate = (current, { from }) => {
    if (!current) return false;
    if (current > dayjs().endOf("day")) {
      return true;
    }
    if (from) {
      return Math.abs(current.diff(from, "days")) > 365;
    }
    return false;
  };

  const handleCustomDateChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange(dates);
    }
  };

  // Dynamic comparison label based on active tab
  const getComparisonLabel = () => {
    if (activeTab === "today") return "From yesterday";
    if (activeTab === "week") return "From last week";
    if (activeTab === "month") return "From last month";
    if (activeTab === "quarter") return "From last quarter";
    if (activeTab === "year") return "From last year";
    return "From previous period";
  };

  const periodLabel = getComparisonLabel();

  // Trending Arrow SVG icon matching reference design
  const TrendUpIcon = () => (
    <svg
      className="w-3.5 h-3.5 stroke-current"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* 1. Welcoming Header & Filter Control Bar */}
      <div className="flex flex-col gap-4 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Welcome, Admin
          </h1>
          <p className="text-lg text-gray-500 mt-1">
            Monitor sales performance, revenue trends, and products' stock
          </p>
        </div>

        {/* Quick Date Range Buttons (Below the welcoming text) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {[
            { key: "today", label: "Today" },
            { key: "week", label: "Week" },
            { key: "month", label: "Month" },
            { key: "quarter", label: "Quarter" },
            { key: "year", label: "Year" },
            { key: "custom", label: "Custom date" },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#ee4d2d] text-white shadow-sm shadow-[#ee4d2d]/25 hover:bg-[#d03e1f]"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          {/* Conditional Custom Date Range Picker */}
          {showCustomPicker && (
            <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex items-center gap-1.5 ml-1">
              <CalendarOutlined className="text-gray-400 pl-1.5" />
              <RangePicker
                value={dateRange}
                disabledDate={disabledDate}
                onChange={handleCustomDateChange}
                allowClear={false}
                format="YYYY-MM-DD"
                className="border-none bg-transparent hover:bg-transparent shadow-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* Row 1: Key Metric Cards (KPIs) with Big Bold Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
        {/* Card 1: Gross Revenue */}
        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div>
            <div className="text-[15px] font-medium text-gray-500">
              Gross revenue
            </div>
            <div className="text-4xl font-bold tracking-tight text-gray-900 mt-2">
              $14,509
            </div>
          </div>
          <div className="flex-1 my-3" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600">
              <TrendUpIcon />
              21%
            </span>
            <span className="text-xs text-gray-400">{periodLabel}</span>
          </div>
        </div>

        {/* Card 2: Average Order Value */}
        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div>
            <div className="text-[15px] font-medium text-gray-500">
              Avg. order value
            </div>
            <div className="text-4xl font-bold tracking-tight text-gray-900 mt-2">
              $204
            </div>
          </div>
          <div className="flex-1 my-3" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600">
              <TrendUpIcon />
              $53
            </span>
            <span className="text-xs text-gray-400">{periodLabel}</span>
          </div>
        </div>

        {/* Card 3: Completed Orders */}
        <div className="bg-white p-6 rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          <div>
            <div className="text-[15px] font-medium text-gray-500">
              Completed orders
            </div>
            <div className="text-4xl font-bold tracking-tight text-gray-900 mt-2">
              1,250
            </div>
          </div>
          <div className="flex-1 my-3" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600">
              <TrendUpIcon />
              12%
            </span>
            <span className="text-xs text-gray-400">{periodLabel}</span>
          </div>
        </div>

        {/* Card 4: Action Alert (Pending Orders) */}
        <div className="bg-white p-6 rounded-xl border border-amber-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-medium text-amber-700">
                Pending orders
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 animate-pulse">
                Live Action
              </span>
            </div>
            <div className="text-4xl font-bold tracking-tight text-amber-600 mt-2">
              15
            </div>
          </div>
          <div className="flex-1 my-3" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Awaiting merchant review
            </span>
            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Process orders <ArrowRightOutlined className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Trends & Leaderboard */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-8 flex flex-col">
          <SalesTrendChart
            dateRange={dateRange}
            activeTab={activeTab}
            className="flex-1 flex flex-col"
          />
        </div>
        <div className="xl:col-span-4 flex flex-col">
          <TopProductsLeaderboard className="flex-1 flex flex-col" />
        </div>
      </div>

      {/* Row 3: Operational Health & Inventory */}
      <div>
        <LowStockAlertTable />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
