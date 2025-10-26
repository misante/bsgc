import { motion } from "framer-motion";
import {
  Users,
  XCircle,
  CheckCircle,
  Edit3,
  MapPin,
  FileText,
  Phone,
  Mail,
  Clock,
  CreditCard,
  Tag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import EditSupplierModal from "./modals/EditSupplierModal";

const SuppliersList = ({
  suppliers,
  onEdit,
  onDelete,
  onEditSupplier,
  // editingSupplier, // Add this prop
  // showEditSupplierModal, // Add this prop
  // setShowEditSupplierModal, // Add this prop
}) => {
  const [expandedSupplier, setExpandedSupplier] = useState(null);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const handleEditClick = (supplier) => {
    setEditingSupplier(supplier);
    setShowEditSupplierModal(true);
  };
  const getRatingColor = (rating) => {
    if (rating >= 4)
      return "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300";
    if (rating >= 3)
      return "text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300";
    return "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300";
  };

  const getStatusColor = (isActive) => {
    return isActive
      ? "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300"
      : "text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-300";
  };

  const toggleExpand = (supplierId) => {
    setExpandedSupplier(expandedSupplier === supplierId ? null : supplierId);
  };

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No suppliers found</p>
        <p className="text-sm mt-2">Add your first supplier to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {suppliers.map((supplier) => (
        <motion.div
          key={supplier.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
        >
          {/* Header - Always Visible */}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md flex-shrink-0">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize truncate">
                    {supplier.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getRatingColor(
                        supplier.rating
                      )}`}
                    >
                      {supplier.rating}/5 ★
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        supplier.is_active
                      )}`}
                    >
                      {supplier.is_active ? (
                        <span className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                          Inactive
                        </span>
                      )}
                    </span>
                    {supplier.category && (
                      <span className="px-2 py-1 capitalize rounded-full text-xs font-semibold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 dark:from-purple-900/30 dark:to-purple-800/30 dark:text-purple-300 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span className="truncate">{supplier.category}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expand Button for Mobile */}
              <button
                onClick={() => toggleExpand(supplier.id)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 lg:hidden flex-shrink-0"
              >
                {expandedSupplier === supplier.id ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Quick Actions - Always Visible */}
            <div className="flex gap-2 mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEditClick(supplier)}
                className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDelete(supplier)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  supplier.is_active
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {supplier.is_active ? (
                  <>
                    <XCircle className="w-4 h-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Activate
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Details Section - Collapsible on Mobile */}
          <div
            className={`border-t border-gray-200 dark:border-gray-700 ${
              expandedSupplier === supplier.id ? "block" : "hidden lg:block"
            }`}
          >
            <div className="p-4">
              {/* Contact Information */}
              <div className="grid grid-cols-2">
                {/* Contact Person */}
                <div className="flex border-b-2 items-center gap-3 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Contact Person
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize truncate">
                      {supplier.contact_person || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex border-b-2 items-center gap-3 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                    <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 font-medium truncate">
                      {supplier.email || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex border-b-2 items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex-shrink-0">
                    <Phone className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Phone
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {supplier.phone || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Delivery Time */}
                <div className="flex border-b-2 items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                    <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Delivery Time
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {supplier.delivery_time_days} days
                    </p>
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="flex border-b-2 items-center gap-3 py-2 px-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0">
                    <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Payment Terms
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {supplier.payment_terms}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-3">
                {supplier.address && (
                  <div className="flex border-b-2 gap-3 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                      <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Address
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 capitalize leading-relaxed">
                        {supplier.address}
                      </p>
                    </div>
                  </div>
                )}

                {supplier.notes && (
                  <div className="flex border-b-2 py-2 gap-3 px-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
                      <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                        Notes
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 capitalize leading-relaxed">
                        {supplier.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Edit Supplier Modal */}
      {showEditSupplierModal && (
        <EditSupplierModal
          isOpen={showEditSupplierModal}
          onClose={() => {
            setShowEditSupplierModal(false);
            setEditingSupplier(null);
          }}
          onUpdate={onEditSupplier}
          supplier={editingSupplier}
        />
      )}
    </div>
  );
};

export default SuppliersList;
