"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GanttChart from "@/components/projects/GanttChart";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id;
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    // Mock data - replace with Supabase fetch
    const mockProject = {
      id: projectId,
      name: "Addis Ababa Commercial Complex",
      description:
        "15-story commercial building in Bole area with modern amenities and sustainable design features.",
      status: "In Progress",
      progress: 65,
      startDate: "2024-01-15",
      endDate: "2024-12-30",
      budget: "ETB 250,000,000",
      client: "Sunshine Real Estate",
      projectManager: "Alemayehu Kebede",
      location: "Bole, Addis Ababa",
      contractNumber: "BSGC-2024-001",
      phase: "Construction",
    };
    setProject(mockProject);
  };

  if (!project) {
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
      {/* Project Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-2 text-sm text-gray-700">{project.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {project.status}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {project.phase}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {project.location}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {project.progress}%
            </div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 rounded-full h-3 transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {["overview", "timeline", "tasks", "team", "documents"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Project Details
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Client
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.client}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Project Manager
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.projectManager}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Contract Number
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.contractNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Budget
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.budget}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Start Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.startDate}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      End Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {project.endDate}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Quick Stats
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Tasks Completed</div>
                  <div className="text-2xl font-bold text-gray-900">24/36</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Team Members</div>
                  <div className="text-2xl font-bold text-gray-900">18</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Days Remaining</div>
                  <div className="text-2xl font-bold text-gray-900">142</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "timeline" && <GanttChart project={project} />}

      {activeTab === "tasks" && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Project Tasks</h3>
          </div>
          <div className="border-t border-gray-200">
            <p className="p-6 text-gray-500">
              Task management interface will be implemented here.
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
