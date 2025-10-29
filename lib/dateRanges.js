// Helper function to calculate the number of days between two dates (inclusive)
function calculateDaysInRange(fromDate, toDate) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const timeDiff = end - start;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff + 1; // Add 1 to include both start and end dates
}

export function getDateRangeForFilter(dateRange, startDate, endDate) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  let fromDate, toDate;

  switch (dateRange) {
    case "today":
      fromDate = new Date(now);
      toDate = new Date(now);
      break;

    case "this_week":
      const thisWeekStart = new Date(now);
      thisWeekStart.setDate(currentDate - currentDay); // Sunday of this week
      const thisWeekEnd = new Date(thisWeekStart);
      thisWeekEnd.setDate(thisWeekStart.getDate() + 6); // Saturday of this week
      fromDate = thisWeekStart;
      toDate = thisWeekEnd;
      break;

    case "last_week":
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(currentDate - currentDay - 7); // Sunday of last week
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6); // Saturday of last week
      fromDate = lastWeekStart;
      toDate = lastWeekEnd;
      break;

    case "this_month":
      fromDate = new Date(currentYear, currentMonth, 1);
      toDate = new Date(currentYear, currentMonth + 1, 0); // Last day of this month
      break;

    case "last_month":
      fromDate = new Date(currentYear, currentMonth - 1, 1);
      toDate = new Date(currentYear, currentMonth, 0); // Last day of last month
      break;

    case "last_7_days":
      fromDate = new Date(now);
      fromDate.setDate(currentDate - 6); // 7 days including today
      toDate = new Date(now);
      break;

    case "last_30_days":
      fromDate = new Date(now);
      fromDate.setDate(currentDate - 29); // 30 days including today
      toDate = new Date(now);
      break;

    case "this_year":
      fromDate = new Date(currentYear, 0, 1); // January 1st
      toDate = new Date(currentYear, 11, 31); // December 31st
      break;

    case "last_year":
      fromDate = new Date(currentYear - 1, 0, 1); // January 1st of last year
      toDate = new Date(currentYear - 1, 11, 31); // December 31st of last year
      break;

    case "custom":
      if (startDate && endDate) {
        fromDate = new Date(startDate);
        toDate = new Date(endDate);
      } else {
        // Default to last 30 days if custom range is invalid
        fromDate = new Date(now);
        fromDate.setDate(currentDate - 29);
        toDate = new Date(now);
      }
      break;

    default:
      fromDate = new Date(now);
      fromDate.setDate(currentDate - 29);
      toDate = new Date(now);
  }

  // Format as YYYY-MM-DD strings
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fromDateStr = formatDate(fromDate);
  const toDateStr = formatDate(toDate);
  const daysInRange = calculateDaysInRange(fromDate, toDate);

  return {
    fromDate: fromDateStr,
    toDate: toDateStr,
    daysInRange,
    label:
      dateRangeOptions.find((opt) => opt.value === dateRange)?.label ||
      "Custom Range",
  };
}

export const dateRangeOptions = [
  { value: "today", label: "Today (1 day)" },
  { value: "this_week", label: "This Week (7 days)" },
  { value: "last_week", label: "Last Week (7 days)" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_7_days", label: "Last 7 Days" },
  { value: "last_30_days", label: "Last 30 Days" },
  { value: "this_year", label: "This Year" },
  { value: "last_year", label: "Last Year" },
  { value: "custom", label: "Custom Range" },
];

// Helper function to get the number of days for a specific range
export function getDaysInRange(dateRange, startDate, endDate) {
  const { fromDate, toDate } = getDateRangeForFilter(
    dateRange,
    startDate,
    endDate
  );
  return calculateDaysInRange(new Date(fromDate), new Date(toDate));
}

// Helper function to get month name
export function getMonthName(monthIndex) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthIndex];
}
