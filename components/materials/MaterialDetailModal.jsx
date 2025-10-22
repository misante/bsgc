"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineXMark,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from "react-icons/hi2";

export default function MaterialDetailModal({
  material,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!material) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          key="modal"
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 relative"
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
          >
            <HiOutlineXMark className="w-6 h-6" />
          </button>

          {/* Title */}
          <h2 className="text-xl capitalize font-semibold text-gray-800 dark:text-white mb-4">
            {material.name}
          </h2>

          {/* Material Info Grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <span className="font-medium">Category:</span> {material.category}
            </div>
            <div>
              <span className="font-medium capitalize">Type:</span>{" "}
              {material.type || "-"}
            </div>
            <div>
              <span className="font-medium">Quantity:</span> {material.quantity}{" "}
              {material.unit}
            </div>
            <div>
              <span className="font-medium">Supplier:</span>{" "}
              {material.supplier || "N/A"}
            </div>
            <div>
              <span className="font-medium">Cost per Unit:</span>{" "}
              {material.cost_per_unit ? `ETB ${material.cost_per_unit}` : "N/A"}
            </div>
            <div>
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`px-2 py-0.5 rounded-md text-xs ${
                  material.status === "In Stock"
                    ? "bg-green-100 text-green-700"
                    : material.status === "Low Stock"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {material.status}
              </span>
            </div>
            <div>
              <span className="font-medium">Min Stock Level:</span>{" "}
              {material.min_stock_level}
            </div>
            <div>
              <span className="font-medium">Location:</span>{" "}
              {material.location || "-"}
            </div>
            <div>
              <span className="font-medium">Last Ordered:</span>{" "}
              {material.last_ordered_date || "-"}
            </div>
            <div>
              <span className="font-medium">Next Order:</span>{" "}
              {material.next_order_date || "-"}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => onEdit(material)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <HiOutlinePencilSquare className="w-5 h-5" />
              Edit
            </button>
            <button
              onClick={() => onDelete(material)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
            >
              <HiOutlineTrash className="w-5 h-5" />
              Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
