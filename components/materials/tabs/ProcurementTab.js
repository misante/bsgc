// export default ProcurementTab;
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Calculator,
  ShoppingCart,
  Search,
  CheckCircle,
  Ban,
  CheckSquare,
  Truck,
  Eye,
  Package,
  Loader,
} from "lucide-react";
import CreateProcurementOrderModal from "../modals/CreateProcurementOrderModal";
import ReceiveOrderModal from "../modals/ReceiveOrderModal";

const ProcurementTab = ({
  suppliers,
  procurementOrders,
  plannedMaterials,
  onCreateOrder,
  onUpdateApproval,
  onReceiveOrder,
}) => {
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    // Track loading states for each order and action
    // Structure: { [orderId]: { approve: boolean, reject: boolean, receive: boolean } }
  });

  const getStatusColor = (status) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      received: "bg-green-500 text-white dark:bg-green-500 dark:text-white",
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      ordered: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      delivered:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      cancelled:
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[status] || colors.pending;
  };

  const handleReceiveClick = (order) => {
    setSelectedOrder(order);
    setShowReceiveModal(true);
  };

  const handleReceiveOrderSubmit = async (orderId, inventoryData) => {
    const success = await onReceiveOrder(orderId, inventoryData);
    if (success) {
      setShowReceiveModal(false);
      setSelectedOrder(null);
    }
  };

  const handleApprove = async (orderId) => {
    // Set loading state for this specific order's approve button
    setLoadingStates((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], approve: true },
    }));

    try {
      await onUpdateApproval(orderId, "approved");
    } finally {
      // Clear loading state regardless of success/failure
      setLoadingStates((prev) => ({
        ...prev,
        [orderId]: { ...prev[orderId], approve: false },
      }));
    }
  };

  const handleReject = async (orderId) => {
    // Set loading state for this specific order's reject button
    setLoadingStates((prev) => ({
      ...prev,
      [orderId]: { ...prev[orderId], reject: true },
    }));

    try {
      await onUpdateApproval(orderId, "rejected");
    } finally {
      // Clear loading state regardless of success/failure
      setLoadingStates((prev) => ({
        ...prev,
        [orderId]: { ...prev[orderId], reject: false },
      }));
    }
  };

  const handleReceive = async (order) => {
    // Set loading state for this specific order's receive button
    setLoadingStates((prev) => ({
      ...prev,
      [order.id]: { ...prev[order.id], receive: true },
    }));

    try {
      handleReceiveClick(order);
    } finally {
      // Note: We don't clear the loading state here because the modal will handle the actual receive operation
      // The loading state will be cleared when the modal operation completes
    }
  };

  // Helper function to get loading state for a specific order and action
  const isLoading = (orderId, action) => {
    return loadingStates[orderId]?.[action] || false;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Procurement Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create procurement orders and manage order workflow
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateOrderModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Order
          </motion.button>
        </div>
      </div>

      {/* Procurement Orders Table */}
      <div>
        <p className="text-center text-xs text-blue-500 capitalize">
          all costs/amounts are in ETB
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-200 w-full text-xs dark:bg-gray-700">
                <tr>
                  <th className="text-center w-[10%] py-3 text-nowrap capitalize">
                    Order #
                  </th>
                  <th className="text-left w-[20%] py-3 capitalize">
                    Material
                  </th>
                  <th className="text-left w-[20%] py-3 capitalize">
                    Supplier
                  </th>
                  <th className="text-center w-[10%] py-3 capitalize">
                    Quantity
                  </th>
                  <th className="text-center w-[10%] py-3 capitalize text-nowrap">
                    Total Cost
                  </th>
                  <th className="text-center w-[10%] py-3 capitalize text-nowrap">
                    Expected Delivery
                  </th>
                  <th className="text-center w-[10%] py-3 capitalize">
                    Status
                  </th>
                  <th className="text-center w-[10%] py-3 capitalize">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {procurementOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b text-xs border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 text-center w-[10%] font-medium text-gray-900 dark:text-white">
                      #{order.id}
                    </td>
                    <td className="py-3 text-left w-[20%]">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white capitalize">
                            {order.master_materials?.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.project_phase}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-left w-[20%] capitalize text-nowrap text-gray-600 dark:text-gray-400">
                      {order.suppliers?.name || "—"}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="text-gray-900 dark:text-white">
                        {order.quantity}
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                          {order.master_materials?.unit}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center w-[10%] font-semibold text-green-600 dark:text-green-400">
                      {order.total_cost?.toLocaleString()}
                    </td>
                    <td className="py-3 px-14 text-gray-600 dark:text-gray-400">
                      {order.expected_delivery
                        ? new Date(order.expected_delivery).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-3 text-center w-[10%]">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 text-center w-[10%]">
                      <div className="flex items-center gap-2">
                        {order.status === "pending" && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleApprove(order.id)}
                              disabled={isLoading(order.id, "approve")}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Approve Order"
                            >
                              {isLoading(order.id, "approve") ? (
                                <Loader className="w-4 h-4 animate-spin mx-auto" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleReject(order.id)}
                              disabled={isLoading(order.id, "reject")}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reject Order"
                            >
                              {isLoading(order.id, "reject") ? (
                                <Loader className="w-4 h-4 animate-spin mx-auto" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </motion.button>
                          </>
                        )}
                        {order.status === "approved" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleReceive(order)}
                            disabled={isLoading(order.id, "receive")}
                            className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Receive Order"
                          >
                            {isLoading(order.id, "receive") ? (
                              <Loader className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                              <Truck className="w-4 h-4" />
                            )}
                          </motion.button>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            /* View details */
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {procurementOrders.length === 0 && (
              <div className="text-center py-16 px-6">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No procurement orders
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Create your first procurement order from material
                  requirements.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      <CreateProcurementOrderModal
        suppliers={suppliers}
        isOpen={showCreateOrderModal}
        onClose={() => setShowCreateOrderModal(false)}
        materialRequirements={plannedMaterials.filter(
          (m) => !m.procurement_order_id
        )}
        onCreateOrder={onCreateOrder}
      />
      <ReceiveOrderModal
        isOpen={showReceiveModal}
        onClose={() => {
          setShowReceiveModal(false);
          setSelectedOrder(null);
          // Clear receive loading state when modal closes
          if (selectedOrder) {
            setLoadingStates((prev) => ({
              ...prev,
              [selectedOrder.id]: { ...prev[selectedOrder.id], receive: false },
            }));
          }
        }}
        order={selectedOrder}
        onReceiveOrder={handleReceiveOrderSubmit}
      />
    </div>
  );
};

export default ProcurementTab;
