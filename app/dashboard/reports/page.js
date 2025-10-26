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
} from "recharts";
import { FaChartBar, FaCalendarAlt } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ReportsPage() {
  const [range, setRange] = useState("last_30_days");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const ranges = [
    { label: "Last 7 Days", value: "last_7_days" },
    { label: "Last 30 Days", value: "last_30_days" },
    { label: "Last 90 Days", value: "last_90_days" },
    { label: "This Year", value: "year" },
  ];

  useEffect(() => {
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
    fetchReports();
  }, [range]);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Summary of ongoing projects, manpower, materials, and equipment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-500 dark:text-gray-400" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white dark:bg-gray-800 dark:text-gray-200"
            >
              {ranges.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
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
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <SummaryCard
                title="Total Projects"
                value={data?.totals?.projects || 0}
                color="bg-blue-600"
              />
              <SummaryCard
                title="Total Manpower"
                value={data?.totals?.manpower || 0}
                color="bg-green-600"
              />
              <SummaryCard
                title="Material Requests"
                value={data?.totals?.materials || 0}
                color="bg-yellow-500"
              />
              <SummaryCard
                title="Equipment Count"
                value={data?.totals?.equipments || 0}
                color="bg-red-600"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartCard
                title="Project Progress Overview"
                data={data?.charts?.progress || []}
                type="bar"
              />
              <ChartCard
                title="Material Requests by Month"
                data={data?.charts?.materials || []}
                type="line"
              />
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ================= Components =================

function SummaryCard({ title, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="p-5 rounded-xl shadow-sm bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </h3>
        </div>
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}
        >
          <FaChartBar className="text-white text-lg" />
        </div>
      </div>
    </motion.div>
  );
}

function ChartCard({ title, data, type }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      {data?.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {type === "bar" ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={6} />
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic">No data available.</p>
      )}
    </div>
  );
}
