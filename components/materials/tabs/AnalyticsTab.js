import StockLevelChart from "../charts/StockLevelChart";
import StatusPieChart from "../charts/StatusPieChart";

const AnalyticsTab = ({ plannedMaterials, historicalData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Levels */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Stock Levels Overview
          </h3>
          <StockLevelChart plannedMaterials={plannedMaterials} />
        </div>

        {/* Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Inventory Status
          </h3>
          <StatusPieChart plannedMaterials={plannedMaterials} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
