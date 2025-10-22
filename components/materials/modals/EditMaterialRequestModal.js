// components/materials/modals/EditMaterialRequestModal.js
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, FileText, Search } from "lucide-react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";

const EditMaterialRequestModal = ({
  isOpen,
  onClose,
  request,
  masterMaterials,
  materialStock,
  onRequestUpdated,
}) => {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    material_id: "",
    requested_quantity: "",
    request_reason: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableStock, setAvailableStock] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && request) {
      // Pre-fill form with request data
      setFormData({
        material_id: request.material_id,
        requested_quantity: request.requested_quantity,
        request_reason: request.request_reason || "",
      });

      // Set available stock for the selected material
      const selectedMaterial = masterMaterials?.find(
        (m) => m.id === request.material_id
      );
      if (selectedMaterial) {
        const stockInfo = materialStock?.find(
          (stock) => stock.master_material_id === selectedMaterial.id
        );
        setAvailableStock(stockInfo?.total_quantity || 0);
        setSearchTerm(selectedMaterial.name || "");
      }
    }
  }, [isOpen, request, masterMaterials, materialStock]);

  // Combine master materials with stock data
  const materialsWithStock = masterMaterials?.map((masterMaterial) => {
    const stockInfo = materialStock?.find(
      (stock) => stock.master_material_id === masterMaterial.id
    );

    return {
      ...masterMaterial,
      total_quantity: stockInfo?.total_quantity || 0,
      available_stock: stockInfo?.total_quantity || 0,
      location: stockInfo?.location,
      average_unit_cost:
        stockInfo?.average_unit_cost || masterMaterial.unit_cost,
    };
  });

  // Filter materials based on search term
  const filteredMaterials = (materialsWithStock || []).filter((material) =>
    material?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMaterialSelect = (material) => {
    setFormData((prev) => ({
      ...prev,
      material_id: material.id,
    }));
    setAvailableStock(material.available_stock || 0);
    setSearchTerm(material.name || "");
    setShowDropdown(false);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setShowDropdown(true);
    if (!value) {
      setFormData((prev) => ({ ...prev, material_id: "" }));
      setAvailableStock(0);
    }
  };

  const getSelectedMaterialName = () => {
    if (!formData.material_id) return "";
    const selected = materialsWithStock?.find(
      (m) => m.id === formData.material_id
    );
    return selected?.name || "";
  };

  const getSelectedMaterialUnit = () => {
    if (!formData.material_id) return "";
    const selected = materialsWithStock?.find(
      (m) => m.id === formData.material_id
    );
    return selected?.unit || "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.material_id || !formData.requested_quantity) {
      toast.error("Please fill in all required fields", { duration: 4000 });
      return;
    }

    if (parseFloat(formData.requested_quantity) > availableStock) {
      toast.error(
        `Requested quantity exceeds available stock. Available: ${availableStock}`,
        { duration: 4000 }
      );
      return;
    }

    if (parseFloat(formData.requested_quantity) <= 0) {
      toast.error("Requested quantity must be greater than 0", {
        duration: 4000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/materials/material-requests/${request.id}/edit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );
      const result = await response.json();

      if (result.success) {
        toast.success("Request updated successfully");
        onRequestUpdated();
      } else {
        toast.error(`Failed to update request: ${result.error}`);
      }
    } catch (error) {
      console.error("Error updating material request:", error);
      toast.error("Failed to update material request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fixed Header */}
            <div className="flex-shrink-0">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  Edit Material Request
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Material Search and Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Material *
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => setShowDropdown(true)}
                      placeholder="Search materials..."
                      className="w-full capitalize pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />

                    {/* Material Dropdown */}
                    <AnimatePresence>
                      {showDropdown && filteredMaterials.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                        >
                          {filteredMaterials.map((material) => (
                            <button
                              key={material.id}
                              type="button"
                              onClick={() => handleMaterialSelect(material)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white capitalize">
                                    {material.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Available: {material.available_stock}{" "}
                                    {material.unit}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Selected Material Info */}
                  {formData.material_id && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-blue-900 dark:text-blue-100 capitalize">
                            {getSelectedMaterialName()}
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300">
                            Available: {availableStock}{" "}
                            {getSelectedMaterialUnit()}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Requested Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requested Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.requested_quantity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        requested_quantity: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter quantity"
                  />
                  {formData.material_id && availableStock > 0 && (
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span>Available: {availableStock}</span>
                      {formData.requested_quantity && (
                        <span
                          className={
                            parseFloat(formData.requested_quantity) >
                            availableStock
                              ? "text-red-600 font-semibold"
                              : "text-green-600 font-semibold"
                          }
                        >
                          Remaining:{" "}
                          {(
                            availableStock -
                            parseFloat(formData.requested_quantity || 0)
                          ).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Request
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <textarea
                      value={formData.request_reason}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          request_reason: e.target.value,
                        }))
                      }
                      rows="3"
                      className="w-full capitalize pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Explain why you need these materials..."
                    />
                  </div>
                </div>

                {/* Current Status */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Current Status:</strong>{" "}
                    <span className="capitalize text-blue-600 dark:text-blue-400">
                      {request.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    You can only edit pending requests
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                    disabled={
                      isSubmitting ||
                      !formData.material_id ||
                      !formData.requested_quantity
                    }
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        Update Request
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
    )
  );
};

export default EditMaterialRequestModal;
