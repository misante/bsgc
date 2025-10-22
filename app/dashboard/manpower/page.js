"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Search, Filter, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StaffList from "./StaffList";
import AddStaffModal from "./AddStaffModal";
import StaffDetailsModal from "./StaffDetailsModal";
import EditStaffModal from "./EditStaffModal";
import { useManpower } from "@/contexts/ManpowerContext";
import toast from "react-hot-toast";

const roles = [
  "Project Manager",
  "Construction Engineer",
  "Office Engineer",
  "Architect",
  "Structural Engineer",
  "Electrical Engineer",
  "Sanitary Engineer",
  "Mechanical Engineer",
  "Construction Foreman",
  "Surveyor",
  "Safety Officer",
  "Skilled Labor",
  "Unskilled Labor",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

export default function ManpowerPage() {
  const [staff, setStaff] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({
    type: null,
    staff: null,
  });

  // Use the manpower context - now with full user data from Supabase
  const { manpower, loading: userLoading, error: userError } = useManpower();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching staff and projects data...");

      const [staffResponse, projectsResponse] = await Promise.all([
        fetch("/api/manpower"),
        fetch("/api/projects?simple=true"),
      ]);

      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        setStaff(staffData);
        console.log("✅ Staff data loaded:", staffData.length, "records");
      } else {
        console.error("❌ Failed to load staff data");
      }

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
        console.log("✅ Projects data loaded:", projectsData.length, "records");
      } else {
        console.error("❌ Failed to load projects data");
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter((person) => {
    const matchesFilter = filter === "all" || person.role === filter;
    const matchesSearch =
      person.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: staff.length,
    active: staff.filter((person) => person.status === "active").length,
    onProject: staff.filter((person) => person.project_id).length,
    totalHourlyCost: staff.reduce(
      (sum, person) => sum + (person.hourly_rate || 0),
      0
    ),
    byRole: roles.reduce((acc, role) => {
      acc[role] = staff.filter((person) => person.role === role).length;
      return acc;
    }, {}),
  };

  // MISSING FUNCTION: Handle viewing staff details
  const handleViewDetails = (staffMember) => {
    setModalState({ type: "details", staff: staffMember });
  };

  const handleAddStaff = () => {
    setModalState({ type: "add", staff: null });
  };

  const handleSaveStaff = async (staffData) => {
    try {
      const response = await fetch("/api/manpower", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ manpowerData: staffData }),
      });

      if (response.ok) {
        await fetchData();
        handleCloseModal();
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      console.error("Error adding staff:", error);
      alert(`Error adding staff: ${error.message}`);
    }
  };

  const handleUpdateStaff = async (staffData) => {
    try {
      // Use the full manpower data from Supabase for updated_by
      const staffWithUpdater = {
        ...staffData,
        project_id: parseInt(staffData.project_id),
        updated_by: manpower?.email || "Unknown User",
        updated_at: new Date().toISOString(),
      };

      const response = await fetch(`/api/manpower/user/edit/${staffData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updateData: staffWithUpdater }),
      });

      if (response.ok) {
        await fetchData();
        handleCloseModal();
        toast.success("Data Update Successful", { duration: 4000 });
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      console.error("Error updating staff:", error);
      alert(`Error updating staff: ${error.message}`);
    }
  };

  // MISSING FUNCTION: Handle editing staff (opens edit modal)
  const handleEditStaff = (staffMember) => {
    setModalState({ type: "edit", staff: staffMember });
  };

  // MISSING FUNCTION: Get project name by ID
  const getProjectName = (projectId) => {
    if (!projectId) return "Not Assigned";
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Project Not Found";
  };

  // MISSING FUNCTION: Close modal
  const handleCloseModal = () => {
    setModalState({ type: null, staff: null });
  };

  // Show loading while user data is being fetched
  if (userLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading user information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error if user data failed to load
  if (userError && !manpower) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              User Data Error
            </h3>
            <p className="text-gray-600 mb-4">{userError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-bold text-gray-900 dark:text-white"
              >
                Manpower Management
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-2 text-gray-600 dark:text-gray-400"
              >
                Manage construction staff, assignments, and resources
                {manpower && (
                  <span className="text-sm text-blue-600 ml-2">
                    (Logged in as: {manpower.first_name} {manpower.last_name} -{" "}
                    {manpower.role})
                  </span>
                )}
              </motion.p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddStaff}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Staff Member
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Total Staff Card */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl py-2 px-4 text-white shadow-lg"
          >
            <div className="w-full flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Staff</p>
                <p className="text-xl font-bold">{stats.total}</p>
                <p className="text-blue-100 text-xs">All team members</p>
              </div>
              <div className="bg-blue-400/20 p-3 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </motion.div>

          {/* Active Staff Card */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 rounded-2xl py-2 px-4 text-white shadow-lg"
          >
            <div className="w-full flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active</p>
                <p className="text-xl font-bold">{stats.active}</p>
                <p className="text-blue-100 text-xs">Currently working</p>
              </div>
              <div className="bg-green-400/20 p-3 rounded-xl">
                <div className="h-2 w-2 bg-green-300 rounded-full animate-pulse" />
              </div>
            </div>
          </motion.div>

          {/* Assigned to Projects */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl py-2 px-4 text-white shadow-lg"
          >
            <div className="w-full flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">
                  On Projects
                </p>
                <p className="text-xl font-bold">{stats.onProject}</p>
                <p className="text-purple-100 text-xs">Assigned to work</p>
              </div>
              <div className="bg-purple-400/20 p-3 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </motion.div>

          {/* Hourly Cost */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl py-2 px-4 text-white shadow-lg"
          >
            <div className="w-full flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">
                  Hourly Cost
                </p>
                <p className="text-xl font-bold">${stats.totalHourlyCost}/hr</p>
                <p className="text-orange-100 text-xs">Total labor cost</p>
              </div>
              <div className="bg-orange-400/20 p-3 rounded-xl">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, role, email, or specialization..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative lg:w-64">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none cursor-pointer transition-all duration-200"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          <AnimatePresence>
            {(searchTerm || filter !== "all") && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-wrap gap-2"
              >
                {searchTerm && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm("")}
                      className="ml-2 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </motion.span>
                )}
                {filter !== "all" && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Role: {filter}
                    <button
                      onClick={() => setFilter("all")}
                      className="ml-2 hover:text-green-600"
                    >
                      ×
                    </button>
                  </motion.span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Staff List */}
        <motion.div variants={itemVariants}>
          <StaffList
            staff={filteredStaff}
            projects={projects}
            loading={loading}
            onViewDetails={handleViewDetails}
            onEditStaff={handleEditStaff} // Pass the edit function
            getProjectName={getProjectName} // Pass the project name function
          />
        </motion.div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {modalState.type === "add" && (
          <AddStaffModal
            onClose={handleCloseModal}
            onSave={handleSaveStaff}
            roles={roles}
            projects={projects}
            currentUser={manpower}
          />
        )}
        {modalState.type === "edit" && modalState.staff && (
          <EditStaffModal
            staff={modalState.staff}
            onClose={handleCloseModal}
            onUpdate={handleUpdateStaff}
            roles={roles}
            projects={projects}
            currentUser={manpower}
          />
        )}
        {modalState.type === "details" && modalState.staff && (
          <StaffDetailsModal
            staff={modalState.staff}
            projects={projects}
            onClose={handleCloseModal}
            onEdit={handleEditStaff}
            getProjectName={getProjectName}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
