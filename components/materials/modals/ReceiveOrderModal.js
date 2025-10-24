// components/materials/modals/ReceiveOrderModal.js
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  Calendar,
  MapPin,
  Barcode,
  User,
  DollarSign,
  Truck,
  CheckCircle,
  ClipboardList,
  Database,
  History,
  Layers,
} from "lucide-react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

const ReceiveOrderModal = ({
  isOpen,
  onClose,
  order,
  fetchProcurementOrders,
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("receive");
  const [formData, setFormData] = useState({
    procurement_order_id: "",
    material_id: "",
    material_name: "",
    location: "",
    batch_number: "",
    received_date: new Date().toISOString().split("T")[0],
    expiry_date: "",
    unit_cost: "",
    ordered_quantity: "",
    received_quantity: "",
    total_value: "",
    received_by: "",
    received_at: "",
    notes: "",
    supplier_name: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptHistory, setReceiptHistory] = useState([]);
  const [materialStock, setMaterialStock] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  console.log("order to receive:", order);
  // Reset form and fetch data when modal opens
  useEffect(() => {
    if (isOpen && order) {
      resetForm();
      fetchMaterialStock();
      if (activeTab === "history") {
        fetchReceiptHistory();
      }
    }
  }, [isOpen, order, activeTab]);

  const resetForm = () => {
    setFormData({
      procurement_order_id: order.id,
      material_id: order.material_id,
      material_name: order.material_name,
      location: "",
      batch_number: `BATCH-${order.id}-${Date.now().toString().slice(-6)}`,
      received_date: new Date().toISOString().split("T")[0],
      expiry_date: null,
      ordered_quantity: order.quantity,
      received_quantity: order.quantity,
      unit_cost: order.unit_cost || 0,
      total_value: (order.unit_cost || 0) * order.quantity,
      received_by: "Anteneh",
      received_at: new Date().toISOString(),
      notes: `Received from ${order.suppliers?.name || "supplier"} - Order #${
        order.id
      }`,
      supplier_name: order.supplier_name,
    });
  };
  console.log("order recceipt form data:", formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!order) return;

    setIsSubmitting(true);
    const orderReceiptDetail = {
      ...formData,
      location: formData.location,
      expiry_date: formData.expiry_date || null,
    };
    try {
      const response = await fetch("/api/materials/inventory/receive-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderReceiptDetail),
      });

      const result = await response.json();

      if (result.success) {
        // Call the parent component's callback if provided
        await fetchProcurementOrders();
        toast.success("Order receipt updated successfully", { duration: 4000 });
        onClose();
      } else {
        console.error("Error receiving order:", result.error);
        toast.error("Error receiving order: " + result.error);
      }
    } catch (error) {
      console.error("Error submitting receive order:", error);
      toast.error("Error receiving order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchMaterialStock = async () => {
    if (!order?.master_material_id) return;

    try {
      const response = await fetch(
        `/api/materials/inventory/material-stock?master_material_id=${order.master_material_id}`
      );
      const result = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        setMaterialStock(result.data[0]);
      } else {
        setMaterialStock(null);
      }
    } catch (error) {
      console.error("Error fetching material stock:", error);
      setMaterialStock(null);
    }
  };

  const fetchReceiptHistory = async () => {
    if (!order?.master_material_id) return;

    setLoadingHistory(true);
    try {
      const response = await fetch(
        `/api/materials/inventory/receipt-history?master_material_id=${order.master_material_id}`
      );
      const result = await response.json();

      if (result.success) {
        setReceiptHistory(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching receipt history:", error);
      setReceiptHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Calculate total value when unit cost or received quantity changes
  useEffect(() => {
    const unitCost = parseFloat(formData.unit_cost) || 0;
    const quantity = parseFloat(formData.received_quantity) || 0;
    const totalValue = unitCost * quantity;

    setFormData((prev) => ({
      ...prev,
      total_value: totalValue,
    }));
  }, [formData.unit_cost, formData.received_quantity]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "history") {
      fetchReceiptHistory();
    }
  };

  if (!isOpen || !order) return null;

  return (
    <>
      {mounted &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50"
              onClick={onClose}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header - Fixed */}
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Truck className="w-6 h-6 text-green-600" />
                        Receive Order #{order.id}
                      </h3>

                      {/* Material Summary Badge */}
                      {materialStock && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full">
                          <Database className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            Total Stock: {materialStock.total_quantity}{" "}
                            {order.master_materials?.unit}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-1 px-6">
                      <button
                        onClick={() => handleTabChange("receive")}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                          activeTab === "receive"
                            ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-t border-l border-r border-gray-200 dark:border-gray-700"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                      >
                        <Package className="w-4 h-4" />
                        Receive Items
                      </button>
                      <button
                        onClick={() => handleTabChange("history")}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                          activeTab === "history"
                            ? "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-t border-l border-r border-gray-200 dark:border-gray-700"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                      >
                        <History className="w-4 h-4" />
                        Receipt History
                      </button>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Order Summary
                      </h4>

                      {/* Quick Stock Info */}
                      {materialStock && (
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm">
                            <Layers className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-600">
                              Current Stock: {materialStock.total_quantity}{" "}
                              {order.master_materials?.unit}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Avg Cost: ETB{" "}
                            {materialStock.average_unit_cost?.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 dark:text-blue-300">
                          Material:
                        </span>
                        <p className="font-medium text-green-500 capitalize">
                          {order.material_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700 dark:text-blue-300">
                          Supplier:
                        </span>
                        <p className="font-medium text-green-500 capitalize">
                          {order.suppliers?.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700 dark:text-blue-300">
                          Unit Cost:
                        </span>
                        <p className="font-medium text-green-500 capitalize">
                          ETB {order.unit_cost?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700 dark:text-blue-300">
                          Ordered Quantity:
                        </span>
                        <p className="font-medium text-green-500 capitalize">
                          {order.quantity} {order.master_materials?.unit}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700 dark:text-blue-300">
                          Total Cost:
                        </span>
                        <p className="font-medium text-green-500 capitalize">
                          ETB {order.total_cost?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-blue-700 dark:text-blue-300">
                          Approved By:
                        </span>
                        <p className="font-medium text-green-500 capitalize">
                          {order.approved_by || "Management"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto">
                  {activeTab === "receive" ? (
                    <ReceiveForm
                      formData={formData}
                      setFormData={setFormData}
                      order={order}
                      isSubmitting={isSubmitting}
                      handleSubmit={handleSubmit}
                      onClose={onClose}
                    />
                  ) : (
                    <ReceiptHistory
                      receiptHistory={receiptHistory}
                      loading={loadingHistory}
                      materialUnit={order.master_materials?.unit}
                    />
                  )}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
};

// Receipt History Component
const ReceiptHistory = ({ receiptHistory, loading, materialUnit }) => {
  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Loading history...
        </p>
      </div>
    );
  }

  if (!receiptHistory || receiptHistory.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No receipt history found for this material.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Material Receipt History ({receiptHistory.length} records)
      </h3>
      <div className="space-y-3">
        {receiptHistory.map((receipt) => (
          <div
            key={receipt.id}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(receipt.received_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {receipt.batch_number}
                  </span>
                </div>
              </div>
              <span className="text-sm font-semibold text-green-600">
                {receipt.quantity} {materialUnit}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Unit Cost:{" "}
                </span>
                <span className="font-medium">
                  ETB {receipt.unit_cost?.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Location:{" "}
                </span>
                <span className="font-medium capitalize">
                  {receipt.location}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">
                  Received By:{" "}
                </span>
                <span className="font-medium capitalize">
                  {receipt.received_by}
                </span>
              </div>
            </div>

            {receipt.notes && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                {receipt.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Receive Form Component
const ReceiveForm = ({
  formData,
  setFormData,
  order,
  isSubmitting,
  handleSubmit,
  onClose,
}) => {
  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Location and Batch Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Storage Location *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              required
              value={formData.location || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              placeholder="e.g., Warehouse A, Shelf B2"
              className="w-full capitalize pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Batch Number *
          </label>
          <div className="relative">
            <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              required
              value={formData.batch_number || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  batch_number: e.target.value,
                }))
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Actual Received Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Actual Received Quantity *
          </label>
          <div className="relative">
            <ClipboardList className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.received_quantity || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  received_quantity: e.target.value,
                }))
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Ordered: {order.quantity} {order.master_materials?.unit}
          </p>
        </div>

        {/* Dates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Received Date *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              required
              value={formData.received_date || new Date()}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  received_date: e.target.value,
                }))
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Expiry Date (Optional)
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="date"
              value={formData.expiry_date || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  expiry_date: e.target.value,
                }))
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Costs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Actual Unit Cost (ETB) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.unit_cost || 0}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  unit_cost: e.target.value,
                }))
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Original: ETB {order.unit_cost?.toLocaleString()}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Total Value (ETB)
          </label>
          <input
            type="number"
            readOnly
            value={formData.total_value || 0}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-semibold"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Calculated: Received Qty × Unit Cost
          </p>
        </div>

        {/* Received By */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Received By *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              required
              value={formData.received_by || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  received_by: e.target.value,
                }))
              }
              placeholder="Enter your name"
              className="w-full capitalize pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                notes: e.target.value,
              }))
            }
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Any additional notes about this delivery..."
          />
        </div>
      </div>

      {/* Quality Check */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Quality Check
        </h4>
        <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-100">
          <p>✓ Verify material quantity matches order</p>
          <p>✓ Check material quality and specifications</p>
          <p>✓ Confirm no damages during transportation</p>
          <p>✓ Ensure proper storage conditions</p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClose}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Receive Order
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};

export default ReceiveOrderModal;
