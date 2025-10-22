// components/materials/modals/CreateMaterialRequestModal.js
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, User, FileText, Search } from "lucide-react";
import { createPortal } from "react-dom";
import { useUser } from "@/contexts/UserContext";
import toast from "react-hot-toast";

const CreateMaterialRequestModal = ({
  isOpen,
  onClose,
  masterMaterials,
  materialStock,
  onRequestCreated,
  currentUser,
}) => {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    material_id: "",
    requested_quantity: "",
    project_phase: "",
    requested_by: "",
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
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        material_id: "",
        requested_quantity: "",
        project_phase: "",
        requested_by: "",
        request_reason: "",
      });
      setAvailableStock(0);
      setSearchTerm("");
      setShowDropdown(false);
    }
  }, [isOpen]);

  // Debug log to see what data we have
  console.log("🔍 Modal Data:", {
    masterMaterials: masterMaterials?.length,
    materialStock: materialStock?.length,
    masterNames: masterMaterials?.map((m) => m.name),
    stockIds: materialStock?.map((s) => s.master_material_id),
  });

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

  console.log("🔄 Combined materials:", materialsWithStock);

  // Filter materials based on search term
  const filteredMaterials = (materialsWithStock || []).filter((material) =>
    material?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMaterialSelect = (material) => {
    setFormData((prev) => ({
      ...prev,
      material_id: material.id, // Use master material ID
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
    if (
      !formData.material_id ||
      !formData.requested_quantity
      // !formData.requested_by
    ) {
      toast("Please fill in all required fields", { duration: 4000 });
      return;
    }

    if (parseFloat(formData.requested_quantity) > availableStock) {
      toast(
        `Requested quantity exceeds available stock. Available: ${availableStock}`,
        { duration: 4000 }
      );
      return;
    }

    if (parseFloat(formData.requested_quantity) <= 0) {
      toast("Requested quantity must be greater than 0", { duration: 4000 });
      return;
    }

    setIsSubmitting(true);
    const requestData = { ...formData, requested_by: currentUser.first_name };
    try {
      const response = await fetch("/api/materials/material-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        onRequestCreated();
        onClose();
      } else {
        alert(`Failed to create request: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating material request:", error);
      alert("Failed to create material request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

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
                  New Material Request
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
                                  <div className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                                    {material.category}
                                    {material.location &&
                                      ` • ${material.location}`}
                                  </div>
                                </div>
                                <div className="text-right ml-2">
                                  <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    ETB{" "}
                                    {material.average_unit_cost?.toFixed(2) ||
                                      "0.00"}
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
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              material_id: "",
                            }));
                            setSearchTerm("");
                            setAvailableStock(0);
                          }}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
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
                {/* Requested By */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requested By *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={formData.requested_by}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          requested_by: e.target.value,
                        }))
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white capitalize"
                      placeholder="Your name"
                    />
                  </div>
                </div> */}

                {/* Project Phase */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Phase
                  </label>
                  <input
                    type="text"
                    value={formData.project_phase}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        project_phase: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Foundation, Structure, Finishing"
                  />
                </div> */}

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
                      // !formData.requested_by
                    }
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4" />
                        Create Request
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

export default CreateMaterialRequestModal;
