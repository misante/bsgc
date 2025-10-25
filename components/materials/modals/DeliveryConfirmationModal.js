// components/materials/modals/DeliveryConfirmationModal.js
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  X,
  Package,
  User,
  Calendar,
  FileText,
  CheckCircle,
  Truck,
  Signature,
  Download,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";

const DeliveryConfirmationModal = ({
  isOpen,
  onClose,
  request,
  onConfirmDelivery,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signature, setSignature] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [availableStock, setAvailableStock] = useState(0);
  const [stockLoading, setStockLoading] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch current stock when modal opens
  useEffect(() => {
    if (isOpen && request?.material_id) {
      fetchCurrentStock();
    }
  }, [isOpen, request]);

  const fetchCurrentStock = async () => {
    if (!request?.material_id) return;

    setStockLoading(true);
    try {
      const response = await fetch(
        `/api/materials/inventory/material-stock?master_material_id=${request.material_id}`
      );
      const result = await response.json();
      console.log("result:", result);
      if (result.success && result.data && result.data.length > 0) {
        setAvailableStock(result.data[0].total_quantity || 0);
      } else {
        setAvailableStock(0); // No stock record found
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
      setAvailableStock(0);
    } finally {
      setStockLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#1f2937";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      setContext(ctx);

      // Clear canvas
      ctx.fillStyle = "#f9fafb";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [isOpen]);

  const startDrawing = (e) => {
    if (!context) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
    updateSignatureData();
  };

  const updateSignatureData = () => {
    if (canvasRef.current) {
      setSignature(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    if (context && canvasRef.current) {
      const canvas = canvasRef.current;
      context.fillStyle = "#f9fafb";
      context.fillRect(0, 0, canvas.width, canvas.height);
      setSignature("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signature) {
      alert("Please provide a signature to confirm delivery");
      return;
    }

    // Final stock check before submission
    if (parseFloat(request.requested_quantity) > parseFloat(availableStock)) {
      alert(
        `Cannot deliver: Requested quantity (${request.requested_quantity}) exceeds available stock (${availableStock})`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmDelivery(request.id, {
        signature,
        delivery_notes: deliveryNotes,
        delivered_at: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error("Error confirming delivery:", error);
      // Error message is handled in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  const isStockSufficient =
    parseFloat(request.requested_quantity) <= parseFloat(availableStock);

  return (
    mounted &&
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      isStockSufficient
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    <Truck
                      className={`w-6 h-6 ${
                        isStockSufficient
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Delivery Confirmation
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Request #{request.id} • {request.master_materials?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Request Details */}
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Material Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-300">
                            Material:
                          </span>
                          <span className="font-medium text-blue-900 dark:text-blue-100 capitalize">
                            {request.master_materials?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-300">
                            Quantity:
                          </span>
                          <span className="font-medium text-blue-900 dark:text-blue-100">
                            {request.requested_quantity}{" "}
                            {request.master_materials?.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-300">
                            Requested By:
                          </span>
                          <span className="font-medium text-blue-900 dark:text-blue-100 capitalize">
                            {request.requested_by}
                          </span>
                        </div>
                        {request.project_phase && (
                          <div className="flex justify-between">
                            <span className="text-blue-700 dark:text-blue-300">
                              Project Phase:
                            </span>
                            <span className="font-medium text-blue-900 dark:text-blue-100">
                              {request.project_phase}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Approval Details */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Approval Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700 dark:text-green-300">
                            Approved By:
                          </span>
                          <span className="font-medium text-green-900 dark:text-green-100 capitalize">
                            {request.approved_by}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700 dark:text-green-300">
                            Approved Date:
                          </span>
                          <span className="font-medium text-green-900 dark:text-green-100">
                            {new Date(request.approved_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Availability Check */}
                    <div
                      className={`rounded-lg p-4 border ${
                        isStockSufficient
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      }`}
                    >
                      <h4
                        className="font-semibold mb-3 flex items-center gap-2"
                        style={{
                          color: isStockSufficient ? "#065f46" : "#991b1b",
                          dark: {
                            color: isStockSufficient ? "#a7f3d0" : "#fecaca",
                          },
                        }}
                      >
                        {isStockSufficient ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                        Stock Availability
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span
                            style={{
                              color: isStockSufficient ? "#065f46" : "#991b1b",
                            }}
                          >
                            Available Stock:
                          </span>
                          <span className="font-medium">
                            {stockLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              `${availableStock} ${request.master_materials?.unit}`
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            style={{
                              color: isStockSufficient ? "#065f46" : "#991b1b",
                            }}
                          >
                            Requested Quantity:
                          </span>
                          <span className="font-medium">
                            {request.requested_quantity}{" "}
                            {request.master_materials?.unit}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span
                            style={{
                              color: isStockSufficient ? "#065f46" : "#991b1b",
                            }}
                          >
                            Status:
                          </span>
                          <span
                            style={{
                              color: isStockSufficient ? "#065f46" : "#991b1b",
                            }}
                          >
                            {isStockSufficient
                              ? "Stock Available"
                              : "Insufficient Stock"}
                          </span>
                        </div>
                        {!isStockSufficient && !stockLoading && (
                          <p className="text-xs mt-2 text-red-600 dark:text-red-400">
                            ⚠️ Cannot deliver - Requested quantity exceeds
                            available stock
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Delivery Notes (Optional)
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                        <textarea
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          rows="3"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Any notes about the delivery condition, packaging, etc."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Signature className="w-4 h-4" />
                          Recipient Signature
                        </h4>
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Clear
                        </button>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-2">
                        <canvas
                          ref={canvasRef}
                          width={400}
                          height={200}
                          className="w-full h-48 bg-white dark:bg-gray-500 rounded border border-gray-300 dark:border-gray-400 cursor-crosshair touch-none"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            startDrawing(e.touches[0]);
                          }}
                          onTouchMove={(e) => {
                            e.preventDefault();
                            draw(e.touches[0]);
                          }}
                          onTouchEnd={stopDrawing}
                        />
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                        Sign above to confirm receipt of materials
                      </p>
                    </div>

                    {/* Signature Preview */}
                    {signature && (
                      <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                          Signature Preview
                        </h5>
                        <div className="bg-white dark:bg-gray-600 rounded border border-gray-300 dark:border-gray-500 p-2">
                          <img
                            src={signature}
                            alt="Signature preview"
                            className="w-full h-20 object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {/* Terms and Conditions */}
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                      <h5 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Terms & Conditions
                      </h5>
                      <ul className="text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                        <li>
                          ✓ I confirm that I have received the materials in good
                          condition
                        </li>
                        <li>
                          ✓ The quantity and quality match the requested
                          specifications
                        </li>
                        <li>
                          ✓ I understand this signature serves as official
                          confirmation
                        </li>
                        <li>
                          ✓ Any discrepancies must be reported within 24 hours
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString()} • Delivery Confirmation
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting || !signature
                      // !isStockSufficient ||
                      // stockLoading
                    }
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Confirming...
                      </>
                    ) : !isStockSufficient ? (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        Insufficient Stock
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Confirm Delivery
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
    )
  );
};

export default DeliveryConfirmationModal;
