"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaSave, FaPlus, FaMinus } from "react-icons/fa";
import { createPortal } from "react-dom";

export default function DailyUsageModal({ open, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState("materials");
  const [projects, setProjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [manpower, setManpower] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    project_id: "",
    date: new Date().toISOString().split("T")[0],
    materials: [],
    manpower: [],
    equipment: [],
  });

  useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  const fetchDropdownData = async () => {
    try {
      const [projectsRes, materialsRes, manpowerRes, equipmentRes] =
        await Promise.all([
          fetch("/api/projects"),
          fetch("/api/materials/master-materials"),
          fetch("/api/master/manpower"),
          fetch("/api/master/equipment"),
        ]);

      const [projectsData, materialsData, manpowerData, equipmentData] =
        await Promise.all([
          projectsRes.json(),
          materialsRes.json(),
          manpowerRes.json(),
          equipmentRes.json(),
        ]);
      //   console.log(
      //     "projectsData:",
      //     projectsData,
      //     "materialsData:",
      //     materialsData,
      //     "manpowerData:",
      //     manpowerData,
      //     "equipmentData:",
      //     equipmentData
      //   );
      if (projectsData) setProjects(projectsData);
      if (materialsData.success) setMaterials(materialsData.materials);
      if (manpowerData.success) setManpower(manpowerData.data);
      if (equipmentData.success) setEquipment(equipmentData.data);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const addUsageItem = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: [
        ...prev[type],
        {
          id: Date.now(),
          [type.slice(0, -1) + "_id"]: "",
          quantity: 0,
          hours: 0,
        },
      ],
    }));
  };

  const removeUsageItem = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const updateUsageItem = (type, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save material usage to daily_material_usage table
      console.log("formData - materials:", formData.materials);
      for (const material of formData.materials) {
        console.log("material:", material);
        if (material.material_id && material.quantity > 0) {
          await fetch("/api/usage/materials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              project_id: formData.project_id,
              material_id: material.material_id,
              quantity_used: material.quantity,
              date: formData.date,
            }),
          });
        }
      }

      // Save manpower usage to daily_manpower_usage table
      for (const worker of formData.manpower) {
        if (worker.manpower_id && worker.hours > 0) {
          await fetch("/api/usage/manpower", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              project_id: formData.project_id,
              manpower_id: worker.manpower_id,
              hours_worked: worker.hours,
              date: formData.date,
            }),
          });
        }
      }

      // Save equipment usage to daily_equipment_usage table
      for (const equip of formData.equipment) {
        if (equip.equipment_id && equip.hours > 0) {
          await fetch("/api/usage/equipment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              project_id: formData.project_id,
              equipment_id: equip.equipment_id,
              hours_used: equip.hours,
              date: formData.date,
            }),
          });
        }
      }

      onSave();
      onClose();
      setFormData({
        project_id: "",
        date: new Date().toISOString().split("T")[0],
        materials: [],
        manpower: [],
        equipment: [],
      });
    } catch (error) {
      console.error("Error saving usage data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Record Daily Usage
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Project Selection */}
          <div className="p-6 border-b dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Project
                </label>
                <select
                  required
                  value={formData.project_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_id: e.target.value,
                    }))
                  }
                  className="w-full capitalize p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option
                      key={project.id}
                      value={project.id}
                      className="capitalize"
                    >
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b dark:border-gray-700">
            <div className="flex">
              {["materials", "manpower", "equipment"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === "materials" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium dark:text-white">
                    Material Usage
                  </h3>
                  <button
                    type="button"
                    onClick={() => addUsageItem("materials")}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                  >
                    <FaPlus /> Add Material
                  </button>
                </div>

                {formData.materials.map((material, index) => (
                  <div
                    key={material.id}
                    className="flex gap-4 items-end p-4 border rounded-lg dark:border-gray-600"
                  >
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        Material
                      </label>
                      <select
                        value={material.material_id}
                        onChange={(e) =>
                          updateUsageItem(
                            "materials",
                            index,
                            "material_id",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="">Select Material</option>
                        {materials.map((mat) => (
                          <option key={mat.id} value={mat.id}>
                            {mat.name} - ${mat.unit_cost}/unit
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        Quantity Used
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={material.quantity}
                        onChange={(e) =>
                          updateUsageItem(
                            "materials",
                            index,
                            "quantity",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUsageItem("materials", index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "manpower" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium dark:text-white">
                    Manpower Usage
                  </h3>
                  <button
                    type="button"
                    onClick={() => addUsageItem("manpower")}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                  >
                    <FaPlus /> Add Manpower
                  </button>
                </div>

                {formData.manpower.map((worker, index) => (
                  <div
                    key={worker.id}
                    className="flex gap-4 items-end p-4 border rounded-lg dark:border-gray-600"
                  >
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        Role
                      </label>
                      <select
                        value={worker.manpower_id}
                        onChange={(e) =>
                          updateUsageItem(
                            "manpower",
                            index,
                            "manpower_id",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="">Select Role</option>
                        {manpower.map((mp) => (
                          <option key={mp.id} value={mp.id}>
                            {mp.role} - ${mp.rate_per_hour}/hr
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        Hours Worked
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={worker.hours}
                        onChange={(e) =>
                          updateUsageItem(
                            "manpower",
                            index,
                            "hours",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUsageItem("manpower", index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "equipment" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium dark:text-white">
                    Equipment Usage
                  </h3>
                  <button
                    type="button"
                    onClick={() => addUsageItem("equipment")}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                  >
                    <FaPlus /> Add Equipment
                  </button>
                </div>

                {formData.equipment.map((equip, index) => (
                  <div
                    key={equip.id}
                    className="flex gap-4 items-end p-4 border rounded-lg dark:border-gray-600"
                  >
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        Equipment
                      </label>
                      <select
                        value={equip.equipment_id}
                        onChange={(e) =>
                          updateUsageItem(
                            "equipment",
                            index,
                            "equipment_id",
                            e.target.value
                          )
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
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2">
                        Hours Used
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={equip.hours}
                        onChange={(e) =>
                          updateUsageItem(
                            "equipment",
                            index,
                            "hours",
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeUsageItem("equipment", index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <FaMinus />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave /> {loading ? "Saving..." : "Save Usage"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
}
