import { useState, useEffect } from "react";

export default function ProjectFinancialSummary({ projectId }) {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFinancialData();
  }, [projectId]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/financials`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch financial data");
      }

      if (result.success) {
        setFinancialData(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch financial data");
      }
    } catch (err) {
      console.error("Error fetching project financials:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading financial data: {error}</p>
        <button
          onClick={fetchFinancialData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No financial data available</p>
      </div>
    );
  }

  const {
    budget,
    actualCost,
    costVariance,
    variancePercentage,
    plannedBreakdown,
    actualBreakdown,
  } = financialData;

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Planned Budget
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            ${budget.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total estimated cost</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Actual Cost
          </h3>
          <p className="text-2xl font-bold text-orange-600">
            ${actualCost.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total incurred cost</p>
        </div>

        <div
          className={`bg-white p-6 rounded-lg border shadow-sm ${
            costVariance >= 0 ? "border-green-200" : "border-red-200"
          }`}
        >
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            Cost Variance
          </h3>
          <p
            className={`text-2xl font-bold ${
              costVariance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ${Math.abs(costVariance).toLocaleString()}
          </p>
          <p
            className={`text-sm font-medium ${
              costVariance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {costVariance >= 0 ? "Under Budget" : "Over Budget"} (
            {variancePercentage.toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Planned Cost Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-extrabold text-gray-900 mb-4">
            Planned Cost Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Materials</span>
              <span className="font-medium dark:text-black">
                ${plannedBreakdown.materials.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Manpower</span>
              <span className="font-medium dark:text-black">
                ${plannedBreakdown.manpower.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Equipment</span>
              <span className="font-medium dark:text-black">
                ${plannedBreakdown.equipment.toLocaleString()}
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Planned</span>
                <span className="text-blue-600">
                  ${budget.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actual Cost Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-extrabold text-gray-900 mb-4">
            Actual Cost Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Materials</span>
              <span className="font-medium dark:text-black">
                ${actualBreakdown.materials.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Manpower</span>
              <span className="font-medium dark:text-black">
                ${actualBreakdown.manpower.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Equipment</span>
              <span className="font-medium dark:text-black">
                ${actualBreakdown.equipment.toLocaleString()}
              </span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Actual</span>
                <span className="text-orange-600">
                  ${actualCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchFinancialData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh Data
        </button>
      </div>
    </div>
  );
}
