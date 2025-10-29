"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaChartBar,
  FaCalendarAlt,
  FaDownload,
  FaExclamationTriangle,
  FaTools,
  FaUsers,
  FaBox,
} from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DailyUsageModal from "./DailyUsageModal";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ReportsPage() {
  const [range, setRange] = useState("last_30_days");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUsageModal, setShowUsageModal] = useState(false);

  const ranges = [
    { label: "Last 7 Days", value: "last_7_days" },
    { label: "Last 30 Days", value: "last_30_days" },
    { label: "Last 90 Days", value: "last_90_days" },
    { label: "This Year", value: "year" },
  ];

  useEffect(() => {
    fetchReports();
  }, [range]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?range=${range}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    console.log("Exporting to PDF...");
  };

  const exportToExcel = () => {
    console.log("Exporting to Excel...");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with Export Options - Mobile Responsive */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Construction Reports & Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Comprehensive cost analysis and project performance metrics.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Date Range & Daily Usage */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
                >
                  {ranges.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowUsageModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <FaChartBar className="flex-shrink-0" />
                <span className="sm:inline">Daily Usage</span>
                {/* <span className="sm:hidden">Usage</span> */}
              </button>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <button
                onClick={exportToPDF}
                className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 flex items-center justify-center gap-2"
                title="Export to PDF"
              >
                <FaDownload className="flex-shrink-0" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              <button
                onClick={exportToExcel}
                className="flex-1 sm:flex-none px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 flex items-center justify-center gap-2"
                title="Export to Excel"
              >
                <FaDownload className="flex-shrink-0" />
                <span className="hidden sm:inline">Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 animate-pulse">Loading reports...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-10"
          >
            {/* Budget & Cost Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <SummaryCard
                title="Total Budget"
                value={`$${(data?.totals?.plannedCost || 0).toLocaleString()}`}
                color="bg-blue-600"
                subtitle="Estimated Cost"
              />
              <SummaryCard
                title="Actual Cost"
                value={`$${(data?.totals?.actualCost || 0).toLocaleString()}`}
                color="bg-orange-600"
                subtitle="Incurred Cost"
              />
              <SummaryCard
                title="Cost Variance"
                value={`$${(data?.totals?.costVariance || 0).toLocaleString()}`}
                color={
                  data?.totals?.costVariance >= 0
                    ? "bg-green-600"
                    : "bg-red-600"
                }
                subtitle={
                  data?.totals?.costVariance >= 0
                    ? "Under Budget"
                    : "Over Budget"
                }
              />
            </div>

            {/* Actual Cost Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <CostBreakdownCard
                title="Material Cost"
                value={data?.totals?.actualMaterialCost || 0}
                plannedValue={data?.totals?.plannedMaterialCost || 0}
                icon={FaBox}
                color="bg-blue-500"
              />
              <CostBreakdownCard
                title="Manpower Cost"
                value={data?.totals?.actualManpowerCost || 0}
                plannedValue={data?.totals?.plannedManpowerCost || 0}
                icon={FaUsers}
                color="bg-green-500"
              />
              <CostBreakdownCard
                title="Equipment Cost"
                value={data?.totals?.actualEquipmentCost || 0}
                plannedValue={data?.totals?.plannedEquipmentCost || 0}
                icon={FaTools}
                color="bg-yellow-500"
              />
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard
                title="Cost Performance Index"
                value={data?.totals?.CPI || 0}
                indicator={data?.totals?.CPI < 1 ? "Over Budget" : "On Budget"}
                color={
                  data?.totals?.CPI < 1 ? "text-red-600" : "text-green-600"
                }
              />
              <KPICard
                title="Schedule Performance Index"
                value={data?.totals?.SPI || 0}
                indicator={
                  data?.totals?.SPI < 1 ? "Behind Schedule" : "On Schedule"
                }
                color={
                  data?.totals?.SPI < 1 ? "text-red-600" : "text-green-600"
                }
              />
              <KPICard
                title="Over Budget Projects"
                value={data?.kpis?.overBudgetProjects || 0}
                indicator="Need Attention"
                color="text-red-600"
              />
              <KPICard
                title="Under Budget Projects"
                value={data?.kpis?.underBudgetProjects || 0}
                indicator="Good Performance"
                color="text-green-600"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartCard
                title="Cost Breakdown - Planned vs Actual"
                data={data?.charts?.costBreakdown || []}
                type="bar"
                dualAxis={true}
              />
              <ChartCard
                title="Planned vs Actual by Project"
                data={data?.charts?.budgetVsActual || []}
                type="bar"
                dualAxis={true}
              />

              <ChartCard
                title="Material Costs by Month"
                data={data?.charts?.materials || []}
                type="line"
              />
              <ChartCard
                title="Equipment Utilization"
                data={data?.charts?.equipmentUtilization || []}
                type="bar"
                dataKey="utilization"
              />
            </div>

            {/* Equipment Efficiency Table */}
            <EquipmentEfficiencyTable
              data={data?.charts?.equipmentUtilization || []}
            />
          </motion.div>
        )}
      </div>

      {/* Daily Usage Modal */}
      <DailyUsageModal
        open={showUsageModal}
        onClose={() => setShowUsageModal(false)}
        onSave={fetchReports}
      />
    </DashboardLayout>
  );
}

// Enhanced Components
function SummaryCard({ title, value, color, subtitle }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="p-5 shadow-md shadow-blue-400 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </h3>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <div
          className={`h-12 w-12 rounded-lg flex items-center justify-center ${color}`}
        >
          <FaChartBar className="text-white text-lg" />
        </div>
      </div>
    </motion.div>
  );
}

function CostBreakdownCard({ title, value, plannedValue, icon: Icon, color }) {
  const variance =
    plannedValue > 0 ? ((value - plannedValue) / plannedValue) * 100 : 0;
  const isOverBudget = value > plannedValue;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="p-5 rounded-xl shadow-md shadow-blue-400 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            ${value.toLocaleString()}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs ${
                isOverBudget ? "text-red-600" : "text-green-600"
              }`}
            >
              {isOverBudget ? "↑" : "↓"} {Math.abs(variance).toFixed(1)}%
            </span>
            <span className="text-gray-400 text-xs">
              Planned: ${plannedValue.toLocaleString()}
            </span>
          </div>
        </div>
        <div
          className={`h-12 w-12 rounded-lg flex items-center justify-center ${color}`}
        >
          <Icon className="text-white text-lg" />
        </div>
      </div>
    </motion.div>
  );
}

function KPICard({ title, value, indicator, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="p-5 rounded-xl shadow-md shadow-blue-400 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm truncate">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {typeof value === "number" ? value.toFixed(2) : value}
          </h3>
          <p className={`text-sm mt-1 ${color}`}>{indicator}</p>
        </div>
        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
          <FaChartBar className="text-blue-600 dark:text-blue-400 text-lg" />
        </div>
      </div>
    </motion.div>
  );
}

// ChartCard and EquipmentEfficiencyTable components remain the same as before
function ChartCard({ title, data, type, dualAxis = false, dataKey = "value" }) {
  // Check if data has meaningful values (not all zeros or empty)
  const hasValidData = data?.some((item) => {
    if (dualAxis) {
      const hasData = item.planned > 0 || item.actual > 0;
      return hasData;
    }
    return item[dataKey] > 0;
  });

  // Custom tooltip formatter based on chart type
  const getTooltipFormatter = () => {
    if (type === "pie") {
      return (value) => [`$${value.toLocaleString()}`, "Cost"];
    } else if (type === "bar" && dualAxis) {
      return (value, name) => {
        const label =
          name === "planned"
            ? "Planned Cost"
            : name === "actual"
            ? "Actual Cost"
            : "Amount";
        return [`$${value.toLocaleString()}`, label];
      };
    } else if (type === "bar" && title.includes("Utilization")) {
      return (value) => [`${value.toFixed(1)}%`, "Utilization Rate"];
    } else if (type === "line" && title.includes("Cost")) {
      return (value) => [`$${value.toLocaleString()}`, "Monthly Cost"];
    } else if (type === "bar") {
      return (value) => [`${value}`, getYAxisLabel()];
    } else {
      return (value) => [`${value}`, getYAxisLabel()];
    }
  };

  // Get YAxis label based on chart title
  const getYAxisLabel = () => {
    if (title.includes("Progress")) return "Progress %";
    if (title.includes("Utilization")) return "Utilization %";
    if (title.includes("Cost")) return "Cost ($)";
    if (title.includes("Hours")) return "Hours";
    return "Value";
  };

  // Optimized XAxis tick component for better space usage
  const CustomizedXAxisTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#6B7280"
          fontSize={11} // Slightly smaller font
          transform="rotate(-35)" // Less rotation for better space usage
          className="capitalize font-medium"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  // Capitalize project names for display
  const capitalizedData = data?.map((item) => ({
    ...item,
    name: item.name
      ? item.name
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ")
      : item.name,
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0]?.payload; // Get the full data item

      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">
            {dataItem?.fullName || label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {typeof entry.value === "number"
                ? entry.name.includes("Cost") || entry.name.includes("Amount")
                  ? `$${entry.value.toLocaleString()}`
                  : entry.name.includes("Utilization") ||
                    entry.name.includes("Progress")
                  ? `${entry.value.toFixed(1)}%`
                  : entry.value.toLocaleString()
                : entry.value}
            </p>
          ))}
          {/* Show progress in tooltip for Planned vs Actual chart */}
          {dataItem?.progress !== undefined && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              Progress: {dataItem.progress}%
            </p>
          )}
          {/* Show budget if available */}
          {dataItem?.budget !== undefined && dataItem.budget > 0 && (
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Budget: ${dataItem.budget.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Optimized margins based on chart type
  const getChartMargin = () => {
    if (type === "bar" && dualAxis) {
      return { bottom: 20, right: 10, left: 10, top: 10 }; // Reduced margins
    }
    if (type === "bar") {
      return { bottom: 20, right: 10, left: 10, top: 10 };
    }
    if (type === "line") {
      return { bottom: 10, right: 10, left: 10, top: 10 };
    }
    return { bottom: 10, right: 10, left: 10, top: 10 };
  };

  const chartMargin = getChartMargin();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      {data?.length > 0 && hasValidData ? (
        <div className="h-72">
          {" "}
          {/* Increased height for better visualization */}
          <ResponsiveContainer width="100%" height="100%">
            {type === "pie" ? (
              <PieChart>
                <Pie
                  data={capitalizedData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {capitalizedData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, "Cost"]}
                />
              </PieChart>
            ) : type === "bar" && dualAxis ? (
              <BarChart data={capitalizedData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={<CustomizedXAxisTick />}
                  height={50} // Reduced height for better space usage
                />
                <YAxis width={40} /> {/* Reduced YAxis width */}
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="planned"
                  fill="#4f46e5"
                  name="Planned Cost"
                  radius={4}
                />
                <Bar
                  dataKey="actual"
                  fill="#10b981"
                  name="Actual Cost"
                  radius={4}
                />
              </BarChart>
            ) : type === "bar" && title.includes("Utilization") ? (
              <BarChart data={capitalizedData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={<CustomizedXAxisTick />}
                  height={50}
                />
                <YAxis width={40} />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Utilization Rate"]}
                />
                <Bar dataKey={dataKey} fill="#2563eb" radius={4} />
              </BarChart>
            ) : type === "bar" ? (
              <BarChart data={capitalizedData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={<CustomizedXAxisTick />}
                  height={50}
                />
                <YAxis width={40} />
                <Tooltip formatter={(value) => [`${value}`, getYAxisLabel()]} />
                <Bar dataKey={dataKey} fill="#2563eb" radius={4} />
              </BarChart>
            ) : type === "line" && title.includes("Cost") ? (
              <LineChart data={capitalizedData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={<CustomizedXAxisTick />}
                  height={40}
                />
                <YAxis width={40} />
                <Tooltip
                  formatter={(value) => [
                    `$${value.toLocaleString()}`,
                    "Monthly Cost",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            ) : (
              <LineChart data={capitalizedData} margin={chartMargin}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis
                  dataKey="name"
                  interval={0}
                  tick={<CustomizedXAxisTick />}
                  height={40}
                />
                <YAxis width={40} />
                <Tooltip formatter={(value) => [`${value}`, getYAxisLabel()]} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#dc2626"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-sm italic mb-2">No data available for: {title}</p>
          <p className="text-xs text-gray-400 text-center">
            {data?.length > 0
              ? "Data exists but all values are zero"
              : "No data returned from API"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Data points: {data?.length || 0}
          </p>
        </div>
      )}
    </div>
  );
}
function EquipmentEfficiencyTable({ data }) {
  if (!data?.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Equipment Efficiency
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-gray-600">
              <th className="text-left py-2">Equipment</th>
              <th className="text-right py-2">Planned Hours</th>
              <th className="text-right py-2">Actual Hours</th>
              <th className="text-right py-2">Utilization Rate</th>
              <th className="text-right py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b dark:border-gray-600">
                <td className="py-3 capitalize">{item.name}</td>
                <td className="text-right py-3">{item.plannedHours}</td>
                <td className="text-right py-3">{item.actualHours}</td>
                <td className="text-right py-3">
                  {item.utilization.toFixed(1)}%
                </td>
                <td className="text-right py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      item.utilization > 80
                        ? "bg-green-100 text-green-800"
                        : item.utilization > 50
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {item.utilization > 80
                      ? "High"
                      : item.utilization > 50
                      ? "Medium"
                      : "Low"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
