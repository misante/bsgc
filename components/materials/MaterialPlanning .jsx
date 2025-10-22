"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Save,
  Edit2,
  Trash2,
  Search,
  Filter,
  Download,
  Calendar,
  Building,
  Package,
  Calculator,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  X,
  User,
  FileText,
  Loader2,
} from "lucide-react";
import { FaMoon, FaSun } from "react-icons/fa6";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import { useProcurement } from "@/hooks/useProcurement";

const MaterialPlanning = () => {
  const [plannedMaterials, setPlannedMaterials] = useState([]);
  const [masterMaterials, setMasterMaterials] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPhase, setFilterPhase] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [addingRequirement, setAddingRequirement] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [projects, setProjects] = useState([]);
  const [showProcurementModal, setShowProcurementModal] = useState(false);
  const [isCreatingProcurement, setIsCreatingProcurement] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [procurementData, setProcurementData] = useState({
    requirement_id: "",
    material_id: "",
    quantity: 0,
    unit_cost: 0,
    expected_delivery: "",
    project_phase: "",
    material_name: "",
    supplier_id: "",
    supplier_name: "",
    notes: "",
    priority: "medium",
  });
  const [suppliers, setSuppliers] = useState([]);
  const { fetchProcurementOrders } = useProcurement();

  // Sample project phases
  const projectPhases = [
    "Foundation",
    "Structural",
    "Enclosure",
    "Finishing",
    "MEP",
    "Landscaping",
  ];

  // Initialize new material requirement
  const newMaterialRequirement = {
    master_material_id: "",
    required_date: "",
    project_id: "",
    project_phase: "",
    quantity: 0,
    unit_cost: 0,
    total_cost: 0,
    material_name: "",
    status: "planned",
  };

  const [newMaterialData, setNewMaterialData] = useState({
    ...newMaterialRequirement,
  });

  // Load suppliers
  const loadSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      const data = await response.json();
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  };

  useEffect(() => {
    if (procurementData.supplier_id) {
      const selectedSupplierData = suppliers.find(
        (supplier) => parseInt(procurementData.supplier_id) === supplier.id
      );
      if (selectedSupplierData !== null) {
        setSupplierName(selectedSupplierData.name);
      }
    }
  }, [procurementData.supplier_id]);
  // Add to your existing useEffect that loads data
  useEffect(() => {
    loadMasterMaterials();
    loadMaterialRequirements();
    fetchProjects();
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (selectedMaterialId) {
      const fetchMaterialDetail = async () => {
        try {
          const response = await fetch(
            `/api/materials/master-materials/${selectedMaterialId}`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch material details");
          }
          const selectedMaterial = await response.json();
          setSelectedDetail(selectedMaterial);

          // Auto-populate the form fields
          setNewMaterialData((prev) => ({
            ...prev,
            material_name: selectedMaterial.name || "",
            unit_cost: selectedMaterial.unit_cost || 0,
            master_material_id: selectedMaterialId,
          }));
        } catch (error) {
          console.error("Error fetching material details:", error);
        }
      };
      fetchMaterialDetail();
    }
  }, [selectedMaterialId]);

  // Calculate total cost
  useEffect(() => {
    const quantity = parseFloat(newMaterialData.quantity) || 0;
    const unitCost = parseFloat(newMaterialData.unit_cost) || 0;
    const totalCost = quantity * unitCost;

    setNewMaterialData((prev) => ({
      ...prev,
      total_cost: totalCost,
    }));
  }, [newMaterialData.quantity, newMaterialData.unit_cost]);

  const fetchProjects = async () => {
    const resp = await fetch("/api/projects");
    const response = await resp.json();
    setProjects(response);
  };
  // Load master materials
  const loadMasterMaterials = async () => {
    try {
      const response = await fetch("/api/materials/master-materials");
      const data = await response.json();
      setMasterMaterials(data.materials || []);
    } catch (error) {
      console.error("Error loading master materials:", error);
    }
  };

  const loadMaterialRequirements = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/materials/requirements");
      const data = await response.json();
      setPlannedMaterials(data.requirements || []);
    } catch (error) {
      console.error("Error loading material requirements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMaterialRequirement = async (newMaterialData) => {
    setAddingRequirement(true);
    try {
      const url = newMaterialData.id
        ? `/api/materials/requirements/${newMaterialData.id}`
        : "/api/materials/requirements";
      const method = newMaterialData.id ? "PATCH" : "POST";

      const materialData = {
        ...newMaterialData,
        status: newMaterialData.status || "planned",
      };
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(materialData),
      });

      if (response.ok) {
        toast.success("Material requirement added successfully!");

        await loadMaterialRequirements();
        setEditingId(null);
        if (!newMaterialData.id) {
          setNewMaterialData({ ...newMaterialRequirement });
        }
      }
    } catch (error) {
      console.error("Error saving material requirement:", error);
      toast.error("Failed to save material requirement");
    } finally {
      setAddingRequirement(false);
    }
  };

  const deleteMaterialRequirement = async (id) => {
    if (!confirm("Are you sure you want to delete this material requirement?"))
      return;

    try {
      const response = await fetch(`/api/materials/requirements/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadMaterialRequirements();
      }
    } catch (error) {
      console.error("Error deleting material requirement:", error);
    }
  };

  // Create procurement order with modal
  const createProcurementOrder = async (materialRequirement) => {
    // Initialize procurement data
    setProcurementData({
      requirement_id: materialRequirement.id,
      material_id: materialRequirement.master_material_id,
      quantity: materialRequirement.quantity,
      unit_cost: materialRequirement.unit_cost,
      total_cost: materialRequirement.total_cost,
      expected_delivery: materialRequirement.required_date,
      project_phase: materialRequirement.project_phase,
      material_name: materialRequirement.material_name,
      supplier_id: "",
      supplier_name: "",
      notes: "",
      priority: "medium",
    });
    setShowProcurementModal(true);
  };
  // Save procurement order
  const saveProcurementOrder = async () => {
    setIsCreatingProcurement(true);
    try {
      const response = await fetch("/api/procurement/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...procurementData,
          total_cost:
            procurementData.total_cost ||
            procurementData.quantity * procurementData.unit_cost,
          supplier_name: supplierName,
        }),
      });

      if (response.ok) {
        // Update the material requirement status to "ordered"
        const updateResponse = await fetch(
          `/api/materials/requirements/${procurementData.requirement_id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ordered" }),
          }
        );

        if (updateResponse.ok) {
          toast.success("Procurement order created successfully!");
          setShowProcurementModal(false);
          await loadMaterialRequirements();
          await fetchProcurementOrders();
        } else {
          toast.error("Order created but failed to update material status");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error creating procurement order");
      }
    } catch (error) {
      console.error("Error creating procurement order:", error);
      toast.error("Failed to create procurement order. Please try again.");
    } finally {
      setIsCreatingProcurement(false);
    }
  };
  // Reset form and filters
  const resetAll = () => {
    setNewMaterialData({ ...newMaterialRequirement });
    setSearchTerm("");
    setFilterPhase("all");
    setFilterProject("all");
    setDateRange({ start: "", end: "" });
    setEditingId(null);
  };

  // Show material details
  const showMaterialDetails = (material) => {
    setSelectedMaterial(material);
    setShowDetailModal(true);
  };

  // Get selected master material
  const getSelectedMasterMaterial = () => {
    return masterMaterials.find(
      (m) => m.id === parseInt(newMaterialData.master_material_id)
    );
  };

  // Get unique projects for filter
  const uniqueProjects = [
    ...new Set(plannedMaterials.map((material) => material.project_id)),
  ];

  // Filter materials
  const filteredMaterials = plannedMaterials.filter((material) => {
    const materialName = material.master_materials?.name || "";
    const matchesSearch =
      materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.project_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhase =
      filterPhase === "all" || material.project_phase === filterPhase;
    const matchesProject =
      filterProject === "all" || material.project_id === filterProject;

    // Date range filter
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const materialDate = new Date(material.required_date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = materialDate >= startDate && materialDate <= endDate;
    }

    return matchesSearch && matchesPhase && matchesProject && matchesDate;
  });

  // Load data on component mount
  useEffect(() => {
    loadMasterMaterials();
    loadMaterialRequirements();
    fetchProjects();
    loadSuppliers();
  }, []);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const isDarkMode =
      localStorage.getItem("darkMode") === "true" ||
      (!localStorage.getItem("darkMode") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDarkMode(isDarkMode);
    updateDarkMode(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    updateDarkMode(newDarkMode);
  };

  const updateDarkMode = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // PDF Export Function
  const exportToPDF = (plannedMaterials, filters = {}) => {
    const doc = new jsPDF("landscape");

    // Colors
    const primaryColor = [41, 128, 185];
    const secondaryColor = [52, 152, 219];

    // Header with gradient effect
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 297, 30, "F");

    // Company
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "extraBold");
    doc.text("BSGC", 148.5, 8, { align: "center" });

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("MATERIAL REQUIREMENTS REPORT", 148.5, 16, { align: "center" });

    // Subtitle
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Construction Material Planning - Landscape View", 148.5, 22, {
      align: "center",
    });

    // Report info
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, 40);
    doc.text(`Total Items: ${plannedMaterials.length}`, 15, 45);

    // Table setup
    let yPosition = 60;
    const columnWidths = [45, 25, 30, 25, 15, 20, 25, 30];
    const headers = [
      "Material Name",
      "Required Date",
      "Project ID",
      "Phase",
      "Quantity",
      "Unit Cost",
      "Total Cost",
      "Category",
    ];

    // Draw table header
    doc.setFillColor(...secondaryColor);
    doc.rect(10, yPosition, 277, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");

    let xPosition = 12;
    headers.forEach((header, index) => {
      let displayHeader = header;
      if (header.length > 12 && index !== 0) {
        displayHeader = header.substring(0, 10) + "..";
      }
      doc.text(displayHeader, xPosition, yPosition + 6);
      xPosition += columnWidths[index];
    });

    yPosition += 12;

    // Table rows
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    plannedMaterials.forEach((material, rowIndex) => {
      if (rowIndex % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(10, yPosition - 4, 277, 8, "F");
      }

      const rowData = [
        material.master_materials?.name || "N/A",
        new Date(material.required_date).toLocaleDateString(),
        material.project_id,
        material.project_phase,
        material.quantity.toString(),
        `ETB ${parseFloat(material.unit_cost).toLocaleString()}`,
        `ETB ${parseFloat(material.total_cost).toLocaleString()}`,
        material.master_materials?.category || "N/A",
      ];

      let hasLongMaterialName = false;
      xPosition = 12;

      rowData.forEach((cell, cellIndex) => {
        let displayText = cell;
        const maxLengths = [25, 10, 12, 10, 8, 12, 12, 15];

        if (cell.length > maxLengths[cellIndex]) {
          displayText = cell.substring(0, maxLengths[cellIndex] - 2) + "..";
        }

        if (cellIndex === 0 && cell.length > 25) {
          hasLongMaterialName = true;
          const words = cell.split(" ");
          let line1 = "";
          let line2 = "";

          for (let word of words) {
            if ((line1 + word).length <= 20) {
              line1 += (line1 ? " " : "") + word;
            } else if ((line2 + word).length <= 20) {
              line2 += (line2 ? " " : "") + word;
            } else {
              break;
            }
          }

          if (line2) {
            doc.text(line1, xPosition, yPosition - 2);
            doc.text(line2, xPosition, yPosition + 2);
          } else {
            doc.text(displayText, xPosition, yPosition);
          }
        } else {
          doc.text(displayText, xPosition, yPosition);
        }

        xPosition += columnWidths[cellIndex];
      });

      yPosition += hasLongMaterialName ? 12 : 8;

      if (yPosition > 190 && rowIndex < plannedMaterials.length - 1) {
        doc.addPage("landscape");
        yPosition = 30;

        doc.setFillColor(...secondaryColor);
        doc.rect(10, yPosition, 277, 8, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");

        xPosition = 12;
        headers.forEach((header, index) => {
          let displayHeader = header;
          if (header.length > 12 && index !== 0) {
            displayHeader = header.substring(0, 10) + "..";
          }
          doc.text(displayHeader, xPosition, yPosition + 6);
          xPosition += columnWidths[index];
        });

        yPosition += 12;
        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "normal");
      }
    });

    // Summary section
    const totalQuantity = plannedMaterials.reduce(
      (sum, mat) => sum + parseFloat(mat.quantity),
      0
    );
    const totalCost = plannedMaterials.reduce(
      (sum, mat) => sum + parseFloat(mat.total_cost),
      0
    );
    const uniqueProjects = new Set(
      plannedMaterials.map((mat) => mat.project_id)
    ).size;

    yPosition += 15;
    doc.setFillColor(241, 241, 241);
    doc.rect(10, yPosition, 277, 25, "F");

    doc.setTextColor(44, 62, 80);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("SUMMARY", 15, yPosition + 8);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `• Total Materials: ${plannedMaterials.length}`,
      15,
      yPosition + 16
    );
    doc.text(
      `• Total Quantity: ${totalQuantity.toLocaleString()}`,
      15,
      yPosition + 22
    );
    doc.text(`• Unique Projects: ${uniqueProjects}`, 150, yPosition + 16);
    doc.text(
      `• Grand Total: ETB ${totalCost.toLocaleString()}`,
      150,
      yPosition + 22
    );

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} - Generated by Construction Material Management System`,
        148.5,
        205,
        { align: "center" }
      );
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
    doc.save(`material-requirements-${timestamp}.pdf`);
  };

  // CSV Export
  const exportMaterials = () => {
    const dataToExport = filteredMaterials.map((material) => ({
      "Material Name": material.master_materials?.name,
      "Required Date": material.required_date,
      "Project ID": material.project_id,
      "Project Phase": material.project_phase,
      Quantity: material.quantity,
      "Unit Cost": material.unit_cost,
      "Total Cost": material.total_cost,
      Category: material.master_materials?.category,
      "Created At": material.created_at,
      "Updated At": material.updated_at,
    }));

    const csv = convertToCSV(dataToExport);
    downloadCSV(csv, "material_requirements.csv");
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    );
    return [headers, ...rows].join("\n");
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Material Planning
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Plan material requirements based on master materials catalog
              </p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors duration-200"
                  title={
                    darkMode ? "Switch to light mode" : "Switch to dark mode"
                  }
                >
                  <span className="sr-only">
                    {darkMode ? "Switch to light mode" : "Switch to dark mode"}
                  </span>
                  {darkMode ? (
                    <FaSun
                      className="h-5 w-5 text-yellow-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <FaMoon
                      className="h-5 w-5 text-gray-600"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetAll}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={exportMaterials}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 10px 30px rgba(147, 51, 234, 0.3)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  exportToPDF(filteredMaterials, {
                    searchTerm,
                    filterPhase,
                    filterProject,
                    dateRange,
                  })
                }
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FileText className="w-5 h-5" />
                <span className="font-semibold">Export PDF</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search materials or project ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Phases</option>
              {projectPhases.map((phase) => (
                <option key={phase} value={phase}>
                  {phase}
                </option>
              ))}
            </select>

            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Projects</option>
              {uniqueProjects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              {filteredMaterials.length} materials found •{" "}
              {masterMaterials.length} master materials available
            </div>
            {(searchTerm ||
              filterPhase !== "all" ||
              filterProject !== "all" ||
              dateRange.start ||
              dateRange.end) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterPhase("all");
                  setFilterProject("all");
                  setDateRange({ start: "", end: "" });
                }}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </motion.div>
        {/* Add New Material Requirement Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingId
              ? "Edit Material Requirement"
              : "Add New Material Requirement"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Material Selection from Master List */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Material ID *
              </label>
              <select
                required
                value={newMaterialData.master_material_id}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedMaterial = masterMaterials.find(
                    (m) => m.id === parseInt(selectedId)
                  );

                  setNewMaterialData((prev) => ({
                    ...prev,
                    master_material_id: selectedId,
                    material_name: selectedMaterial
                      ? selectedMaterial.name
                      : "",
                    unit_cost: selectedMaterial
                      ? selectedMaterial.unit_cost
                      : 0,
                  }));
                }}
                className="w-full capitalize px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Material</option>
                {masterMaterials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.name} ({material.unit}) - ETB {material.unit_cost}
                    {material.category ? ` - ${material.category}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Material Name *
              </label>
              <input
                type="text"
                readOnly
                value={newMaterialData.material_name || ""}
                className="w-full capitalize px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                placeholder="Auto-populated from Material ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit Cost (ETB) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newMaterialData.unit_cost || 0}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Required Date *
              </label>
              <input
                type="date"
                value={newMaterialData.required_date}
                onChange={(e) =>
                  setNewMaterialData({
                    ...newMaterialData,
                    required_date: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project ID *
              </label>
              <select
                required
                value={newMaterialData.project_id}
                onChange={(e) =>
                  setNewMaterialData({
                    ...newMaterialData,
                    project_id: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Project Id</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Phase *
              </label>
              <select
                value={newMaterialData.project_phase}
                onChange={(e) =>
                  setNewMaterialData({
                    ...newMaterialData,
                    project_phase: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select Phase</option>
                {projectPhases.map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newMaterialData.quantity}
                onChange={(e) =>
                  setNewMaterialData({
                    ...newMaterialData,
                    quantity: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              {getSelectedMasterMaterial() && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Unit: {getSelectedMasterMaterial().unit}
                </p>
              )}
            </div>
          </div>

          {/* Total Cost Display */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  Total Cost:
                </span>
                {getSelectedMasterMaterial() && (
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    ({getSelectedMasterMaterial().name})
                  </span>
                )}
              </div>
              <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                ETB {newMaterialData.total_cost.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => saveMaterialRequirement(newMaterialData)}
              disabled={
                !newMaterialData.master_material_id ||
                !newMaterialData.required_date ||
                !newMaterialData.project_id
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {addingRequirement ? (
                <Loader2 className="animate-spin mx-auto h-6 w-6" />
              ) : (
                <div className="flex gap-1 items-center">
                  <Plus className="w-4 h-4" />
                  Add Requirement
                </div>
              )}
            </motion.button>
          </div>
        </motion.div>
        {/* Materials Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Required Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Project ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phase
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Unit Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                <AnimatePresence>
                  {isLoading ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredMaterials.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No material requirements found.</p>
                        <p className="text-sm mt-1">
                          Add your first requirement from the form above
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((material, index) => (
                      <motion.tr
                        key={material.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                        onClick={() => showMaterialDetails(material)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white capitalize">
                                {material.master_materials?.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {material.master_materials?.unit}
                                {material.master_materials?.category && (
                                  <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                                    {material.master_materials.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-900 dark:text-white">
                              {new Date(
                                material.required_date
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="font-mono text-gray-900 dark:text-white">
                              {material.project_id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {material.project_phase}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 dark:text-white">
                            {material.quantity.toLocaleString()}
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                              {material.master_materials?.unit}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 dark:text-white">
                            ETB{" "}
                            {parseFloat(material.unit_cost).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-green-600 dark:text-green-400">
                            ETB{" "}
                            {parseFloat(material.total_cost).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => showMaterialDetails(material)}
                              className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setEditingId(material.id);
                                setNewMaterialData({
                                  master_material_id:
                                    material.master_material_id,
                                  required_date:
                                    material.required_date.split("T")[0],
                                  project_id: material.project_id,
                                  project_phase: material.project_phase,
                                  quantity: material.quantity,
                                  unit_cost: material.unit_cost,
                                  total_cost: material.total_cost,
                                  id: material.id,
                                });
                              }}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => createProcurementOrder(material)}
                              className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                              title="Create Procurement Order"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                deleteMaterialRequirement(material.id)
                              }
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
        {/* Enhanced Procurement Order Modal */}
        <AnimatePresence>
          {showProcurementModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowProcurementModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header - Fixed */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                    Create Procurement Order
                  </h3>
                  <button
                    onClick={() => setShowProcurementModal(false)}
                    disabled={isCreatingProcurement}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Material Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-600" />
                          Material Information
                        </h4>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Material Name
                          </label>
                          <input
                            disabled
                            type="text"
                            value={procurementData.material_name}
                            onChange={(e) =>
                              setProcurementData((prev) => ({
                                ...prev,
                                material_name: e.target.value,
                              }))
                            }
                            className="w-full capitalize px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={procurementData.quantity}
                            onChange={(e) => {
                              const quantity = parseFloat(e.target.value) || 0;
                              const unitCost =
                                parseFloat(procurementData.unit_cost) || 0;
                              setProcurementData((prev) => ({
                                ...prev,
                                quantity: e.target.value,
                                total_cost: quantity * unitCost,
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Unit Cost (ETB) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={procurementData.unit_cost}
                            onChange={(e) => {
                              const unitCost = parseFloat(e.target.value) || 0;
                              const quantity =
                                parseFloat(procurementData.quantity) || 0;
                              setProcurementData((prev) => ({
                                ...prev,
                                unit_cost: e.target.value,
                                total_cost: quantity * unitCost,
                              }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Building className="w-5 h-5 text-green-600" />
                          Project Details
                        </h4>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Project Phase
                          </label>
                          <select
                            value={procurementData.project_phase}
                            onChange={(e) =>
                              setProcurementData((prev) => ({
                                ...prev,
                                project_phase: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Select Phase</option>
                            {projectPhases.map((phase) => (
                              <option key={phase} value={phase}>
                                {phase}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Expected Delivery Date *
                          </label>
                          <input
                            type="date"
                            value={procurementData.expected_delivery}
                            onChange={(e) =>
                              setProcurementData((prev) => ({
                                ...prev,
                                expected_delivery: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Priority
                          </label>
                          <select
                            value={procurementData.priority}
                            onChange={(e) =>
                              setProcurementData((prev) => ({
                                ...prev,
                                priority: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Supplier Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-orange-600" />
                        Supplier Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Select Supplier *
                          </label>
                          <select
                            required
                            value={procurementData.supplier_id}
                            onChange={(e) => {
                              const selectedSupplier = suppliers.find(
                                (s) => s.id === e.target.value
                              );
                              setProcurementData((prev) => ({
                                ...prev,
                                supplier_id: e.target.value,
                                supplier_name: selectedSupplier
                                  ? selectedSupplier.name
                                  : "",
                              }));
                            }}
                            className="w-full capitalize px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            <option value="">Select Supplier</option>
                            {suppliers.map((supplier) => (
                              <option
                                key={supplier.id}
                                value={supplier.id}
                                className="capitalize"
                              >
                                {supplier.name} - {supplier.contact_email}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Supplier Name
                          </label>
                          <input
                            type="text"
                            value={procurementData.supplier_name}
                            onChange={(e) =>
                              setProcurementData((prev) => ({
                                ...prev,
                                supplier_name: e.target.value,
                              }))
                            }
                            className="w-full capitalize px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="Or enter supplier name manually"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        value={procurementData.notes}
                        onChange={(e) =>
                          setProcurementData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        rows="3"
                        className="w-full capitalize px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-vertical"
                        placeholder="Any special instructions or notes for this procurement order..."
                      />
                    </div>

                    {/* Cost Summary */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        Cost Summary
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Quantity
                          </p>
                          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                            {procurementData.quantity || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Unit Cost
                          </p>
                          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                            ETB{" "}
                            {parseFloat(
                              procurementData.unit_cost || 0
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Total Cost
                          </p>
                          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                            ETB{" "}
                            {parseFloat(
                              procurementData.total_cost || 0
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowProcurementModal(false)}
                    disabled={isCreatingProcurement}
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveProcurementOrder}
                    disabled={
                      isCreatingProcurement ||
                      (!procurementData.supplier_id &&
                        !procurementData.supplier_name) ||
                      !procurementData.quantity ||
                      !procurementData.unit_cost ||
                      !procurementData.expected_delivery
                    }
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 min-w-[180px] justify-center"
                  >
                    {isCreatingProcurement ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Create Procurement Order
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>{" "}
        {/* Material Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedMaterial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header - Fixed */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="w-6 h-6" />
                    Material Requirement Details
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Material Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-600" />
                          Material Information
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Material Name
                            </label>
                            <p className="text-gray-900 dark:text-white font-medium capitalize">
                              {selectedMaterial.master_materials?.name}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Category
                            </label>
                            <p className="text-gray-900 dark:text-white">
                              {selectedMaterial.master_materials?.category ||
                                "Not specified"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Unit
                            </label>
                            <p className="text-gray-900 dark:text-white">
                              {selectedMaterial.master_materials?.unit}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Requirement Details */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-green-600" />
                          Requirement Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Required Date
                            </label>
                            <p className="text-gray-900 dark:text-white">
                              {new Date(
                                selectedMaterial.required_date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Project ID
                            </label>
                            <p className="text-gray-900 dark:text-white font-mono">
                              {selectedMaterial.project_id}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Project Phase
                            </label>
                            <p className="text-gray-900 dark:text-white">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {selectedMaterial.project_phase}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cost Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-purple-600" />
                        Cost Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Quantity
                          </label>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedMaterial.quantity.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedMaterial.master_materials?.unit}
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Unit Cost
                          </label>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ETB{" "}
                            {parseFloat(
                              selectedMaterial.unit_cost
                            ).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            per unit
                          </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <label className="text-sm font-medium text-green-700 dark:text-green-300">
                            Total Cost
                          </label>
                          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                            ETB{" "}
                            {parseFloat(
                              selectedMaterial.total_cost
                            ).toLocaleString()}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            calculated total
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-600" />
                        System Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Created
                          </label>
                          <p className="text-gray-900 dark:text-white">
                            {new Date(
                              selectedMaterial.created_at
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Last Updated
                          </label>
                          <p className="text-gray-900 dark:text-white">
                            {new Date(
                              selectedMaterial.updated_at
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Footer */}
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Close
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      createProcurementOrder(selectedMaterial);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Create Procurement Order
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Summary Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Requirements
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {plannedMaterials.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Quantity
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {plannedMaterials
                    .reduce((sum, mat) => sum + parseFloat(mat.quantity), 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Calculator className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Cost
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  ETB{" "}
                  {plannedMaterials
                    .reduce((sum, mat) => sum + parseFloat(mat.total_cost), 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Projects
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {new Set(plannedMaterials.map((mat) => mat.project_id)).size}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Building className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MaterialPlanning;
