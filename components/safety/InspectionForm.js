"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { HiX, HiCalendar } from "react-icons/hi";

export default function InspectionForm({
  inspection,
  onSave,
  onCancel,
  isSubmitting,
  currentUser,
}) {
  const [formData, setFormData] = useState({
    type: inspection?.type || "",
    inspection_date:
      inspection?.inspection_date || new Date().toISOString().split("T")[0],
    inspector: inspection?.inspector || currentUser,
    status: inspection?.status || "Scheduled",
    findings: inspection?.findings || 0,
    score: inspection?.score || 100,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "number"
        ? parseInt(e.target.value) || 0
        : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  return createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center pb-3">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {inspection ? "Edit Inspection" : "Schedule New Inspection"}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <HiX className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Inspection Type *
            </label>
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="mt-1 px-1 py-1.5 capitalize block bg-gray-100 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            >
              <option value="">Select inspection type</option>
              <option value="Daily Safety Check">Daily Safety Check</option>
              <option value="Weekly Site Audit">Weekly Site Audit</option>
              <option value="Equipment Safety Audit">
                Equipment Safety Audit
              </option>
              <option value="Electrical Safety Check">
                Electrical Safety Check
              </option>
              <option value="Scaffolding Inspection">
                Scaffolding Inspection
              </option>
              <option value="Fire Safety Audit">Fire Safety Audit</option>
              <option value="PPE Compliance Check">PPE Compliance Check</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="inspection_date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Inspection Date *
              </label>
              <div className="mt-1 relative">
                <input
                  type="date"
                  id="inspection_date"
                  name="inspection_date"
                  required
                  value={formData.inspection_date}
                  onChange={handleChange}
                  className="block w-full px-1 py-1.5 capitalize bg-gray-100 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
                <HiCalendar className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 px-1 py-2 capitalize bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="inspector"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Inspector *
            </label>
            <input
              type="text"
              id="inspector"
              name="inspector"
              required
              value={formData.inspector}
              onChange={handleChange}
              className="mt-1 px-1 py-1.5 capitalize bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="findings"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Number of Findings
              </label>
              <input
                type="number"
                id="findings"
                name="findings"
                min="0"
                value={formData.findings}
                onChange={handleChange}
                className="mt-1 px-1 py-1.5 capitalize block bg-gray-100 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="score"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Compliance Score (%)
              </label>
              <input
                type="number"
                id="score"
                name="score"
                min="0"
                max="100"
                value={formData.score}
                onChange={handleChange}
                className="mt-1 px-1 py-1.5 capitalize bg-gray-100 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : inspection
                ? "Update Inspection"
                : "Schedule Inspection"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
