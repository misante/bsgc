// import { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import { X, Package, CheckCircle, Calendar, MapPin, Hash } from "lucide-react";

// const ReceiveOrderModal = ({ order, isOpen, onClose, onSuccess }) => {
//   const [form, setForm] = useState({
//     received_quantity: "",
//     location: "",
//     batch_number: "",
//     received_date: new Date().toISOString().split("T")[0],
//     expiry_date: "",
//     unit_cost: "",
//     total_value: "",
//     received_by: "",
//     notes: "",
//   });

//   // Initialize form with order data
//   useEffect(() => {
//     if (order) {
//       setForm({
//         received_quantity: order.quantity || "",
//         location: "",
//         batch_number: "",
//         received_date: new Date().toISOString().split("T")[0],
//         expiry_date: "",
//         unit_cost: order.unit_cost || "",
//         total_value: order.total_cost || "",
//         received_by: "",
//         notes: "",
//       });
//     }
//   }, [order]);

//   // Calculate total value
//   useEffect(() => {
//     const quantity = parseFloat(form.received_quantity) || 0;
//     const unitCost = parseFloat(form.unit_cost) || 0;
//     const totalValue = quantity * unitCost;

//     setForm((prev) => ({
//       ...prev,
//       total_value: totalValue,
//     }));
//   }, [form.received_quantity, form.unit_cost]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const response = await fetch("/api/inventory", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           procurement_order_id: order.id,
//           master_material_id: order.master_material_id,
//           quantity: form.received_quantity,
//           location: form.location,
//           batch_number: form.batch_number,
//           received_date: form.received_date,
//           expiry_date: form.expiry_date || null,
//           unit_cost: form.unit_cost,
//           total_value: form.total_value,
//           received_by: form.received_by,
//           notes: form.notes,
//         }),
//       });

//       if (response.ok) {
//         alert("Order received successfully! Material added to inventory.");
//         onSuccess();
//       } else {
//         const error = await response.json();
//         alert(`Error: ${error.error}`);
//       }
//     } catch (error) {
//       console.error("Error receiving order:", error);
//       alert("Error receiving order. Please try again.");
//     }
//   };

//   if (!isOpen || !order) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
//           <div>
//             <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//               Receive Order
//             </h2>
//             <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
//               Add received materials to inventory
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Order Summary */}
//         <div className="p-6 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
//             <Package className="w-5 h-5" />
//             Order Summary
//           </h3>
//           <div className="grid grid-cols-2 gap-4 text-sm">
//             <div>
//               <span className="text-gray-500 dark:text-gray-400">
//                 Material:
//               </span>
//               <p className="font-medium text-gray-900 dark:text-white capitalize">
//                 {order.master_materials?.name} ({order.master_materials?.unit})
//               </p>
//             </div>
//             <div>
//               <span className="text-gray-500 dark:text-gray-400">
//                 Supplier:
//               </span>
//               <p className="font-medium text-gray-900 dark:text-white">
//                 {order.suppliers?.name}
//               </p>
//             </div>
//             <div>
//               <span className="text-gray-500 dark:text-gray-400">
//                 Ordered Quantity:
//               </span>
//               <p className="font-medium text-gray-900 dark:text-white">
//                 {order.quantity} {order.master_materials?.unit}
//               </p>
//             </div>
//             <div>
//               <span className="text-gray-500 dark:text-gray-400">
//                 Expected Delivery:
//               </span>
//               <p className="font-medium text-gray-900 dark:text-white">
//                 {order.expected_delivery
//                   ? new Date(order.expected_delivery).toLocaleDateString()
//                   : "Not set"}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Receive Form */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {/* Received Quantity */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Received Quantity *
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 step="0.01"
//                 required
//                 value={form.received_quantity}
//                 onChange={(e) =>
//                   setForm({ ...form, received_quantity: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                 placeholder="Enter received quantity"
//               />
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                 Ordered: {order.quantity} {order.master_materials?.unit}
//               </p>
//             </div>

//             {/* Unit Cost */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Unit Cost (ETB) *
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 step="0.01"
//                 required
//                 value={form.unit_cost}
//                 onChange={(e) =>
//                   setForm({ ...form, unit_cost: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                 placeholder="Enter unit cost"
//               />
//             </div>

//             {/* Location */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
//                 <MapPin className="w-4 h-4" />
//                 Storage Location
//               </label>
//               <input
//                 type="text"
//                 value={form.location}
//                 onChange={(e) => setForm({ ...form, location: e.target.value })}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                 placeholder="e.g., Warehouse A, Shelf 3"
//               />
//             </div>

//             {/* Batch Number */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
//                 <Hash className="w-4 h-4" />
//                 Batch Number
//               </label>
//               <input
//                 type="text"
//                 value={form.batch_number}
//                 onChange={(e) =>
//                   setForm({ ...form, batch_number: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                 placeholder="e.g., BATCH-001"
//               />
//             </div>

//             {/* Received Date */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
//                 <Calendar className="w-4 h-4" />
//                 Received Date *
//               </label>
//               <input
//                 type="date"
//                 required
//                 value={form.received_date}
//                 onChange={(e) =>
//                   setForm({ ...form, received_date: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//               />
//             </div>

//             {/* Expiry Date */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Expiry Date (Optional)
//               </label>
//               <input
//                 type="date"
//                 value={form.expiry_date}
//                 onChange={(e) =>
//                   setForm({ ...form, expiry_date: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//               />
//             </div>

//             {/* Received By */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Received By *
//               </label>
//               <input
//                 type="text"
//                 required
//                 value={form.received_by}
//                 onChange={(e) =>
//                   setForm({ ...form, received_by: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//                 placeholder="Enter your name"
//               />
//             </div>

//             {/* Total Value (Auto-calculated) */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                 Total Value (ETB)
//               </label>
//               <input
//                 type="number"
//                 readOnly
//                 value={form.total_value}
//                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white font-semibold"
//               />
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                 Auto-calculated
//               </p>
//             </div>
//           </div>

//           {/* Notes */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//               Notes (Optional)
//             </label>
//             <textarea
//               value={form.notes}
//               onChange={(e) => setForm({ ...form, notes: e.target.value })}
//               rows="3"
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
//               placeholder="Any additional notes about this delivery..."
//             />
//           </div>

//           {/* Submit Button */}
//           <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
//             <motion.button
//               type="button"
//               onClick={onClose}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//             >
//               Cancel
//             </motion.button>
//             <motion.button
//               type="submit"
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
//             >
//               <CheckCircle className="w-4 h-4" />
//               Receive Order
//             </motion.button>
//           </div>
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// export default ReceiveOrderModal;
