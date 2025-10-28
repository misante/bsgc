"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEdit, FaTrash, FaPlus, FaTools } from "react-icons/fa";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function MasterEquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    rate_per_hour: "",
    maintenance_rate: "",
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const res = await fetch("/api/master/equipment");
      const result = await res.json();
      if (result.success) {
        setEquipment(result.data);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = "/api/master/equipment";
      const method = editingEquipment ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rate_per_hour: parseFloat(formData.rate_per_hour),
          maintenance_rate: parseFloat(formData.maintenance_rate) || 0,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setShowModal(false);
        resetForm();
        fetchEquipment();
      }
    } catch (error) {
      console.error("Error saving equipment:", error);
    }
  };

  const handleEdit = (item) => {
    setEditingEquipment(item);
    setFormData({
      name: item.name,
      type: item.type,
      rate_per_hour: item.rate_per_hour,
      maintenance_rate: item.maintenance_rate,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;

    try {
      const res = await fetch(`/api/master/equipment?id=${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.success) {
        fetchEquipment();
      }
    } catch (error) {
      console.error("Error deleting equipment:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      rate_per_hour: "",
      maintenance_rate: "",
    });
    setEditingEquipment(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Master Equipment
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage equipment types and rates
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus /> Add Equipment
          </button>
        </div>

        {/* Equipment Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading equipment...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-600">
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Type</th>
                    <th className="text-right p-4">Rate/Hour</th>
                    <th className="text-right p-4">Maintenance Rate</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="p-4">{item.name}</td>
                      <td className="p-4">{item.type}</td>
                      <td className="p-4 text-right">${item.rate_per_hour}</td>
                      <td className="p-4 text-right">
                        ${item.maintenance_rate}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold mb-4">
                {editingEquipment ? "Edit Equipment" : "Add New Equipment"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
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
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <input
                    type="text"
                    required
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
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

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Maintenance Rate ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maintenance_rate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maintenance_rate: e.target.value,
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
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingEquipment ? "Update" : "Create"}
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
