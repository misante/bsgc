"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  HiOutlineShieldCheck,
  HiOutlineExclamationTriangle,
  HiOutlineDocumentCheck,
  HiPencil,
  HiTrash,
  HiPlus,
  HiUserGroup,
} from "react-icons/hi2";

import DashboardLayout from "@/components/layout/DashboardLayout";
import IncidentForm from "@/components/safety/IncidentForm";
import InspectionForm from "@/components/safety/InspectionForm";
import TrainingForm from "@/components/safety/TrainingForm";
import DeleteConfirmation from "@/components/safety/DeleteConfirmation";
import { useManpower } from "@/contexts/ManpowerContext";
import { safetyService } from "@/lib/services/safetyService";
// import IncidentForm from "@/components/safety/IncidentForm";
// import InspectionForm from "@/components/safety/InspectionForm";
// import TrainingForm from "@/components/safety/TrainingForm";
// import DeleteConfirmation from "@/components/safety/DeleteConfirmation";
// import { safetyService } from "@/lib/services/safetyService";
// import { useManpower } from "@/hooks/useManpower";

export default function SafetyPage() {
  const [incidents, setIncidents] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showTrainingForm, setShowTrainingForm] = useState(false);

  // Editing states
  const [editingIncident, setEditingIncident] = useState(null);
  const [editingInspection, setEditingInspection] = useState(null);
  const [editingTraining, setEditingTraining] = useState(null);

  // Delete confirmation states
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteType, setDeleteType] = useState("");

  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { manpower, loading: userLoading, error: userError } = useManpower();
  const currentUser = manpower?.first_name
    ? `${manpower.first_name} ${manpower.last_name}`
    : "Unknown User";

  useEffect(() => {
    fetchSafetyData();
  }, []);

  const fetchSafetyData = async () => {
    try {
      setLoading(true);
      const [incidentsData, inspectionsData, trainingsData] = await Promise.all(
        [
          safetyService.getIncidents(),
          safetyService.getInspections(),
          safetyService.getTrainings(),
        ]
      );
      setIncidents(incidentsData);
      setInspections(inspectionsData);
      setTrainings(trainingsData);
    } catch (error) {
      console.error("Error fetching safety data:", error);
      toast.error("Failed to load safety data");
    } finally {
      setLoading(false);
    }
  };

  // Incident Handlers
  const handleCreateIncident = async (incidentData) => {
    try {
      setIsSubmitting(true);
      const newIncident = await safetyService.createIncident(incidentData);
      setIncidents((prev) => [newIncident, ...prev]);
      setShowIncidentForm(false);
      toast.success("Incident reported successfully");
    } catch (error) {
      console.error("Error creating incident:", error);
      toast.error("Failed to report incident");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateIncident = async (incidentData) => {
    if (!editingIncident) return;

    try {
      setIsSubmitting(true);
      const updatedIncident = await safetyService.updateIncident(
        editingIncident.id,
        incidentData
      );
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === editingIncident.id ? updatedIncident : inc
        )
      );
      setEditingIncident(null);
      setShowIncidentForm(false);
      toast.success("Incident updated successfully");
    } catch (error) {
      console.error("Error updating incident:", error);
      toast.error("Failed to update incident");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Inspection Handlers
  const handleCreateInspection = async (inspectionData) => {
    try {
      setIsSubmitting(true);
      const newInspection = await safetyService.createInspection(
        inspectionData
      );
      setInspections((prev) => [newInspection, ...prev]);
      setShowInspectionForm(false);
      toast.success("Inspection scheduled successfully");
    } catch (error) {
      console.error("Error creating inspection:", error);
      toast.error("Failed to schedule inspection");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateInspection = async (inspectionData) => {
    if (!editingInspection) return;

    try {
      setIsSubmitting(true);
      const updatedInspection = await safetyService.updateInspection(
        editingInspection.id,
        inspectionData
      );
      setInspections((prev) =>
        prev.map((ins) =>
          ins.id === editingInspection.id ? updatedInspection : ins
        )
      );
      setEditingInspection(null);
      setShowInspectionForm(false);
      toast.success("Inspection updated successfully");
    } catch (error) {
      console.error("Error updating inspection:", error);
      toast.error("Failed to update inspection");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Training Handlers
  const handleCreateTraining = async (trainingData) => {
    try {
      setIsSubmitting(true);
      const newTraining = await safetyService.createTraining(trainingData);
      setTrainings((prev) => [newTraining, ...prev]);
      setShowTrainingForm(false);
      toast.success("Training scheduled successfully");
    } catch (error) {
      console.error("Error creating training:", error);
      toast.error("Failed to schedule training");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTraining = async (trainingData) => {
    if (!editingTraining) return;

    try {
      setIsSubmitting(true);
      const updatedTraining = await safetyService.updateTraining(
        editingTraining.id,
        trainingData
      );
      setTrainings((prev) =>
        prev.map((train) =>
          train.id === editingTraining.id ? updatedTraining : train
        )
      );
      setEditingTraining(null);
      setShowTrainingForm(false);
      toast.success("Training updated successfully");
    } catch (error) {
      console.error("Error updating training:", error);
      toast.error("Failed to update training");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generic Delete Handler
  const handleDelete = async () => {
    if (!deletingItem || !deleteType) return;

    try {
      setIsDeleting(true);

      switch (deleteType) {
        case "incident":
          await safetyService.deleteIncident(deletingItem.id);
          setIncidents((prev) =>
            prev.filter((item) => item.id !== deletingItem.id)
          );
          break;
        case "inspection":
          await safetyService.deleteInspection(deletingItem.id);
          setInspections((prev) =>
            prev.filter((item) => item.id !== deletingItem.id)
          );
          break;
        case "training":
          await safetyService.deleteTraining(deletingItem.id);
          setTrainings((prev) =>
            prev.filter((item) => item.id !== deletingItem.id)
          );
          break;
        default:
          throw new Error("Unknown delete type");
      }

      setDeletingItem(null);
      setDeleteType("");
      toast.success("Item deleted successfully");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Edit Forms
  const openEditIncident = (incident) => {
    setEditingIncident(incident);
    setShowIncidentForm(true);
  };

  const openEditInspection = (inspection) => {
    setEditingInspection(inspection);
    setShowInspectionForm(true);
  };

  const openEditTraining = (training) => {
    setEditingTraining(training);
    setShowTrainingForm(true);
  };

  // Open Delete Confirmations
  const openDeleteConfirmation = (item, type) => {
    setDeletingItem(item);
    setDeleteType(type);
  };

  // Close all modals
  const closeModals = () => {
    setShowIncidentForm(false);
    setShowInspectionForm(false);
    setShowTrainingForm(false);
    setEditingIncident(null);
    setEditingInspection(null);
    setEditingTraining(null);
    setDeletingItem(null);
    setDeleteType("");
  };

  // Utility functions
  const getSeverityColor = (severity) => {
    const colors = {
      Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Medium:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      High: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return (
      colors[severity] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      Resolved:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Under Investigation":
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "Action Required":
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Completed:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Scheduled:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "In Progress":
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Cancelled:
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  };

  const getTrainingTypeColor = (type) => {
    const colors = {
      Safety: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Equipment:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "First Aid": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Hazard:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Emergency:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Regulatory:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    };
    return (
      colors[type] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Safety Management
            </h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              Monitor safety protocols, incidents, and compliance according to
              BSGC SOP
            </p>
          </div>
        </div>

        {/* Safety Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <HiOutlineShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Days Without Incident
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      30
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <HiOutlineExclamationTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Open Incidents
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {incidents.filter((i) => i.status !== "Resolved").length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <HiOutlineDocumentCheck className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Inspections This Month
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {inspections.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <HiUserGroup className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Trainings Scheduled
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {trainings.filter((t) => t.status === "Scheduled").length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {["overview", "incidents", "inspections", "training"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                      activeTab === tab
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Incidents */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Recent Safety Incidents
                </h3>
                <button
                  onClick={() => setShowIncidentForm(true)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <HiPlus className="h-4 w-4 mr-1" />
                  Report
                </button>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {incidents.slice(0, 5).map((incident) => (
                    <li key={incident.id} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {incident.title}
                            </p>
                            <div className="flex space-x-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                                  incident.severity
                                )}`}
                              >
                                {incident.severity}
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  incident.status
                                )}`}
                              >
                                {incident.status}
                              </span>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {incident.location}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Reported by {incident.reported_by} on{" "}
                            {incident.incident_date}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Upcoming Inspections */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Safety Inspections
                </h3>
                <button
                  onClick={() => setShowInspectionForm(true)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <HiPlus className="h-4 w-4 mr-1" />
                  Schedule
                </button>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {inspections.slice(0, 5).map((inspection) => (
                    <li key={inspection.id} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {inspection.type}
                            </p>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                inspection.status
                              )}`}
                            >
                              {inspection.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Inspector: {inspection.inspector}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Date: {inspection.inspection_date}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {inspection.findings} findings
                            </span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              Score: {inspection.score}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Upcoming Trainings */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Upcoming Trainings
              </h3>
              <button
                onClick={() => setShowTrainingForm(true)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <HiPlus className="h-4 w-4 mr-1" />
                Schedule
              </button>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {trainings
                  .filter((t) => t.status === "Scheduled")
                  .slice(0, 5)
                  .map((training) => (
                    <li key={training.id} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm capitalize font-medium text-gray-900 dark:text-white">
                              {training.title}
                            </p>
                            <div className="flex space-x-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrainingTypeColor(
                                  training.type
                                )}`}
                              >
                                {training.type}
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  training.status
                                )}`}
                              >
                                {training.status}
                              </span>
                            </div>
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Trainer: {training.trainer} • {training.duration}{" "}
                            mins
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Date: {training.scheduled_date} •{" "}
                            {training.participants} participants
                          </p>
                          {training.location && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              Location: {training.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === "incidents" && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Safety Incidents
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                All reported safety incidents and near-misses
              </p>
            </div>
            <button
              onClick={() => setShowIncidentForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <HiPlus className="h-4 w-4 mr-2" />
              Report Incident
            </button>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Incident
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {incident.title}
                      </div>
                      <div className="text-sm capitalize text-gray-500 dark:text-gray-400">
                        {incident.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                          incident.severity
                        )}`}
                      >
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          incident.status
                        )}`}
                      >
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {incident.incident_date}
                    </td>
                    <td className="px-6 capitalize py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {incident.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditIncident(incident)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <HiPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            openDeleteConfirmation(incident, "incident")
                          }
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "inspections" && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Safety Inspections
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Scheduled and completed safety inspections
              </p>
            </div>
            <button
              onClick={() => setShowInspectionForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <HiPlus className="h-4 w-4 mr-2" />
              Schedule Inspection
            </button>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspection Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Findings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {inspections.map((inspection) => (
                  <tr key={inspection.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {inspection.type}
                      </div>
                    </td>
                    <td className="px-6 capitalize py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {inspection.inspector}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex capitalize items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          inspection.status
                        )}`}
                      >
                        {inspection.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {inspection.inspection_date}
                    </td>
                    <td className="px-6 py-4 capitalize whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {inspection.findings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {inspection.score}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditInspection(inspection)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <HiPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            openDeleteConfirmation(inspection, "inspection")
                          }
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "training" && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Safety Training
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Scheduled safety training sessions and certifications
              </p>
            </div>
            <button
              onClick={() => setShowTrainingForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <HiPlus className="h-4 w-4 mr-2" />
              Schedule Training
            </button>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Training
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trainer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {trainings.map((training) => (
                  <tr key={training.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-nowrap capitalize font-medium text-gray-900 dark:text-white">
                        {training.title}
                      </div>
                      {/* {training.description && (
                        <div className="text-sm capitalize text-gray-500 dark:text-gray-400">
                          {training.description}
                        </div>
                      )} */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex capitalize items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrainingTypeColor(
                          training.type
                        )}`}
                      >
                        {training.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {training.trainer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex capitalize items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          training.status
                        )}`}
                      >
                        {training.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {training.scheduled_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {training.duration} mins
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {training.participants}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditTraining(training)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <HiPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            openDeleteConfirmation(training, "training")
                          }
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Incident Form Modal */}
      {showIncidentForm && (
        <IncidentForm
          incident={editingIncident || undefined}
          onSave={editingIncident ? handleUpdateIncident : handleCreateIncident}
          onCancel={closeModals}
          isSubmitting={isSubmitting}
          currentUser={currentUser}
        />
      )}

      {/* Inspection Form Modal */}
      {showInspectionForm && (
        <InspectionForm
          inspection={editingInspection || undefined}
          onSave={
            editingInspection ? handleUpdateInspection : handleCreateInspection
          }
          onCancel={closeModals}
          isSubmitting={isSubmitting}
          currentUser={currentUser}
        />
      )}

      {/* Training Form Modal */}
      {showTrainingForm && (
        <TrainingForm
          training={editingTraining || undefined}
          onSave={editingTraining ? handleUpdateTraining : handleCreateTraining}
          onCancel={closeModals}
          isSubmitting={isSubmitting}
          currentUser={currentUser}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <DeleteConfirmation
          isOpen={!!deletingItem}
          onClose={closeModals}
          onConfirm={handleDelete}
          title={`Delete ${
            deleteType.charAt(0).toUpperCase() + deleteType.slice(1)
          }`}
          message={`Are you sure you want to delete the ${deleteType} "${
            deletingItem.title || deletingItem.type
          }"? This action cannot be undone.`}
          isDeleting={isDeleting}
        />
      )}
    </DashboardLayout>
  );
}
