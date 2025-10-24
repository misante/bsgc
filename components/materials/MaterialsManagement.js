"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

// Import custom hooks
import { useInventory } from "@/hooks/useInventory";
import { usePlannedMaterials } from "@/hooks/usePlannedMaterials";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useProcurement } from "@/hooks/useProcurement";
import { useMasterMaterials } from "@/hooks/useMasterMaterials";

// Import components
import MaterialsHeader from "./MaterialsHeader";
import MaterialsTabs from "./MaterialsTabs";
import InventoryTab from "./tabs/InventoryTab";
import PlanningTab from "./tabs/PlanningTab";
import ProcurementTab from "./tabs/ProcurementTab";
import SuppliersTab from "./tabs/SuppliersTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import MaterialDetailDrawer from "./MaterialDetailDrawer";
import AddMasterMaterialModal from "./modals/AddMasterMaterialModal";
import MaterialRequestsTab from "./tabs/MaterialRequestsTab";

// Constants
const TABS = [
  "inventory",
  "planning",
  "procurement",
  "suppliers",
  "analytics",
  "requests",
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.6,
    },
  },
};

export default function MaterialsManagement() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [mounted, setMounted] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  // Modal states
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);

  const {
    inventory,
    loading: inventoryLoading,
    fetchInventory,
    handleUpdateInventory,
    handleDeleteInventory,
    handleAddToInventory,
  } = useInventory();

  const {
    plannedMaterials,
    loading: materialsLoading,
    fetchPlannedMaterials,
    handleAddMaterial,
    handleUpdateMaterial,
    handleDeleteMaterial,
    updateMaterialStatus,
  } = usePlannedMaterials();
  const {
    suppliers,
    loading: suppliersLoading,
    fetchSuppliers,
    handleAddSupplier,
    handleEditSupplier,
    handleToggleSupplier,
    handleEditClick,
    editingSupplier,
  } = useSuppliers();

  const {
    procurementOrders,
    fetchProcurementOrders,
    handleCreateProcurement,
    handleUpdateApproval,
    handleReceiveOrder,
  } = useProcurement();

  const {
    masterMaterials,
    fetchMasterMaterials,
    showMasterMaterialForm,
    setShowMasterMaterialForm,
    saveMasterMaterial,
  } = useMasterMaterials();

  const getPlannedMaterials = useCallback(() => {
    return plannedMaterials.filter(
      (material) => material.status === "planned" || !material.status // Include legacy items without status
    );
  }, [plannedMaterials]);

  const getOrderedMaterials = useCallback(() => {
    return plannedMaterials.filter((material) => material.status === "ordered");
  }, [plannedMaterials]);

  const getApprovedMaterials = useCallback(() => {
    // Get materials with approved status AND approved procurement orders
    const approvedMaterials = plannedMaterials.filter(
      (material) => material.status === "approved"
    );
    console.log("suppliers in mmp:", suppliers);

    // Also include materials that have approved procurement orders
    const approvedOrderMaterials = procurementOrders
      .filter((order) => order.status === "approved")
      .map((order) => {
        const material = plannedMaterials.find(
          (m) => m.id === order.material_requirement_id
        );
        return material ? { ...material, ...order } : null;
      })
      .filter(Boolean);

    // Merge and remove duplicates
    const allApproved = [...approvedMaterials, ...approvedOrderMaterials];
    const uniqueApproved = allApproved.filter(
      (material, index, self) =>
        index === self.findIndex((m) => m.id === material.id)
    );

    return uniqueApproved;
  }, [plannedMaterials, procurementOrders]);

  // Enhanced procurement handlers with status updates
  const handleCreateProcurementWithStatus = useCallback(
    async (orderData) => {
      return await handleCreateProcurement(orderData, updateMaterialStatus);
    },
    [handleCreateProcurement, updateMaterialStatus]
  );

  const handleUpdateApprovalWithStatus = useCallback(
    async (orderId, status, materialRequirementId) => {
      return await handleUpdateApproval(
        orderId,
        status,
        updateMaterialStatus,
        materialRequirementId
      );
    },
    [handleUpdateApproval, updateMaterialStatus]
  );
  // Data states for charts
  const [projectSchedule, setProjectSchedule] = useState([]);
  const [demandForecast, setDemandForecast] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);

  // Load all data
  const fetchAllData = useCallback(async () => {
    try {
      await Promise.all([
        fetchPlannedMaterials(),
        fetchProcurementOrders(),
        fetchInventory(),
        fetchSuppliers(),
        fetchMasterMaterials(),
        fetchProjectSchedule(),
        fetchDemandForecastData(),
        fetchHistoricalData(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [
    fetchPlannedMaterials,
    fetchInventory,
    fetchProcurementOrders,
    fetchSuppliers,
    fetchMasterMaterials,
  ]);

  // Individual data fetchers
  const fetchProjectSchedule = async () => {
    try {
      const res = await fetch("/api/projects/schedule");
      const data = await res.json();
      setProjectSchedule(data || []);
    } catch (error) {
      console.error("Error fetching project schedule:", error);
    }
  };

  const fetchDemandForecastData = async () => {
    try {
      const res = await fetch("/api/materials/forecast");
      const data = await res.json();
      setDemandForecast(data.forecast || []);
    } catch (err) {
      console.error("fetchDemandForecast:", err);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const res = await fetch("/api/materials/history");
      const data = await res.json();
      setHistoricalData(data.history || []);
    } catch (err) {
      console.error("fetchHistoricalData:", err);
    }
  };

  // Effects
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Render tabs content - UPDATED
  const renderTabContent = () => {
    switch (activeTab) {
      case "inventory":
        return (
          <InventoryTab
            inventory={inventory}
            loading={inventoryLoading}
            onMaterialSelect={setSelectedMaterial}
            onRefresh={fetchInventory}
          />
        );

      case "planning":
        return (
          <PlanningTab
            plannedMaterials={getPlannedMaterials()} // Show only planned materials
            approvedOrders={getApprovedMaterials()} // Show approved orders for JIT schedule
            projectSchedule={projectSchedule}
            demandForecast={demandForecast}
            onRefresh={fetchAllData}
          />
        );

      case "procurement":
        console.log("suppliers:", suppliers);
        return (
          <ProcurementTab
            suppliers={suppliers}
            procurementOrders={procurementOrders}
            plannedMaterials={getOrderedMaterials()} // Show ordered materials
            onCreateOrder={handleCreateProcurementWithStatus}
            onUpdateApproval={handleUpdateApprovalWithStatus}
            onReceiveOrder={handleReceiveOrder}
            fetchProcurementOrders={fetchProcurementOrders}
          />
        );

      case "suppliers":
        return (
          <SuppliersTab
            suppliers={suppliers}
            loading={suppliersLoading}
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditClick}
            onToggleSupplier={handleToggleSupplier}
            showAddSupplierModal={showAddSupplierModal}
            setShowAddSupplierModal={setShowAddSupplierModal}
            showEditSupplierModal={showEditSupplierModal}
            setShowEditSupplierModal={setShowEditSupplierModal}
            editingSupplier={editingSupplier}
          />
        );
      case "requests":
        return <MaterialRequestsTab />;

      case "analytics":
        return (
          <AnalyticsTab
            plannedMaterials={plannedMaterials}
            historicalData={historicalData}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full px-0 sm:px-4 lg:px-6">
      <div className="space-y-6 w-full px-4 sm:px-0">
        {/* Header */}
        <MaterialsHeader
          onAddMasterMaterial={() => setShowMasterMaterialForm(true)}
        />

        {/* Navigation Tabs */}
        <div className="w-full overflow-x-auto">
          <MaterialsTabs
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {renderTabContent()}
        </motion.div>

        {/* Material Detail Drawer */}
        {mounted && selectedMaterial && (
          <MaterialDetailDrawer
            material={selectedMaterial}
            onClose={() => setSelectedMaterial(null)}
            onUpdate={handleUpdateInventory}
            onDelete={handleDeleteInventory}
          />
        )}

        {/* Master Material Modal */}
        {mounted && showMasterMaterialForm && (
          <AddMasterMaterialModal
            isOpen={showMasterMaterialForm}
            onClose={() => setShowMasterMaterialForm(false)}
            onSave={saveMasterMaterial}
            onRefresh={fetchMasterMaterials}
          />
        )}
      </div>
    </div>
  );
}
