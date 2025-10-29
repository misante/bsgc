"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaTrash, FaPlus, FaUsers } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createPortal } from "react-dom";

export default function MasterManpowerPage() {
  const [manpower, setManpower] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingManpower, setEditingManpower] = useState(null);
  const [formData, setFormData] = useState({
    role: "",
    rate_per_hour: "",
  });

  useEffect(() => {
    fetchManpower();
  }, []);

  const fetchManpower = async () => {
    try {
      const res = await fetch("/api/master/manpower");
      const result = await res.json();
      if (result.success) {
        setManpower(result.data);
      }
    } catch (error) {
      console.error("Error fetching manpower:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "/api/master/manpower";
      const method = editingManpower ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rate_per_hour: parseFloat(formData.rate_per_hour),
        }),
      });

      const result = await res.json();
      if (result.success) {
        setShowModal(false);
        resetForm();
        fetchManpower();
      }
    } catch (error) {
      console.error("Error saving manpower:", error);
    }
  };

  const resetForm = () => {
    setFormData({ role: "", rate_per_hour: "" });
    setEditingManpower(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Master Manpower
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage manpower roles and rates
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Add Role
          </button>
        </div>

        {/* Manpower Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading manpower...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-600 dark:bg-gray-700">
                    <th className="text-left py-2 px-4">Role</th>
                    <th className="text-right py-2 px-4">Rate/Hour</th>
                    <th className="text-right py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manpower.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      <td className="py-2 px-4 capitalize">{item.role}</td>
                      <td className="py-2 px-4 text-right">
                        ${item.rate_per_hour}
                      </td>
                      <td className="py-2 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingManpower(item);
                              setFormData({
                                role: item.role,
                                rate_per_hour: item.rate_per_hour,
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
                                  "Are you sure you want to delete this role?"
                                )
                              )
                                return;
                              try {
                                const res = await fetch(
                                  `/api/master/manpower?id=${item.id}`,
                                  {
                                    method: "DELETE",
                                  }
                                );
                                const result = await res.json();
                                if (result.success) {
                                  fetchManpower();
                                }
                              } catch (error) {
                                console.error(
                                  "Error deleting manpower:",
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
        {showModal &&
          createPortal(
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
              >
                <h2 className="text-xl font-bold mb-4 dark:text-white">
                  {editingManpower ? "Edit Role" : "Add New Role"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full capitalize p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Rate per Hour ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.rate_per_hour}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rate_per_hour: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 dark:hover:text-black dark:border-white py-2 border rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {editingManpower ? "Update" : "Create"}
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
