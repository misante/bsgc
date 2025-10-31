"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaTrash, FaPlus, FaCalendarAlt } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function IndirectCostUsagePage() {
  const [usage, setUsage] = useState([]);
  const [projects, setProjects] = useState([]);
  const [indirectCosts, setIndirectCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUsage, setEditingUsage] = useState(null);
  const [formData, setFormData] = useState({
    project_id: "",
    indirect_cost_id: "",
    quantity_used: "",
    usage_date: new Date().toISOString().split("T")[0],
    remarks: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usageRes, projectsRes, costsRes] = await Promise.all([
        fetch("/api/indirect-costs/usage"),
        fetch("/api/projects"),
        fetch("/api/indirect-costs/master"),
      ]);

      const [usageData, projectsData, costsData] = await Promise.all([
        usageRes.json(),
        projectsRes.json(),
        costsRes.json(),
      ]);

      if (usageData.data) setUsage(usageData.data);
      if (projectsData.data) setProjects(projectsData.data);
      if (costsData.data) setIndirectCosts(costsData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "/api/indirect-costs/usage";
      const method = editingUsage ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity_used: parseFloat(formData.quantity_used),
          ...(editingUsage && { id: editingUsage.id }),
        }),
      });

      const result = await res.json();
      if (result.data) {
        setShowModal(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error("Error saving usage:", error);
    }
  };

  const handleEdit = (usageItem) => {
    setEditingUsage(usageItem);
    setFormData({
      project_id: usageItem.project_id,
      indirect_cost_id: usageItem.indirect_cost_id,
      quantity_used: usageItem.quantity_used,
      usage_date: usageItem.usage_date,
      remarks: usageItem.remarks,
    });
    setShowModal(true);
  };

  const handleDelete = async (usageItem) => {
    if (!confirm("Are you sure you want to delete this usage record?")) return;

    try {
      const res = await fetch("/api/indirect-costs/usage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: usageItem.id,
          project_id: usageItem.project_id,
          indirect_cost_id: usageItem.indirect_cost_id,
          quantity_used: usageItem.quantity_used,
        }),
      });
      const result = await res.json();
      if (result.message) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting usage:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: "",
      indirect_cost_id: "",
      quantity_used: "",
      usage_date: new Date().toISOString().split("T")[0],
      remarks: "",
    });
    setEditingUsage(null);
  };

  const getActualCost = (usageItem) => {
    return (
      (usageItem.master_indirect_costs?.rate_per_unit || 0) *
      (usageItem.quantity_used || 0)
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Daily Indirect Cost Usage
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Record daily indirect cost usage for projects
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Add Usage
          </button>
        </div>

        {/* Usage Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading usage records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-600">
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Project</th>
                    <th className="text-left p-4">Cost Type</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-right p-4">Quantity Used</th>
                    <th className="text-right p-4">Actual Cost</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.map((usageItem) => (
                    <tr
                      key={usageItem.id}
                      className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          {new Date(usageItem.usage_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        {usageItem.projects?.name || "N/A"}
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          {usageItem.master_indirect_costs?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {usageItem.master_indirect_costs?.unit}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {usageItem.master_indirect_costs?.category}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {usageItem.quantity_used}
                      </td>
                      <td className="p-4 text-right font-semibold">
                        ${getActualCost(usageItem).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(usageItem)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(usageItem)}
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
                {editingUsage ? "Edit Usage Record" : "Add Indirect Cost Usage"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Project
                    </label>
                    <select
                      required
                      value={formData.project_id}
                      onChange={(e) =>
                        setFormData({ ...formData, project_id: e.target.value })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">Select Project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Indirect Cost Type
                    </label>
                    <select
                      required
                      value={formData.indirect_cost_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          indirect_cost_id: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">Select Cost Type</option>
                      {indirectCosts.map((cost) => (
                        <option key={cost.id} value={cost.id}>
                          {cost.name} - ${cost.rate_per_unit}/{cost.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Quantity Used
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.quantity_used}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity_used: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Usage Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.usage_date}
                      onChange={(e) =>
                        setFormData({ ...formData, usage_date: e.target.value })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Remarks
                    </label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) =>
                        setFormData({ ...formData, remarks: e.target.value })
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
                    {editingUsage ? "Update" : "Create"}
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
