"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  DollarSign,
  Briefcase,
  Calendar,
} from "lucide-react";
import { HiEnvelope, HiOutlineEnvelope } from "react-icons/hi2";

const listVariants = {
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

export default function StaffList({
  staff,
  projects,
  loading,
  onViewDetails,
  getProjectName,
}) {
  const getRoleColor = (role) => {
    const colors = {
      "Project Manager":
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "Construction Engineer":
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "Office Engineer":
        "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      Architect:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "Structural Engineer":
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "Electrical Engineer":
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      "Sanitary Engineer":
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      "Mechanical Engineer":
        "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      "Construction Foreman":
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Surveyor: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
      "Safety Officer":
        "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200",
      "Skilled Labor":
        "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
      "Unskilled Labor":
        "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[role] || colors["Unskilled Labor"];
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        color:
          "bg-green-100 text-xs text-green-800 dark:bg-green-900 dark:text-green-200",
        label: "Active",
      },
      inactive: {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        label: "Inactive",
      },
      on_leave: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        label: "On Leave",
      },
    };
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span
        className={`inline-flex items-center px-1 py-[1px] rounded-full text-[8px] font-medium ${config.color}`}
      >
        <span
          className={`w-[6px] h-[6px] rounded-full mr-1 ${
            status === "active"
              ? "bg-green-400"
              : status === "on_leave"
              ? "bg-yellow-400"
              : "bg-gray-400"
          }`}
        />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center"
      >
        <User className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No staff members found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your search or filter criteria
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={listVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <AnimatePresence>
        {staff.map((person, index) => (
          <motion.div
            key={person.id}
            variants={itemVariants}
            layout
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-200"
          >
            <div className="py-3 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Avatar & Basic Info */}
                  <motion.div whileHover={{ scale: 1.1 }} className="relative">
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 text-xs">
                      {getStatusBadge(person.status)}
                    </div>
                  </motion.div>

                  {/* Simplified Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-sm capitalize font-semibold text-gray-900 dark:text-white">
                        {person.first_name} {person.last_name}
                      </h3>
                      <span
                        className={`md:inline-flex hidden capitalize items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                          person.role
                        )}`}
                      >
                        {person.role}
                      </span>
                    </div>

                    {/* Project Assignment Only */}
                    {person.project_id && (
                      <div className="md:flex hidden capitalize items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <Briefcase className="h-4 w-4" />
                        <span>{getProjectName(person.project_id)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <Mail className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onViewDetails(person)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    View Details
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
