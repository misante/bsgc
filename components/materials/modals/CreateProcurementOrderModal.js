// components/materials/modals/CreateProcurementOrderModal.js
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Calendar, User, DollarSign, FileText } from "lucide-react";
import { createPortal } from "react-dom";

const CreateProcurementOrderModal = ({
  isOpen,
  onClose,
  materialRequirements,
  suppliers,
  onCreateOrder,
}) => {
  // Initialize form data with proper default values
  const initialFormData = {
    material_name: "",
    material_requirement_id: "",
    master_material_id: "",
    supplier_id: "",
    suppliers: "",
    quantity: "",
    unit_cost: "",
    total_cost: "",
    expected_delivery: "",
    project_phase: "",
    notes: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setSelectedRequirement(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Calculate total cost
  useEffect(() => {
    const quantity = parseFloat(formData.quantity) || 0;
    const unitCost = parseFloat(formData.unit_cost) || 0;
    const totalCost = quantity * unitCost;

    setFormData((prev) => ({
      ...prev,
      total_cost: totalCost || 0,
    }));
  }, [formData.quantity, formData.unit_cost]);

  // When material requirement is selected, populate the form
  useEffect(() => {
    if (formData.material_requirement_id) {
      const requirement = materialRequirements.find(
        (req) => req.id === parseInt(formData.material_requirement_id)
      );
      if (requirement) {
        setSelectedRequirement(requirement);
        setFormData((prev) => ({
          ...prev,
          master_material_id: requirement.master_material_id || "",
          quantity: requirement.quantity || "",
          unit_cost: requirement.unit_cost || "",
          expected_delivery: requirement.required_date || "",
          project_phase: requirement.project_phase || "",
          material_name: requirement.material_name || formData.material_name,
          supplier: requirement.supplier || formData.supplier,
        }));
      }
    } else {
      setSelectedRequirement(null);
    }
  }, [formData.material_requirement_id, materialRequirements]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ensure all required fields have values
      const submitData = {
        ...formData,
        quantity: parseInt(formData.quantity) || 0,
        unit_cost: parseFloat(formData.unit_cost) || 0,
        total_cost: parseFloat(formData.total_cost) || 0,
      };

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
  console.log("suppliers", suppliers);
  return createPortal(
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
            {/* Material Requirement Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Material Requirement *
              </label>
              <select
                required
                value={formData.material_requirement_id || ""}
                onChange={(e) =>
                  handleInputChange("material_requirement_id", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a material requirement</option>
                {materialRequirements
                  .filter((req) => !req.procurement_order_id) // Only show requirements without existing orders
                  .map((requirement) => (
                    <option key={requirement.id} value={requirement.id}>
                      {requirement.master_materials?.name || "Unknown Material"}{" "}
                      - {requirement.project_id} - {requirement.project_phase}
                    </option>
                  ))}
              </select>
            </div>

            {/* Selected Requirement Details */}
            {selectedRequirement && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Selected Requirement Details
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">
                      Material:
                    </span>
                    <p className="font-medium">
                      {selectedRequirement.master_materials?.name || "Unknown"}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">
                      Project:
                    </span>
                    <p className="font-medium">
                      {selectedRequirement.project_id || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">
                      Phase:
                    </span>
                    <p className="font-medium">
                      {selectedRequirement.project_phase || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">
                      Required Date:
                    </span>
                    <p className="font-medium">
                      {selectedRequirement.required_date
                        ? new Date(
                            selectedRequirement.required_date
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
                onChange={(e) =>
                  handleInputChange("supplier_id", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a supplier</option>
                {suppliers
                  .filter((supplier) => supplier.is_active)
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
                {selectedRequirement && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Unit: {selectedRequirement.master_materials?.unit || "—"}
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
                  !formData.material_requirement_id ||
                  !formData.supplier_id ||
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
  );
};

export default CreateProcurementOrderModal;
