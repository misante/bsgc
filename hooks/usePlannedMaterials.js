import { useState, useCallback } from "react";
import toast from "react-hot-toast";

const INITIAL_MATERIAL_FORM = {
  name: "",
  category: "",
  quantity: "",
  unit: "",
  supplier: "",
  location: "",
  cost_per_unit: "",
  status: "In Stock",
  min_stock_level: "",
  project_phase: "",
  delivery_date: "",
};

const INITIAL_NEW_MATERIAL_REQUIREMENT = {
  master_material_id: "",
  required_date: "",
  project_id: "",
  project_phase: "",
  quantity: 0,
  unit_cost: 0,
  total_cost: 0,
};

export function usePlannedMaterials() {
  const [plannedMaterials, setPlannedMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    status: "all",
    page: 1,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [newMaterialData, setNewMaterialData] = useState(
    INITIAL_NEW_MATERIAL_REQUIREMENT
  );
  const [editingId, setEditingId] = useState(null);

  // const fetchMaterials = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const { search, category, status, page } = filters;
  //     const res = await fetch(
  //       `/api/materials?category=${encodeURIComponent(
  //         category
  //       )}&status=${encodeURIComponent(status)}&search=${encodeURIComponent(
  //         search
  //       )}&page=${page}`
  //     );
  //     const data = await res.json();
  //     if (!data.error) {
  //       setMaterials(data.materials || []);
  //       setTotalPages(data.totalPages || 1);
  //     }
  //   } catch (err) {
  //     console.error("fetchMaterials:", err);
  //     toast.error("Failed to load materials");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [filters]);

  const fetchPlannedMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/materials/requirements");
      const data = await response.json();
      setPlannedMaterials(data.requirements || []);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  // const handleAddMaterial = async (materialData) => {
  //   try {
  //     const res = await fetch("/api/materials", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(materialData),
  //     });
  //     const data = await res.json();
  //     if (!data.error) {
  //       await fetchMaterials();
  //       toast.success("Material added successfully");
  //       return true;
  //     } else {
  //       toast.error(data.error || "Failed to add material");
  //       return false;
  //     }
  //   } catch (error) {
  //     toast.error("Failed to add material");
  //     return false;
  //   }
  // };

  const handleAddMaterial = useCallback(
    async (materialData) => {
      try {
        const response = await fetch("/api/materials/requirements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...materialData,
            status: "planned", // Default status for new materials
          }),
        });

        if (response.ok) {
          await fetchPlannedMaterials();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error adding material:", error);
        return false;
      }
    },
    [fetchPlannedMaterials]
  );

  // const handleUpdateMaterial = async (id, payload) => {
  //   try {
  //     const res = await fetch(`/api/materials/${id}`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });
  //     if (res.ok) {
  //       await fetchMaterials();
  //       toast.success("Material updated successfully");
  //       return true;
  //     } else {
  //       toast.error("Failed to update material");
  //       return false;
  //     }
  //   } catch (err) {
  //     toast.error("Failed to update material");
  //     return false;
  //   }
  // };
  const updateMaterialStatus = useCallback(
    async (materialId, status) => {
      try {
        const response = await fetch(
          `/api/materials/requirements/${materialId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }
        );

        if (response.ok) {
          await fetchPlannedMaterials();
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error updating material status:", error);
        return false;
      }
    },
    [fetchPlannedMaterials]
  );

  const handleDeleteMaterial = async (id) => {
    try {
      const res = await fetch(`/api/materials/requirements/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchPlannedMaterials();
        toast.success("Material deleted successfully");
        return true;
      } else {
        toast.error("Failed to delete material");
        return false;
      }
    } catch (err) {
      toast.error("Failed to delete material");
      return false;
    }
  };

  // Material requirements functions
  const loadMaterialRequirements = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/materials/requirements");
      const data = await response.json();
      if (response.ok) {
        setMaterials(data.requirements || []);
      } else {
        toast.error(data.error || "Failed to load material requirements");
      }
    } catch (error) {
      console.error("Error loading material requirements:", error);
      toast.error("Error loading material requirements");
    } finally {
      setLoading(false);
    }
  };

  const saveMaterialRequirement = async (materialData) => {
    try {
      const url = materialData.id
        ? `/api/materials/requirements/${materialData.id}`
        : "/api/materials/requirements";
      const method = materialData.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(materialData),
      });

      const result = await response.json();

      if (response.ok) {
        await loadMaterialRequirements();
        setEditingId(null);
        if (!materialData.id) {
          setNewMaterialData(INITIAL_NEW_MATERIAL_REQUIREMENT);
        }
        toast.success(
          materialData.id
            ? "Material requirement updated successfully!"
            : "Material requirement added successfully!"
        );
        return true;
      } else {
        toast.error(result.error || "Failed to save material requirement");
        return false;
      }
    } catch (error) {
      console.error("Error saving material requirement:", error);
      toast.error("Error saving material requirement");
      return false;
    }
  };

  const deleteMaterialRequirement = async (id) => {
    try {
      if (
        !confirm("Are you sure you want to delete this material requirement?")
      ) {
        return false;
      }

      const response = await fetch(`/api/materials/requirements/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        await loadMaterialRequirements();
        toast.success("Material requirement deleted successfully!");
        return true;
      } else {
        toast.error(result.error || "Failed to delete material requirement");
        return false;
      }
    } catch (error) {
      console.error("Error deleting material requirement:", error);
      toast.error("Error deleting material requirement");
      return false;
    }
  };

  return {
    plannedMaterials,
    loading,
    filters,
    setFilters,
    totalPages,
    newMaterialData,
    setNewMaterialData,
    editingId,
    setEditingId,
    fetchPlannedMaterials,
    handleAddMaterial,
    // handleUpdateMaterial,
    handleDeleteMaterial,
    loadMaterialRequirements,
    saveMaterialRequirement,
    deleteMaterialRequirement,
    updateMaterialStatus,
  };
}
