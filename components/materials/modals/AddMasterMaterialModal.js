import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import {
  Package,
  X,
  DollarSign,
  AlertTriangle,
  Truck,
  Box,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";

const MATERIAL_CATEGORIES = [
  "Construction Materials",
  "Structural Steel",
  "Aggregates",
  "Wood & Timber",
  "Plumbing",
  "Electrical",
  "Finishing",
  "Hardware",
  "Tools & Equipment",
  "Safety Equipment",
  "Other",
];

const UNITS = [
  "kg",
  "g",
  "lb",
  "pieces",
  "units",
  "m",
  "cm",
  "mm",
  "m²",
  "ft²",
  "m³",
  "ft³",
  "L",
  "mL",
  "gal",
  "boxes",
  "rolls",
  "bundles",
  "pallets",
];

const INITIAL_FORM = {
  name: "",
  category: "",
  unit: "",
  description: "",
  current_stock: 0,
  min_stock_level: 0,
  supplier: "",
  unit_cost: 0,
};

const AddMasterMaterialModal = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
      setForm(INITIAL_FORM);
    } catch (error) {
      console.error("Error saving material:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(INITIAL_FORM);
    onClose();
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);
  if (!isOpen) return null;

  const fetchSuppliers = async () => {
    const resp = await fetch("/api/suppliers");
    if (!resp.ok) {
      throw new Error();
    }
    const fetchedSuppliers = await resp.json();
    setSuppliers(fetchedSuppliers.suppliers);
  };
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6" />
            Add New Master Material
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Material Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Material Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Portland Cement, Reinforcement Steel Bars"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Category</option>
                {MATERIAL_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unit *
              </label>
              <select
                required
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Unit</option>
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Unit Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unit Cost (ETB) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.unit_cost}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      unit_cost: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Minimum Stock Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Stock Level
              </label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.min_stock_level}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      min_stock_level: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Supplier */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supplier
              </label>
              <select
                required
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="w-full capitalize px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((supplier) => (
                  <option
                    key={supplier.id}
                    value={supplier.name}
                    className="capitalize"
                  >
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stock Status */}
          {/* {((form.current_stock || 0) > 0 ||
            (form.min_stock_level || 0) > 0) && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Box className="w-4 h-4" />
                Stock Status
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Current Stock:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {form.current_stock || 0} {form.unit || ""}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Minimum Level:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {form.min_stock_level || 0} {form.unit || ""}
                  </p>
                </div>
              </div>
              {(form.current_stock || 0) < (form.min_stock_level || 0) && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Low Stock Alert</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Current stock is below minimum required level. Consider
                    reordering.
                  </p>
                </div>
              )}
            </div>
          )} */}

          <div className="flex justify-end gap-3 mt-6">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!form.name || !form.category || !form.unit || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? "Adding..." : "Add Material"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>,
    document.body
  );
};

export default AddMasterMaterialModal;
