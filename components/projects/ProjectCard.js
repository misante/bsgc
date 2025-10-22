"use client";
import { useState, useEffect } from "react";
import ProjectDetailsModal from "./ProjectDetailsModal";
import toast from "react-hot-toast";

export default function ProjectCard({
  project: initialProject,
  onProjectDelete,
}) {
  const [project, setProject] = useState(initialProject);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    setProject(initialProject);
  }, [initialProject]);

  const getStatusColor = (status) => {
    const colors = {
      Planning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
      "On Hold": "bg-orange-100 text-orange-800 border-orange-200",
      Completed: "bg-green-100 text-green-800 border-green-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getCoverImage = () => {
    const images = parseImages(project.images);
    return images.length > 0 ? images[0] : null;
  };

  const handleDeleteProject = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${project.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);

    // Show loading toast with project-specific message
    const deleteToast = toast.loading(
      `Deleting project "${project.name}" and all associated images...`,
      {
        duration: 4000, // Longer duration for deletion process
      }
    );

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete project");
      }

      const result = await response.json();

      // Success toast with checkmark icon and project name
      toast.success(`Project "${project.name}" has been permanently deleted.`, {
        id: deleteToast,
        duration: 5000,
        icon: "✅",
      });

      // Notify parent component to remove this project
      if (onProjectDelete) {
        onProjectDelete(project.id);
      }
    } catch (error) {
      console.error("Error deleting project:", error);

      // Error toast with specific error message
      toast.error(`Could not delete "${project.name}": ${error.message}`, {
        id: deleteToast,
        duration: 6000, // Longer duration for errors
        icon: "❌",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  const coverImage = getCoverImage();
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer relative">
        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteProject();
          }}
          disabled={isDeleting}
          className="absolute top-3 right-3 z-10 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          title="Delete project"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
        </button>

        {/* Project Header */}
        <div
          className="h-48 relative overflow-hidden"
          onClick={() => setIsDetailsOpen(true)}
        >
          {coverImage ? (
            <img
              src={coverImage}
              alt={project.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-4xl opacity-80">🏗️</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
          <div className="absolute top-4 left-4">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(
                project.status
              )} backdrop-blur-sm`}
            >
              {project.status}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-xl capitalize font-bold text-white truncate drop-shadow-lg">
              {project.name}
            </h3>
          </div>
        </div>

        {/* Progress Section */}
        <div className="">
          <div className="mb-4 px-2">
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-gray-600 font-medium">Progress</span>
              <span className="font-bold text-gray-900">
                {/* {project.progress}% */}
                {project.progress != null
                  ? Number(project.progress).toFixed(2)
                  : "0%"}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`rounded-full h-2.5 transition-all duration-1000 ${
                  Number(project.progress) === 100
                    ? "bg-green-500"
                    : Number(project.progress) > 0
                    ? "bg-gradient-to-r from-green-500 via-green-600 to-green-700"
                    : "bg-gray-300"
                }`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <button
            onClick={() => setIsDetailsOpen(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-1 px-4 rounded-full font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Details Modal */}
      <ProjectDetailsModal
        project={project}
        setProject={setProject}
        open={isDetailsOpen}
        setOpen={setIsDetailsOpen}
      />
    </>
  );
}
