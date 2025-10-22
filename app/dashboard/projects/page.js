// "use client";
// import { useState, useEffect } from "react";
// import DashboardLayout from "@/components/layout/DashboardLayout";
// import ProjectCard from "@/components/projects/ProjectCard";
// import ProjectForm from "@/components/projects/ProjectForm";
// import toast from "react-hot-toast";
// import { motion, AnimatePresence } from "framer-motion";
// import { Plus } from "lucide-react";

// export default function ProjectsPage() {
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Fetch projects from API
//   const fetchProjects = async () => {
//     try {
//       setLoading(true);
//       const url =
//         statusFilter !== "all"
//           ? `/api/projects?status=${statusFilter}`
//           : "/api/projects";

//       const response = await fetch(url);

//       if (!response.ok) {
//         throw new Error(`Failed to fetch projects: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("returned-projecct-data:", data);

//       setProjects(data);
//       setError(null);
//     } catch (err) {
//       console.error("Error fetching projects:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (formData) => {
//     try {
//       const response = await fetch("/api/projects", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to create project");
//       }

//       await fetchProjects();
//       setIsFormOpen(false);
//       toast.success("Project Created Successfully");
//     } catch (error) {
//       console.error("Error creating project:", error);
//       alert("Error creating project");
//     }
//   };

//   // Handle view details
//   const handleViewDetails = (project) => {
//     console.log("View details for:", project);
//   };

//   const handleProjectDelete = (deletedProjectId) => {
//     // Remove the project from your local state
//     setProjects((prevProjects) =>
//       prevProjects.filter((project) => project.id !== deletedProjectId)
//     );
//   };

//   // Fetch projects on component mount and when status filter changes
//   useEffect(() => {
//     fetchProjects();
//   }, [statusFilter]);

//   // Filter projects based on search term
//   const filteredProjects = projects.filter((project) => {
//     if (!searchTerm) return true;

//     return (
//       project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       project.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       project.location?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   });

//   // Show loading state
//   if (loading && projects.length === 0) {
//     return (
//       <DashboardLayout>
//         <div className="flex justify-center items-center h-64">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Loading projects...</p>
//           </div>
//         </div>
//       </DashboardLayout>
//     );
//   }
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         duration: 0.5,
//       },
//     },
//   };
//   return (
//     <DashboardLayout>
//       {/* Header Section */}
//       <motion.div
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//         className="space-y-6"
//       >
//         {" "}
//         {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between"> */}
//         <motion.div variants={itemVariants} className="mb-8">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//             <div>
//               <motion.h1
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 className="text-3xl font-bold text-gray-900 dark:text-white"
//               >
//                 Projects{" "}
//               </motion.h1>
//               <motion.p
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.1 }}
//                 className="mt-2 text-gray-600 dark:text-gray-400"
//               >
//                 Manage all construction projects
//               </motion.p>
//             </div>
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={setIsFormOpen(true)}
//               // onClick={() => setIsFormOpen(true)}
//               className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
//             >
//               <Plus className="h-5 w-5 mr-2" />
//               New Project
//             </motion.button>
//           </div>
//         </motion.div>

//         {/* Filters and Search Section */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
//           <div className="flex flex-col sm:flex-row gap-4">
//             {/* Search */}
//             <div className="flex-1">
//               <label
//                 htmlFor="search"
//                 className="block text-sm font-medium text-gray-700 mb-2"
//               >
//                 Search Projects
//               </label>
//               <div className="relative rounded-md shadow-sm">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <span className="text-gray-400">🔍</span>
//                 </div>
//                 <input
//                   type="text"
//                   id="search"
//                   className="block w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   placeholder="Search by project name, client, or location..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>

//             {/* Status Filter */}
//             <div className="sm:w-48">
//               <label
//                 htmlFor="status"
//                 className="block text-sm font-medium text-gray-700 mb-2"
//               >
//                 Filter by Status
//               </label>
//               <select
//                 id="status"
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//               >
//                 <option value="all">All Status</option>
//                 <option value="Planning">Planning</option>
//                 <option value="In Progress">In Progress</option>
//                 <option value="On Hold">On Hold</option>
//                 <option value="Completed">Completed</option>
//                 <option value="Cancelled">Cancelled</option>
//               </select>
//             </div>
//           </div>
//         </div>
//         {/* Error State */}
//         {error && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
//             <div className="flex items-center">
//               <span className="text-red-500 mr-2">⚠️</span>
//               <span className="text-red-800">{error}</span>
//               <button
//                 onClick={fetchProjects}
//                 className="ml-auto text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
//               >
//                 Retry
//               </button>
//             </div>
//           </div>
//         )}
//         {/* Projects Grid */}
//         {filteredProjects.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {filteredProjects.map((project) => (
//               <ProjectCard
//                 key={project.id}
//                 project={project}
//                 onViewDetails={() => handleViewDetails(project)}
//                 onProjectDelete={handleProjectDelete}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-12">
//             <div className="text-6xl mb-4">🏗️</div>
//             <h3 className="text-lg font-medium text-gray-900 mb-2">
//               {searchTerm || statusFilter !== "all"
//                 ? "No projects found"
//                 : "No projects yet"}
//             </h3>
//             <p className="text-gray-500 mb-4">
//               {searchTerm || statusFilter !== "all"
//                 ? "Try adjusting your search or filter criteria."
//                 : "Get started by creating your first project."}
//             </p>
//             <button
//               onClick={() => setIsFormOpen(true)}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
//             >
//               Create New Project
//             </button>
//           </div>
//         )}
//         {/* Project Form Modal */}
//         <ProjectForm
//           open={isFormOpen}
//           setOpen={setIsFormOpen}
//           onSubmit={handleSubmit}
//         />
//       </motion.div>
//     </DashboardLayout>
//   );
// }
"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectForm from "@/components/projects/ProjectForm";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, AlertCircle, Building } from "lucide-react";

export default function ProjectsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter !== "all"
          ? `/api/projects?status=${statusFilter}`
          : "/api/projects";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const data = await response.json();
      console.log("returned-projecct-data:", data);

      setProjects(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      await fetchProjects();
      setIsFormOpen(false);
      toast.success("Project Created Successfully");
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Error creating project");
    }
  };

  // Handle view details
  const handleViewDetails = (project) => {
    console.log("View details for:", project);
  };

  const handleProjectDelete = (deletedProjectId) => {
    // Remove the project from your local state
    setProjects((prevProjects) =>
      prevProjects.filter((project) => project.id !== deletedProjectId)
    );
  };

  // Fetch projects on component mount and when status filter changes
  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  // Filter projects based on search term
  const filteredProjects = projects.filter((project) => {
    if (!searchTerm) return true;

    return (
      project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  const cardVariants = {
    hidden: {
      y: 30,
      opacity: 0,
      scale: 0.95,
    },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  const filterVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  // Show loading state
  if (loading && projects.length === 0) {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center h-64"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-gray-600"
            >
              Loading projects...
            </motion.p>
          </div>
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                {/* <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent dark:from-white dark:to-blue-200"
                >
                  Projects
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="text-lg text-gray-600 dark:text-gray-400"
                >
                  Manage all construction projects
                </motion.p> */}
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-3xl font-bold text-gray-900 dark:text-white"
                >
                  Projects
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-2 text-gray-600 dark:text-gray-400"
                >
                  Manage all construction projects
                </motion.p>
              </div>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(37, 99, 235, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFormOpen(true)}
                className="group inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm"
              >
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="h-5 w-5 mr-3" />
                </motion.div>
                New Project
              </motion.button>
            </div>
          </motion.div>

          {/* Filters and Search Section */}
          <motion.div
            variants={filterVariants}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-6 mb-8"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <motion.label
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
                >
                  Search Projects
                </motion.label>
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  className="relative rounded-xl shadow-sm"
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <motion.input
                    whileFocus={{
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    type="text"
                    id="search"
                    className="block w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                    placeholder="Search by project name, client, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </motion.div>
              </div>

              {/* Status Filter */}
              <div className="sm:w-56">
                <motion.label
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
                >
                  Filter by Status
                </motion.label>
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <motion.select
                    whileFocus={{
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                    }}
                    id="status"
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm appearance-none cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </motion.select>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Error State */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-6 backdrop-blur-sm"
              >
                <div className="flex items-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  </motion.div>
                  <span className="text-red-800 dark:text-red-200 flex-1">
                    {error}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchProjects}
                    className="ml-4 text-sm bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Retry
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Projects Grid */}
          <AnimatePresence mode="wait">
            {filteredProjects.length > 0 ? (
              <motion.div
                key="projects-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <AnimatePresence>
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      exit="hidden"
                      transition={{ delay: index * 0.1 }}
                      layout
                    >
                      <ProjectCard
                        project={project}
                        onViewDetails={() => handleViewDetails(project)}
                        onProjectDelete={handleProjectDelete}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-sm border border-gray-200/50 dark:border-gray-700/50 text-center py-16 px-6"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-6xl mb-6"
                >
                  <Building className="inline text-gray-400" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-semibold text-gray-900 dark:text-white mb-3"
                >
                  {searchTerm || statusFilter !== "all"
                    ? "No projects found"
                    : "No projects yet"}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto"
                >
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Get started by creating your first project."}
                </motion.p>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 30px rgba(37, 99, 235, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFormOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Create New Project
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Project Form Modal */}
          <ProjectForm
            open={isFormOpen}
            setOpen={setIsFormOpen}
            onSubmit={handleSubmit}
          />
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
