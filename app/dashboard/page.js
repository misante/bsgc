"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatsCard from "@/components/common/StatsCard";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboardData,
  getChartData,
  getRecentActivity,
  testDatabaseConnection,
} from "@/lib/dashboardData";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

// Default data for loading states
const defaultStats = [
  {
    name: "Active Projects",
    stat: "0",
    icon: "🏗️",
    change: "+0",
    changeType: "increase",
    description: "Ongoing construction projects",
    href: "/dashboard/projects",
  },
  {
    name: "Tasks",
    href: "/dashboard/tasks",
    icon: "✅",
    stat: "0",
    change: "+0",
    changeType: "increase",
    description: "Project Tasks",
  },
  {
    name: "Total Workers",
    stat: "0",
    icon: "👷",
    change: "+0",
    changeType: "increase",
    description: "On-site personnel",
    href: "/dashboard/manpower",
  },
  {
    name: "Equipment",
    stat: "0",
    icon: "🚜",
    change: "+0",
    changeType: "increase",
    description: "Active machinery",
    href: "/dashboard/equipment",
  },
  {
    name: "Materials",
    stat: "0",
    icon: "📦",
    change: "+0",
    changeType: "increase",
    description: "Inventory items",
    href: "/dashboard/materials",
  },
  {
    name: "Tasks Completed",
    stat: "0%",
    icon: "✅",
    change: "+0%",
    changeType: "increase",
    description: "Project progress",
    href: "/dashboard/projects",
  },
  {
    name: "Safety Score",
    stat: "0%",
    icon: "🛡️",
    change: "+0%",
    changeType: "increase",
    description: "Compliance rating",
    href: "/dashboard/safety",
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(defaultStats);
  const [chartData, setChartData] = useState({
    projectProgressData: [],
    safetyData: [],
    resourceData: [],
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.group("🚀 Loading Dashboard Data");

      // Test connection first
      const connectionTest = await testDatabaseConnection();
      if (!connectionTest.success) {
        throw new Error(
          "Database connection failed: " + connectionTest.error.message
        );
      }

      const [dashboardData, charts, activity] = await Promise.all([
        getDashboardData().catch((err) => {
          console.error("Failed to get dashboard data:", err);
          throw err;
        }),
        getChartData().catch((err) => {
          console.error("Failed to get chart data:", err);
          throw err;
        }),
        getRecentActivity().catch((err) => {
          console.error("Failed to get recent activity:", err);
          throw err;
        }),
      ]);

      // Update stats with real data
      setStats([
        {
          name: "Active Projects",
          stat: dashboardData.activeProjects.toString(),
          icon: "🏗️",
          change: "+0",
          changeType: "increase",
          description: "Ongoing construction projects",
          href: "/dashboard/projects",
        },
        {
          name: "Total Workers",
          stat: dashboardData.totalWorkers.toString(),
          icon: "👷",
          change: "+0",
          changeType: "increase",
          description: "On-site personnel",
          href: "/dashboard/manpower",
        },
        {
          name: "Equipment",
          stat: dashboardData.activeEquipment.toString(),
          icon: "🚜",
          change: "+0",
          changeType: "increase",
          description: "Active machinery",
          href: "/dashboard/equipment",
        },
        {
          name: "Materials",
          stat: dashboardData.totalMaterials.toString(),
          icon: "📦",
          change: "+0",
          changeType: "increase",
          description: "Inventory items",
          href: "/dashboard/materials",
          progress: dashboardData.materialsAvailability,
        },
        {
          name: "Tasks Completed",
          stat: `${dashboardData.tasksCompletedRate}%`,
          icon: "✅",
          change: "+0%",
          changeType: "increase",
          description: "Project progress",
          href: "/dashboard/tasks",
          progress: dashboardData.tasksCompletedRate,
        },
        {
          name: "Safety Score",
          stat: `${dashboardData.safetyScore}%`,
          icon: "🛡️",
          change: "+0%",
          changeType: "increase",
          description: "Compliance rating",
          href: "/dashboard/safety",
          progress: dashboardData.safetyScore,
        },
      ]);

      setChartData(charts);
      setRecentActivity(activity);
      setLastUpdated(new Date().toLocaleString());

      console.groupEnd();
    } catch (error) {
      console.error("💥 Failed to load dashboard data:", error);
      setError({
        message: error.message,
        details: "Please check your database connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Error state component
  if (error) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center min-h-96 p-8"
        >
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Unable to Load Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
            {error.message}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 text-center mb-6">
            {error.details}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadDashboardData}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </motion.button>
        </motion.div>
      </DashboardLayout>
    );
  }
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight dark:text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400 max-w-3xl">
              Welcome to BSGC Construction Management System. Monitor your
              projects, resources, and safety metrics.
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} className="mt-4 sm:mt-0">
            <div className="text-sm text-gray-500 bg-primary-50 px-4 py-2 rounded-lg border border-primary-100 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-800">
              Last updated: {lastUpdated}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Overview
          </h2>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 dark:bg-gray-800">
            {["overview", "projects", "resources"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab
                    ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {stats.map((item) => (
              <motion.div
                key={item.name}
                variants={itemVariants}
                className="shadow-sm shadow-blue-600 rounded-xl"
              >
                <StatsCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10"
      >
        {/* Project Progress Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
            Project Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.projectProgressData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [`${value}%`, "Progress"]}
              />
              <Bar dataKey="progress" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Safety Score Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
            Safety Score Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.safetyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [`${value}%`, "Safety Score"]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#10B981" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
            Resource Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.resourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.resourceData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div
                    className={`w-2 h-2 mt-2 rounded-full ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "info"
                        ? "bg-blue-500"
                        : activity.type === "warning"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm capitalize font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700"
      >
        <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: "📋",
              label: "Create Report",
              color: "primary",
              href: "/dashboard/reports",
            },
            {
              icon: "👥",
              label: "Add Staff",
              color: "green",
              href: "/dashboard/manpower",
            },
            {
              icon: "📦",
              label: "Order Materials",
              color: "blue",
              href: "/dashboard/materials",
            },
            {
              icon: "🛡️",
              label: "Safety Check",
              color: "purple",
              href: "/dashboard/safety",
            },
          ].map((action, index) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = action.href)}
              className={`bg-${action.color}-50 text-${action.color}-700 hover:bg-${action.color}-100 p-4 rounded-xl text-center transition-all duration-200 dark:bg-${action.color}-900/20 dark:text-${action.color}-300 dark:hover:bg-${action.color}-900/30 border border-${action.color}-200 dark:border-${action.color}-800`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm font-medium">{action.label}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
