"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function StatsCard({ item }) {
  const { name, stat, icon, change, changeType, description, href } = item;
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="card h-full hover:shadow-lg transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden group"
    >
      <div className="card-body p-6">
        <div className="flex items-center">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="flex-shrink-0"
          >
            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
              <span className="text-white text-xl">{icon}</span>
            </div>
          </motion.div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate dark:text-gray-400">
              {name}
            </p>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stat}
              </p>
              {change && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`ml-2 inline-flex items-baseline px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    changeType === "increase"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {changeType === "increase" ? "↑" : "↓"} {change}
                </motion.span>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar for percentage-based stats */}
        {(name === "Tasks Completed" || name === "Safety Score") && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: stat }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-2 rounded-full ${
                  name === "Tasks Completed" ? "bg-blue-500" : "bg-green-500"
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Hover indicator */}
      <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 w-0 group-hover:w-full transition-all duration-300" />
    </motion.div>
  );
}
