import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StatusPieChart = ({ materials }) => {
  if (!materials || materials.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  // Count materials by status
  const statusCount = materials.reduce((acc, material) => {
    acc[material.status] = (acc[material.status] || 0) + 1;
    return acc;
  }, {});

  // Convert to array for Recharts
  const pieData = Object.entries(statusCount).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = {
    "In Stock": "#10b981", // Green
    "Low Stock": "#f59e0b", // Yellow
    "Out of Stock": "#ef4444", // Red
    "On Order": "#3b82f6", // Blue
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name] || "#6b7280"}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} materials`, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
        {pieData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[item.name] || "#6b7280" }}
              />
              <span className="text-gray-600 dark:text-gray-300">
                {item.name}
              </span>
            </div>
            <span className="font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusPieChart;
