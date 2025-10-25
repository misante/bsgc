// components/materials/MaterialTransactionHistory.js
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  User,
  Building,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Scale,
} from "lucide-react";
import { useMaterialTransactions } from "@/hooks/useMaterialTransactions";

const MaterialTransactionHistory = ({ materialId, materialName, onClose }) => {
  const {
    transactions,
    loading,
    error,
    refreshTransactions,
    currentStock,
    unit,
  } = useMaterialTransactions(materialId);
  const [filter, setFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType = filter === "all" || transaction.type === filter;
    const transactionDate = new Date(transaction.date);
    const matchesStart =
      !dateRange.start || transactionDate >= new Date(dateRange.start);
    const matchesEnd =
      !dateRange.end ||
      transactionDate <= new Date(dateRange.end + "T23:59:59");

    return matchesType && matchesStart && matchesEnd;
  });

  const summary = filteredTransactions.reduce(
    (acc, transaction) => {
      if (transaction.type === "in") {
        acc.totalIn += transaction.quantity;
        acc.totalInValue += transaction.total_cost;
      } else {
        acc.totalOut += transaction.quantity;
        acc.totalOutValue += transaction.total_cost;
      }
      return acc;
    },
    { totalIn: 0, totalOut: 0, totalInValue: 0, totalOutValue: 0 }
  );

  const netQuantity = summary.totalIn - summary.totalOut;
  const netValue = summary.totalInValue - summary.totalOutValue;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-600">
        <p className="text-sm">Error loading transaction history: {error}</p>
        <button
          onClick={refreshTransactions}
          className="mt-3 px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header - Compact */}
      <div className="px-4 pt-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Transaction History
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 capitalize">
              {materialName} • {transactions.length} transactions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs dark:text-white mr-2">
          Current Stock -
          <span className="text-green-500 ml-2">
            {currentStock} {unit}
          </span>
        </p>
      </div>

      {/* Summary Cards - Compact */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-700 dark:text-green-300">
                  Total In
                </p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  {summary.totalIn.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  ETB {summary.totalInValue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-700 dark:text-red-300">
                  Total Out
                </p>
                <p className="text-lg font-bold text-red-900 dark:text-red-100">
                  {summary.totalOut.toLocaleString()}
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  ETB {summary.totalOutValue.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border ${
              netQuantity >= 0
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Net Change
                </p>
                <p
                  className={`text-lg font-bold ${
                    netQuantity >= 0
                      ? "text-blue-900 dark:text-blue-100"
                      : "text-orange-900 dark:text-orange-100"
                  }`}
                >
                  {netQuantity >= 0 ? "+" : ""}
                  {netQuantity.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  ETB {netValue >= 0 ? "+" : ""}
                  {netValue.toLocaleString()}
                </p>
              </div>
              <Scale className="w-6 h-6 text-gray-600" />
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                  Transactions
                </p>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                  {filteredTransactions.length}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Filtered
                </p>
              </div>
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters - Compact */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  {["all", "in", "out"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                        filter === type
                          ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {type === "all" ? "All" : type === "in" ? "In" : "Out"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-6 items-center">
              <div className="flex items-center gap-2">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  From
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, start: e.target.value }))
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  To
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                  className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-800"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions List - Compact with better scrolling */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <AnimatePresence>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No transactions found</p>
              <p className="text-xs mt-0.5">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Transaction Icon - Smaller */}
                      <div
                        className={`p-1.5 rounded-full flex-shrink-0 ${
                          transaction.type === "in"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600"
                            : "bg-red-100 dark:bg-red-900/30 text-red-600"
                        }`}
                      >
                        {transaction.type === "in" ? (
                          <ArrowDownCircle className="w-4 h-4" />
                        ) : (
                          <ArrowUpCircle className="w-4 h-4" />
                        )}
                      </div>

                      {/* Transaction Details - Compact */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.type === "in"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                          >
                            {transaction.type === "in" ? "IN" : "OUT"}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            Order #{transaction.reference}
                          </span>
                        </div>

                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {transaction.supplier && (
                              <span className="flex items-center gap-1 flex-shrink-0">
                                <Building className="w-3 h-3" />
                                <span className="truncate max-w-20">
                                  {transaction.supplier}
                                </span>
                              </span>
                            )}
                            {transaction.project && (
                              <span className="flex items-center gap-1 flex-shrink-0">
                                <FileText className="w-3 h-3" />
                                <span className="truncate max-w-20 capitalize">
                                  {transaction.project}
                                </span>
                              </span>
                            )}
                            <div className="flex gap-4">
                              {transaction.notes && (
                                <p className="text-xs capitalize text-gray-500 dark:text-gray-500 italic truncate">
                                  {transaction.notes}
                                </p>
                              )}
                              <span className="flex items-center gap-1 flex-shrink-0">
                                <Calendar className="w-3 h-3" />
                                {new Date(
                                  transaction.date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quantity and Cost - Compact */}
                    <div className="text-right ml-2 flex-shrink-0">
                      <div
                        className={`text-base font-semibold ${
                          transaction.type === "in"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.type === "in" ? "+" : "-"}
                        {transaction.quantity}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-0.5 justify-end">
                        <DollarSign className="w-3 h-3" />
                        {transaction.total_cost?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MaterialTransactionHistory;
