"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaTrash, FaPlus, FaCalendar } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createPortal } from "react-dom";

export default function IndirectCostPlanningPage() {
  const [requirements, setRequirements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [indirectCosts, setIndirectCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReq, setEditingReq] = useState(null);
  const [formData, setFormData] = useState({
    project_id: "",
    indirect_cost_id: "",
    planned_quantity: "",
    remarks: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, projectsRes, costsRes] = await Promise.all([
        fetch("/api/indirect-costs/requirements"),
        fetch("/api/projects"),
        fetch("/api/indirect-costs/master"),
      ]);

      const [reqData, projectsData, costsData] = await Promise.all([
        reqRes.json(),
        projectsRes.json(),
        costsRes.json(),
      ]);

      if (reqData.data) setRequirements(reqData.data);
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
      const url = "/api/indirect-costs/requirements";
      const method = editingReq ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          planned_quantity: parseFloat(formData.planned_quantity),
          ...(editingReq && { id: editingReq.id }),
        }),
      });

      const result = await res.json();
      if (result.data) {
        setShowModal(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error("Error saving requirement:", error);
    }
  };

  const handleEdit = (req) => {
    setEditingReq(req);
    setFormData({
      project_id: req.project_id,
      indirect_cost_id: req.indirect_cost_id,
      planned_quantity: req.planned_quantity,
      remarks: req.remarks,
    });
    setShowModal(true);
  };

  const handleDelete = async (req) => {
    if (!confirm("Are you sure you want to delete this requirement?")) return;

    try {
      const res = await fetch("/api/indirect-costs/requirements", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: req.id,
          project_id: req.project_id,
          indirect_cost_id: req.indirect_cost_id,
          planned_quantity: req.planned_quantity,
        }),
      });
      const result = await res.json();
      if (result.message) {
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting requirement:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: "",
      indirect_cost_id: "",
      planned_quantity: "",
      remarks: "",
    });
    setEditingReq(null);
  };

  const getPlannedCost = (req) => {
    return (
      (req.master_indirect_costs?.rate_per_unit || 0) *
      (req.planned_quantity || 0)
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Indirect Cost Planning
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Plan indirect cost requirements for projects
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Add Requirement
          </button>
        </div>

        {/* Requirements Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading requirements...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-600">
                    <th className="text-left p-4">Project</th>
                    <th className="text-left p-4">Cost Type</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-right p-4">Planned Quantity</th>
                    <th className="text-right p-4">Planned Cost</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="p-4">{req.projects?.name || "N/A"}</td>
                      <td className="p-4">
                        <div className="font-medium">
                          {req.master_indirect_costs?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {req.master_indirect_costs?.unit}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {req.master_indirect_costs?.category}
                        </span>
                      </td>
                      <td className="p-4 text-right">{req.planned_quantity}</td>
                      <td className="p-4 text-right font-semibold">
                        ${getPlannedCost(req).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(req)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(req)}
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
        {showModal &&
          createPortal(
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-xl font-bold mb-4 dark:text-white">
                  {editingReq
                    ? "Edit Requirement"
                    : "Add Indirect Cost Requirement"}
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
                          setFormData({
                            ...formData,
                            project_id: e.target.value,
                          })
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
                        Planned Quantity
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.planned_quantity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            planned_quantity: e.target.value,
                          })
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
                      {editingReq ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>,
            document.body
          )}
      </div>
    </DashboardLayout>
  );
}
