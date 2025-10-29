"use client";

import { Fragment, useEffect, useState } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import ProjectFinancialSummary from "./ProjectFinancialSummary";

// Simple icon fallbacks using emojis
const IconWrapper = ({ children, className = "" }) => (
  <div className={`flex items-center justify-center w-5 h-5 ${className}`}>
    {children}
  </div>
);

export default function ProjectDetailsModal({
  project,
  setProject,
  open,
  setOpen,
}) {
  // local synced copy of project (keeps modal reactive)
  const [selectedProject, setSelectedProject] = useState(project);

  // image gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  // tasks and phases
  const [tasks, setTasks] = useState([]);
  const [phases, setPhases] = useState([]);

  // UI state
  const [showTasks, setShowTasks] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState({});
  const [uploading, setUploading] = useState(false);
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [editedPhases, setEditedPhases] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // keep selectedProject in sync with prop changes
  useEffect(() => {
    setSelectedProject(project);
    setEditedProject(project || {});
  }, [project]);

  // Fetch tasks and phases when modal opens
  useEffect(() => {
    if (open && project?.id) {
      fetchPhases();
      fetchTasks();
      setShowTasks(false);
      setIsEditing(false);
    }
  }, [open, project?.id]);

  // Set editedPhases when phases change
  useEffect(() => {
    setEditedPhases(
      phases.map((phase) => ({
        ...phase,
        tasks: phase.tasks.map((task) => ({ ...task })),
      }))
    );
  }, [phases]);

  // ---------- Helpers ----------
  const parseApiList = (resJson) => {
    // backend might return { data: [...] } or directly [...]
    if (!resJson) return [];
    return Array.isArray(resJson) ? resJson : resJson.data ?? [];
  };

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

  const getImagesArray = () => {
    const source = isEditing ? editedProject : selectedProject;
    return parseImages(source?.images);
  };

  // ---------- Fetching ----------
  const fetchTasks = async () => {
    setLoadingTasks(true);
    try {
      const res = await fetch(`/api/tasks?projectId=${project.id}`);
      const json = await res.json();
      const tasksList = parseApiList(json);

      // set tasks array
      setTasks(tasksList);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchPhases = async () => {
    setLoadingPhases(true);
    try {
      const res = await fetch(`/api/phases?projectId=${project.id}`);
      const json = await res.json();
      const phasesList = parseApiList(json);

      // Ensure phases have tasks array slot for client grouping
      const phasesWithTasks = phasesList.map((p) => ({ ...p, tasks: [] }));
      setPhases(phasesWithTasks);
    } catch (error) {
      console.error("Error fetching phases:", error);
      toast.error("Failed to load phases");
    } finally {
      setLoadingPhases(false);
    }
  };

  // Keep tasks grouped under phases for UI convenience
  useEffect(() => {
    // only do grouping when both fetched
    if (loadingTasks || loadingPhases) return;

    // copy phases
    const grouped = phases.map((p) => ({ ...p, tasks: [] }));

    // attach each task under its phase_id
    tasks.forEach((t) => {
      const phaseIndex = grouped.findIndex((p) => p.id === t.phase_id);
      if (phaseIndex >= 0) {
        grouped[phaseIndex].tasks.push(t);
      } else {
        // If phase not found, you could optionally create a fallback phase
      }
    });

    setPhases(grouped);
  }, [tasks, loadingTasks, loadingPhases]); // react when tasks or phases change

  // ---------- Weighted calculation utils ----------
  // Calculate weighted average given items and their weight field name(s)
  // Items: [{progress: number, weight?: number, share?: number}, ...]
  // Weight preference: weight -> share -> fallback equal
  function calculateWeightedProgress(items) {
    if (!items || items.length === 0) return 0;

    // try gather weights (weight or share)
    const rawWeights = items.map((it) => {
      if (it.weight != null) return Number(it.weight);
      if (it.share != null) return Number(it.share);
      return null;
    });

    const hasWeights = rawWeights.some((w) => w != null);

    if (!hasWeights) {
      // equal weighting
      const sum = items.reduce((s, it) => s + Number(it.progress || 0), 0);
      return sum / items.length;
    }

    // normalize weights (if total != 100 or total === 0)
    const totalRaw = rawWeights.reduce((s, w) => s + (w || 0), 0) || 0;
    // if totalRaw is 0, fallback to equal
    if (totalRaw === 0) {
      const sum = items.reduce((s, it) => s + Number(it.progress || 0), 0);
      return sum / items.length;
    }

    // weighted sum: Σ(progress * (weight/totalRaw))
    const weighted = items.reduce((acc, it, idx) => {
      const weight = rawWeights[idx] || 0;
      return acc + Number(it.progress || 0) * (weight / totalRaw);
    }, 0);

    return weighted;
  }

  // ---------- Update chain: task -> phase -> project ----------
  // updateTask sends PUT to /api/tasks/:id with numeric progress and/or status
  const updateTaskOnServer = async (taskPatch) => {
    // taskPatch must include id
    try {
      const res = await fetch(`/api/tasks/${taskPatch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskPatch),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed updating task");
      }
      const json = await res.json();
      // json might be { data: {...} } or {...}
      const updated = json.data ?? json;
      return updated;
    } catch (err) {
      console.error("updateTaskOnServer error:", err);
      throw err;
    }
  };

  // updatePhaseOnServer updates phase progress & status
  const updatePhaseOnServer = async (phaseId, patch) => {
    try {
      const res = await fetch(`/api/phases/${phaseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed updating phase");
      const json = await res.json();
      return json.data ?? json;
    } catch (err) {
      console.error("updatePhaseOnServer error:", err);
      throw err;
    }
  };

  // updateProjectOnServer updates project progress & status
  const updateProjectOnServer = async (projectId, patch) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed updating project");
      const json = await res.json();
      return json.data ?? json;
    } catch (err) {
      console.error("updateProjectOnServer error:", err);
      throw err;
    }
  };

  // Recalculate a single phase progress from current client tasks and persist it
  const recalcAndPersistPhase = async (phaseId) => {
    // find phase in current phases state
    const phase = phases.find((p) => p.id === phaseId);
    if (!phase) return null;

    const tasksInPhase = phase.tasks ?? [];
    const phaseProgress = calculateWeightedProgress(tasksInPhase);
    const roundedPhaseProgress = Number(
      parseFloat(phaseProgress || 0).toFixed(2)
    );
    const phaseStatus =
      roundedPhaseProgress >= 100
        ? "Completed"
        : roundedPhaseProgress > 0
        ? "In Progress"
        : "Pending";

    // persist to server
    await updatePhaseOnServer(phaseId, {
      progress: roundedPhaseProgress,
      status: phaseStatus,
    });

    // update local phases array
    const newPhases = phases.map((p) =>
      p.id === phaseId
        ? { ...p, progress: roundedPhaseProgress, status: phaseStatus }
        : p
    );
    setPhases(newPhases);

    return newPhases;
  };

  // Recalculate overall project from phases (client phases) and persist
  const recalcAndPersistProject = async (phasesArray = null) => {
    const currentPhases = phasesArray ?? phases;
    if (!currentPhases || currentPhases.length === 0) {
      // if none, set project progress to 0
      await updateProjectOnServer(project.id, {
        progress: 0,
        status: "Pending",
      }).catch(() => {});
      setProject((prev) => ({ ...prev, progress: 0, status: "Pending" }));
      return;
    }

    const projectProgress = calculateWeightedProgress(
      currentPhases.map((p) => ({
        progress: p.progress,
        weight: p.weight ?? p.share,
      }))
    );
    const roundedProjectProgress = Number(
      parseFloat(projectProgress || 0).toFixed(2)
    );
    const projectStatus =
      roundedProjectProgress >= 100
        ? "Completed"
        : roundedProjectProgress > 0
        ? "In Progress"
        : "Pending";

    // persist to server
    await updateProjectOnServer(project.id, {
      progress: roundedProjectProgress,
      status: projectStatus,
    });

    // update parent project state
    setProject((prev) => ({
      ...prev,
      progress: roundedProjectProgress,
      status: projectStatus,
    }));
    setSelectedProject((prev) => ({
      ...prev,
      progress: roundedProjectProgress,
      status: projectStatus,
    }));
  };

  // Full chain: after a task has been updated on server & client, recalc the phase and project
  const recalcChain = async (phaseId) => {
    try {
      const newPhases = await recalcAndPersistPhase(phaseId);
      if (newPhases) {
        await recalcAndPersistProject(newPhases);
      }
      // refresh tasks & phases from server to ensure UI is in sync
      await Promise.all([fetchTasks(), fetchPhases()]);
    } catch (err) {
      console.error("recalcChain error:", err);
    }
  };

  // ---------- UI actions ----------

  // Local update for task progress
  const handleLocalTaskProgressChange = (phaseId, taskId, newValue) => {
    const value = Number(newValue);
    if (isNaN(value) || value < 0 || value > 100) return;

    setEditedPhases((prev) =>
      prev.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              tasks: phase.tasks.map((t) =>
                t.id === taskId ? { ...t, progress: value } : t
              ),
            }
          : phase
      )
    );
  };

  // Submit all changes
  const handleSubmitUpdates = async () => {
    setUpdating(true);
    try {
      // Collect all changed tasks
      const updates = [];
      editedPhases.forEach((editedPhase) => {
        const originalPhase = phases.find((p) => p.id === editedPhase.id);
        editedPhase.tasks.forEach((editedTask) => {
          const originalTask = originalPhase.tasks.find(
            (t) => t.id === editedTask.id
          );
          if (editedTask.progress !== originalTask.progress) {
            updates.push({
              id: editedTask.id,
              progress: editedTask.progress,
            });
          }
        });
      });

      // Update each changed task sequentially
      for (const patch of updates) {
        await updateTaskOnServer(patch);
      }

      // Refresh data
      await Promise.all([fetchTasks(), fetchPhases()]);

      toast.success("Tasks updated successfully");
    } catch (err) {
      console.error("Error updating tasks:", err);
      toast.error("Failed to update tasks");
    } finally {
      setUpdating(false);
    }
  };

  // Toggle task status (uses PUT /api/tasks/:id for consistency)
  const toggleTaskStatus = async (task) => {
    try {
      const newStatus = task.status === "Completed" ? "Pending" : "Completed";
      const patch = {
        id: task.id,
        status: newStatus,
        progress: newStatus === "Completed" ? 100 : task.progress || 0,
      };
      const updated = await updateTaskOnServer(patch);

      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t))
      );
      await recalcChain(task.phase_id);
      toast.success("Task status updated");
    } catch (err) {
      console.error("Error updating task status:", err);
      toast.error("Failed to update status");
    }
  };

  // ---------- Image upload / remove (kept from your original) ----------
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

        // Upload to Supabase via API
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", selectedProject.id); // Always use existing project ID

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Upload failed for ${file.name}`);
        }

        const data = await response.json();
        return data.secure_url;
      });

      // Update previews immediately for better UX
      const currentImages = getImagesArray();
      setEditedProject((prev) => ({
        ...prev,
        images: [...currentImages, ...newPreviews],
      }));
      setSelectedProject((prev) => ({
        ...prev,
        images: [...currentImages, ...newPreviews],
      }));

      // Wait for all uploads to complete
      const uploadedUrls = await Promise.all(uploadPromises);

      // Update with actual URLs
      const newImages = [...currentImages, ...uploadedUrls];
      setEditedProject((prev) => ({ ...prev, images: newImages }));
      setSelectedProject((prev) => ({ ...prev, images: newImages }));

      // Update database in background
      await updateProjectImages(newImages);

      // Clean up previews
      newPreviews.forEach((u) => URL.revokeObjectURL(u));

      toast.success(`Successfully uploaded ${uploadedUrls.length} image(s)!`, {
        id: uploadToast,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error(`Upload failed: ${error.message}`, {
        id: uploadToast,
        duration: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async (index) => {
    const currentImages = getImagesArray();
    const imageToRemove = currentImages[index];
    const removeToast = toast.loading("Removing image...");

    try {
      if (imageToRemove && imageToRemove.includes("supabase.co")) {
        const url = new URL(imageToRemove);
        const pathParts = url.pathname.split("/");
        const filePath = pathParts.slice(5).join("/");

        if (filePath) {
          const response = await fetch("/api/upload/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filePath }),
          });
          if (!response.ok)
            console.error("Failed to delete image from storage");
        }
      }

      // Update local state
      const newImages = currentImages.filter((_, i) => i !== index);
      setEditedProject((prev) => ({ ...prev, images: newImages }));
      setSelectedProject((prev) => ({ ...prev, images: newImages }));

      // Update database in background
      await updateProjectImages(newImages);

      if (selectedImageIndex >= newImages.length) {
        setSelectedImageIndex(Math.max(0, newImages.length - 1));
      }

      if (imageToRemove.startsWith("blob:")) URL.revokeObjectURL(imageToRemove);

      toast.success("Image removed successfully!", { id: removeToast });
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image. Please try again.", {
        id: removeToast,
      });
    }
  };

  const updateProjectImages = async (imagesArray) => {
    try {
      const res = await fetch(`/api/projects?id=${selectedProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: imagesArray }),
      });
      if (!res.ok) console.error("Failed to update project images");
    } catch (error) {
      console.error("Error updating project images:", error);
    }
  };

  // ---------- Edit / Save project ----------
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/projects?id=${selectedProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProject),
      });
      if (res.ok) {
        const updatedJson = await res.json();
        const updatedProject = updatedJson.data ?? updatedJson;
        // update parent + local
        setProject(updatedProject);
        setSelectedProject(updatedProject);
        setIsEditing(false);
        toast.success("Project updated");
      } else {
        console.error("Failed to update project");
        toast.error("Failed to save project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Error saving project");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProject(project);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditedProject((prev) => ({ ...prev, [field]: value }));
  };

  // ---------- Reports ----------
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatBudget = (budget) => {
    if (!budget) return "Not specified";
    if (typeof budget === "string" && budget.includes("ETB")) return budget;
    const numericBudget =
      typeof budget === "string" ? parseFloat(budget) : budget;
    if (!isNaN(numericBudget)) return `ETB ${numericBudget.toLocaleString()}`;
    return `ETB ${budget}`;
  };

  const generatePDFReport = () => {
    const project = selectedProject || {};

    // Helper to capitalize text like in your modal
    const capitalizeModalText = (text) => {
      if (!text) return "Not specified";
      return text
        .toString()
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    };

    const reportContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${project.name || "Project"} Report</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
          margin: 40px; 
          color: #111827;
          line-height: 1.5;
          background: white;
        }
        
        /* Header Section */
        .project-header {
          margin-bottom: 24px;
        }
        .project-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
          text-transform: capitalize;
        }
        .badge-container {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .badge {
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: 500;
          border: 1px solid;
        }
        .status-badge { 
          background: #dbeafe; 
          color: #1e40af;
          border-color: #bfdbfe;
        }
        .priority-badge { 
          background: #fef3c7; 
          color: #92400e;
          border-color: #fde68a;
        }
        .phase-badge { 
          background: #f3e8ff; 
          color: #7c3aed;
          border-color: #e9d5ff;
        }
        
        /* Progress Section - Exact match to modal */
        .progress-section {
          margin: 24px 0;
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
        }
        .progress-label {
          font-weight: 500;
          color: #374151;
        }
        .progress-value {
          font-weight: 700;
          color: #111827;
        }
        .progress-bar-container {
          width: 100%;
          background: #e5e7eb;
          border-radius: 6px;
          height: 12px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 6px;
          background: linear-gradient(90deg, #10b981, #059669);
          transition: width 0.3s ease;
        }
        
        /* Description Section */
        .description-section {
          margin: 24px 0;
        }
        .description-label {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
        }
        .description-text {
          color: #6b7280;
          line-height: 1.6;
          text-transform: capitalize;
        }
        
        /* Details Grid - Two column layout */
        .details-section {
          margin: 24px 0;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .detail-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
        }
        .detail-icon {
          width: 20px;
          text-align: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .detail-content {
          flex: 1;
        }
        .detail-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        .detail-value {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          text-transform: capitalize;
        }
        
        /* Tasks Section - Two column grid */
        .tasks-section {
          margin: 32px 0;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }
        .tasks-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .task-item {
          background: #f8fafc;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }
        .task-name {
          font-weight: 500;
          color: #374151;
          margin-bottom: 4px;
          text-transform: capitalize;
        }
        .task-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }
        .task-status {
          color: #6b7280;
          text-transform: capitalize;
        }
        .task-progress {
          font-weight: 600;
          color: #059669;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          color: #9ca3af;
          font-size: 12px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        
        @media print {
          body { margin: 20px; }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="project-header">
        <h1 class="project-title">${capitalizeModalText(project.name)}</h1>
        <div class="badge-container">
          <span class="badge status-badge">${
            project.status || "No Status"
          }</span>
          <span class="badge priority-badge">${
            project.priority || "No Priority"
          } Priority</span>
          <span class="badge phase-badge">${project.phase || "No Phase"}</span>
        </div>
      </div>
      
      <!-- Progress -->
      <div class="progress-section">
        <div class="progress-header">
          <span class="progress-label">Project Progress</span>
          <span class="progress-value">${project.progress || 0}%</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${
            project.progress || 0
          }%"></div>
        </div>
      </div>
      
      <!-- Description -->
      ${
        project.description
          ? `
      <div class="description-section">
        <div class="description-label">Description</div>
        <div class="description-text">${capitalizeModalText(
          project.description
        )}</div>
      </div>
      `
          : ""
      }
      
      <!-- Project Details Grid -->
      <div class="details-section">
        <div class="details-grid">
          <div class="detail-item">
            <div class="detail-icon">🏢</div>
            <div class="detail-content">
              <div class="detail-label">Client</div>
              <div class="detail-value">${capitalizeModalText(
                project.client || "Not specified"
              )}</div>
            </div>
          </div>
          
          <div class="detail-item">
            <div class="detail-icon">👤</div>
            <div class="detail-content">
              <div class="detail-label">Project Manager</div>
              <div class="detail-value">${capitalizeModalText(
                project.project_manager || "Not specified"
              )}</div>
            </div>
          </div>
          
          <div class="detail-item">
            <div class="detail-icon">📍</div>
            <div class="detail-content">
              <div class="detail-label">Location</div>
              <div class="detail-value">${capitalizeModalText(
                project.location || "Not specified"
              )}</div>
            </div>
          </div>
          
          <div class="detail-item">
            <div class="detail-icon">📄</div>
            <div class="detail-content">
              <div class="detail-label">Contract Number</div>
              <div class="detail-value">${capitalizeModalText(
                project.contract_number || "Not specified"
              )}</div>
            </div>
          </div>
          
          <div class="detail-item">
            <div class="detail-icon">📅</div>
            <div class="detail-content">
              <div class="detail-label">Start Date</div>
              <div class="detail-value">${formatDate(project.start_date)}</div>
            </div>
          </div>
          
          <div class="detail-item">
            <div class="detail-icon">🏁</div>
            <div class="detail-content">
              <div class="detail-label">End Date</div>
              <div class="detail-value">${formatDate(project.end_date)}</div>
            </div>
          </div>
          
          <div class="detail-item">
            <div class="detail-icon">💰</div>
            <div class="detail-content">
              <div class="detail-label">Budget</div>
              <div class="detail-value">${formatBudget(project.budget)}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tasks Section - Two Column Grid -->
      ${
        tasks.length > 0
          ? `
      <div class="tasks-section">
        <div class="section-title">Tasks</div>
        <div class="tasks-grid">
          ${tasks
            .map(
              (task) => `
            <div class="task-item">
              <div class="task-name">${capitalizeModalText(
                task.task_name || "Unnamed Task"
              )}</div>
              <div class="task-meta">
                <span class="task-status">${task.status || "No Status"}</span>
                <span class="task-progress">${task.progress || 0}%</span>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      `
          : ""
      }
      
      <div class="footer">
        Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
      </div>
    </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(reportContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleDownloadReport = (format = "pdf") => {
    // Helper function to capitalize text
    const capitalizeText = (text) => {
      if (!text) return "Not specified";
      return text
        .toString()
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    // Helper function to capitalize task status
    const capitalizeStatus = (status) => {
      if (!status) return "";
      return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    switch (format) {
      case "pdf":
        generatePDFReport();
        break;
      case "json":
        // Create JSON report
        const report = {
          projectName: selectedProject.name,
          status: selectedProject.status,
          priority: selectedProject.priority,
          progress: `${selectedProject.progress}%`,
          client: selectedProject.client,
          projectManager: selectedProject.project_manager,
          location: selectedProject.location,
          startDate: formatDate(selectedProject.start_date),
          endDate: formatDate(selectedProject.end_date),
          budget: formatBudget(selectedProject.budget),
          description: selectedProject.description,
          tasks: tasks.map((task) => ({
            name: task.task_name,
            status: task.status,
          })),
          generatedAt: new Date().toLocaleString(),
        };

        const reportData = JSON.stringify(report, null, 2);
        const blob = new Blob([reportData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedProject.name.replace(/\s+/g, "_")}_report.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        break;

      default:
        generatePDFReport();
    }
  };

  // ---------- UI helpers ----------
  const getPriorityColor = (priority) => {
    const colors = {
      Low: "bg-green-100 text-green-800",
      Medium: "bg-yellow-100 text-yellow-800",
      High: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status) => {
    const colors = {
      Planning: "bg-yellow-100 text-yellow-800",
      "In Progress": "bg-blue-100 text-blue-800",
      "On Hold": "bg-orange-100 text-orange-800",
      Completed: "bg-green-100 text-green-800",
      Cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // defaults & images
  const defaultImage =
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80";
  const currentImages = getImagesArray();
  const hasImages = currentImages.length > 0;

  // ---------- Render ----------
  return (
    <>
      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setOpen}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed overflow-y-auto inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-blur-sm" />
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
                <DialogPanel className="relative transform overflow-y-auto rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-6xl max-h-[90vh]">
                  {/* Close Button */}
                  <div className="absolute right-4 top-4 z-10">
                    <button
                      type="button"
                      className="rounded-full bg-white/90 p-2 text-gray-400 hover:text-gray-500 backdrop-blur-sm transition-all hover:scale-110"
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-xl">×</span>
                    </button>
                  </div>

                  <div className="flex flex-col lg:flex-row">
                    {/* Image Gallery */}
                    <div className="lg:w-1/2">
                      <div className="relative h-80 sm:h-96 lg:h-full">
                        <img
                          src={
                            currentImages.length > 0
                              ? currentImages[selectedImageIndex]
                              : defaultImage
                          }
                          alt={selectedProject?.name}
                          className="h-full w-full object-cover"
                        />

                        {/* Image Navigation */}
                        {currentImages.length > 1 && (
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {currentImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all ${
                                  selectedImageIndex === index
                                    ? "bg-white scale-125"
                                    : "bg-white/50 hover:bg-white/80"
                                }`}
                              />
                            ))}
                          </div>
                        )}

                        {/* Edit Mode Overlay */}
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="text-2xl mb-2">🖼️</div>
                              <p className="text-sm">
                                Click below to manage images
                              </p>
                            </div>
                          </div>
                        )}

                        {/* No Images Indicator */}
                        {!hasImages && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🖼️</div>
                              <p className="text-gray-500 text-sm">
                                No images available
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Image Management Section */}
                      {isEditing && (
                        <div className="p-4 bg-blue-50 border-t border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-blue-900">
                              Manage Images
                            </h4>
                            {uploading && (
                              <div className="flex items-center text-sm text-blue-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                Uploading...
                              </div>
                            )}
                          </div>

                          {/* Upload Button */}
                          <label className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center cursor-pointer hover:bg-blue-700 transition-colors mb-3 disabled:bg-blue-400 disabled:cursor-not-allowed">
                            <span>
                              {uploading ? "Uploading..." : "Upload Images"}
                            </span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>

                          {/* Image Thumbnails with Remove Option */}
                          {currentImages.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-sm text-blue-700">
                                {currentImages.length} image(s) in project
                                folder - Click × to remove
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {currentImages.map((image, index) => (
                                  <div key={index} className="relative">
                                    <button
                                      onClick={() => removeImage(index)}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs z-10 hover:bg-red-600 transition-colors shadow-lg"
                                      title="Remove image"
                                    >
                                      ×
                                    </button>
                                    <img
                                      src={image}
                                      alt={`Project image ${index + 1}`}
                                      className="w-20 h-20 rounded-lg object-cover border-2 border-blue-300 hover:border-blue-500 transition-colors"
                                      onError={(e) => {
                                        e.target.src = defaultImage;
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Thumbnail Strip (Non-edit mode) */}
                      {!isEditing && currentImages.length > 1 && (
                        <div className="flex space-x-2 p-4 bg-gray-50 overflow-x-auto">
                          {currentImages.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                selectedImageIndex === index
                                  ? "border-blue-500 ring-2 ring-blue-200"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <img
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Project Details */}
                    <div className="lg:w-1/2 p-6 sm:p-8 overflow-y-auto">
                      {/* Header */}
                      <div className="mb-6">
                        <div className="flex items-start justify-between mb-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedProject.name || ""}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value)
                              }
                              className="text-2xl font-bold text-gray-900 pr-8 border-b-2 border-blue-500 focus:outline-none focus:border-blue-700 w-full capitalize"
                            />
                          ) : (
                            <DialogTitle
                              as="h2"
                              className="text-2xl capitalize font-bold text-gray-900 pr-8"
                            >
                              {selectedProject?.name}
                            </DialogTitle>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {isEditing ? (
                            <>
                              <select
                                value={editedProject.status || ""}
                                onChange={(e) =>
                                  handleInputChange("status", e.target.value)
                                }
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-gray-300 focus:outline-none focus:border-blue-500"
                              >
                                <option value="Planning">Planning</option>
                                <option value="In Progress">In Progress</option>
                                <option value="On Hold">On Hold</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                              <select
                                value={editedProject.priority || ""}
                                onChange={(e) =>
                                  handleInputChange("priority", e.target.value)
                                }
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-gray-300 focus:outline-none focus:border-blue-500"
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </select>
                              <input
                                type="text"
                                value={editedProject.phase || ""}
                                onChange={(e) =>
                                  handleInputChange("phase", e.target.value)
                                }
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border-2 border-gray-300 focus:outline-none focus:border-blue-500 w-32 capitalize"
                                placeholder="Phase"
                              />
                            </>
                          ) : (
                            <>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                  selectedProject?.status
                                )}`}
                              >
                                {selectedProject?.status}
                              </span>
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                                  selectedProject?.priority
                                )}`}
                              >
                                {selectedProject?.priority} Priority
                              </span>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                {selectedProject?.phase}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center text-sm mb-2">
                          <span className="font-medium text-gray-700">
                            Project Progress
                          </span>
                          <span className="font-bold text-gray-900">
                            {selectedProject?.progress != null
                              ? Number(selectedProject.progress).toFixed(2)
                              : "0.00"}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`rounded-full h-3 transition-all duration-1000 ${
                              Number(selectedProject?.progress) === 100
                                ? "bg-green-500"
                                : Number(selectedProject?.progress) > 0
                                ? "bg-gradient-to-r from-green-500 via-green-600 to-green-700"
                                : "bg-gray-300"
                            }`}
                            style={{
                              width: `${selectedProject?.progress ?? 0}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Tasks List - Collapsible */}
                      <div className="mb-6">
                        <button
                          onClick={() => setShowTasks(!showTasks)}
                          className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <h3 className="font-semibold text-gray-900">
                            Phases/Tasks
                          </h3>
                          <span className="transform transition-transform duration-200">
                            {showTasks ? "▼" : "▶"}
                          </span>
                        </button>
                      </div>

                      {/* Description */}
                      {selectedProject?.description && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-gray-900 mb-2">
                            Description
                          </h3>
                          {isEditing ? (
                            <textarea
                              value={editedProject.description || ""}
                              onChange={(e) =>
                                handleInputChange("description", e.target.value)
                              }
                              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none h-24 capitalize"
                              placeholder="Project description..."
                            />
                          ) : (
                            <p className="text-gray-600 capitalize leading-relaxed">
                              {selectedProject?.description}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Project Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {[
                          {
                            key: "client",
                            label: "Client",
                            icon: "🏢",
                            editable: true,
                          },
                          {
                            key: "project_manager",
                            label: "Project Manager",
                            icon: "👤",
                            editable: true,
                          },
                          {
                            key: "location",
                            label: "Location",
                            icon: "📍",
                            editable: true,
                          },
                          {
                            key: "contract_number",
                            label: "Contract Number",
                            icon: "📄",
                            editable: true,
                          },
                          {
                            key: "start_date",
                            label: "Start Date",
                            icon: "📅",
                            editable: false,
                          },
                          {
                            key: "end_date",
                            label: "End Date",
                            icon: "🏁",
                            editable: false,
                          },
                          {
                            key: "budget",
                            label: "Budget",
                            icon: "💰",
                            editable: true,
                          },
                        ].map(({ key, label, icon, editable }) => (
                          <div
                            key={key}
                            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <IconWrapper>{icon}</IconWrapper>
                            <div className="flex-1">
                              <p className="text-xs text-gray-500">{label}</p>
                              {isEditing && editable ? (
                                <input
                                  type="text"
                                  value={editedProject[key] || ""}
                                  onChange={(e) =>
                                    handleInputChange(key, e.target.value)
                                  }
                                  className="w-full font-medium text-gray-900 border-b-2 border-blue-500 focus:outline-none focus:border-blue-700 capitalize"
                                />
                              ) : (
                                <p className="font-medium text-gray-900 capitalize">
                                  {key.includes("date")
                                    ? formatDate(project[key])
                                    : key === "budget"
                                    ? formatBudget(project[key])
                                    : project[key] || "Not specified"}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => {
                                handleSave();
                                // isUpdating(true);
                              }}
                              disabled={isUpdating}
                              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                            >
                              {isUpdating ? (
                                <div className="flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                </div>
                              ) : (
                                "Save Changes"
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={handleEdit}
                              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
                            >
                              Edit Project
                            </button>
                            <div className="flex-1 relative group">
                              <button
                                onClick={() => handleDownloadReport("pdf")}
                                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                              >
                                Download Report
                              </button>
                              <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                                <button
                                  onClick={() => handleDownloadReport("pdf")}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg border-b border-gray-100 dark:border-gray-600 text-gray-900 dark:text-white"
                                >
                                  📄 PDF Report
                                </button>
                                <button
                                  onClick={() => handleDownloadReport("json")}
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg text-gray-900 dark:text-white"
                                >
                                  ⚙️ JSON Data
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                        {/* </div> */}
                      </div>

                      {/* Financial Summary Section - Added right below action buttons */}
                      {project?.id && (
                        <div className="bg-white mt-2 rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                          <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Financial Overview
                          </h2>
                          <ProjectFinancialSummary projectId={project.id} />
                        </div>
                      )}
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* Slide Drawer - FIXED: Using correct component names */}
      <Transition show={showTasks} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowTasks(false)}
        >
          {/* Overlay */}
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 flex justify-end">
            <TransitionChild
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <DialogPanel className="w-full max-w-md h-full bg-white shadow-xl overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Phase / Task Details
                  </h2>
                  <button
                    onClick={() => setShowTasks(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {loadingTasks || loadingPhases ? (
                  <p className="text-gray-500">Loading details...</p>
                ) : (
                  <>
                    {editedPhases.map((phase) => (
                      <div key={phase.id} className="mb-6 border-b pb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-lg text-blue-700">
                            {phase.name}
                          </h3>
                          <span className="text-sm text-gray-600">
                            {phase.progress != null
                              ? Number(phase.progress).toFixed(2)
                              : "0.00"}
                            %
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className="h-2 rounded-full bg-green-500 transition-all duration-500"
                            style={{ width: `${phase.progress ?? 0}%` }}
                          />
                        </div>

                        <div className="space-y-2">
                          {(phase.tasks ?? []).map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-gray-800">
                                  {task.task_name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Share: {task.weight ?? task.share ?? "auto"}
                                </p>
                              </div>

                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={task.progress ?? 0}
                                  onChange={(e) =>
                                    handleLocalTaskProgressChange(
                                      phase.id,
                                      task.id,
                                      e.target.value
                                    )
                                  }
                                  className="w-20 text-black text-center border rounded-md px-2 py-1"
                                />
                                <span className="text-sm text-gray-500">%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleSubmitUpdates}
                      disabled={updating}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400"
                    >
                      {updating ? "Updating..." : "Submit Updates"}
                    </button>
                  </>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
