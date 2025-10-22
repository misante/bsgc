// Temporary permissions hook that gives everyone full access
// Use this until you finish building all basic app functions

export function useTempPermissions() {
  // Grant full access to everything for development
  const can = (module, action) => {
    console.log(`🔓 TEMP ACCESS: ${module} - ${action} (always true)`);
    return true;
  };

  const canAny = (module, actions) => true;
  const canAll = (module, actions) => true;
  const canView = (module) => true;
  const canCreate = (module) => true;
  const canEdit = (module) => true;
  const canDelete = (module) => true;
  const canApprove = (module) => true;
  const canReject = (module) => true;

  // Mock role checks
  const isAdmin = () => true;
  const isProjectManager = () => true;
  const isSupervisor = () => true;
  const isEngineer = () => true;
  const isFinanceOfficer = () => false; // Adjust as needed
  const isWorker = () => false; // Adjust as needed
  const isStoreKeeper = () => true;

  const getAccessibleModules = () => [
    { name: "dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { name: "projects", path: "/projects", icon: "Briefcase" },
    { name: "materials", path: "/materials", icon: "Package" },
    { name: "hr", path: "/hr", icon: "Users" },
    { name: "finance", path: "/finance", icon: "DollarSign" },
    { name: "reports", path: "/reports", icon: "BarChart" },
    { name: "settings", path: "/settings", icon: "Settings" },
  ];

  const getDataScope = () => "all";

  return {
    // Permission checks
    can,
    canAny,
    canAll,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canApprove,
    canReject,

    // Role checks
    isAdmin,
    isProjectManager,
    isSupervisor,
    isEngineer,
    isFinanceOfficer,
    isWorker,
    isStoreKeeper,

    // Navigation
    getAccessibleModules,
    getDataScope,

    // Mock data
    permissions: [],
    manpower: { role: "admin" },
    loading: false,
    currentRole: "admin",
  };
}
