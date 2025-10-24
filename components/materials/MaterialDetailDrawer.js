// import { motion, AnimatePresence } from "framer-motion";
// import { createPortal } from "react-dom";
// import {
//   Package,
//   X,
//   Calendar,
//   MapPin,
//   User,
//   DollarSign,
//   Layers,
// } from "lucide-react";

// const MaterialDetailDrawer = ({ material, onClose, onUpdate, onDelete }) => {
//   const getStatusColor = (quantity, minStockLevel = 0) => {
//     if (quantity <= 0) {
//       return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
//     } else if (quantity <= minStockLevel) {
//       return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
//     } else {
//       return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
//     }
//   };

//   const getStatusText = (quantity, minStockLevel = 0) => {
//     if (quantity <= 0) return "Out of Stock";
//     if (quantity <= minStockLevel) return "Low Stock";
//     return "In Stock";
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "—";
//     return new Date(dateString).toLocaleDateString();
//   };

//   // Get supplier name from material_stock or procurement_orders relation
//   const getSupplierName = (material) => {
//     return (
//       material.supplier_name ||
//       material.procurement_orders?.supplier_name ||
//       "—"
//     );
//   };

//   if (!material) return null;

//   return createPortal(
//     <AnimatePresence>
//       <motion.div
//         key="drawer-backdrop"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         onClick={onClose}
//         className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
//       />
//       <motion.aside
//         key="drawer"
//         initial={{ x: "100%" }}
//         animate={{ x: 0 }}
//         exit={{ x: "100%" }}
//         transition={{ type: "spring", damping: 22, stiffness: 260 }}
//         className="fixed top-0 right-0 h-full w-full sm:w-[480px] max-w-full bg-white dark:bg-gray-900 shadow-2xl z-[80] flex flex-col"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
//           <div className="flex-1 min-w-0">
//             <h3 className="text-lg capitalize font-semibold text-gray-900 dark:text-gray-100 truncate">
//               {material.master_materials?.name || "Unknown Material"}
//             </h3>
//             <p className="text-sm capitalize text-gray-500 dark:text-gray-400 truncate">
//               {material.master_materials?.category || "—"}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             aria-label="Close drawer"
//             className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 ml-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6 flex-1 overflow-y-auto space-y-6">
//           {/* Summary */}
//           <div className="flex items-start gap-4">
//             <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
//               <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
//             </div>
//             <div className="flex-1">
//               <div className="flex items-center justify-between gap-4 mb-4">
//                 <div>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Category
//                   </p>
//                   <p className="font-medium capitalize text-gray-900 dark:text-gray-100">
//                     {material.master_materials?.category || "—"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Unit
//                   </p>
//                   <p className="font-medium text-gray-900 dark:text-gray-100">
//                     {material.master_materials?.unit || "—"}
//                   </p>
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-400">
//                     Current Stock
//                   </p>
//                   <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                     {material.total_quantity} {material.master_materials?.unit}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-400">Min Stock</p>
//                   <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//                     {material.master_materials?.min_stock_level || "—"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Stock Level */}
//           <div>
//             <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
//               <span>Stock Level</span>
//               <span>
//                 {Math.round(
//                   (material.total_quantity /
//                     (material.master_materials?.min_stock_level || 1)) *
//                     100
//                 ) || 0}
//                 %
//               </span>
//             </div>
//             <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
//               <motion.div
//                 initial={{ width: 0 }}
//                 animate={{
//                   width: `${
//                     Math.min(
//                       (material.total_quantity /
//                         ((material.master_materials?.min_stock_level || 1) *
//                           2)) *
//                         100,
//                       100
//                     ) || 0
//                   }%`,
//                 }}
//                 transition={{ duration: 0.8, ease: "easeOut" }}
//                 className={`h-3 rounded-full ${
//                   material.total_quantity >
//                   (material.master_materials?.min_stock_level || 0)
//                     ? "bg-green-500"
//                     : material.total_quantity ===
//                       (material.master_materials?.min_stock_level || 0)
//                     ? "bg-yellow-500"
//                     : "bg-red-500"
//                 }`}
//               />
//             </div>
//           </div>

//           {/* Details */}
//           <div className="space-y-4">
//             <h4 className="font-semibold text-gray-900 dark:text-gray-100">
//               Details
//             </h4>
//             <div className="grid grid-cols-1 gap-4 text-sm">
//               <div className="flex items-center gap-3">
//                 <MapPin className="w-4 h-4 text-gray-400" />
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-400">Location</p>
//                   <p className="font-medium capitalize text-gray-900 dark:text-gray-100">
//                     {material.location || "—"}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <Layers className="w-4 h-4 text-gray-400" />
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-400">
//                     Batch Number
//                   </p>
//                   <p className="font-medium text-gray-900 dark:text-gray-100">
//                     {material.batch_number || "—"}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <DollarSign className="w-4 h-4 text-gray-400" />
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-400">
//                     Average Unit Cost
//                   </p>
//                   <p className="font-medium text-gray-900 dark:text-gray-100">
//                     {material.average_unit_cost
//                       ? `ETB ${material.average_unit_cost.toFixed(2)}`
//                       : "—"}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <DollarSign className="w-4 h-4 text-gray-400" />
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-400">
//                     Total Value
//                   </p>
//                   <p className="font-medium text-gray-900 dark:text-gray-100">
//                     {material.total_value
//                       ? `ETB ${material.total_value.toFixed(2)}`
//                       : "—"}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <Calendar className="w-4 h-4 text-gray-400" />
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-400">
//                     Last Received
//                   </p>
//                   <p className="font-medium text-gray-900 dark:text-gray-100">
//                     {formatDate(material.last_received_date)}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3">
//                 <User className="w-4 h-4 text-gray-400" />
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-400">
//                     Last Received By
//                   </p>
//                   <p className="font-medium capitalize text-gray-900 dark:text-gray-100">
//                     {material.received_by || "—"}
//                   </p>
//                 </div>
//               </div>

//               <div>
//                 <p className="text-gray-500 dark:text-gray-400">Supplier</p>
//                 <p className="font-medium capitalize text-gray-900 dark:text-gray-100">
//                   {getSupplierName(material)}
//                 </p>
//               </div>

//               {material.expiry_date && (
//                 <div className="flex items-center gap-3">
//                   <Calendar className="w-4 h-4 text-gray-400" />
//                   <div>
//                     <p className="text-gray-500 dark:text-gray-400">
//                       Expiry Date
//                     </p>
//                     <p className="font-medium text-gray-900 dark:text-gray-100">
//                       {formatDate(material.expiry_date)}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               <div>
//                 <p className="text-gray-500 dark:text-gray-400">Status</p>
//                 <div
//                   className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                     material.total_quantity,
//                     material.master_materials?.min_stock_level
//                   )}`}
//                 >
//                   {getStatusText(
//                     material.total_quantity,
//                     material.master_materials?.min_stock_level
//                   )}
//                 </div>
//               </div>

//               {material.notes && (
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-400">Notes</p>
//                   <p className="font-medium text-gray-900 dark:text-gray-100">
//                     {material.notes}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="border-t dark:border-gray-800 p-6 flex gap-3 justify-end bg-gray-50 dark:bg-gray-900">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => onUpdate && onUpdate(material.id)}
//             className="px-6 py-3 text-sm font-medium rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
//           >
//             Update Stock
//           </motion.button>
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => onDelete && onDelete(material.id)}
//             className="px-6 py-3 text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors"
//           >
//             Delete
//           </motion.button>
//         </div>
//       </motion.aside>
//     </AnimatePresence>,
//     document.body
//   );
// };

// export default MaterialDetailDrawer;
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { useState } from "react"; // Add this import
import {
  Package,
  X,
  Calendar,
  MapPin,
  User,
  DollarSign,
  Layers,
} from "lucide-react";
import UpdateStockModal from "./modals/UpdateStockModal";

const MaterialDetailDrawer = ({ material, onClose, onUpdate, onDelete }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const getStatusColor = (quantity, minStockLevel = 0) => {
    if (quantity <= 0) {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    } else if (quantity <= minStockLevel) {
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    } else {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    }
  };

  const getStatusText = (quantity, minStockLevel = 0) => {
    if (quantity <= 0) return "Out of Stock";
    if (quantity <= minStockLevel) return "Low Stock";
    return "In Stock";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  // Get supplier name from material_stock or procurement_orders relation
  const getSupplierName = (material) => {
    return (
      material.supplier_name ||
      material.procurement_orders?.supplier_name ||
      "—"
    );
  };

  const handleUpdateClick = () => {
    setShowUpdateModal(true);
  };

  const handleUpdateModalClose = () => {
    setShowUpdateModal(false);
  };

  const handleUpdateSubmit = async (updatedData) => {
    if (onUpdate) {
      const success = await onUpdate(material.id, updatedData);
      if (success) {
        setShowUpdateModal(false);
        // Optionally close the drawer after successful update
        onClose();
      }
    } else {
      setShowUpdateModal(false);
    }
  };
  if (!material) return null;

  return createPortal(
    <>
      <AnimatePresence>
        <motion.div
          key="drawer-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70]"
        />
        <motion.aside
          key="drawer"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 22, stiffness: 260 }}
          className="fixed top-0 right-0 h-full w-full sm:w-[480px] max-w-full bg-white dark:bg-gray-900 shadow-2xl z-[80] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg capitalize font-semibold text-gray-900 dark:text-gray-100 truncate">
                {material.master_materials?.name || "Unknown Material"}
              </h3>
              <p className="text-sm capitalize text-gray-500 dark:text-gray-400 truncate">
                {material.master_materials?.category || "—"}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 ml-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {/* Summary */}
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Category
                    </p>
                    <p className="font-medium capitalize text-gray-900 dark:text-gray-100">
                      {material.master_materials?.category || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Unit
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {material.master_materials?.unit || "—"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Current Stock
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {material.total_quantity}{" "}
                      {material.master_materials?.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Min Stock
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {material.master_materials?.min_stock_level || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Level */}
            <div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                <span>Stock Level</span>
                <span>
                  {Math.round(
                    (material.total_quantity /
                      (material.master_materials?.min_stock_level || 1)) *
                      100
                  ) || 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      Math.min(
                        (material.total_quantity /
                          ((material.master_materials?.min_stock_level || 1) *
                            2)) *
                          100,
                        100
                      ) || 0
                    }%`,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-3 rounded-full ${
                    material.total_quantity >
                    (material.master_materials?.min_stock_level || 0)
                      ? "bg-green-500"
                      : material.total_quantity ===
                        (material.master_materials?.min_stock_level || 0)
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Details
              </h4>
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-medium capitalize text-gray-900 dark:text-gray-100">
                      {material.location || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Batch Number
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {material.batch_number || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Average Unit Cost
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {material.average_unit_cost
                        ? `ETB ${material.average_unit_cost.toFixed(2)}`
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Total Value
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {material.total_value
                        ? `ETB ${material.total_value.toFixed(2)}`
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Last Received
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(material.last_received_date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">
                      Last Received By
                    </p>
                    <p className="font-medium capitalize text-gray-900 dark:text-gray-100">
                      {material.received_by || "—"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 dark:text-gray-400">Supplier</p>
                  <p className="font-medium capitalize text-gray-900 dark:text-gray-100">
                    {getSupplierName(material)}
                  </p>
                </div>

                {material.expiry_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">
                        Expiry Date
                      </p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {formatDate(material.expiry_date)}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      material.total_quantity,
                      material.master_materials?.min_stock_level
                    )}`}
                  >
                    {getStatusText(
                      material.total_quantity,
                      material.master_materials?.min_stock_level
                    )}
                  </div>
                </div>

                {material.notes && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Notes</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {material.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t dark:border-gray-800 p-6 flex gap-3 justify-end bg-gray-50 dark:bg-gray-900">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpdateClick}
              className="px-6 py-3 text-sm font-medium rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
            >
              Update Stock
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if (
                  onDelete &&
                  window.confirm(
                    "Are you sure you want to delete this inventory item?"
                  )
                ) {
                  const success = await onDelete(material.id);
                  if (success) {
                    onClose();
                  }
                }
              }}
              className="px-6 py-3 text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Delete
            </motion.button>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Update Stock Modal */}
      {showUpdateModal && (
        <UpdateStockModal
          material={material}
          onClose={handleUpdateModalClose}
          onSubmit={handleUpdateSubmit}
        />
      )}
    </>,
    document.body
  );
};

export default MaterialDetailDrawer;
