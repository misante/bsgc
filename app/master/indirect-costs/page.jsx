"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaTrash, FaPlus, FaDollarSign } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function MasterIndirectCostsPage() {
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCost, setEditingCost] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    rate_per_unit: "",
    category: "",
    description: "",
  });

  const categories = [
    "Subcontractor",
    "Site Preparation",
    "Administrative",
    "Permits & Legal",
    "Financial",
    "Logistics",
    "Maintenance",
    "Safety",
    "Temporary Works",
    "Quality Control",
    "Professional Services",
    "Head Office",
    "Cleanup",
    "Contingency",
    "Environmental",
  ];

  const units = [
    "lump sum",
    "month",
    "hour",
    "day",
    "trip",
    "session",
    "test",
    "unit",
    "percentage",
  ];

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    try {
      const res = await fetch("/api/indirect-costs/master");
      const result = await res.json();
      if (result.data) {
        setCosts(result.data);
      }
    } catch (error) {
      console.error("Error fetching indirect costs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "/api/indirect-costs/master";
      const method = editingCost ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rate_per_unit: parseFloat(formData.rate_per_unit),
          ...(editingCost && { id: editingCost.id }),
        }),
      });

      const result = await res.json();
      if (result.data) {
        setShowModal(false);
        resetForm();
        fetchCosts();
      }
    } catch (error) {
      console.error("Error saving indirect cost:", error);
    }
  };

  const handleEdit = (cost) => {
    setEditingCost(cost);
    setFormData({
      name: cost.name,
      unit: cost.unit,
      rate_per_unit: cost.rate_per_unit,
      category: cost.category,
      description: cost.description,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this indirect cost?")) return;

    try {
      const res = await fetch("/api/indirect-costs/master", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (result.message) {
        fetchCosts();
      }
    } catch (error) {
      console.error("Error deleting indirect cost:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      unit: "",
      rate_per_unit: "",
      category: "",
      description: "",
    });
    setEditingCost(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Master Indirect Costs
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage indirect cost types and rates
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Add Indirect Cost
          </button>
        </div>

        {/* Costs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading indirect costs...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-600">
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Unit</th>
                    <th className="text-right p-4">Rate/Unit</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((cost) => (
                    <tr
                      key={cost.id}
                      className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{cost.name}</div>
                          {cost.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {cost.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
                          {cost.category}
                        </span>
                      </td>
                      <td className="p-4">{cost.unit}</td>
                      <td className="p-4 text-right">${cost.rate_per_unit}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(cost)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(cost.id)}
                            className="text-red-600 hover:text-red-800 p-2"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold mb-4">
                {editingCost ? "Edit Indirect Cost" : "Add New Indirect Cost"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Unit
                    </label>
                    <select
                      required
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">Select Unit</option>
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rate per Unit ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.rate_per_unit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rate_per_unit: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingCost ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
