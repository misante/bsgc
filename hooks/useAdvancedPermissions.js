// hooks/useAdvancedPermissions.js
"use client";
import { useManpower } from "@/contexts/ManpowerContext";
import { useMemo } from "react";

export function useAdvancedPermissions() {
  const { manpower, permissions, loading } = useManpower();

  const permissionMap = useMemo(() => {
    if (!permissions) return new Map();

    return permissions.reduce((map, perm) => {
      map.set(perm.module_id, perm);
      return map;
    }, new Map());
  }, [permissions]);

  // Check permission for specific module and action
  const can = (moduleName, action = "view", context = {}) => {
    if (!manpower || loading) return false;

    // Find module by name (you might want to cache this)
    const module = findModuleByName(moduleName);
    if (!module) return false;

    const permission = permissionMap.get(module.id);
    if (!permission) return false;

    switch (action) {
      case "view":
        return permission.can_view;
      case "create":
        return permission.can_create;
      case "edit":
        return permission.can_edit;
      case "delete":
        return permission.can_delete;
      case "approve":
        return permission.can_approve;
      case "reject":
        return permission.can_reject;
      case "export":
        return permission.can_export;
      case "import":
        return permission.can_import;
      default:
        return false;
    }
  };

  // Check multiple permissions
  const canAny = (moduleName, actions) => {
    return actions.some((action) => can(moduleName, action));
  };

  const canAll = (moduleName, actions) => {
    return actions.every((action) => can(moduleName, action));
  };

  // Get accessible modules for navigation
  const getAccessibleModules = () => {
    if (!permissions) return [];

    return permissions
      .filter((p) => p.can_view)
      .map((p) => ({
        id: p.module_id,
        name: p.module_name, // You'll need to join this data
        path: p.module_path,
        icon: p.module_icon,
        sort_order: p.module_sort_order,
      }))
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  // Check data scope
  const getDataScope = (moduleName) => {
    const module = findModuleByName(moduleName);
    if (!module) return "own";

    const permission = permissionMap.get(module.id);
    return permission?.data_scope || "own";
  };

  // Role-based quick checks
  const isAdmin = () => manpower?.role === "admin";
  const isProjectManager = () => manpower?.role === "project_manager";
  const canManageMaterials = () =>
    canAny("materials", ["view", "create", "edit"]);
  const canManageProcurement = () =>
    canAny("procurement", ["view", "create", "edit"]);

  return {
    // Basic checks
    can,
    canAny,
    canAll,

    // Role checks
    isAdmin,
    isProjectManager,
    canManageMaterials,
    canManageProcurement,

    // Navigation
    getAccessibleModules,
    getDataScope,

    // Data
    permissions,
    permissionMap,
    manpower,
    loading,
    currentRole: manpower?.role,
  };
}

// Mock function - you'll want to cache module data
function findModuleByName(name) {
  // This should come from your modules table
  const modules = {
    materials: { id: 1, name: "materials" },
    requests: { id: 2, name: "requests" },
    procurement: { id: 3, name: "procurement" },
    purchase_orders: { id: 4, name: "purchase_orders" },
    create_po: { id: 5, name: "create_po" },
    approve_po: { id: 6, name: "approve_po" },
    // ... other modules
  };
  return modules[name];
}
