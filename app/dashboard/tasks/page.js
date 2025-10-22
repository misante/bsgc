"use client";

import { useEffect, useState } from "react";
import {
  PlusCircle,
  ClipboardList,
  Loader2,
  Edit3,
  Trash2,
  X,
  Save,
  Loader,
} from "lucide-react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
// import ExportPdfButton from "@/components/tasks/ExportPdfButton";
import dynamic from "next/dynamic";
import ErrorBoundary from "@/components/tasks/ErrorBoundary";

// Dynamically import ExportPdfButton with SSR disabled
const ExportPdfButton = dynamic(
  () => import("@/components/tasks/ExportPdfButton"),
  {
    ssr: false,
  }
);

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isCommonModalOpen, setIsCommonModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [commonTaskLoading, setCommonTaskLoading] = useState(false);
  const [customTaskLoading, setCustomTaskLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // New: project filter + selected task modal state
  const [projectFilter, setProjectFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
  const [detailDeleting, setDetailDeleting] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchStaff();
  }, []);

  useEffect(() => {
    if (tasks && projects) {
      console.log("tasks:", tasks, "projects:", projects);
    }
  }, [tasks, projects]);

  // ✅ Register Poppins font
  // Font.register({
  //   family: "Poppins",
  //   src: "/fonts/Poppins-Regular.ttf",
  // });
  // const styles = StyleSheet.create({
  //   page: {
  //     padding: 25,
  //     fontFamily: "Poppins",
  //     fontSize: 9,
  //     backgroundColor: "#FFFFFF", // ensure white background
  //     color: "#111111", // readable text color
  //   },
  //   header: {
  //     fontSize: 16,
  //     marginBottom: 12,
  //     textAlign: "center",
  //     textTransform: "uppercase",
  //     color: "#222222",
  //   },
  //   table: {
  //     display: "table",
  //     width: "auto",
  //     borderStyle: "solid",
  //     borderColor: "#cccccc",
  //     borderWidth: 1,
  //   },
  //   tableRow: {
  //     flexDirection: "row",
  //   },
  //   // Column widths — consistent for all rows
  //   colTask: {
  //     flex: 2.2,
  //     borderRightWidth: 1,
  //     borderColor: "#cccccc",
  //     padding: 4,
  //   },
  //   colProject: {
  //     flex: 2.2,
  //     borderRightWidth: 1,
  //     borderColor: "#cccccc",
  //     padding: 4,
  //   },
  //   col: { flex: 1.2, borderRightWidth: 1, borderColor: "#cccccc", padding: 4 },
  //   colEnd: { flex: 1.2, padding: 4 }, // last column, no border-right
  //   headerText: {
  //     fontSize: 10,
  //     fontWeight: "bold",
  //     color: "#222222",
  //     textTransform: "capitalize",
  //   },
  //   cellText: {
  //     fontSize: 9,
  //     color: "#333333",
  //   },
  //   rowAlt: {
  //     backgroundColor: "#f9f9f9", // alternating background for readability
  //   },
  // });

  const phases = [
    "Pre-Construction",
    "Construction Phase",
    "Post-Construction",
  ];

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const result = await res.json();

      // Validate and ensure data is always an array
      const tasksData = Array.isArray(result?.data) ? result.data : [];

      // Clean each task object
      const cleanedTasks = tasksData.map((task) => ({
        id: task.id || "",
        task_name: task.task_name || "Unnamed Task",
        project_id: task.project_id || "",
        assigned_to: task.assigned_to || "",
        priority: task.priority || "Medium",
        status: task.status || "Pending",
        start_date: task.start_date || "",
        end_date: task.end_date || "",
        description: task.description || "",
        progress: task.progress || 0,
        phase: task.phase || "",
      }));

      setTasks(cleanedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/manpower");
      const data = await res.json();
      setStaff(data || []);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  // Add handlers (unchanged)
  const handleAddCommonTask = async (e) => {
    e.preventDefault();
    setCommonTaskLoading(true);
    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/task-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add common task");
      e.target.reset();
      setIsCommonModalOpen(false);
      toast.success("Common task added successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error adding common task");
    } finally {
      setCommonTaskLoading(false);
    }
  };

  const handleAddCustomTask = async (e) => {
    e.preventDefault();
    setCustomTaskLoading(true);

    const formData = new FormData(e.target);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add custom task");
      e.target.reset();
      setIsCustomModalOpen(false);
      await fetchTasks();
      toast.success("Custom task added successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error adding custom task");
    } finally {
      setCustomTaskLoading(false);
    }
  };

  // Filtering by tab and project
  const filteredByTab =
    activeTab === "all"
      ? Array.isArray(tasks)
        ? tasks
        : []
      : Array.isArray(tasks)
      ? tasks.filter((t) => t?.status === activeTab)
      : [];

  const filteredTasks = projectFilter
    ? filteredByTab.filter(
        (t) => t && String(t.project_id) === String(projectFilter)
      )
    : filteredByTab;

  // Row click -> open detail modal
  const openTaskDetail = (task) => {
    if (!task || !task.id) {
      toast.error("Invalid task data");
      return;
    }

    // Create a safe copy with default values
    const safeTask = {
      id: task.id || "",
      task_name: task.task_name || "",
      project_id: task.project_id || "",
      assigned_to: task.assigned_to || "",
      priority: task.priority || "Medium",
      status: task.status || "Pending",
      start_date: task.start_date || "",
      end_date: task.end_date || "",
      description: task.description || "",
      progress: task.progress || 0,
      phase: task.phase || "",
    };

    setSelectedTask(safeTask);
    setIsDetailOpen(true);
  };

  const closeTaskDetail = () => {
    setIsDetailOpen(false);
    setSelectedTask(null);
  };

  // Inline edit handlers for the detail modal
  const updateSelected = (key, value) => {
    setSelectedTask((s) => ({ ...s, [key]: value }));
  };

  // Save edits
  const saveTaskDetail = async () => {
    if (!selectedTask) return;

    // Validate and clean the data
    const cleanedTask = {
      ...selectedTask,
      task_name: selectedTask.task_name || "",
      project_id: selectedTask.project_id || "",
      assigned_to: selectedTask.assigned_to || "",
      priority: selectedTask.priority || "Medium",
      status: selectedTask.status || "Pending",
      start_date: selectedTask.start_date || "",
      end_date: selectedTask.end_date || "",
      description: selectedTask.description || "",
      progress: selectedTask.progress || 0,
    };

    setDetailSaving(true);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedTask),
      });

      if (!res.ok) throw new Error("Failed to save task");
      await fetchTasks();
      toast.success("Task updated successfully");
      closeTaskDetail();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error("Error saving task");
    } finally {
      setDetailSaving(false);
    }
  };
  // Delete task (optional)
  const deleteTask = async () => {
    if (!selectedTask || !selectedTask.id) {
      toast.error("No task selected or task ID missing");
      return;
    }

    if (!confirm("Are you sure you want to delete this task permanently?"))
      return;

    setDetailDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`Failed to delete task: ${res.status}`);
      }

      // Close modal FIRST before state updates
      closeTaskDetail();

      // Then refresh tasks
      await fetchTasks();

      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Delete task error:", error);
      toast.error("Error deleting task");
    } finally {
      setDetailDeleting(false);
    }
  };
  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header + Add Buttons */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight dark:text-white flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-green-600" />
            Tasks Management
          </h1>

          {/* Right: project filter + add buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Filter by project */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Filter:
              </label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="input min-w-[160px] capitalize"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="capitalize">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons: responsive, stacked on small screens */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setIsCommonModalOpen(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 min-w-[160px] justify-center"
              >
                <PlusCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Add Common Task</span>
                <span className="sm:hidden">Common</span>
              </button>
              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 min-w-[160px] justify-center"
              >
                <PlusCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Add Custom Task</span>
                <span className="sm:hidden">Custom</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-between items-center px-2">
          <div className="flex border-b mb-4 text-sm font-medium">
            {["all", "Pending", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 capitalize ${
                  activeTab === tab
                    ? "border-b-2 border-green-600 text-green-600"
                    : "text-gray-500 hover:text-green-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div>
            {pdfError ? (
              <div className="text-red-600 text-sm">
                PDF export unavailable: {pdfError}
              </div>
            ) : (
              <ExportPdfButton
                tasks={filteredTasks}
                projects={projects}
                onError={(error) => setPdfError(error.message)}
              />
            )}
          </div>
        </div>

        {/* Table / Responsive */}
        <div className="rounded-lg border">
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-x-auto"
          >
            <table className="table-modern dark:text-white">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="py-3 px-4 text-left">Task Name</th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">
                    Project id
                  </th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">
                    Assigned To
                  </th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">
                    Priority
                  </th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">
                    Start Date
                  </th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">
                    End Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* {filteredTasks.length > 0 ? ( */}
                {filteredTasks.map((task) => (
                  <motion.tr
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="cursor-pointer dark:text-white  dark:hover:text-gray-900"
                    onClick={() => openTaskDetail(task)}
                  >
                    {/* Task name always visible */}
                    <td className="py-3 px-4 ">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium capitalize">
                          {task.task_name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {/* optional tag */}
                        </div>
                      </div>
                      {/* On small screens show project below the name */}
                      <div className="mt-1 text-xs text-gray-500 md:hidden">
                        {projects.find(
                          (p) => String(p.id) === String(task.project_id)
                        )?.name || task.project_id}
                      </div>
                    </td>

                    {/* Project: hidden on small screens */}
                    <td className="py-3 px-4 hidden md:table-cell">
                      {/* {projects.find(
                          (p) => String(p.id) === String(task.project_id)
                        )?.name ||  */}
                      {task.project_id}
                    </td>

                    <td className="py-3 px-4 hidden md:table-cell">
                      {/* {staff.find(
                          (s) => String(s.id) === String(task.assigned_to)
                        )
                          ? `${
                              staff.find(
                                (s) => String(s.id) === String(task.assigned_to)
                              ).first_name
                            }` */}
                      {task.assigned_to}
                    </td>

                    <td className="py-3 px-4 hidden md:table-cell capitalize">
                      {task.priority}
                    </td>

                    <td
                      className={`border-b py-3 px-4 hidden lg:table-cell capitalize hover:bg-gray-50  ${
                        task.status === "Pending"
                          ? "text-yellow-500 dark:text-yellow-900"
                          : "text-green-500 dark:text-green-800"
                      }`}
                      // className="py-3 px-4 hidden lg:table-cell capitalize"
                    >
                      {task.status}
                    </td>

                    <td className="py-3 px-4 hidden lg:table-cell">
                      {task.start_date}
                    </td>

                    <td className="py-3 px-4 hidden lg:table-cell">
                      {task.end_date}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {loading && (
              <div className="text-center py-6 text-gray-500">
                <div className="flex justify-center items-center">
                  <Loader className="animate-spin h-6 w-6 pr-2" />{" "}
                  <p>Loading tasks...</p>
                </div>
              </div>
            )}
            {!loading && tasks.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                No materials found.
              </div>
            )}
          </motion.div>
        </div>

        {/* Add Common Task Modal */}
        {isCommonModalOpen &&
          createPortal(
            <Modal
              title="Add Common Task"
              onClose={() => setIsCommonModalOpen(false)}
            >
              <form onSubmit={handleAddCommonTask} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Task Name</label>
                  <input name="task_name" required className="input" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Phase</label>
                  <select name="phase" required className="input capitalize">
                    <option value="">Select Phase</option>
                    {phases.map((phase, index) => (
                      <option key={index} value={phase} className="capitalize">
                        {phase}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Description</label>
                  <textarea name="description" rows="3" className="input" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Priority</label>
                  <select name="priority" required className="input">
                    <option value="">Select Priority</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <button
                  disabled={commonTaskLoading}
                  className="btn-primary w-full"
                >
                  {commonTaskLoading ? (
                    <Loader2 className="animate-spin mx-auto" />
                  ) : (
                    "Save Common Task"
                  )}
                </button>
              </form>
            </Modal>,
            document.body
          )}

        {/* Add Custom Task Modal */}
        {isCustomModalOpen &&
          createPortal(
            <Modal
              title="Add Custom Task"
              onClose={() => setIsCustomModalOpen(false)}
            >
              <form
                onSubmit={handleAddCustomTask}
                className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-4"
              >
                <div>
                  <label className="block text-sm mb-1">Task Name</label>
                  <input name="task_name" required className="input" />
                </div>

                <div>
                  <label className="block text-sm mb-1">Phase</label>
                  <select name="phase" required className="input capitalize">
                    <option value="">Phase</option>
                    {phases.map((phase, index) => (
                      <option key={index} value={phase} className="capitalize">
                        {phase}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Project</label>
                  <select
                    name="project_id"
                    required
                    className="input capitalize"
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="capitalize">
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Assign To</label>
                  <select
                    name="assigned_to"
                    required
                    className="input capitalize"
                  >
                    <option value="">Select Staff</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id} className="capitalize">
                        {s.first_name} - {s.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1">Priority</label>
                  <select name="priority" required className="input">
                    <option value="">Select Priority</option>
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 md:col-span-2">
                  <div>
                    <label className="block text-sm mb-1">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      required
                      className="input"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm mb-1">Description</label>
                  <textarea
                    name="description"
                    rows="2"
                    className="input w-full"
                    placeholder="Enter task description..."
                  />
                </div>

                <div className="col-span-2">
                  <button
                    disabled={customTaskLoading}
                    className="btn-primary w-full"
                  >
                    {customTaskLoading ? (
                      <Loader2 className="animate-spin mx-auto" />
                    ) : (
                      "Save Custom Task"
                    )}
                  </button>
                </div>
              </form>
            </Modal>,
            document.body
          )}

        {/* Task Detail Modal (editable inline) */}
        {isDetailOpen &&
          selectedTask &&
          createPortal(
            <Modal
              title={`Edit Task: ${selectedTask.task_name || "Unnamed Task"}`}
              onClose={closeTaskDetail}
            >
              <div className="space-y-4">
                {/* Top row: name + status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="">
                    <label className="block text-sm mb-1">Task Name</label>
                    <input
                      value={selectedTask.task_name || ""}
                      onChange={(e) =>
                        updateSelected("task_name", e.target.value)
                      }
                      className="input"
                    />
                  </div>
                  <div className="">
                    <label className="block text-sm mb-1">Progress</label>
                    <input
                      type="number"
                      value={selectedTask.progress || 0}
                      onChange={(e) =>
                        updateSelected("progress", Number(e.target.value))
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Status</label>
                    <select
                      value={selectedTask.status || ""}
                      onChange={(e) => updateSelected("status", e.target.value)}
                      className="input"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
                {/* Project / Assigned / Priority */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Project</label>
                    <select
                      value={selectedTask.project_id || ""}
                      onChange={(e) =>
                        updateSelected("project_id", e.target.value)
                      }
                      className="input capitalize"
                    >
                      <option value="">Select Project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Assign To</label>
                    <select
                      value={selectedTask.assigned_to || ""}
                      onChange={(e) =>
                        updateSelected("assigned_to", e.target.value)
                      }
                      className="input capitalize"
                    >
                      <option value="">Select Staff</option>
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} - {s.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Priority</label>
                    <select
                      value={selectedTask.priority || ""}
                      onChange={(e) =>
                        updateSelected("priority", e.target.value)
                      }
                      className="input"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Start Date</label>
                    <input
                      type="date"
                      value={selectedTask.start_date || ""}
                      onChange={(e) =>
                        updateSelected("start_date", e.target.value)
                      }
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">End Date</label>
                    <input
                      type="date"
                      value={selectedTask.end_date || ""}
                      onChange={(e) =>
                        updateSelected("end_date", e.target.value)
                      }
                      className="input"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={selectedTask.description || ""}
                    onChange={(e) =>
                      updateSelected("description", e.target.value)
                    }
                    className="input w-full"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t">
                  <button
                    onClick={saveTaskDetail}
                    disabled={detailSaving || !selectedTask.id}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {detailSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{detailSaving ? "Saving..." : "Save Changes"}</span>
                  </button>

                  <button
                    onClick={deleteTask}
                    disabled={detailDeleting || !selectedTask.id}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {detailDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span>
                      {detailDeleting ? "Deleting..." : "Delete Task"}
                    </span>
                  </button>

                  <button
                    onClick={closeTaskDetail}
                    className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>

                {/* Debug info - remove in production */}
                {process.env.NODE_ENV === "development" && (
                  <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded">
                    Task ID: {selectedTask.id} | Valid: {!!selectedTask.id}
                  </div>
                )}
              </div>
            </Modal>,
            document.body
          )}
      </div>
    </DashboardLayout>
  );
}

/* Reusable Modal — kept modern / adaptive to dark/light theme */
function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 backdrop-blur-sm bg-black/40">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-white/90 dark:bg-gray-900/90 border border-gray-200/40 dark:border-gray-700/40 rounded-2xl shadow-xl w-full max-w-2xl 
                   md:max-h-[95vh] md:overflow-hidden 
                   max-h-[90vh] overflow-y-auto backdrop-saturate-150"
      >
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center p-5 border-b border-gray-200/40 dark:border-gray-700/40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
}
