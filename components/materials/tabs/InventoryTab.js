// components/materials/tabs/InventoryTab.js
import { motion, AnimatePresence } from "framer-motion";
import { Package, Building, Calendar } from "lucide-react";

const InventoryTab = ({ inventory, loading, onMaterialSelect }) => {
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
  const getSupplierName = (item) => {
    return item.supplier_name || item.procurement_orders?.supplier_name || "—";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-center text-xs text-blue-500 capitalize">
        all costs/amounts are in ETB
      </p>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-200 w-full text-xs dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-3 capitalize">Material</th>
                <th className="text-left py-3 px-3 capitalize">Category</th>
                <th className="text-left py-3 px-3 capitalize">
                  Total Quantity
                </th>
                <th className="text-left py-3 px-3 capitalize">Location</th>
                <th className="text-left py-3 px-3 capitalize">Batch No.</th>
                <th className="text-left py-3 px-3 capitalize">
                  Last Received
                </th>
                <th className="text-left py-3 px-3 capitalize">
                  Avg Unit Cost
                </th>
                <th className="text-left py-3 px-3 capitalize">Status</th>
              </tr>
            </thead>

            <tbody>
              {inventory.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => onMaterialSelect(item)}
                  className="cursor-pointer border-b text-xs border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-3 px-3 text-left text-nowrap capitalize font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div>{item.master_materials?.name || "Unknown"}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.master_materials?.unit || "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-left text-nowrap capitalize font-medium text-gray-900 dark:text-white">
                    {item.master_materials?.category || "—"}
                  </td>
                  <td className="py-3 px-3 text-left text-nowrap capitalize font-medium text-gray-900 dark:text-white">
                    {item.total_quantity} {item.master_materials?.unit}
                  </td>
                  <td className="py-3 px-3 text-left text-nowrap capitalize font-medium text-gray-900 dark:text-white">
                    {item.location || "—"}
                  </td>
                  <td className="py-3 px-3 text-left text-nowrap capitalize font-medium text-gray-900 dark:text-white">
                    {item.batch_number || "—"}
                  </td>
                  <td className="py-3 px-3 text-left text-nowrap capitalize font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.last_received_date)}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-left text-nowrap capitalize font-medium text-gray-900 dark:text-white">
                    ETB {item.average_unit_cost?.toFixed(2) || "0.00"}
                  </td>
                  <td className="py-3 px-3">
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className={`inline-flex text-nowrap items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        item.total_quantity,
                        item.master_materials?.min_stock_level
                      )}`}
                    >
                      {getStatusText(
                        item.total_quantity,
                        item.master_materials?.min_stock_level
                      )}
                    </motion.span>
                  </td>
                </motion.tr>
              ))}
              {/* </AnimatePresence> */}
            </tbody>
          </table>

          {inventory.length === 0 && (
            <div className="text-center py-16 px-6">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No inventory items found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Inventory items will appear here when procurement orders are
                received.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryTab;
