import { motion } from "framer-motion";
import { Plus, Calendar, TrendingUp, RefreshCw } from "lucide-react";
import ProjectTimeline from "../charts/ProjectTimeline";
import DemandForecastChart from "../charts/DemandForecastChart";
import JITDeliverySchedule from "../charts/JITDeliverySchedule";

const PlanningTab = ({
  plannedMaterials,
  projectSchedule,
  demandForecast,
  onRefresh,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open("/material-planning", "_blank")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Open Material Planner
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Project Timeline
          </h3>
          <ProjectTimeline data={projectSchedule} />
        </div>

        {/* Demand Forecast */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Demand Forecast
          </h3>
          <DemandForecastChart plannedMaterials={plannedMaterials} />
        </div>
      </div>

      {/* JIT Delivery Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          JIT Delivery Schedule
        </h3>
        <JITDeliverySchedule plannedMaterials={plannedMaterials} />
      </div>
    </div>
  );
};

export default PlanningTab;
