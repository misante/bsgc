import { motion } from "framer-motion";
import { HiOutlinePlus } from "react-icons/hi2";
import SuppliersList from "../SuppliersList";
import AddSupplierModal from "../modals/AddSupplierModal";
import EditSupplierModal from "../modals/EditSupplierModal";

const SuppliersTab = ({
  suppliers,
  loading,
  onAddSupplier,
  onEditSupplier,
  onToggleSupplier,
  showAddSupplierModal = false,
  setShowAddSupplierModal,
  showEditSupplierModal = false,
  setShowEditSupplierModal,
  editingSupplier,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Supplier Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your material suppliers and vendor relationships
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddSupplierModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Supplier
        </motion.button>
      </div>

      <SuppliersList
        suppliers={suppliers}
        onEdit={onEditSupplier}
        onDelete={onToggleSupplier}
      />

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <AddSupplierModal
          isOpen={showAddSupplierModal}
          onClose={() => setShowAddSupplierModal(false)}
          onAdd={onAddSupplier}
        />
      )}

      {/* Edit Supplier Modal */}
      {showEditSupplierModal && (
        <EditSupplierModal
          isOpen={showEditSupplierModal}
          onClose={() => {
            setShowEditSupplierModal(false);
          }}
          onUpdate={onEditSupplier}
          supplier={editingSupplier}
        />
      )}
    </div>
  );
};

export default SuppliersTab;
