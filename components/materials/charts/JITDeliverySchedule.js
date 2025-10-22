import { Calendar } from "lucide-react";

const JITDeliverySchedule = ({ plannedMaterials }) => {
  // Helper function to parse dates safely
  const parseDate = (dateString) => {
    if (!dateString) return null;

    // Handle different date formats
    if (dateString.includes("T")) {
      // ISO format with time
      return new Date(dateString);
    } else if (dateString.includes("-")) {
      // YYYY-MM-DD format
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(year, month - 1, day);
    } else {
      // Fallback for any other format
      return new Date(dateString);
    }
  };

  // Get upcoming deliveries (within next 30 days)
  const getUpcomingDeliveries = () => {
    if (!plannedMaterials || plannedMaterials.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    thirtyDaysFromNow.setHours(23, 59, 59, 999); // End of day

    return plannedMaterials
      .filter((material) => {
        if (!material.required_date) return false;

        const requiredDate = parseDate(material.required_date);
        if (!requiredDate || isNaN(requiredDate.getTime())) return false;

        requiredDate.setHours(0, 0, 0, 0); // Normalize to start of day
        return requiredDate >= today && requiredDate <= thirtyDaysFromNow;
      })
      .sort((a, b) => parseDate(a.required_date) - parseDate(b.required_date));
  };

  // Get overdue deliveries
  const getOverdueDeliveries = () => {
    if (!plannedMaterials || plannedMaterials.length === 0) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    return plannedMaterials
      .filter((material) => {
        if (!material.required_date) return false;

        const requiredDate = parseDate(material.required_date);
        if (!requiredDate || isNaN(requiredDate.getTime())) return false;

        requiredDate.setHours(0, 0, 0, 0); // Normalize to start of day
        return requiredDate < today;
      })
      .sort((a, b) => parseDate(a.required_date) - parseDate(b.required_date));
  };

  const upcomingDeliveries = getUpcomingDeliveries();
  const overdueDeliveries = getOverdueDeliveries();
  const allDeliveries = [...overdueDeliveries, ...upcomingDeliveries];

  const getDeliveryStatus = (requiredDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reqDate = parseDate(requiredDate);
    if (!reqDate || isNaN(reqDate.getTime())) {
      return {
        status: "No Date",
        color:
          "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
      };
    }

    reqDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.ceil((reqDate - today) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0)
      return {
        status: "Overdue",
        color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      };
    if (daysDiff <= 3)
      return {
        status: "Urgent",
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      };
    if (daysDiff <= 7)
      return {
        status: "Soon",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      };
    return {
      status: "Scheduled",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    };
  };

  const getDaysUntil = (requiredDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reqDate = parseDate(requiredDate);
    if (!reqDate || isNaN(reqDate.getTime())) return null;

    reqDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.ceil((reqDate - today) / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const formatDateForDisplay = (dateString) => {
    const date = parseDate(dateString);
    if (!date || isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (allDeliveries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No scheduled deliveries found</p>
        <p className="text-sm mt-1">
          Add materials with required dates to see JIT schedule
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {overdueDeliveries.length}
          </div>
          <div className="text-sm text-red-700 dark:text-red-300">Overdue</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {
              upcomingDeliveries.filter(
                (d) => getDaysUntil(d.required_date) <= 3
              ).length
            }
          </div>
          <div className="text-sm text-orange-700 dark:text-orange-300">
            Urgent (≤3 days)
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {
              upcomingDeliveries.filter((d) => {
                const days = getDaysUntil(d.required_date);
                return days > 3 && days <= 7;
              }).length
            }
          </div>
          <div className="text-sm text-yellow-700 dark:text-yellow-300">
            Soon (4-7 days)
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {
              upcomingDeliveries.filter((d) => {
                const days = getDaysUntil(d.required_date);
                return days > 7;
              }).length
            }
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">
            Scheduled
          </div>
        </div>
      </div>

      {/* Delivery Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-gray-700 bg-gray-200 rounded-t-lg dark:bg-gray-700/50">
              <th className="text-left py-3 px-4 font-semibold">Material</th>
              <th className="text-left py-3 px-4 font-semibold">
                Project Phase
              </th>
              <th className="text-left py-3 px-4 font-semibold">
                Required Date
              </th>
              <th className="text-left py-3 px-4 font-semibold">Days Until</th>
              <th className="text-left py-3 px-4 font-semibold">Quantity</th>
              <th className="text-left py-3 px-4 font-semibold">Project ID</th>
              <th className="text-left py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {allDeliveries.map((material) => {
              const deliveryStatus = getDeliveryStatus(material.required_date);
              const daysUntil = getDaysUntil(material.required_date);

              return (
                <tr
                  key={material.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                >
                  <td className="py-3 px-4 font-medium capitalize">
                    {material.material_name || material.name}
                  </td>
                  <td className="py-3 px-4">{material.project_phase}</td>
                  <td className="py-3 px-4 font-medium">
                    {formatDateForDisplay(material.required_date)}
                  </td>
                  <td className="py-3 px-4">
                    {daysUntil === null ? (
                      <span className="text-gray-400">-</span>
                    ) : daysUntil < 0 ? (
                      <span className="text-red-600 dark:text-red-400 font-semibold">
                        {Math.abs(daysUntil)} days ago
                      </span>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">
                        {daysUntil} days
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {material.quantity} {material.unit}
                  </td>
                  <td className="py-3 px-4 font-mono text-sm uppercase">
                    {material.project_id}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${deliveryStatus.color}`}
                    >
                      {deliveryStatus.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JITDeliverySchedule;
