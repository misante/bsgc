"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { HiX, HiCalendar } from "react-icons/hi";

export default function IncidentForm({
  incident,
  onSave,
  onCancel,
  isSubmitting,
  currentUser,
}) {
  const [formData, setFormData] = useState({
    title: incident?.title || "",
    description: incident?.description || "",
    severity: incident?.severity || "Low",
    status: incident?.status || "Under Investigation",
    incident_date:
      incident?.incident_date || new Date().toISOString().split("T")[0],
    location: incident?.location || "",
    actions_taken: incident?.actions_taken || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({
      ...formData,
      reported_by: currentUser,
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return createPortal(
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div className="flex justify-between items-center pb-3">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {incident ? "Edit Incident" : "Report New Incident"}
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
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Incident Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 px-1 py-1.5 block capitalize w-full rounded-md bg-gray-100 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block bg-gray-100 capitalize w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="severity"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Severity
              </label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="mt-1 px-1 py-1.5 block w-full bg-gray-100 capitalize rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
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
                className="mt-1 px-1 py-1.5 bg-gray-100 capitalize block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              >
                <option value="Under Investigation">Under Investigation</option>
                <option value="Action Required">Action Required</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="incident_date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Incident Date *
              </label>
              <div className="mt-1 relative">
                <input
                  type="date"
                  id="incident_date"
                  name="incident_date"
                  required
                  value={formData.incident_date}
                  onChange={handleChange}
                  className="block px-1 py-1.5 bg-gray-100 capitalize w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
                <HiCalendar className="absolute right-3 top-2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="mt-1 px-1 py-1.5 bg-gray-100 capitalize block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="actions_taken"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Actions Taken
            </label>
            <textarea
              id="actions_taken"
              name="actions_taken"
              rows={3}
              value={formData.actions_taken}
              onChange={handleChange}
              className="mt-1 bg-gray-100 capitalize block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              placeholder="Describe any immediate actions taken..."
            />
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
                : incident
                ? "Update Incident"
                : "Report Incident"}
            </button>
          </div>
        </form>
      </div>
    </div>,

    document.body
  );
}
