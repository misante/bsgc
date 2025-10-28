"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaTrash, FaPlus, FaCalendar } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function EquipmentPlanningPage() {
  const [requirements, setRequirements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReq, setEditingReq] = useState(null);
  const [formData, setFormData] = useState({
    project_id: "",
    equipment_id: "",
    planned_hours: "",
    actual_hours: "",
    start_date: "",
    end_date: "",
    status: "planned",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reqRes, projectsRes, equipmentRes] = await Promise.all([
        fetch("/api/planning/equipment"),
        fetch("/api/projects"),
        fetch("/api/master/equipment"),
      ]);

      const [reqData, projectsData, equipmentData] = await Promise.all([
        reqRes.json(),
        projectsRes.json(),
        equipmentRes.json(),
      ]);
      console.log(
        "reqData:",
        reqData,
        "projectsData:",
        projectsData,
        "equipmentData:",
        equipmentData
      );
      if (reqData.success) setRequirements(reqData.data);
      if (projectsData) setProjects(projectsData);
      if (equipmentData.success) setEquipment(equipmentData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "/api/planning/equipment";
      const method = editingReq ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          planned_hours: parseInt(formData.planned_hours),
          actual_hours: parseInt(formData.actual_hours) || 0,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setShowModal(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error("Error saving requirement:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: "",
      equipment_id: "",
      planned_hours: "",
      actual_hours: "",
      start_date: "",
      end_date: "",
      status: "planned",
    });
    setEditingReq(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "planned":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Equipment Planning
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Plan and track equipment requirements
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
                    <th className="text-left p-4">Equipment</th>
                    <th className="text-right p-4">Planned Hours</th>
                    <th className="text-right p-4">Actual Hours</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requirements.map((req) => (
                    <tr
                      key={req.id}
                      className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="p-4 capitalize">{req.projects?.name}</td>
                      <td className="p-4 capitalize">
                        {req.master_equipment?.name}
                      </td>
                      <td className="p-4 text-right">{req.planned_hours}</td>
                      <td className="p-4 text-right">{req.actual_hours}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${getStatusColor(
                            req.status
                          )}`}
                        >
                          {req.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingReq(req);
                              setFormData({
                                project_id: req.project_id,
                                equipment_id: req.equipment_id,
                                planned_hours: req.planned_hours,
                                actual_hours: req.actual_hours,
                                start_date: req.start_date,
                                end_date: req.end_date,
                                status: req.status,
                              });
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-2"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={async () => {
                              if (
                                !confirm(
                                  "Are you sure you want to delete this requirement?"
                                )
                              )
                                return;
                              try {
                                const res = await fetch(
                                  `/api/planning/equipment?id=${req.id}`,
                                  {
                                    method: "DELETE",
                                  }
                                );
                                const result = await res.json();
                                if (result.success) {
                                  fetchData();
                                }
                              } catch (error) {
                                console.error(
                                  "Error deleting requirement:",
                                  error
                                );
                              }
                            }}
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
                {editingReq
                  ? "Edit Equipment Requirement"
                  : "Add Equipment Requirement"}
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
                      Equipment
                    </label>
                    <select
                      required
                      value={formData.equipment_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          equipment_id: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="">Select Equipment</option>
                      {equipment.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.name} - ${eq.rate_per_hour}/hr
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Planned Hours
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.planned_hours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          planned_hours: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Actual Hours
                    </label>
                    <input
                      type="number"
                      value={formData.actual_hours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          actual_hours: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
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
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
