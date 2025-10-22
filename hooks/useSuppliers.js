import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      console.log("suppliers data:", data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  }, []);
  const handleAddSupplier = async (supplierData) => {
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierData),
      });
      if (res.ok) {
        await fetchSuppliers();
        setShowAddSupplierModal(false);
        toast.success("Supplier added successfully");
        return true;
      } else {
        toast.error("Failed to add supplier");
        return false;
      }
    } catch (error) {
      toast.error("Failed to add supplier");
      return false;
    }
  };

  const handleEditSupplier = async (supplierId, supplierData) => {
    try {
      const res = await fetch(`/api/suppliers/${supplierId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplierData),
      });
      if (res.ok) {
        await fetchSuppliers();
        setShowEditSupplierModal(false);
        setEditingSupplier(null);
        toast.success("Supplier updated successfully");
        return true;
      } else {
        toast.error("Failed to update supplier");
        return false;
      }
    } catch (error) {
      toast.error("Failed to update supplier");
      return false;
    }
  };

  const handleToggleSupplier = async (supplier) => {
    try {
      const res = await fetch(`/api/suppliers/${supplier.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !supplier.is_active }),
      });
      if (res.ok) {
        await fetchSuppliers();
        toast.success(
          `Supplier ${supplier.is_active ? "deactivated" : "activated"}`
        );
        return true;
      } else {
        toast.error("Failed to update supplier status");
        return false;
      }
    } catch (error) {
      toast.error("Failed to update supplier status");
      return false;
    }
  };

  // Add the missing handleEditClick function
  const handleEditClick = (supplier) => {
    setEditingSupplier(supplier);
    setShowEditSupplierModal(true);
  };

  return {
    suppliers,
    loading,
    editingSupplier,
    setEditingSupplier,
    showAddSupplierModal,
    setShowAddSupplierModal,
    showEditSupplierModal,
    setShowEditSupplierModal,
    fetchSuppliers,
    handleAddSupplier,
    handleEditSupplier,
    handleToggleSupplier,
    handleEditClick,
  };
}
