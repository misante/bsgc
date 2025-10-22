"use client";
import { Fragment, useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { FaTimes, FaImage } from "react-icons/fa";
import toast from "react-hot-toast";

const projectPhases = ["Pre-Construction", "Construction", "Post-Construction"];
const projectStatuses = [
  "Planning",
  "In Progress",
  "On Hold",
  "Completed",
  "Cancelled",
];
const priorities = ["Low", "Medium", "High"];

export default function ProjectForm({
  open,
  setOpen,
  project,
  onSubmit = () => {},
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    client: "",
    project_manager: "",
    budget: "",
    start_date: "",
    end_date: "",
    status: "Planning",
    phase: "Pre-Construction",
    location: "",
    contract_number: "",
    priority: "Medium",
    images: [],
  });

  const [uploading, setUploading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [tempImageUrls, setTempImageUrls] = useState([]); // Store uploaded image URLs temporarily

  // Helper function to parse images from text/JSON string to array
  const parseImages = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Reset form when project changes
  useEffect(() => {
    if (project) {
      const parsedImages = parseImages(project.images);
      setFormData({
        name: project.name || "",
        description: project.description || "",
        client: project.client || "",
        project_manager: project.project_manager || "",
        budget: project.budget || "",
        start_date: project.start_date || "",
        end_date: project.end_date || "",
        status: project.status || "Planning",
        phase: project.phase || "Pre-Construction",
        location: project.location || "",
        contract_number: project.contract_number || "",
        priority: project.priority || "Medium",
        images: parsedImages,
      });
      setImagePreviews(parsedImages);
      setTempImageUrls([]);
    } else {
      setFormData({
        name: "",
        description: "",
        client: "",
        project_manager: "",
        budget: "",
        start_date: "",
        end_date: "",
        status: "Planning",
        phase: "Pre-Construction",
        location: "",
        contract_number: "",
        priority: "Medium",
        images: [],
      });
      setImagePreviews([]);
      setTempImageUrls([]);
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadToast = toast.loading(`Uploading ${files.length} image(s)...`);

    try {
      const newPreviews = [];
      const uploadPromises = files.map(async (file) => {
        // Create local preview
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push(previewUrl);

        // Upload to Supabase
        const formData = new FormData();
        formData.append("file", file);

        // For existing projects, use project folder. For new projects, upload to temp location
        if (project?.id) {
          formData.append("projectId", project.id);
        } else {
          formData.append("projectId", "temp"); // Temporary location for new projects
        }

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Upload failed for ${file.name}`);
        }

        const data = await response.json();
        return {
          secure_url: data.secure_url,
          file_path: data.file_path,
        };
      });

      // Update previews immediately for better UX
      setImagePreviews((prev) => [...prev, ...newPreviews]);

      // Wait for all uploads to complete
      const uploadResults = await Promise.all(uploadPromises);
      const imageUrls = uploadResults.map((result) => result.secure_url);
      const filePaths = uploadResults.map((result) => result.file_path);

      // Store temp URLs for cleanup in case of cancellation
      if (!project?.id) {
        setTempImageUrls((prev) => [...prev, ...filePaths]);
      }

      // Update form data with actual URLs
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...imageUrls],
      }));

      toast.success(`Successfully uploaded ${imageUrls.length} image(s)!`, {
        id: uploadToast,
      });
    } catch (error) {
      console.error("Error uploading images:", error);

      // Remove failed upload previews
      setImagePreviews((prev) => prev.slice(0, -files.length));

      toast.error(`Upload failed: ${error.message}`, {
        id: uploadToast,
        duration: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index) => {
    const imageToRemove = imagePreviews[index];
    const imageUrlToRemove = formData.images[index];

    // Show loading toast for image removal
    const removeToast = toast.loading("Removing image...");

    try {
      // If it's a real uploaded image (not just a preview), delete from storage
      if (imageUrlToRemove && imageUrlToRemove.includes("supabase.co")) {
        const url = new URL(imageUrlToRemove);
        const pathParts = url.pathname.split("/");
        const filePath = pathParts.slice(5).join("/");

        if (filePath) {
          const response = await fetch("/api/upload/delete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ filePath }),
          });

          if (!response.ok) {
            console.error("Failed to delete image from storage");
            // Continue with local removal even if storage deletion fails
          }
        }

        // Remove from temp URLs if it exists
        if (
          tempImageUrls.some((tempPath) => imageUrlToRemove.includes(tempPath))
        ) {
          setTempImageUrls((prev) =>
            prev.filter((path) => !imageUrlToRemove.includes(path))
          );
        }
      }

      // Update local state
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));

      // Clean up blob URL
      if (imageToRemove.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove);
      }

      toast.success("Image removed successfully!", {
        id: removeToast,
      });
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image. Please try again.", {
        id: removeToast,
      });
    }
  };

  // Clean up temporary images if form is closed without submitting
  const cleanupTempImages = async () => {
    if (tempImageUrls.length > 0) {
      try {
        const deletePromises = tempImageUrls.map(async (filePath) => {
          const response = await fetch("/api/upload/delete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ filePath }),
          });

          if (!response.ok) {
            console.error("Failed to delete temp image:", filePath);
          }
        });

        await Promise.allSettled(deletePromises);
        console.log("Cleaned up temporary images");
      } catch (error) {
        console.error("Error cleaning up temp images:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    const submitToast = toast.loading(
      project ? "Updating project..." : "Creating new project..."
    );

    try {
      // For new projects, we need to handle image relocation after project creation
      const submitData = {
        ...formData,
        // Include temp image info for backend processing
        ...(!project?.id &&
          tempImageUrls.length > 0 && { tempImagePaths: tempImageUrls }),
      };

      await onSubmit(submitData);

      // Clear temp URLs after successful submission
      setTempImageUrls([]);

      toast.success(
        project
          ? `"${formData.name}" updated successfully!`
          : `"${formData.name}" created successfully!`,
        {
          id: submitToast,
          duration: 5000,
        }
      );

      handleClose();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        `Failed to ${project ? "update" : "create"} project: ${error.message}`,
        {
          id: submitToast,
          duration: 6000,
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    // Clean up temporary images if closing without submitting (for new projects)
    if (!project?.id && tempImageUrls.length > 0) {
      await cleanupTempImages();
    }

    setOpen(false);

    // Clean up object URLs to prevent memory leaks
    imagePreviews.forEach((preview) => {
      if (preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    });

    setTimeout(() => {
      setFormData({
        name: "",
        description: "",
        client: "",
        project_manager: "",
        budget: "",
        start_date: "",
        end_date: "",
        status: "Planning",
        phase: "Pre-Construction",
        location: "",
        contract_number: "",
        priority: "Medium",
        images: [],
      });
      setImagePreviews([]);
      setTempImageUrls([]);
    }, 300);
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 max-h-[90vh] overflow-y-auto">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-full bg-white p-2 text-gray-400 hover:text-gray-500 transition-colors hover:bg-gray-50"
                    onClick={handleClose}
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <DialogTitle
                      as="h3"
                      className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2"
                    >
                      {project ? "Edit Project" : "Create New Project"}
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mb-6">
                      {project
                        ? "Update the project details."
                        : "Fill in the project details to get started."}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Project Name */}
                        <div className="sm:col-span-2">
                          <label
                            htmlFor="name"
                            className="block text-sm font-semibold text-gray-900 mb-2"
                          >
                            Project Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="block capitalize w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter project name"
                          />
                        </div>

                        {/* Client */}
                        <div>
                          <label
                            htmlFor="client"
                            className="block text-sm font-semibold text-gray-900 mb-2"
                          >
                            Client *
                          </label>
                          <input
                            type="text"
                            name="client"
                            id="client"
                            required
                            value={formData.client}
                            onChange={handleChange}
                            className="block capitalize w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter client name"
                          />
                        </div>

                        {/* Project Manager */}
                        <div>
                          <label
                            htmlFor="project_manager"
                            className="block text-sm font-semibold text-gray-900 mb-2"
                          >
                            Project Manager *
                          </label>
                          <input
                            type="text"
                            name="project_manager"
                            id="project_manager"
                            required
                            value={formData.project_manager}
                            onChange={handleChange}
                            className="block capitalize w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter project manager name"
                          />
                        </div>

                        {/* Budget */}
                        <div>
                          <label
                            htmlFor="budget"
                            className="block text-sm font-semibold text-gray-900 mb-2"
                          >
                            Budget
                          </label>
                          <input
                            type="number"
                            name="budget"
                            id="budget"
                            step="0.01"
                            value={formData.budget}
                            onChange={handleChange}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter budget amount"
                          />
                        </div>

                        {/* Start Date */}
                        <div>
                          <label
                            htmlFor="start_date"
                            className="block text-sm font-semibold text-gray-900 mb-2"
                          >
                            Start Date
                          </label>
                          <input
                            type="date"
                            name="start_date"
                            id="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>

                        {/* End Date */}
                        <div>
                          <label
                            htmlFor="end_date"
                            className="block text-sm font-semibold text-gray-900 mb-2"
                          >
                            End Date
                          </label>
                          <input
                            type="date"
                            name="end_date"
                            id="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>

                        {/* Status */}
                        <div>
                          <label
                            htmlFor="status"
                            className="block text-sm font-semibold text-gray-900 mb-2"
                          >
                            Status
                          </label>
                          <select
                            name="status"
                            id="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          >
                            {projectStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Phase */}
                        <div>
                          <label
                            htmlFor="phase"
                            className="block text-sm font-semibold text-gray-900 mb-2"
                          >
                            Phase
                          </label>
                          <select
                            name="phase"
                            id="phase"
                            value={formData.phase}
                            onChange={handleChange}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          >
                            {projectPhases.map((phase) => (
                              <option key={phase} value={phase}>
                                {phase}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Priority */}
                        <div>
                          <label
                            htmlFor="priority"
                            className="block text-sm font-semibold text-gray-900 mb-2"
                          >
                            Priority
                          </label>
                          <select
                            name="priority"
                            id="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          >
                            {priorities.map((priority) => (
                              <option key={priority} value={priority}>
                                {priority}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Location */}
                        <div>
                          <label
                            htmlFor="location"
                            className="block text-sm font-semibold text-gray-900 mb-2"
                          >
                            Location
                          </label>
                          <input
                            type="text"
                            name="location"
                            id="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="block capitalize w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter project location"
                          />
                        </div>

                        {/* Contract Number */}
                        <div>
                          <label
                            htmlFor="contract_number"
                            className="block text-sm font-semibold text-gray-900 mb-2"
                          >
                            Contract Number
                          </label>
                          <input
                            type="text"
                            name="contract_number"
                            id="contract_number"
                            value={formData.contract_number}
                            onChange={handleChange}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Enter contract number"
                          />
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="images"
                          className="block text-sm font-semibold text-gray-900 mb-2"
                        >
                          Project Images
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                          <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-4">
                            <label htmlFor="images" className="cursor-pointer">
                              <span className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                Choose Images
                              </span>
                              <input
                                type="file"
                                id="images"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading || submitting}
                                className="hidden"
                              />
                            </label>
                            <p className="text-sm text-gray-500 mt-2">
                              PNG, JPG, GIF up to 10MB
                            </p>
                            {!project?.id && (
                              <p className="text-xs text-blue-600 mt-1">
                                Images will be stored in project folder after
                                creation
                              </p>
                            )}
                          </div>
                        </div>
                        {uploading && (
                          <div className="mt-4 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-sm text-gray-600">
                              Uploading images...
                            </span>
                          </div>
                        )}

                        {/* Image Preview */}
                        {imagePreviews.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                              Image Previews ({imagePreviews.length})
                              {!project?.id && tempImageUrls.length > 0 && (
                                <span className="text-xs text-blue-600 ml-2">
                                  (Temporary storage)
                                </span>
                              )}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                              {imagePreviews.map((image, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={image}
                                    alt={`Project preview ${index + 1}`}
                                    className="h-24 w-full object-cover rounded-lg shadow-sm group-hover:opacity-75 transition-opacity"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    disabled={submitting}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <FaTimes className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Description */}
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-semibold text-gray-900 mb-2"
                        >
                          Description
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          rows={4}
                          value={formData.description}
                          onChange={handleChange}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="Enter project description..."
                        />
                      </div>

                      {/* Form Actions */}
                      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handleClose}
                          disabled={submitting}
                          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {submitting ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {project ? "Updating..." : "Creating..."}
                            </div>
                          ) : project ? (
                            "Update Project"
                          ) : (
                            "Create Project"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
// "use client";
// import { Fragment, useState, useEffect, useRef } from "react";
// import {
//   Dialog,
//   DialogPanel,
//   DialogTitle,
//   Transition,
//   TransitionChild,
// } from "@headlessui/react";
// import { FaTimes, FaImage } from "react-icons/fa";
// import toast from "react-hot-toast";

// const projectPhases = ["Pre-Construction", "Construction", "Post-Construction"];
// const projectStatuses = [
//   "Planning",
//   "In Progress",
//   "On Hold",
//   "Completed",
//   "Cancelled",
// ];
// const priorities = ["Low", "Medium", "High"];

// export default function ProjectForm({
//   open,
//   setOpen,
//   project,
//   onSubmit = () => {},
// }) {
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     client: "",
//     project_manager: "",
//     budget: "",
//     start_date: "",
//     end_date: "",
//     status: "Planning",
//     phase: "Pre-Construction",
//     location: "",
//     contract_number: "",
//     priority: "Medium",
//     images: [],
//   });

//   const [uploading, setUploading] = useState(false);
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [submitting, setSubmitting] = useState(false);
//   const [pendingFiles, setPendingFiles] = useState([]); // Store File objects for new projects
//   const fileInputRef = useRef(null);

//   // Helper function to parse images from text/JSON string to array
//   const parseImages = (images) => {
//     if (!images) return [];
//     if (Array.isArray(images)) return images;
//     if (typeof images === "string") {
//       try {
//         const parsed = JSON.parse(images);
//         return Array.isArray(parsed) ? parsed : [];
//       } catch {
//         return [];
//       }
//     }
//     return [];
//   };

//   // Reset form when project changes
//   useEffect(() => {
//     if (project) {
//       const parsedImages = parseImages(project.images);
//       setFormData({
//         name: project.name || "",
//         description: project.description || "",
//         client: project.client || "",
//         project_manager: project.project_manager || "",
//         budget: project.budget || "",
//         start_date: project.start_date || "",
//         end_date: project.end_date || "",
//         status: project.status || "Planning",
//         phase: project.phase || "Pre-Construction",
//         location: project.location || "",
//         contract_number: project.contract_number || "",
//         priority: project.priority || "Medium",
//         images: parsedImages,
//       });
//       setImagePreviews(parsedImages);
//       setPendingFiles([]);
//     } else {
//       setFormData({
//         name: "",
//         description: "",
//         client: "",
//         project_manager: "",
//         budget: "",
//         start_date: "",
//         end_date: "",
//         status: "Planning",
//         phase: "Pre-Construction",
//         location: "",
//         contract_number: "",
//         priority: "Medium",
//         images: [],
//       });
//       setImagePreviews([]);
//       setPendingFiles([]);
//     }
//   }, [project]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // SIMPLE UPLOAD LOGIC - Just store files and create previews
//   const handleImageUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;

//     setUploading(true);

//     try {
//       // Create local previews
//       const newPreviews = [];
//       files.forEach((file) => {
//         const previewUrl = URL.createObjectURL(file);
//         newPreviews.push(previewUrl);
//       });

//       // Update previews
//       setImagePreviews((prev) => [...prev, ...newPreviews]);

//       if (project?.id) {
//         // For existing projects: UPLOAD IMMEDIATELY
//         const uploadToast = toast.loading(
//           `Uploading ${files.length} image(s)...`
//         );
//         const uploadedImages = [];

//         for (const file of files) {
//           const formData = new FormData();
//           formData.append("file", file);
//           formData.append("projectId", project.id);

//           const response = await fetch("/api/upload", {
//             method: "POST",
//             body: formData,
//           });

//           if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(
//               errorData.error || `Upload failed for ${file.name}`
//             );
//           }

//           const result = await response.json();

//           if (result.secure_url) {
//             uploadedImages.push(result.secure_url);
//           }
//         }

//         // Update form data with uploaded URLs
//         const newImages = [...formData.images, ...uploadedImages];
//         setFormData((prev) => ({
//           ...prev,
//           images: newImages,
//         }));

//         toast.success(
//           `Successfully uploaded ${uploadedImages.length} image(s)!`,
//           {
//             id: uploadToast,
//           }
//         );
//       } else {
//         // For new projects: STORE FILES FOR LATER
//         setPendingFiles((prev) => [...prev, ...files]);
//         toast.success(
//           `${files.length} image(s) added! They will be uploaded after project creation.`
//         );
//       }

//       // Reset file input
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     } catch (error) {
//       console.error("Error uploading images:", error);
//       toast.error(`Upload failed: ${error.message}`);

//       // Remove failed previews
//       setImagePreviews((prev) => prev.slice(0, -files.length));
//     } finally {
//       setUploading(false);
//     }
//   };

//   // UPLOAD IMAGES FOR NEW PROJECT (after project creation)
//   const uploadImagesForNewProject = async (projectId, files) => {
//     if (!files || files.length === 0) return [];

//     const uploadToast = toast.loading(
//       `Uploading ${files.length} image(s) to project folder...`
//     );
//     const uploadedImages = [];

//     try {
//       for (const file of files) {
//         const formData = new FormData();
//         formData.append("file", file);
//         formData.append("projectId", projectId);

//         const response = await fetch("/api/upload", {
//           method: "POST",
//           body: formData,
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.error || `Upload failed for ${file.name}`);
//         }

//         const result = await response.json();

//         if (result.secure_url) {
//           uploadedImages.push(result.secure_url);
//         }
//       }

//       toast.success(
//         `Successfully uploaded ${uploadedImages.length} image(s) to project folder!`,
//         {
//           id: uploadToast,
//         }
//       );

//       return uploadedImages;
//     } catch (error) {
//       toast.error(`Failed to upload images: ${error.message}`, {
//         id: uploadToast,
//       });
//       throw error;
//     }
//   };

//   const removeImage = async (indexToRemove) => {
//     const imageToRemove = imagePreviews[indexToRemove];
//     const isPendingImage = indexToRemove >= formData.images.length;

//     const removeToast = toast.loading("Removing image...");

//     try {
//       // If it's an uploaded image (not pending), delete from storage
//       if (
//         !isPendingImage &&
//         imageToRemove &&
//         imageToRemove.includes("supabase.co") &&
//         project?.id
//       ) {
//         const url = new URL(imageToRemove);
//         const pathParts = url.pathname.split("/");
//         const filePath = pathParts.slice(5).join("/");

//         if (filePath) {
//           const response = await fetch("/api/upload/delete", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ filePath }),
//           });

//           if (!response.ok) {
//             console.error("Error deleting image from storage");
//           }
//         }
//       }

//       // Update state
//       if (isPendingImage) {
//         // Remove from pending files and previews
//         const pendingIndex = indexToRemove - formData.images.length;
//         setPendingFiles((prev) => prev.filter((_, i) => i !== pendingIndex));
//         setImagePreviews((prev) => prev.filter((_, i) => i !== indexToRemove));
//       } else {
//         // Remove from uploaded images
//         const newImages = formData.images.filter(
//           (_, index) => index !== indexToRemove
//         );
//         const newPreviews = imagePreviews.filter(
//           (_, index) => index !== indexToRemove
//         );

//         setFormData((prev) => ({
//           ...prev,
//           images: newImages,
//         }));
//         setImagePreviews(newPreviews);
//       }

//       // Clean up blob URL
//       if (imageToRemove.startsWith("blob:")) {
//         URL.revokeObjectURL(imageToRemove);
//       }

//       toast.success("Image removed successfully!", {
//         id: removeToast,
//       });
//     } catch (error) {
//       console.error("Error removing image:", error);
//       toast.error("Failed to remove image. Please try again.", {
//         id: removeToast,
//       });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setSubmitting(true);
//     const submitToast = toast.loading(
//       project ? "Updating project..." : "Creating new project..."
//     );

//     try {
//       let result;

//       if (project) {
//         // EXISTING PROJECT: Submit with current images
//         result = await onSubmit(formData);
//         toast.success(`"${formData.name}" updated successfully!`, {
//           id: submitToast,
//         });
//       } else {
//         // NEW PROJECT: Two-step process
//         // Step 1: Create project without images
//         const projectWithoutImages = { ...formData, images: [] };
//         result = await onSubmit(projectWithoutImages);

//         // Step 2: Upload images and update project
//         if (result && result.id && pendingFiles.length > 0) {
//           const uploadedImages = await uploadImagesForNewProject(
//             result.id,
//             pendingFiles
//           );

//           // Update project with image URLs
//           const updateResponse = await fetch(`/api/projects/${result.id}`, {
//             method: "PUT",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               images: uploadedImages,
//               updated_at: new Date().toISOString(),
//             }),
//           });

//           if (updateResponse.ok) {
//             const updatedProject = await updateResponse.json();
//             result = updatedProject; // Update result with images
//             toast.success(
//               `"${formData.name}" created with ${uploadedImages.length} image(s)!`,
//               {
//                 id: submitToast,
//               }
//             );
//           } else {
//             throw new Error("Failed to update project with images");
//           }
//         } else {
//           toast.success(`"${formData.name}" created successfully!`, {
//             id: submitToast,
//           });
//         }
//       }

//       handleClose();
//     } catch (error) {
//       console.error("Form submission error:", error);
//       toast.error(
//         `Failed to ${project ? "update" : "create"} project: ${error.message}`,
//         {
//           id: submitToast,
//           duration: 6000,
//         }
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleClose = () => {
//     setOpen(false);

//     // Clean up object URLs to prevent memory leaks
//     imagePreviews.forEach((preview) => {
//       if (preview.startsWith("blob:")) {
//         URL.revokeObjectURL(preview);
//       }
//     });

//     setTimeout(() => {
//       setFormData({
//         name: "",
//         description: "",
//         client: "",
//         project_manager: "",
//         budget: "",
//         start_date: "",
//         end_date: "",
//         status: "Planning",
//         phase: "Pre-Construction",
//         location: "",
//         contract_number: "",
//         priority: "Medium",
//         images: [],
//       });
//       setImagePreviews([]);
//       setPendingFiles([]);
//     }, 300);
//   };

//   return (
//     <Transition show={open} as={Fragment}>
//       <Dialog as="div" className="relative z-50" onClose={handleClose}>
//         <TransitionChild
//           as={Fragment}
//           enter="ease-out duration-300"
//           enterFrom="opacity-0"
//           enterTo="opacity-100"
//           leave="ease-in duration-200"
//           leaveFrom="opacity-100"
//           leaveTo="opacity-0"
//         >
//           <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" />
//         </TransitionChild>

//         <div className="fixed inset-0 z-10 overflow-y-auto">
//           <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
//             <TransitionChild
//               as={Fragment}
//               enter="ease-out duration-300"
//               enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
//               enterTo="opacity-100 translate-y-0 sm:scale-100"
//               leave="ease-in duration-200"
//               leaveFrom="opacity-100 translate-y-0 sm:scale-100"
//               leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
//             >
//               <DialogPanel className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6 max-h-[90vh] overflow-y-auto">
//                 <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
//                   <button
//                     type="button"
//                     className="rounded-full bg-white p-2 text-gray-400 hover:text-gray-500 transition-colors hover:bg-gray-50"
//                     onClick={handleClose}
//                   >
//                     <FaTimes className="h-6 w-6" />
//                   </button>
//                 </div>

//                 <div className="sm:flex sm:items-start">
//                   <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
//                     <DialogTitle
//                       as="h3"
//                       className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2"
//                     >
//                       {project ? "Edit Project" : "Create New Project"}
//                     </DialogTitle>

//                     <form onSubmit={handleSubmit} className="space-y-6">
//                       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
//                         {/* Project Name */}
//                         <div className="sm:col-span-2">
//                           <label
//                             htmlFor="name"
//                             className="block text-sm font-semibold text-gray-900 mb-2"
//                           >
//                             Project Name *
//                           </label>
//                           <input
//                             type="text"
//                             name="name"
//                             id="name"
//                             required
//                             value={formData.name}
//                             onChange={handleChange}
//                             className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                             placeholder="Enter project name"
//                           />
//                         </div>

//                         {/* Client */}
//                         <div>
//                           <label
//                             htmlFor="client"
//                             className="block text-sm font-semibold text-gray-900 mb-2"
//                           >
//                             Client *
//                           </label>
//                           <input
//                             type="text"
//                             name="client"
//                             id="client"
//                             required
//                             value={formData.client}
//                             onChange={handleChange}
//                             className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                             placeholder="Enter client name"
//                           />
//                         </div>

//                         {/* Project Manager */}
//                         <div>
//                           <label
//                             htmlFor="project_manager"
//                             className="block text-sm font-semibold text-gray-900 mb-2"
//                           >
//                             Project Manager *
//                           </label>
//                           <input
//                             type="text"
//                             name="project_manager"
//                             id="project_manager"
//                             required
//                             value={formData.project_manager}
//                             onChange={handleChange}
//                             className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                             placeholder="Enter project manager name"
//                           />
//                         </div>

//                         {/* Budget */}
//                         <div>
//                           <label
//                             htmlFor="budget"
//                             className="block text-sm font-semibold text-gray-900 mb-2"
//                           >
//                             Budget
//                           </label>
//                           <input
//                             type="number"
//                             name="budget"
//                             id="budget"
//                             step="0.01"
//                             value={formData.budget}
//                             onChange={handleChange}
//                             className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                             placeholder="Enter budget amount"
//                           />
//                         </div>

//                         {/* Start Date */}
//                         <div>
//                           <label
//                             htmlFor="start_date"
//                             className="block text-sm font-semibold text-gray-900 mb-2"
//                           >
//                             Start Date
//                           </label>
//                           <input
//                             type="date"
//                             name="start_date"
//                             id="start_date"
//                             value={formData.start_date}
//                             onChange={handleChange}
//                             className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                           />
//                         </div>

//                         {/* End Date */}
//                         <div>
//                           <label
//                             htmlFor="end_date"
//                             className="block text-sm font-semibold text-gray-900 mb-2"
//                           >
//                             End Date
//                           </label>
//                           <input
//                             type="date"
//                             name="end_date"
//                             id="end_date"
//                             value={formData.end_date}
//                             onChange={handleChange}
//                             className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                           />
//                         </div>

//                         {/* Status */}
//                         <div>
//                           <label
//                             htmlFor="status"
//                             className="block text-sm font-semibold text-gray-900 mb-2"
//                           >
//                             Status
//                           </label>
//                           <select
//                             name="status"
//                             id="status"
//                             value={formData.status}
//                             onChange={handleChange}
//                             className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                           >
//                             {projectStatuses.map((status) => (
//                               <option key={status} value={status}>
//                                 {status}
//                               </option>
//                             ))}
//                           </select>
//                         </div>

//                         {/* Phase */}
//                         <div>
//                           <label
//                             htmlFor="phase"
//                             className="block text-sm font-semibold text-gray-900 mb-2"
//                           >
//                             Phase
//                           </label>
//                           <select
//                             name="phase"
//                             id="phase"
//                             value={formData.phase}
//                             onChange={handleChange}
//                             className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                           >
//                             {projectPhases.map((phase) => (
//                               <option key={phase} value={phase}>
//                                 {phase}
//                               </option>
//                             ))}
//                           </select>
//                         </div>

//                         {/* Priority */}
//                         <div>
//                           <label
//                             htmlFor="priority"
//                             className="block text-sm font-semibold text-gray-900 mb-2"
//                           >
//                             Priority
//                           </label>
//                           <select
//                             name="priority"
//                             id="priority"
//                             value={formData.priority}
//                             onChange={handleChange}
//                             className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                           >
//                             {priorities.map((priority) => (
//                               <option key={priority} value={priority}>
//                                 {priority}
//                               </option>
//                             ))}
//                           </select>
//                         </div>

//                         {/* Location */}
//                         <div>
//                           <label
//                             htmlFor="location"
//                             className="block text-sm font-semibold text-gray-900 mb-2"
//                           >
//                             Location
//                           </label>
//                           <input
//                             type="text"
//                             name="location"
//                             id="location"
//                             value={formData.location}
//                             onChange={handleChange}
//                             className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                             placeholder="Enter project location"
//                           />
//                         </div>

//                         {/* Contract Number */}
//                         <div>
//                           <label
//                             htmlFor="contract_number"
//                             className="block text-sm font-semibold text-gray-900 mb-2"
//                           >
//                             Contract Number
//                           </label>
//                           <input
//                             type="text"
//                             name="contract_number"
//                             id="contract_number"
//                             value={formData.contract_number}
//                             onChange={handleChange}
//                             className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                             placeholder="Enter contract number"
//                           />
//                         </div>
//                       </div>

//                       {/* Image Upload */}
//                       <div className="sm:col-span-2">
//                         <label
//                           htmlFor="images"
//                           className="block text-sm font-semibold text-gray-900 mb-2"
//                         >
//                           Project Images
//                         </label>
//                         <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
//                           <FaImage className="mx-auto h-12 w-12 text-gray-400" />
//                           <div className="mt-4">
//                             <label htmlFor="images" className="cursor-pointer">
//                               <span className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
//                                 Choose Images
//                               </span>
//                               <input
//                                 ref={fileInputRef}
//                                 type="file"
//                                 id="images"
//                                 multiple
//                                 accept="image/*"
//                                 onChange={handleImageUpload}
//                                 disabled={uploading || submitting}
//                                 className="hidden"
//                               />
//                             </label>
//                             <p className="text-sm text-gray-500 mt-2">
//                               PNG, JPG, GIF up to 10MB
//                             </p>
//                             {!project?.id && (
//                               <p className="text-xs text-blue-600 mt-1">
//                                 Images will be uploaded to project folder after
//                                 creation
//                               </p>
//                             )}
//                           </div>
//                         </div>

//                         {uploading && (
//                           <div className="mt-4 flex items-center justify-center">
//                             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
//                             <span className="ml-2 text-sm text-gray-600">
//                               {project?.id
//                                 ? "Uploading to storage..."
//                                 : "Processing images..."}
//                             </span>
//                           </div>
//                         )}

//                         {/* Image Preview */}
//                         {imagePreviews.length > 0 && (
//                           <div className="mt-6">
//                             <h4 className="text-sm font-semibold text-gray-900 mb-3">
//                               Image Previews ({imagePreviews.length})
//                               {!project?.id && pendingFiles.length > 0 && (
//                                 <span className="text-xs text-blue-600 ml-2">
//                                   ({pendingFiles.length} waiting for upload)
//                                 </span>
//                               )}
//                             </h4>
//                             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//                               {imagePreviews.map((image, index) => (
//                                 <div key={index} className="relative group">
//                                   <img
//                                     src={image}
//                                     alt={`Project preview ${index + 1}`}
//                                     className="h-24 w-full object-cover rounded-lg shadow-sm group-hover:opacity-75 transition-opacity"
//                                   />
//                                   <button
//                                     type="button"
//                                     onClick={() => removeImage(index)}
//                                     disabled={submitting}
//                                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
//                                   >
//                                     <FaTimes className="h-3 w-3" />
//                                   </button>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </div>

//                       {/* Description */}
//                       <div>
//                         <label
//                           htmlFor="description"
//                           className="block text-sm font-semibold text-gray-900 mb-2"
//                         >
//                           Description
//                         </label>
//                         <textarea
//                           name="description"
//                           id="description"
//                           rows={4}
//                           value={formData.description}
//                           onChange={handleChange}
//                           className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                           placeholder="Enter project description..."
//                         />
//                       </div>

//                       {/* Form Actions */}
//                       <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
//                         <button
//                           type="button"
//                           onClick={handleClose}
//                           disabled={submitting}
//                           className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           type="submit"
//                           disabled={submitting}
//                           className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-xl shadow-sm hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                         >
//                           {submitting ? (
//                             <div className="flex items-center">
//                               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                               {project ? "Updating..." : "Creating..."}
//                             </div>
//                           ) : project ? (
//                             "Update Project"
//                           ) : (
//                             "Create Project"
//                           )}
//                         </button>
//                       </div>
//                     </form>
//                   </div>
//                 </div>
//               </DialogPanel>
//             </TransitionChild>
//           </div>
//         </div>
//       </Dialog>
//     </Transition>
//   );
// }
