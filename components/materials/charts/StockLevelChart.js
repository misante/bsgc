import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";

const StockLevelChart = ({ plannedMaterials }) => {
  // Transform data for the chart
  const chartData = plannedMaterials.map((material) => {
    // Handle different data structures (inventory items vs material requirements)
    const quantity = parseFloat(
      material.quantity || material.current_stock || 0
    );
    const minStock = parseFloat(
      material.min_stock_level || material.min_stock || 0
    );

    // Determine status based on quantity and min stock
    let status = "Adequate";
    if (quantity === 0) {
      status = "Out of Stock";
    } else if (quantity <= minStock) {
      status = "Low Stock";
    } else if (
      material.status === "ordered" ||
      material.status === "on_order"
    ) {
      status = "On Order";
    } else if (material.status === "planned") {
      status = "Planned";
    }

    return {
      id: material.id,
      name: material.name || material.material_name || "Unnamed Material",
      fullName: material.name || material.material_name || "Unnamed Material",
      quantity: quantity,
      minStock: minStock,
      status: status,
      unit: material.unit || "units",
      category: material.category || "Uncategorized",
      project: material.project_id || "No Project",
    };
  });

  // Get bar color based on status
  const getBarColor = (status) => {
    switch (status) {
      case "Low Stock":
        return "#f59e0b"; // amber-500
      case "Out of Stock":
        return "#ef4444"; // red-500
      case "On Order":
        return "#3b82f6"; // blue-500
      case "Planned":
        return "#8b5cf6"; // purple-500
      case "Adequate":
        return "#10b981"; // emerald-500
      default:
        return "#6b7280"; // gray-500
    }
  };

  // Custom tooltip - FIXED: No nested divs in p tags
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-xs">
          {/* Use span instead of p to avoid nesting issues */}
          <div className="font-semibold text-gray-900 dark:text-white mb-2">
            {data.fullName}
          </div>
          <div className="space-y-1 text-sm">
            <div className="text-gray-600 dark:text-gray-400">
              Category: {data.category}
            </div>
            <div>
              <span className="font-medium">Current Stock:</span>{" "}
              {data.quantity.toLocaleString()} {data.unit}
            </div>
            <div>
              <span className="font-medium">Min Stock:</span>{" "}
              {data.minStock.toLocaleString()} {data.unit}
            </div>
            <div>
              <span className="font-medium">Status:</span>{" "}
              <span
                className="font-semibold"
                style={{ color: getBarColor(data.status) }}
              >
                {data.status}
              </span>
            </div>
            {data.project && data.project !== "No Project" && (
              <div className="text-gray-600 dark:text-gray-400">
                Project: {data.project}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label formatter to avoid nested divs in p tags
  const renderCustomizedLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 10}
        fill="#374151"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={12}
      >
        {value}
      </text>
    );
  };

  if (!plannedMaterials || plannedMaterials.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">
          No inventory data available
        </p>
      </div>
    );
  }

  // Calculate summary statistics
  const totalItems = chartData.length;
  const lowStockItems = chartData.filter(
    (item) => item.status === "Low Stock"
  ).length;
  const outOfStockItems = chartData.filter(
    (item) => item.status === "Out of Stock"
  ).length;
  const onOrderItems = chartData.filter(
    (item) => item.status === "On Order"
  ).length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {totalItems}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Items
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {lowStockItems}
          </div>
          <div className="text-sm text-amber-700 dark:text-amber-300">
            Low Stock
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-red-200 dark:border-red-800">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {outOfStockItems}
          </div>
          <div className="text-sm text-red-700 dark:text-red-300">
            Out of Stock
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {onOrderItems}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            On Order
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                strokeOpacity={0.3}
              />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={11}
                tick={{ fill: "currentColor" }}
                interval={0}
              />
              <YAxis
                fontSize={12}
                tick={{ fill: "currentColor" }}
                label={{
                  value: "Quantity",
                  angle: -90,
                  position: "insideLeft",
                  offset: -10,
                  style: { fill: "currentColor" },
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{
                  paddingTop: "10px",
                }}
              />

              {/* Current Stock Bars */}
              <Bar
                dataKey="quantity"
                name="Current Stock"
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.status)}
                    strokeWidth={1}
                  />
                ))}
              </Bar>

              {/* Minimum Stock Line - Using ReferenceLine instead of Bar for better semantics */}
              {chartData.map((entry, index) => (
                <ReferenceLine
                  key={`min-${index}`}
                  y={entry.minStock}
                  stroke="#6b7280"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  ifOverflow="extendDomain"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Custom legend for minimum stock since ReferenceLine doesn't show in legend */}
        <div className="flex justify-center mt-2">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <div
              className="w-4 h-0.5 bg-gray-500"
              style={{
                background:
                  "repeating-linear-gradient(90deg, #6b7280, #6b7280 3px, transparent 3px, transparent 6px)",
              }}
            />
            Minimum Stock Level
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap gap-2 justify-center text-xs">
        {[
          { status: "Adequate", color: "#10b981", label: "Adequate Stock" },
          { status: "Low Stock", color: "#f59e0b", label: "Low Stock" },
          { status: "Out of Stock", color: "#ef4444", label: "Out of Stock" },
          { status: "On Order", color: "#3b82f6", label: "On Order" },
          { status: "Planned", color: "#8b5cf6", label: "Planned" },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-600 dark:text-gray-400">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockLevelChart;
