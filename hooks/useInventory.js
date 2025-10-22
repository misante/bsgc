// hooks/useInventory.js
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export function useInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    status: "all",
    page: 1,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // const fetchInventory = useCallback(
  //   async (customFilters = null) => {
  //     setLoading(true);
  //     try {
  //       const { search, category, status, page } = customFilters || filters;

  //       const queryParams = new URLSearchParams({
  //         search: search || "",
  //         category: category || "all",
  //         status: status || "all",
  //         page: page?.toString() || "1",
  //         limit: "50",
  //       });

  //       const res = await fetch(`/api/materials/inventory?${queryParams}`);
  //       const data = await res.json();
  //       // console.log("inventory data:", data);
  //       if (!data.error) {
  //         setInventory(data.inventory || []);
  //         setTotalPages(data.totalPages || 1);
  //         setTotalCount(data.totalCount || 0);
  //       } else {
  //         toast.error("Failed to load inventory");
  //       }
  //     } catch (err) {
  //       console.error("fetchInventory:", err);
  //       toast.error("Failed to load inventory");
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [filters]
  // );

  const fetchInventory = useCallback(
    async (customFilters = null) => {
      setLoading(true);
      try {
        const { search, category, status, page } = customFilters || filters;

        // Build query parameters for material-stock API
        const queryParams = new URLSearchParams();

        if (search) queryParams.append("search", search);
        if (category && category !== "all")
          queryParams.append("category", category);
        if (status && status !== "all") queryParams.append("status", status);
        queryParams.append("page", page?.toString() || "1");
        queryParams.append("limit", "50");

        // Fetch from material-stock API instead of inventory API
        const res = await fetch(
          `/api/materials/inventory/material-stock?${queryParams}`
        );
        const data = await res.json();

        if (data.success) {
          setInventory(data.data || []);
          // Since material-stock is aggregated, we might need to handle pagination differently
          setTotalPages(data.totalPages || 1);
          setTotalCount(data.totalCount || data.data?.length || 0);
        } else {
          console.error("Failed to load inventory:", data.error);
          toast.error("Failed to load inventory");
        }
      } catch (err) {
        console.error("fetchInventory error:", err);
        toast.error("Failed to load inventory");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );
  // Update filters and refetch
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);
  const handleAddToInventory = async (inventoryData) => {
    try {
      const res = await fetch("/api/materials/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inventoryData),
      });
      const data = await res.json();
      if (!data.error) {
        await fetchInventory();
        toast.success("Item added to inventory successfully");
        return true;
      } else {
        toast.error(data.error || "Failed to add to inventory");
        return false;
      }
    } catch (error) {
      toast.error("Failed to add to inventory");
      return false;
    }
  };

  const handleUpdateInventory = async (id, payload) => {
    try {
      const res = await fetch(`/api/materials/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchInventory();
        toast.success("Inventory item updated successfully");
        return true;
      } else {
        toast.error("Failed to update inventory item");
        return false;
      }
    } catch (err) {
      toast.error("Failed to update inventory item");
      return false;
    }
  };

  const handleDeleteInventory = async (id) => {
    try {
      const res = await fetch(`/api/materials/inventory/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchInventory();
        toast.success("Inventory item deleted successfully");
        return true;
      } else {
        toast.error("Failed to delete inventory item");
        return false;
      }
    } catch (err) {
      toast.error("Failed to delete inventory item");
      return false;
    }
  };

  return {
    inventory,
    loading,
    filters,
    setFilters,
    totalPages,
    totalCount,
    fetchInventory,
    handleAddToInventory,
    handleUpdateInventory,
    handleDeleteInventory,
    updateFilters,
  };
}
