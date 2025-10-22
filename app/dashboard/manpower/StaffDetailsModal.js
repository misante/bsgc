"use client";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  DollarSign,
  Briefcase,
  Calendar,
  GraduationCap,
  ShieldAlert,
  X,
} from "lucide-react";
import { createPortal } from "react-dom";
const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: {
      duration: 0.3,
    },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export default function StaffDetailsModal({
  staff,
  projects,
  onClose,
  onEdit, // NEW: Add this prop
  getProjectName,
}) {
  const getRoleColor = (role) => {
    const colors = {
      "Project Manager":
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "Construction Engineer":
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      // ... same as in StaffList
    };
    return colors[role] || colors["Unskilled Labor"];
  };

  const getStatusConfig = (status) => {
    const config = {
      active: { color: "bg-green-500", label: "Active" },
      inactive: { color: "bg-gray-500", label: "Inactive" },
      on_leave: { color: "bg-yellow-500", label: "On Leave" },
    };
    return config[status] || config.inactive;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const statusConfig = getStatusConfig(staff.status);

  const handleEdit = () => {
    onEdit(staff); // Pass the staff data to parent for editing
  };
  return createPortal(
    <motion.div
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl capitalize font-bold text-white">
                  {staff.first_name} {staff.last_name}
                </h2>
                <p className="text-blue-100">{staff.role}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${statusConfig.color} animate-pulse`}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {statusConfig.label}
              </span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                staff.role
              )}`}
            >
              {staff.role}
            </span>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Personal Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Full Name
                  </span>
                  <span className="text-sm capitalize font-medium text-gray-900 dark:text-white">
                    {staff.first_name} {staff.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Email
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {staff.email || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Phone
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {staff.phone || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Emergency Contact
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {staff.emergency_contact || "N/A"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Employment Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                Employment Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Role
                  </span>
                  <span className="text-sm capitalize font-medium text-gray-900 dark:text-white">
                    {staff.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Specialization
                  </span>
                  <span className="text-sm capitalize font-medium text-gray-900 dark:text-white">
                    {staff.specialization || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Hourly Rate
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {staff.hourly_rate
                      ? formatCurrency(staff.hourly_rate) + "/hr"
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Experience
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {staff.experience_years
                      ? `${staff.experience_years} years`
                      : "N/A"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Project Assignment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
                Project Assignment
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Current Project
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {staff.project_id
                      ? getProjectName(staff.project_id)
                      : "Not Assigned"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Employee ID
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {staff.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Member Since
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {staff.created_at ? formatDate(staff.created_at) : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Last Updated
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {staff.updated_at ? formatDate(staff.updated_at) : "N/A"}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Skills & Expertise */}
            {staff.skills && staff.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ShieldAlert className="h-5 w-5 mr-2 text-orange-600" />
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {staff.skills.map((skill, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="inline-flex capitalize items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium shadow-lg"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Close
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEdit} // UPDATED: Now functional
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all duration-200"
            >
              Edit Profile
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
