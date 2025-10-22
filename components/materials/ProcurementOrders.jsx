"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit2,
  Search,
  Filter,
  Download,
  Plus,
} from "lucide-react";
import ReceiveOrderModal from "./ReceiveOrderModal";

const ProcurementOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // Load procurement orders
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/procurement/orders");
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.master_materials?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.suppliers?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.material_requirements?.project_id
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  // Load orders on component mount
  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      Pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      Ordered:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      Shipped:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      Received:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      Cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      Delayed:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    );
  };

  const getStatusIcon = (status) => {
    const icons = {
      Pending: Clock,
      Ordered: Package,
      Shipped: Truck,
      Received: CheckCircle,
      Cancelled: AlertCircle,
      Delayed: AlertCircle,
    };
    return icons[status] || Package;
  };

  const handleReceiveOrder = (order) => {
    setSelectedOrder(order);
    setShowReceiveModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Procurement Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage and track all material procurement orders
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search materials, suppliers, or project ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Ordered">Ordered</option>
              <option value="Shipped">Shipped</option>
              <option value="Received">Received</option>
              <option value="Delayed">Delayed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {filteredOrders.length} orders found
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Expected Delivery
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                <AnimatePresence>
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No procurement orders found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order, index) => {
                      const StatusIcon = getStatusIcon(order.status);

                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white capitalize">
                                  {order.master_materials?.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {order.master_materials?.unit}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {order.suppliers?.name || "Not specified"}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {order.suppliers?.contact_person}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-semibold">
                            {order.quantity} {order.master_materials?.unit}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {order.expected_delivery
                              ? new Date(
                                  order.expected_delivery
                                ).toLocaleDateString()
                              : "Not set"}
                          </td>

                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white font-mono uppercase">
                              {order.material_requirements?.project_id}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {order.project_phase}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {order.status}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleReceiveOrder(order)}
                                disabled={order.status === "Received"}
                                className={`p-1 rounded ${
                                  order.status === "Received"
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
                                }`}
                                title="Receive Order"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-1 rounded text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Receive Order Modal */}
        <ReceiveOrderModal
          order={selectedOrder}
          isOpen={showReceiveModal}
          onClose={() => {
            setShowReceiveModal(false);
            setSelectedOrder(null);
          }}
          onSuccess={() => {
            setShowReceiveModal(false);
            setSelectedOrder(null);
            loadOrders();
          }}
        />
      </div>
    </div>
  );
};

export default ProcurementOrders;
