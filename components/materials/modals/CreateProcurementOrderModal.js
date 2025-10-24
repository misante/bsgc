// components/materials/modals/CreateProcurementOrderModal.js
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Calendar, User, DollarSign, FileText } from "lucide-react";
import { createPortal } from "react-dom";

const CreateProcurementOrderModal = ({
  isOpen,
  onClose,
  suppliers,
  materialRequirement, // Single material requirement from selection
  onCreateOrder,
}) => {
  // Initialize form data with proper default values
  const initialFormData = {
    requirement_id: "",
    material_id: "",
    material_name: "",
    supplier_id: "",
    supplier_name: "",
    quantity: 0,
    unit_cost: 0,
    total_cost: 0,
    expected_delivery: "",
    project_phase: "",
    notes: "",
    priority: "medium",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  // Auto-populate when materialRequirement changes
  useEffect(() => {
    if (materialRequirement) {
      console.log(
        "Populating form with material requirement:",
        materialRequirement
      );
      setFormData({
        requirement_id: materialRequirement.id,
        material_id: materialRequirement.master_material_id,
        material_name:
          materialRequirement.material_name ||
          materialRequirement.master_materials?.name,
        quantity: materialRequirement.quantity || 0,
        unit_cost: materialRequirement.unit_cost || 0,
        total_cost: materialRequirement.total_cost || 0,
        expected_delivery: materialRequirement.required_date || "",
        project_phase: materialRequirement.project_phase || "",
        supplier_id: "",
        supplier_name: "",
        notes: "",
        priority: "medium",
      });
    } else {
      setFormData(initialFormData);
    }
  }, [materialRequirement]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && !materialRequirement) {
      setFormData(initialFormData);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Calculate total cost when quantity or unit cost changes
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitCost = parseFloat(formData.unit_cost) || 0;
    const totalCost = quantity * unitCost;

    setFormData((prev) => ({
      ...prev,
      total_cost: totalCost,
    }));
  }, [formData.quantity, formData.unit_cost]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle supplier selection
  const handleSupplierChange = (supplierId) => {
    const selectedSupplier = suppliers.find(
      (s) => s.id === parseInt(supplierId)
    );
    setFormData((prev) => ({
      ...prev,
      supplier_id: supplierId,
      supplier_name: selectedSupplier ? selectedSupplier.name : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const submitData = {
        requirement_id: formData.requirement_id,
        material_id: formData.material_id,
        material_name: formData.material_name,
        supplier_id: formData.supplier_id,
        supplier_name: formData.supplier_name,
        quantity: parseFloat(formData.quantity) || 0,
        unit_cost: parseFloat(formData.unit_cost) || 0,
        total_cost: parseFloat(formData.total_cost) || 0,
        expected_delivery: formData.expected_delivery,
        project_phase: formData.project_phase,
        notes: formData.notes,
        priority: formData.priority,
      };

      console.log("Submitting procurement order:", submitData);
      const success = await onCreateOrder(submitData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error("Error creating procurement order:", error);
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Create Procurement Order
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Material Information Display */}
              {materialRequirement && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Selected Material Requirement
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 dark:text-blue-300 block text-xs font-medium">
                        Material:
                      </span>
                      <p className="font-medium capitalize">
                        {materialRequirement.master_materials?.name ||
                          materialRequirement.material_name ||
                          "Unknown"}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300 block text-xs font-medium">
                        Project:
                      </span>
                      <p className="font-medium">
                        {materialRequirement.project_id || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300 block text-xs font-medium">
                        Phase:
                      </span>
                      <p className="font-medium capitalize">
                        {materialRequirement.project_phase || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300 block text-xs font-medium">
                        Required Date:
                      </span>
                      <p className="font-medium">
                        {materialRequirement.required_date
                          ? new Date(
                              materialRequirement.required_date
                            ).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Supplier Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Supplier *
                </label>
                <select
                  required
                  value={formData.supplier_id || ""}
                  onChange={(e) => handleSupplierChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a supplier</option>
                  {suppliers
                    ?.filter((supplier) => supplier.is_active)
                    .map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name} - {supplier.contact_person} (
                        {supplier.email})
                      </option>
                    ))}
                </select>
              </div>

              {/* Quantity and Costs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.quantity || ""}
                    onChange={(e) =>
                      handleInputChange("quantity", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {materialRequirement?.master_materials?.unit && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Unit: {materialRequirement.master_materials.unit}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit Cost (ETB) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.unit_cost || ""}
                    onChange={(e) =>
                      handleInputChange("unit_cost", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total Cost (ETB)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={formData.total_cost || 0}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              {/* Expected Delivery */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Delivery Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.expected_delivery || ""}
                  onChange={(e) =>
                    handleInputChange("expected_delivery", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Project Phase */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Phase
                </label>
                <input
                  type="text"
                  value={formData.project_phase || ""}
                  onChange={(e) =>
                    handleInputChange("project_phase", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white capitalize"
                  placeholder="Enter project phase"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority || "medium"}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Any additional notes or specifications..."
                />
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
                  disabled={
                    !formData.supplier_id ||
                    !formData.quantity ||
                    !formData.unit_cost ||
                    !formData.expected_delivery ||
                    isSubmitting
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
                      <FileText className="w-4 h-4" />
                      Create Order
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>,
      document.body
    )
  );
};

export default CreateProcurementOrderModal;
