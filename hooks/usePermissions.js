import { useManpower } from "@/contexts/ManpowerContext";

export function usePermissions() {
  const { manpower, permissions, loading } = useManpower();

  // Check permission for a specific module and action
  const can = (module, action) => {
    if (!manpower || loading || !permissions) return false;

    const modulePermission = permissions.find((p) => p.module === module);

    if (!modulePermission) return false;

    switch (action) {
      case "create":
        return modulePermission.can_create;
      case "read":
        return modulePermission.can_read;
      case "update":
        return modulePermission.can_update;
      case "delete":
        return modulePermission.can_delete;
      default:
        return false;
    }
  };

  // Check multiple permissions at once
  const canAny = (module, actions) => {
    return actions.some((action) => can(module, action));
  };

  const canAll = (module, actions) => {
    return actions.every((action) => can(module, action));
  };

  // Common permission checks
  const canView = (module) => can(module, "read");
  const canCreate = (module) => can(module, "create");
  const canEdit = (module) => can(module, "update");
  const canDelete = (module) => can(module, "delete");

  // Role-based helpers (compatible with existing code)
  const hasRole = (role) => {
    if (!manpower || loading) return false;
    return manpower.role === role;
  };

  const hasAnyRole = (roles) => {
    if (!manpower || loading) return false;
    return roles.includes(manpower.role);
  };

  // Common role checks
  const isAdmin = () => hasRole("admin");
  const isProjectManager = () => hasRole("project_manager") || isAdmin();
  const isSupervisor = () => hasRole("supervisor") || isProjectManager();
  const isEngineer = () => hasRole("engineer") || isSupervisor();
  const isFinanceOfficer = () => hasRole("finance_officer") || isAdmin();
  const isWorker = () => hasRole("worker") || isEngineer();

  // Get modules that user has access to
  const getAccessibleModules = () => {
    if (!permissions) return [];
    return permissions.filter((p) => p.can_read).map((p) => p.module);
  };

  return {
    // Permission checks
    can,
    canAny,
    canAll,
    canView,
    canCreate,
    canEdit,
    canDelete,

    // Role checks
    hasRole,
    hasAnyRole,
    isAdmin,
    isProjectManager,
    isSupervisor,
    isEngineer,
    isFinanceOfficer,
    isWorker,

    // Data
    permissions,
    manpower,
    loading,

    // Helpers
    getAccessibleModules,
    currentRole: manpower?.role || null,
  };
}
