// hooks/useProjects.js
import { useState, useEffect, useCallback } from "react";

export const useProjects = (initialStatus = "all") => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  const fetchProjects = useCallback(
    async (customStatus = null) => {
      try {
        setLoading(true);
        setError(null);

        const status = customStatus !== null ? customStatus : statusFilter;
        const url =
          status !== "all" ? `/api/projects?status=${status}` : "/api/projects";

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.status}`);
        }

        const data = await response.json();
        console.log("returned-project-data:", data);
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter]
  );

  // Fetch projects when status filter changes
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Update status filter and refetch
  const updateStatusFilter = useCallback((newStatus) => {
    setStatusFilter(newStatus);
  }, []);

  // Refresh projects manually
  const refreshProjects = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Get project by ID
  const getProjectById = useCallback(
    (id) => {
      return projects.find((project) => project.id === id);
    },
    [projects]
  );

  // Get projects by status
  const getProjectsByStatus = useCallback(
    (status) => {
      return projects.filter((project) => project.status === status);
    },
    [projects]
  );

  return {
    projects,
    loading,
    error,
    statusFilter,
    updateStatusFilter,
    refreshProjects,
    getProjectById,
    getProjectsByStatus,
    fetchProjects,
  };
};

// Optional: Hook for single project
export const useProject = (projectId) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProject = useCallback(
    async (id = projectId) => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/projects/${id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch project: ${response.status}`);
        }

        const data = await response.json();
        setProject(data);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId, fetchProject]);

  const refreshProject = useCallback(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    loading,
    error,
    refreshProject,
  };
};
