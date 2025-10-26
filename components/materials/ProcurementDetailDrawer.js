// components/materials/ProcurementDetailDrawer.js
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useState } from "react";
import {
  X,
  Package,
  Building,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  Ban,
  Loader,
} from "lucide-react";
import { FaEnvelope } from "react-icons/fa6";
import toast from "react-hot-toast";

const ProcurementDetailDrawer = ({
  order,
  onClose,
  onApprove,
  onReject,
  onReceive,
  loadingStates,
  setShowDetailDrawer,
  isOpen,
  onReceiveClick,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const sendOrderEmail = async (order) => {
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/procurement/orders/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId: order.id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email");
      }

      toast.success("Order Email sent to the Supplier", { duration: 4000 });

      // Close the drawer after successful email send to refresh the data
      onClose();
    } catch (err) {
      console.error("Error sending email:", err);
      setError(err.message);
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      received: "bg-green-500 text-white dark:bg-green-500 dark:text-white",
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      ordered:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      delivered:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      cancelled:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isLoading = (action) => {
    return loadingStates[order.id]?.[action] || false;
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
      />
      <motion.aside
        key="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 22, stiffness: 260 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[480px] max-w-full bg-white dark:bg-gray-900 shadow-2xl z-[80] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Order Details
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              #{order.id}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 ml-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Status Badge */}
          <div className="flex justify-between items-center">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                order.status
              )}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
            {(order.status === "pending" ||
              order.status === "approved" ||
              order.status === "ordered") && (
              <button
                onClick={() => setShowActions(!showActions)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showActions ? "Hide Actions" : "Show Actions"}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          {showActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3"
            >
              {order.status === "pending" && (
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onApprove(order.id)}
                    disabled={isLoading("approve")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading("approve") ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve Order
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onReject(order.id)}
                    disabled={isLoading("reject")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading("reject") ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Ban className="w-4 h-4" />
                    )}
                    Reject Order
                  </motion.button>
                </div>
              )}

              {order.status === "approved" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendOrderEmail(order)}
                  disabled={isSending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <FaEnvelope className="w-4 h-4" />
                  )}
                  Send Order Email
                </motion.button>
              )}

              {order.status === "ordered" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowDetailDrawer(false);
                    onReceiveClick(order);
                  }}
                  disabled={isLoading("receive")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading("receive") ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Truck className="w-4 h-4" />
                  )}
                  Receive Order
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Material Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Material Information
            </h4>
            <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {order.master_materials?.name || "Unknown Material"}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {order.master_materials?.category || "—"}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Quantity</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {order.quantity} {order.master_materials?.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Unit Cost
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      ETB {order.unit_cost?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
              Order Details
            </h4>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Supplier</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {order.suppliers?.name || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Total Cost</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    ETB {order.total_cost?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Order Date</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(order.order_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Expected Delivery
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(order.expected_delivery)}
                  </p>
                </div>
              </div>

              {order.project_phase && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Project Phase
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                    {order.project_phase}
                  </p>
                </div>
              )}

              {order.notes && (
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Notes</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {order.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>,
    document.body
  );
};

export default ProcurementDetailDrawer;
