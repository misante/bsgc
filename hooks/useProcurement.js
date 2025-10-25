import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useInventory } from "./useInventory";

export function useProcurement() {
  const [procurementOrders, setProcurementOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchInventory } = useInventory();

  const fetchProcurementOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/procurement/orders");
      const data = await response.json();
      setProcurementOrders(data.procurementOrders || []);
    } catch (error) {
      console.error("Error fetching procurement orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateProcurement = useCallback(
    async (orderData, updateMaterialStatus) => {
      console.log("order-data:", orderData);
      try {
        const response = await fetch("/api/procurement/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        });

        if (response.ok) {
          // Update the material requirement status to "ordered"
          if (updateMaterialStatus && orderData.material_requirement_id) {
            await updateMaterialStatus(
              orderData.material_requirement_id,
              "Ordered"
            );
          }

          await fetchProcurementOrders();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error creating procurement order:", error);
        return false;
      }
    },
    [fetchProcurementOrders]
  );
  // const handleReceiveOrder = useCallback(
  //   async (orderId, materialData) => {
  //     try {
  //       const response = await fetch(`/api/materials/inventory`, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(materialData),
  //       });

  //       if (response.ok) {
  //         await fetchProcurementOrders();
  //         await fetchInventory(); // Refresh inventory
  //         return true;
  //       }
  //       return false;
  //     } catch (error) {
  //       console.error("Error receiving order:", error);
  //       return false;
  //     }
  //   },
  //   [fetchProcurementOrders, fetchInventory]
  // );
  const handleUpdateApproval = useCallback(
    async (orderId, status, updateMaterialStatus, materialRequirementId) => {
      try {
        const response = await fetch(`/api/procurement/orders/${orderId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });

        if (response.ok) {
          // If order is approved, update material status to "approved"
          if (
            status === "approved" &&
            updateMaterialStatus &&
            materialRequirementId
          ) {
            await updateMaterialStatus(materialRequirementId, "approved");
          }
          await fetchProcurementOrders();
          toast.success(
            `Order ${status === "approved" ? "Approved" : "Rejected"}`,
            { duration: 4000 }
          );
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating procurement order:", error);
        return false;
      }
    },
    [fetchProcurementOrders]
  );

  return {
    procurementOrders,
    loading,
    fetchProcurementOrders,
    handleCreateProcurement,
    handleUpdateApproval,
    // handleReceiveOrder,
  };
}
