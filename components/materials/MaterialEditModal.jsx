"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

export default function MaterialEditModal({
  isOpen,
  onClose,
  material,
  onSave,
}) {
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "",
    type: "",
    quantity: "",
    unit: "",
    supplier: "",
    cost_per_unit: "",
    min_stock_level: "",
    location: "",
    status: "In Stock",
  });
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (material) {
      setForm({
        name: material.name || "",
        category: material.category || "",
        type: material.type || "",
        quantity: material.quantity ?? "",
        unit: material.unit || "",
        supplier: material.supplier || "",
        cost_per_unit: material.cost_per_unit ?? "",
        min_stock_level: material.min_stock_level ?? "",
        location: material.location || "",
        status: material.status || "In Stock",
      });
    }
  }, [material]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!material) return;
    // prepare payload (cast numeric fields)
    const payload = {
      ...form,
      quantity: Number(form.quantity) || 0,
      cost_per_unit: form.cost_per_unit ? Number(form.cost_per_unit) : null,
      min_stock_level: form.min_stock_level
        ? Number(form.min_stock_level)
        : null,
    };
    await onSave(material.id, payload);
  };

  return (
    <>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
              >
                <motion.form
                  onSubmit={submit}
                  onClick={(e) => e.stopPropagation()}
                  initial={{ scale: 0.95, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.95, y: 20, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-2xl p-6 mx-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Edit Material
                    </h3>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Name"
                      className="w-full dark:text-gray-900 capitalize px-3 py-2 border rounded-lg text-sm"
                    />
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 dark:text-gray-900 border rounded-lg text-sm"
                    >
                      <option value="">Select category</option>
                      <option>Local Materials</option>
                      <option>Industrial Materials</option>
                      <option>Structural Materials</option>
                      <option>Finishing Materials</option>
                      <option>Utilities</option>
                    </select>
                    <input
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      placeholder="Type"
                      className="w-full dark:text-gray-900 capitalize px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      name="unit"
                      value={form.unit}
                      onChange={handleChange}
                      placeholder="Unit (e.g. kg, bags)"
                      className="w-full dark:text-gray-900 px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      name="quantity"
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="Quantity"
                      className="w-full dark:text-gray-900 px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      name="min_stock_level"
                      value={form.min_stock_level}
                      onChange={handleChange}
                      placeholder="Min stock level"
                      className="w-full dark:text-gray-900 px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      name="supplier"
                      value={form.supplier}
                      onChange={handleChange}
                      placeholder="Supplier"
                      className="w-full dark:text-gray-900 capitalize px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Location"
                      className="w-full dark:text-gray-900 capitalize px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      name="cost_per_unit"
                      value={form.cost_per_unit}
                      onChange={handleChange}
                      placeholder="Cost per unit"
                      className="w-full dark:text-gray-900 px-3 py-2 border rounded-lg text-sm"
                    />
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full dark:text-gray-900 px-3 py-2 border rounded-lg text-sm"
                    >
                      <option>In Stock</option>
                      <option>Low Stock</option>
                      <option>Out of Stock</option>
                      <option>On Order</option>
                    </select>
                  </div>

                  <div className="mt-6  flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-md border text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm"
                    >
                      Save
                    </button>
                  </div>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
