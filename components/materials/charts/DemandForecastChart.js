import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DemandForecastChart = ({ plannedMaterials }) => {
  // Generate forecast data with date ranges
  const generateForecastData = () => {
    if (!plannedMaterials || plannedMaterials.length === 0) return [];

    // Group materials by project phase with date information
    const phaseData = {};

    plannedMaterials.forEach((material) => {
      if (material.project_phase && material.required_date) {
        if (!phaseData[material.project_phase]) {
          phaseData[material.project_phase] = {
            totalQuantity: 0,
            materialCount: 0,
            totalCost: 0,
            plannedMaterials: [],
            earliestDate: null,
            latestDate: null,
          };
        }

        const quantity = parseFloat(material.quantity) || 0;
        const cost = parseFloat(material.total_cost) || 0;
        const requiredDate = new Date(material.required_date);

        phaseData[material.project_phase].totalQuantity += quantity;
        phaseData[material.project_phase].materialCount += 1;
        phaseData[material.project_phase].totalCost += cost;
        phaseData[material.project_phase].plannedMaterials.push(material);

        // Track date range
        if (
          !phaseData[material.project_phase].earliestDate ||
          requiredDate < phaseData[material.project_phase].earliestDate
        ) {
          phaseData[material.project_phase].earliestDate = requiredDate;
        }
        if (
          !phaseData[material.project_phase].latestDate ||
          requiredDate > phaseData[material.project_phase].latestDate
        ) {
          phaseData[material.project_phase].latestDate = requiredDate;
        }
      }
    });

    // Convert to chart data format
    const chartData = Object.entries(phaseData).map(([phase, data]) => ({
      name: phase,
      plannedMaterials: data.materialCount,
      quantity: data.totalQuantity,
      cost: data.totalCost,
      avgQuantity: data.totalQuantity / data.materialCount,
      dateRange:
        data.earliestDate && data.latestDate
          ? `${data.earliestDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })} - ${data.latestDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}`
          : "No dates",
    }));

    return chartData.sort((a, b) => b.quantity - a.quantity);
  };

  const forecastData = generateForecastData();

  // Custom Tooltip Component to avoid hydration errors
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            {label}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Date Range: {data.dateRange}
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">
                Total Quantity:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.quantity.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">
                Materials:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {data.plannedMaterials}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600 dark:text-gray-400">
                Total Cost:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ETB {data.cost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (forecastData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          No material data available for forecasting
        </p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={forecastData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
        >
          <XAxis
            type="number"
            tick={{ fill: "currentColor" }}
            axisLine={{ stroke: "currentColor" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={75}
            fontSize={11}
            tick={{ fill: "currentColor" }}
            axisLine={{ stroke: "currentColor" }}
          />
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="quantity"
            name="Total Quantity"
            fill="#8b5cf6"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Enhanced Stats with Date Info */}
      <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="font-semibold text-purple-700 dark:text-purple-300">
            {forecastData.length} Phases
          </div>
          <div className="text-gray-600 dark:text-gray-400 mt-1">
            Active project phases with materials
          </div>
        </div>
        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="font-semibold text-green-700 dark:text-green-300">
            {forecastData.reduce(
              (sum, phase) => sum + phase.plannedMaterials,
              0
            )}{" "}
            Materials
          </div>
          <div className="text-gray-600 dark:text-gray-400 mt-1">
            Total material types planned
          </div>
        </div>
      </div>

      {/* Date Range Summary */}
      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
          Planning Timeline
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {(() => {
            const allDates = forecastData
              .filter((phase) => phase.dateRange !== "No dates")
              .flatMap((phase) => {
                const [start, end] = phase.dateRange.split(" - ");
                return [new Date(start), new Date(end)];
              })
              .filter((date) => !isNaN(date.getTime()));

            if (allDates.length === 0) return "No date ranges available";

            const earliest = new Date(Math.min(...allDates));
            const latest = new Date(Math.max(...allDates));

            return `${earliest.toLocaleDateString()} - ${latest.toLocaleDateString()}`;
          })()}
        </div>
      </div>
    </div>
  );
};

export default DemandForecastChart;
