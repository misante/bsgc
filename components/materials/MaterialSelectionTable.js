// components/materials/MaterialSelectionTable.js
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Package,
  Calendar,
  Building,
  CheckCircle,
  Eye,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";

const MaterialSelectionTable = ({ onMaterialSelect, onClose, isOpen }) => {
  const [plannedMaterials, setPlannedMaterials] = useState([]);
  const [masterMaterials, setMasterMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPhase, setFilterPhase] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  // Sample project phases
  const projectPhases = [
    "Foundation",
    "Structural",
    "Enclosure",
    "Finishing",
    "MEP",
    "Landscaping",
  ];

  // Load data
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

  const fetchProjects = async () => {
    try {
      const resp = await fetch("/api/projects");
      const response = await resp.json();
      setProjects(response);
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMasterMaterials();
      loadMaterialRequirements();
      fetchProjects();
    }
  }, [isOpen]);

  // Get unique projects for filter
  const uniqueProjects = [
    ...new Set(plannedMaterials.map((material) => material.project_id)),
  ];

  // Filter materials - only show planned materials (not ordered yet)
  const filteredMaterials = plannedMaterials.filter((material) => {
    const materialName = material.master_materials?.name || "";
    const matchesSearch =
      materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.project_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhase =
      filterPhase === "all" || material.project_phase === filterPhase;
    const matchesProject =
      filterProject === "all" || material.project_id === filterProject;
    const isPlanned = material.status === "planned" || !material.status;

    return matchesSearch && matchesPhase && matchesProject && isPlanned;
  });

  const showMaterialDetails = (material) => {
    setSelectedMaterial(material);
    setShowDetailModal(true);
  };

  const handleMaterialSelect = (material) => {
    onMaterialSelect(material);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Select Material for Procurement Order
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose from planned material requirements
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="p-6 border-b dark:border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <select
                  value={filterPhase}
                  onChange={(e) => setFilterPhase(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="all">All Projects</option>
                  {uniqueProjects.map((project) => (
                    <option key={project} value={project}>
                      {project}
                    </option>
                  ))}
                </select>

                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  {filteredMaterials.length} materials found
                </div>
              </div>
            </div>

            {/* Materials Table */}
            <div className="flex-1 overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-300">
                        Material
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-300">
                        Required Date
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-300">
                        Project
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-300">
                        Phase
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-300">
                        Quantity
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-300">
                        Unit Cost
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-300">
                        Total Cost
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {isLoading ? (
                      <tr>
                        <td colSpan="8" className="px-4 py-8 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredMaterials.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No planned materials found.</p>
                          <p className="text-sm mt-1">
                            All materials have been ordered or no requirements
                            exist
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredMaterials.map((material) => (
                        <motion.tr
                          key={material.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white capitalize">
                                  {material.master_materials?.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {material.master_materials?.unit}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-900 dark:text-white">
                                {new Date(
                                  material.required_date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Building className="h-3 w-3 text-gray-400" />
                              <span className="font-mono text-gray-900 dark:text-white">
                                {material.project_id}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {material.project_phase}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-gray-900 dark:text-white">
                              {material.quantity.toLocaleString()}
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                {material.master_materials?.unit}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-gray-900 dark:text-white">
                              ETB{" "}
                              {parseFloat(material.unit_cost).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-green-600 dark:text-green-400">
                              ETB{" "}
                              {parseFloat(material.total_cost).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => showMaterialDetails(material)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleMaterialSelect(material)}
                                className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                                title="Select Material"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Material Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedMaterial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Material Details
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Material
                        </label>
                        <p className="text-gray-900 dark:text-white capitalize">
                          {selectedMaterial.master_materials?.name}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Quantity
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedMaterial.quantity}{" "}
                          {selectedMaterial.master_materials?.unit}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Project
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedMaterial.project_id}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Phase
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {selectedMaterial.project_phase}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Unit Cost
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          ETB{" "}
                          {parseFloat(
                            selectedMaterial.unit_cost
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Cost
                        </label>
                        <p className="text-green-600 dark:text-green-400 font-semibold">
                          ETB{" "}
                          {parseFloat(
                            selectedMaterial.total_cost
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleMaterialSelect(selectedMaterial);
                      setShowDetailModal(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Select Material
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </AnimatePresence>,
    document.body
  );
};

export default MaterialSelectionTable;
