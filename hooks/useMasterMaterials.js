// import { useState, useCallback } from "react";
// import toast from "react-hot-toast";

// const INITIAL_NEW_MASTER_MATERIAL = {
//   name: "",
//   category: "",
//   unit: "",
//   description: "",
//   current_stock: 0,
//   min_stock_level: 0,
//   supplier: "",
//   unit_cost: 0,
// };

// export function useMasterMaterials() {
//   const [masterMaterials, setMasterMaterials] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showMasterMaterialForm, setShowMasterMaterialForm] = useState(false);
//   const [editingMasterMaterial, setEditingMasterMaterial] = useState(null);
//   const [newMasterMaterialData, setNewMasterMaterialData] = useState(
//     INITIAL_NEW_MASTER_MATERIAL
//   );
//   console.log("masterMaterials:", masterMaterials);
//   const fetchMasterMaterials = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await fetch("/api/materials/master-materials");
//       const data = await response.json();
//       if (response.ok) {
//         setMasterMaterials(data.materials || []);
//       } else {
//         toast.error(data.error || "Failed to load master materials");
//       }
//     } catch (error) {
//       console.error("Error fetching master materials:", error);
//       toast.error("Error loading master materials");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const saveMasterMaterial = async (materialData) => {
//     try {
//       const url = materialData.id
//         ? `/api/materials/master-materials/${materialData.id}`
//         : "/api/materials/master-materials";
//       const method = materialData.id ? "PATCH" : "POST";

//       const response = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(materialData),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         await fetchMasterMaterials();
//         setEditingMasterMaterial(null);
//         setShowMasterMaterialForm(false);
//         setNewMasterMaterialData(INITIAL_NEW_MASTER_MATERIAL);
//         toast.success(
//           materialData.id
//             ? "Master material updated successfully!"
//             : "Master material added successfully!"
//         );
//         return true;
//       } else {
//         toast.error(result.error || "Failed to save master material");
//         return false;
//       }
//     } catch (error) {
//       console.error("Error saving master material:", error);
//       toast.error("Error saving master material");
//       return false;
//     }
//   };

//   const deleteMasterMaterial = async (id) => {
//     try {
//       if (!confirm("Are you sure you want to delete this master material?")) {
//         return false;
//       }

//       const response = await fetch(`/api/materials/master-materials/${id}`, {
//         method: "DELETE",
//       });

//       const result = await response.json();

//       if (response.ok) {
//         await fetchMasterMaterials();
//         toast.success("Master material deleted successfully!");
//         return true;
//       } else {
//         toast.error(result.error || "Failed to delete master material");
//         return false;
//       }
//     } catch (error) {
//       console.error("Error deleting master material:", error);
//       toast.error("Error deleting master material");
//       return false;
//     }
//   };

//   const editMasterMaterial = (material) => {
//     setEditingMasterMaterial(material);
//     setNewMasterMaterialData({
//       ...material,
//       id: material.id,
//     });
//     setShowMasterMaterialForm(true);
//   };

//   const resetMasterMaterialForm = () => {
//     setEditingMasterMaterial(null);
//     setNewMasterMaterialData(INITIAL_NEW_MASTER_MATERIAL);
//     setShowMasterMaterialForm(false);
//   };

//   return {
//     masterMaterials,
//     loading,
//     showMasterMaterialForm,
//     setShowMasterMaterialForm,
//     editingMasterMaterial,
//     setEditingMasterMaterial,
//     newMasterMaterialData,
//     setNewMasterMaterialData,
//     fetchMasterMaterials,
//     saveMasterMaterial,
//     deleteMasterMaterial,
//     editMasterMaterial,
//     resetMasterMaterialForm,
//   };
// }
import { useState, useCallback, useEffect } from "react"; // Added useEffect
import toast from "react-hot-toast";

const INITIAL_NEW_MASTER_MATERIAL = {
  name: "",
  category: "",
  unit: "",
  description: "",
  current_stock: 0,
  min_stock_level: 0,
  supplier: "",
  unit_cost: 0,
};

export function useMasterMaterials() {
  const [masterMaterials, setMasterMaterials] = useState([]);
  const [materialStock, setMaterialStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMasterMaterialForm, setShowMasterMaterialForm] = useState(false);
  const [editingMasterMaterial, setEditingMasterMaterial] = useState(null);
  const [newMasterMaterialData, setNewMasterMaterialData] = useState(
    INITIAL_NEW_MASTER_MATERIAL
  );

  const fetchMasterMaterials = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch master materials for names and reference data
      const masterResponse = await fetch("/api/materials/master-materials");
      const masterData = await masterResponse.json();

      // Fetch material stock for availability
      const stockResponse = await fetch(
        "/api/materials/inventory/material-stock"
      );
      const stockData = await stockResponse.json();

      console.log("📦 Master materials:", masterData);
      console.log("📊 Material stock:", stockData);

      if (masterResponse.ok && stockResponse.ok) {
        setMasterMaterials(masterData.materials || []);
        setMaterialStock(stockData.data || []);
      } else {
        toast.error("Failed to load materials data");
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Error loading materials");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMasterMaterials();
  }, [fetchMasterMaterials]);

  console.log("🔄 Current data:", {
    masterCount: masterMaterials?.length,
    stockCount: materialStock?.length,
    masterNames: masterMaterials?.map((m) => m.name),
  });
  const saveMasterMaterial = async (materialData) => {
    try {
      const url = materialData.id
        ? `/api/materials/master-materials/${materialData.id}`
        : "/api/materials/master-materials";
      const method = materialData.id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(materialData),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchMasterMaterials(); // This causes the re-render with empty array
        setEditingMasterMaterial(null);
        setShowMasterMaterialForm(false);
        setNewMasterMaterialData(INITIAL_NEW_MASTER_MATERIAL);
        toast.success(
          materialData.id
            ? "Master material updated successfully!"
            : "Master material added successfully!"
        );
        return true;
      } else {
        toast.error(result.error || "Failed to save master material");
        return false;
      }
    } catch (error) {
      console.error("Error saving master material:", error);
      toast.error("Error saving master material");
      return false;
    }
  };

  const deleteMasterMaterial = async (id) => {
    try {
      if (!confirm("Are you sure you want to delete this master material?")) {
        return false;
      }

      const response = await fetch(`/api/materials/master-materials/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        await fetchMasterMaterials(); // This causes the re-render with empty array
        toast.success("Master material deleted successfully!");
        return true;
      } else {
        toast.error(result.error || "Failed to delete master material");
        return false;
      }
    } catch (error) {
      console.error("Error deleting master material:", error);
      toast.error("Error deleting master material");
      return false;
    }
  };

  const editMasterMaterial = (material) => {
    setEditingMasterMaterial(material);
    setNewMasterMaterialData({
      ...material,
      id: material.id,
    });
    setShowMasterMaterialForm(true);
  };

  const resetMasterMaterialForm = () => {
    setEditingMasterMaterial(null);
    setNewMasterMaterialData(INITIAL_NEW_MASTER_MATERIAL);
    setShowMasterMaterialForm(false);
  };

  return {
    masterMaterials,
    materialStock,
    loading,
    showMasterMaterialForm,
    setShowMasterMaterialForm,
    editingMasterMaterial,
    setEditingMasterMaterial,
    newMasterMaterialData,
    setNewMasterMaterialData,
    fetchMasterMaterials,
    saveMasterMaterial,
    deleteMasterMaterial,
    editMasterMaterial,
    resetMasterMaterialForm,
  };
}
