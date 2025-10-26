import { supabase } from "@/lib/supabase";

export async function getDashboardData() {
  try {
    // Get active projects count and progress
    const {
      data: projects,
      error: projectsError,
      count: projectsCount,
    } = await supabase
      .from("projects")
      .select("id, progress, status", { count: "exact" })
      .neq("status", "Completed");

    if (projectsError) {
      console.error("❌ Error fetching projects:", projectsError);
      throw projectsError;
    }

    // Get total workers count
    const {
      data: manpower,
      error: manpowerError,
      count: manpowerCount,
    } = await supabase
      .from("manpower")
      .select("id, status", { count: "exact" })
      .eq("status", "active");

    if (manpowerError) {
      console.error("❌ Error fetching manpower:", manpowerError);
      throw manpowerError;
    }

    // Get equipment count
    const {
      data: equipment,
      error: equipmentError,
      count: equipmentCount,
    } = await supabase
      .from("equipment")
      .select("id, status", { count: "exact" })
      .eq("status", "Operational");

    if (equipmentError) {
      console.error("❌ Error fetching equipment:", equipmentError);
      throw equipmentError;
    }

    // Get materials count
    const {
      data: materials,
      error: materialsError,
      count: materialsCount,
    } = await supabase
      .from("material_stock")
      .select(`*, master_materials(id,name,min_stock_level,unit)`, {
        count: "exact",
      })
      .eq("status", "active");

    if (materialsError) {
      console.error("❌ Error fetching materials:", materialsError);
      throw materialsError;
    }

    // Get safety incidents for score calculation
    const thirtyDaysAgo = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    const {
      data: safetyIncidents,
      error: safetyError,
      count: safetyCount,
    } = await supabase
      .from("safety_incidents")
      .select("id, severity, incident_date, created_at", { count: "exact" })
      .gte("incident_date", thirtyDaysAgo)
      .order("created_at", { ascending: false });

    if (safetyError) {
      console.error("❌ Error fetching safety incidents:", safetyError);
      throw safetyError;
    }

    // Get completed tasks for progress calculation
    const {
      data: tasks,
      error: tasksError,
      count: tasksCount,
    } = await supabase
      .from("tasks")
      .select("id, status, project_id", { count: "exact" });

    if (tasksError) {
      console.error("❌ Error fetching tasks:", tasksError);
      throw tasksError;
    }

    // Calculate metrics
    const activeProjects = projects?.length || 0;
    const totalWorkers = manpower?.length || 0;
    const activeEquipment = equipment?.length || 0;
    const totalMaterials = materials?.length || 0;

    // Calculate average project progress
    const averageProgress = projects?.length
      ? Math.round(
          projects.reduce((sum, project) => sum + (project.progress || 0), 0) /
            projects.length
        )
      : 0;

    // Calculate safety score (100 - (incidents * severity factor))
    const incidentScore =
      safetyIncidents?.reduce((score, incident) => {
        const severityFactor =
          incident.severity === "high"
            ? 5
            : incident.severity === "medium"
            ? 3
            : 1;
        return score - severityFactor;
      }, 100) || 100;
    const safetyScore = Math.max(0, Math.min(100, incidentScore));

    // Calculate tasks completion rate
    const completedTasks =
      tasks?.filter((task) => task.status === "Completed").length || 0;
    const totalTasks = tasks?.length || 0;
    const tasksCompletedRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const result = {
      activeProjects,
      totalWorkers,
      activeEquipment,
      totalMaterials,
      averageProgress,
      safetyScore,
      tasksCompletedRate,
      projects,
      materials,
      recentIncidents: safetyIncidents?.slice(0, 5) || [],
    };

    return result;
  } catch (error) {
    console.error("💥 Critical error in getDashboardData:", {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    throw error;
  }
}

export async function getChartData() {
  try {
    // Project progress data for bar chart
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("name, progress")
      .neq("status", "Completed")
      .limit(5)
      .order("progress", { ascending: false });

    if (projectsError) {
      console.error("❌ Error fetching projects for chart:", projectsError);
      throw projectsError;
    }

    // Safety score trend for line chart (last 6 months)
    const sixMonthsAgo = new Date(
      Date.now() - 180 * 24 * 60 * 60 * 1000
    ).toISOString();
    const { data: monthlySafety, error: safetyError } = await supabase
      .from("safety_incidents")
      .select("incident_date, severity, created_at")
      .gte("incident_date", sixMonthsAgo)
      .order("incident_date", { ascending: true });

    if (safetyError) {
      console.error("❌ Error fetching safety data for chart:", safetyError);
      throw safetyError;
    }

    // Resource distribution
    const resourceData = await getResourceDistribution();

    const processedProjectData =
      projects?.map((p) => ({
        name: p.name?.substring(0, 12) + (p.name?.length > 12 ? "..." : ""),
        progress: p.progress || 0,
      })) || [];

    const processedSafetyData = processMonthlySafetyData(monthlySafety);

    const result = {
      projectProgressData: processedProjectData,
      safetyData: processedSafetyData,
      resourceData,
    };

    return result;
  } catch (error) {
    console.error("💥 Critical error in getChartData:", {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    throw error;
  }
}

function processMonthlySafetyData(incidents) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const last6Months = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    last6Months.push({
      name: months[date.getMonth()],
      score: 100, // Start with perfect score
    });
  }

  // Deduct points for incidents
  incidents?.forEach((incident) => {
    const incidentDate = new Date(incident.date);
    const monthIndex = last6Months.findIndex(
      (m) => m.name === months[incidentDate.getMonth()]
    );

    if (monthIndex !== -1) {
      const severityDeduction =
        incident.severity === "high"
          ? 8
          : incident.severity === "medium"
          ? 5
          : 2;
      last6Months[monthIndex].score = Math.max(
        60,
        last6Months[monthIndex].score - severityDeduction
      );
      // console.log(
      //   `⚠️ Incident in ${last6Months[monthIndex].name}: -${severityDeduction} points (${incident.severity} severity)`
      // );
    }
  });

  return last6Months;
}

async function getResourceDistribution() {
  try {
    const [manpowerResult, equipmentResult, materialsResult] =
      await Promise.all([
        supabase
          .from("manpower")
          .select("id", { count: "exact" })
          .eq("status", "active"),
        supabase
          .from("equipment")
          .select("id", { count: "exact" })
          .eq("status", "Operational"),
        supabase
          .from("materials")
          .select("id", { count: "exact" })
          .eq("status", "In Stock"),
      ]);

    const manpowerError = manpowerResult.error;
    const equipmentError = equipmentResult.error;
    const materialsError = materialsResult.error;

    if (manpowerError) {
      console.error("❌ Error fetching manpower for resources:", manpowerError);
      throw manpowerError;
    }
    if (equipmentError) {
      console.error(
        "❌ Error fetching equipment for resources:",
        equipmentError
      );
      throw equipmentError;
    }
    if (materialsError) {
      console.error(
        "❌ Error fetching materials for resources:",
        materialsError
      );
      throw materialsError;
    }

    const resourceData = [
      { name: "Workers", value: manpowerResult.count || 0 },
      { name: "Equipment", value: equipmentResult.count || 0 },
      { name: "Materials", value: materialsResult.count || 0 },
    ];

    return resourceData;
  } catch (error) {
    console.error("💥 Error in getResourceDistribution:", {
      error: error.message,
      stack: error.stack,
    });
    // Return default data instead of throwing to prevent breaking the entire dashboard
    return [
      { name: "Workers", value: 0 },
      { name: "Equipment", value: 0 },
      { name: "Materials", value: 0 },
    ];
  }
}

export async function getRecentActivity() {
  try {
    // Get recent safety incidents
    const { data: incidents, error: incidentsError } = await supabase
      .from("safety_incidents")
      .select("id, title, description, severity, created_at")
      .order("created_at", { ascending: false })
      .limit(4);

    if (incidentsError) {
      console.error(
        "❌ Error fetching recent safety incidents:",
        incidentsError
      );
      throw incidentsError;
    }

    // Get recent task completions
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, task_name, project_id, status, updated_at")
      .eq("status", "Completed")
      .order("updated_at", { ascending: false })
      .limit(4);

    if (tasksError) {
      console.error("❌ Error fetching recent completed tasks:", tasksError);
      throw tasksError;
    }

    // Combine and format activities
    const activities = [
      ...(incidents?.map((incident) => ({
        id: `incident-${incident.id}`,
        action: `Safety: ${incident.title}`,
        description: incident.description,
        time: formatTimeAgo(incident.created_at),
        type:
          incident.severity === "high"
            ? "error"
            : incident.severity === "medium"
            ? "warning"
            : "info",
        rawDate: incident.created_at,
      })) || []),
      ...(tasks?.map((task) => ({
        id: `task-${task.id}`,
        action: `Task Completed: ${task.task_name}`,
        description: `Project task marked as done`,
        time: formatTimeAgo(task.updated_at),
        type: "success",
        rawDate: task.updated_at,
      })) || []),
    ];

    // Sort by date and take top 4
    const sortedActivities = activities
      .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate))
      .slice(0, 4)
      .map(({ rawDate, ...activity }) => activity); // Remove rawDate from final result

    return sortedActivities;
  } catch (error) {
    console.error("💥 Critical error in getRecentActivity:", {
      error: error.message,
      stack: error.stack,
      name: error.name,
    });
    // Return empty array instead of throwing to prevent breaking the UI
    return [];
  }
}

function formatTimeAgo(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return `${Math.floor(diffInHours / 168)} weeks ago`;
  } catch (error) {
    console.error("❌ Error formatting time ago:", error);
    return "Recently";
  }
}

// Utility function to test database connection
export async function testDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("id")
      .limit(1);

    if (error) {
      console.error("❌ Database connection test failed:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("💥 Database connection test error:", error);
    return { success: false, error };
  }
}
