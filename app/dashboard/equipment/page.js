"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Truck,
  Wrench,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Menu,
  X,
  RotateCcw,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { equipmentService } from "@/lib/equipmentService";
import { formatText } from "@/lib/formatText";
import toast from "react-hot-toast";

// Modal Components
const EquipmentModal = ({
  showModal,
  setShowModal,
  selectedEquipment,
  formData,
  setFormData,
  submitForm,
}) => {
  if (!showModal) return null;
  const initialFormData = {
    name: "",
    type: "",
    model: "",
    serial_number: "",
    status: "Operational",
    maintenance_due_date: "",
    hours_used: 0,
    location: "",
    operator_id: null,
    project_id: null,
    purchase_date: "",
    purchase_cost: "",
  };
  return createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-0 mx-auto p-4 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 sm:top-20 sm:p-5">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {selectedEquipment ? "Edit Equipment" : "Add New Equipment"}
          </h3>
          <form onSubmit={submitForm} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter equipment name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Type *
                </label>
                <input
                  type="text"
                  required
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Equipment type"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Model
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Model number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Operator ID
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.operator_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      operator_id:
                        e.target.value === "" ? null : parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project ID
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.project_id || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      project_id:
                        e.target.value === "" ? null : parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Purchase Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.purchase_cost || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      purchase_cost:
                        e.target.value === "" ? "" : parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={(e) =>
                    setFormData({ ...formData, serial_number: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Serial number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Operational">Operational</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Broken">Broken</option>
                  <option value="Idle">Idle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hours Used
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.hours_used}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hours_used: parseInt(e.target.value) || 0,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maintenance Due Date
                </label>
                <input
                  type="date"
                  value={formData.maintenance_due_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maintenance_due_date: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <div>
                <button
                  type="button"
                  onClick={() => setFormData(initialFormData)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2 inline" />
                  Reset
                </button>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {selectedEquipment ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

const DeleteModal = ({
  showDeleteModal,
  setShowDeleteModal,
  selectedEquipment,
  confirmDelete,
}) => {
  if (!showDeleteModal) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-4 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 sm:top-20">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Delete Equipment
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete "{selectedEquipment?.name}"? This
              action cannot be undone.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const MaintenanceModal = ({
  showMaintenanceModal,
  setShowMaintenanceModal,
  selectedEquipment,
  maintenanceData,
  setMaintenanceData,
  submitMaintenance,
}) => {
  if (!showMaintenanceModal) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-4 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 sm:top-20">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Log Maintenance
          </h3>
          <form onSubmit={submitMaintenance} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Next Maintenance Due Date *
              </label>
              <input
                type="date"
                required
                value={maintenanceData.nextDueDate}
                onChange={(e) =>
                  setMaintenanceData({
                    ...maintenanceData,
                    nextDueDate: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Current Hours Used
              </label>
              <input
                type="number"
                value={maintenanceData.newHoursUsed}
                onChange={(e) =>
                  setMaintenanceData({
                    ...maintenanceData,
                    newHoursUsed: parseInt(e.target.value) || 0,
                  })
                }
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 text-sm sm:text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowMaintenanceModal(false)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                Log Maintenance
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    model: "",
    serial_number: "",
    status: "Operational",
    maintenance_due_date: "",
    hours_used: 0,
    location: "",
    operator_id: null,
    project_id: null,
    purchase_date: "",
    purchase_cost: "",
  });
  const [maintenanceData, setMaintenanceData] = useState({
    nextDueDate: "",
    newHoursUsed: 0,
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      const data = await equipmentService.getAllEquipment();
      setEquipment(data || []);
    } catch (error) {
      console.error("Error fetching equipment:", error);
      alert("Error fetching equipment data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedEquipment(null);
    setFormData({
      name: "",
      type: "",
      model: "",
      serial_number: "",
      status: "Operational",
      maintenance_due_date: "",
      hours_used: 0,
      location: "",
      operator_id: null,
      project_id: null,
      purchase_date: "",
      purchase_cost: "",
    });
    setShowModal(true);
  };

  const handleEdit = (equip) => {
    setSelectedEquipment(equip);
    setFormData({
      name: equip.name,
      type: equip.type,
      model: equip.model || "",
      serial_number: equip.serial_number || "",
      status: equip.status,
      maintenance_due_date: equip.maintenance_due_date || "",
      hours_used: equip.hours_used || 0,
      location: equip.location || "",
      operator_id: equip.operator_id || null,
      project_id: equip.project_id || null,
      purchase_date: equip.purchase_date || "",
      purchase_cost: equip.purchase_cost || "",
    });
    setShowModal(true);
  };

  const handleDelete = (equip) => {
    setSelectedEquipment(equip);
    setShowDeleteModal(true);
  };

  const handleMaintenance = (equip) => {
    setSelectedEquipment(equip);
    setMaintenanceData({
      nextDueDate: "",
      newHoursUsed: equip.hours_used || 0,
    });
    setShowMaintenanceModal(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      if (selectedEquipment) {
        await equipmentService.updateEquipment(selectedEquipment.id, formData);
      } else {
        await equipmentService.createEquipment(formData);
      }
      setShowModal(false);
      fetchEquipment();
      toast.success(
        `Equipment ${selectedEquipment ? "updated" : "created"} successfully!`,
        { duration: 4000 }
      );
    } catch (error) {
      console.error("Error saving equipment:", error);
      toast.error("Error saving equipment data", { duration: 4000 });
    }
  };

  const confirmDelete = async () => {
    try {
      await equipmentService.deleteEquipment(selectedEquipment.id);
      setShowDeleteModal(false);
      fetchEquipment();
      toast.success("Equipment deleted successfully!", { duration: 4000 });
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Error deleting equipment", { duration: 4000 });
    }
  };

  const submitMaintenance = async (e) => {
    e.preventDefault();
    try {
      await equipmentService.logMaintenance(
        selectedEquipment.id,
        maintenanceData
      );
      setShowMaintenanceModal(false);
      fetchEquipment();
      toast.success("Maintenance logged successfully!", { duration: 4000 });
    } catch (error) {
      console.error("Error logging maintenance:", error);
      toast.error("Error logging maintenance", { duration: 4000 });
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await equipmentService.updateEquipmentStatus(id, newStatus);
      fetchEquipment();
      toast.success("Status updated successfully!", { duration: 4000 });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status", { duration: 4000 });
    }
  };

  const filteredEquipment = equipment.filter(
    (item) => filter === "all" || item.status === filter
  );

  const getStatusColor = (status) => {
    const colors = {
      Operational:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Maintenance:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Broken: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Idle: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    );
  };

  const getMaintenanceStatus = (dueDate) => {
    if (!dueDate)
      return {
        status: "Not Scheduled",
        color: "text-gray-600 dark:text-gray-400",
      };

    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return { status: "Overdue", color: "text-red-600 dark:text-red-400" };
    if (diffDays <= 7)
      return {
        status: "Due Soon",
        color: "text-yellow-600 dark:text-yellow-400",
      };
    return { status: "Scheduled", color: "text-green-600 dark:text-green-400" };
  };

  // Format equipment data for display using formatText utility
  const formatEquipmentDisplay = (equip) => {
    return {
      ...equip,
      name: formatText.formatEquipmentName(equip.name),
      type: formatText.formatType(equip.type),
      model: formatText.capitalize(equip.model || ""),
      location: formatText.capitalize(equip.location || ""),
      operator: equip.operator
        ? {
            ...equip.operator,
            first_name: formatText.capitalize(equip.operator.first_name || ""),
            last_name: formatText.capitalize(equip.operator.last_name || ""),
          }
        : null,
    };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-900 dark:text-gray-100">
            Loading equipment...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        {/* Header Section - Mobile Responsive */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Equipment Management
            </h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Monitor equipment operation and maintenance according to BSGC SOP
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={handleCreate}
              className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Equipment</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Equipment Stats - Responsive Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-3 py-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-2 sm:p-3">
                  <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Operational
                    </dt>
                    <dd className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white">
                      {
                        equipment.filter((e) => e.status === "Operational")
                          .length
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-3 py-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-2 sm:p-3">
                  <Wrench className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Maintenance
                    </dt>
                    <dd className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white">
                      {
                        equipment.filter((e) => e.status === "Maintenance")
                          .length
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-3 py-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-500 rounded-md p-2 sm:p-3">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <dl>
                    <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Due Soon
                    </dt>
                    <dd className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white">
                      {
                        equipment.filter(
                          (e) =>
                            getMaintenanceStatus(e.maintenance_due_date)
                              .status === "Due Soon"
                        ).length
                      }
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section - Mobile Responsive */}
        <div className={`mt-6 ${mobileMenuOpen ? "block" : "hidden"} sm:block`}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <select
              className="block w-full sm:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Equipment</option>
              <option value="Operational">Operational</option>
              <option value="Maintenance">Under Maintenance</option>
              <option value="Broken">Broken</option>
              <option value="Idle">Idle</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment List - Mobile Responsive */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        {filteredEquipment.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No equipment
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding new equipment.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredEquipment.map((item) => {
              const formattedItem = formatEquipmentDisplay(item);
              const maintenance = getMaintenanceStatus(
                item.maintenance_due_date
              );
              const operatorName = formattedItem.operator
                ? `${formattedItem.operator.first_name} ${formattedItem.operator.last_name}`
                : "Unassigned";

              return (
                <li
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="px-4 py-4 sm:px-6">
                    {/* Mobile Layout */}
                    <div className="sm:hidden">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <Truck className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                              {formattedItem.name}
                            </h4>
                            <div className="flex items-center mt-1">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  item.status
                                )}`}
                              >
                                {item.status}
                              </span>
                            </div>
                            <div className="mt-2 space-y-1 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex justify-between">
                                <span>Type:</span>
                                <span className="text-gray-900 dark:text-white">
                                  {formattedItem.type}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Location:</span>
                                <span className="text-gray-900 dark:text-white">
                                  {formattedItem.location || "Not specified"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Operator:</span>
                                <span className="text-gray-900 dark:text-white">
                                  {operatorName}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Hours:</span>
                                <span className="text-gray-900 dark:text-white">
                                  {item.hours_used || 0}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Maintenance:</span>
                                <span className={maintenance.color}>
                                  {maintenance.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            updateStatus(item.id, e.target.value)
                          }
                          className="flex-1 min-w-[120px] text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="Operational">Operational</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Broken">Broken</option>
                          <option value="Idle">Idle</option>
                        </select>
                        <button
                          onClick={() => handleMaintenance(item)}
                          className="flex-1 inline-flex justify-center items-center px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Maintenance
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex justify-center items-center px-2 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="inline-flex justify-center items-center px-2 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <Truck className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="ml-4 flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {formattedItem.name}
                            </h4>
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span>Type: {formattedItem.type}</span>
                            {formattedItem.model && (
                              <>
                                <span className="mx-2">•</span>
                                <span>Model: {formattedItem.model}</span>
                              </>
                            )}
                            <span className="mx-2">•</span>
                            <span>
                              Location:{" "}
                              {formattedItem.location || "Not specified"}
                            </span>
                            <span className="mx-2">•</span>
                            <span>Operator: {operatorName}</span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span>Hours Used: {item.hours_used || 0}</span>
                            <span className="mx-2">•</span>
                            <span className={maintenance.color}>
                              Maintenance: {maintenance.status}
                              {item.maintenance_due_date &&
                                ` (${new Date(
                                  item.maintenance_due_date
                                ).toLocaleDateString()})`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <select
                          value={item.status}
                          onChange={(e) =>
                            updateStatus(item.id, e.target.value)
                          }
                          className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="Operational">Operational</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Broken">Broken</option>
                          <option value="Idle">Idle</option>
                        </select>
                        <button
                          onClick={() => handleMaintenance(item)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Log Maintenance
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Modal Components */}
      <EquipmentModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedEquipment={selectedEquipment}
        formData={formData}
        setFormData={setFormData}
        submitForm={submitForm}
      />

      <DeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        selectedEquipment={selectedEquipment}
        confirmDelete={confirmDelete}
      />

      <MaintenanceModal
        showMaintenanceModal={showMaintenanceModal}
        setShowMaintenanceModal={setShowMaintenanceModal}
        selectedEquipment={selectedEquipment}
        maintenanceData={maintenanceData}
        setMaintenanceData={setMaintenanceData}
        submitMaintenance={submitMaintenance}
      />
    </DashboardLayout>
  );
}
