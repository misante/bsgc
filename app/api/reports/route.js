import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "last_30_days";

  try {
    // Get all required data with cost calculations - UPDATED TABLE NAME
    const [
      { data: projects },
      { data: manpowerReqs },
      { data: materialReqs },
      { data: equipmentReqs },
      { data: masterMaterials },
      { data: masterManpower },
      { data: masterEquipment },
      // NEW: Get daily usage data from separate tables
      { data: dailyMaterialUsage },
      { data: dailyManpowerUsage },
      { data: dailyEquipmentUsage },
    ] = await Promise.all([
      supabase.from("projects").select("*"),
      supabase.from("manpower_requirements").select("*, master_manpower(*)"),
      // UPDATED: Correct table name with hyphen
      supabase.from("material-requirements").select("*, master_materials(*)"),
      supabase.from("equipment_requirements").select("*, master_equipment(*)"),
      supabase.from("master_materials").select("*"),
      supabase.from("master_manpower").select("*"),
      supabase.from("master_equipment").select("*"),
      // Daily usage tables
      supabase.from("daily_material_usage").select("*, master_materials(*)"),
      supabase.from("daily_manpower_usage").select("*, master_manpower(*)"),
      supabase.from("daily_equipment_usage").select("*, master_equipment(*)"),
    ]);

    // DEBUG: Log the data we're getting
    console.log("=== DEBUG DATA ===");
    console.log("Projects:", projects?.length);
    console.log("Material Requirements:", materialReqs?.length);
    console.log(
      "All projects:",
      projects?.map((p) => ({ id: p.id, name: p.name, budget: p.budget }))
    );

    // Calculate PLANNED Costs (based on requirements)
    const plannedMaterialCost =
      materialReqs?.reduce((sum, req) => {
        const unitCost = req.master_materials?.unit_cost || 0;
        return sum + unitCost * (req.quantity || 0);
      }, 0) || 0;

    const plannedManpowerCost =
      manpowerReqs?.reduce((sum, req) => {
        const rate = req.master_manpower?.rate_per_hour || 0;
        const hours = req.planned_hours || 0;
        return sum + rate * hours;
      }, 0) || 0;

    const plannedEquipmentCost =
      equipmentReqs?.reduce((sum, req) => {
        const rate = req.master_equipment?.rate_per_hour || 0;
        const hours = req.planned_hours || 0;
        const maintenance = req.master_equipment?.maintenance_rate || 0;
        return sum + rate * hours + maintenance;
      }, 0) || 0;

    const totalPlannedCost =
      plannedMaterialCost + plannedManpowerCost + plannedEquipmentCost;

    // Calculate ACTUAL Costs from daily usage tables
    const actualMaterialCost =
      dailyMaterialUsage?.reduce((sum, usage) => {
        const unitCost = usage.master_materials?.unit_cost || 0;
        return sum + unitCost * (usage.quantity_used || 0);
      }, 0) || 0;

    const actualManpowerCost =
      dailyManpowerUsage?.reduce((sum, usage) => {
        const rate = usage.master_manpower?.rate_per_hour || 0;
        return sum + rate * (usage.hours_worked || 0);
      }, 0) || 0;

    const actualEquipmentCost =
      dailyEquipmentUsage?.reduce((sum, usage) => {
        const rate = usage.master_equipment?.rate_per_hour || 0;
        const maintenance = usage.master_equipment?.maintenance_rate || 0;
        return sum + rate * (usage.hours_used || 0) + maintenance;
      }, 0) || 0;

    // const totalActualCost =
    //   actualMaterialCost + actualManpowerCost + actualEquipmentCost;
    const totalActualCost =
      projects?.reduce((sum, project) => sum + (project.actual_cost || 0), 0) ||
      0;
    const costVariance = totalPlannedCost - totalActualCost;

    // Calculate total budget from projects table
    const totalBudget =
      projects?.reduce((sum, project) => sum + (project.budget || 0), 0) || 0;

    // This shows Planned vs Actual by project - SHOW ALL PROJECTS
    const budgetVsActual = calculateBudgetVsActual(
      projects,
      materialReqs,
      manpowerReqs,
      equipmentReqs,
      dailyMaterialUsage,
      dailyManpowerUsage,
      dailyEquipmentUsage
    );

    console.log("=== BUDGET VS ACTUAL RESULT ===");
    console.log("BudgetVsActual data:", budgetVsActual);
    console.log("Projects included:", budgetVsActual?.length);

    // Enhanced totals with both planned and actual costs
    const totals = {
      projects: projects?.length || 0,
      manpower: manpowerReqs?.length || 0,
      materials: materialReqs?.length || 0,
      equipments: equipmentReqs?.length || 0,
      dailyMaterialUsage: dailyMaterialUsage?.length || 0,
      dailyManpowerUsage: dailyManpowerUsage?.length || 0,
      dailyEquipmentUsage: dailyEquipmentUsage?.length || 0,

      // Cost Metrics
      budget: totalBudget,
      plannedCost: totalPlannedCost,
      actualCost: totalActualCost,
      costVariance: costVariance,

      // Actual Cost Breakdown
      actualMaterialCost: actualMaterialCost,
      actualManpowerCost: actualManpowerCost,
      actualEquipmentCost: actualEquipmentCost,

      // Planned Cost Breakdown
      plannedMaterialCost: plannedMaterialCost,
      plannedManpowerCost: plannedManpowerCost,
      plannedEquipmentCost: plannedEquipmentCost,
    };

    // Charts Data
    const progressChart = projects?.map((p) => ({
      name: p.name?.substring(0, 12) || "Unnamed",
      value: p.progress || 0,
      budget: p.budget || 0,
    }));

    const costBreakdown = [
      {
        name: "Materials",
        planned: plannedMaterialCost,
        actual: actualMaterialCost,
        color: "#3b82f6",
      },
      {
        name: "Manpower",
        planned: plannedManpowerCost,
        actual: actualManpowerCost,
        color: "#10b981",
      },
      {
        name: "Equipment",
        planned: plannedEquipmentCost,
        actual: actualEquipmentCost,
        color: "#f59e0b",
      },
    ];

    const monthlyCosts = calculateMonthlyCosts(
      dailyMaterialUsage,
      dailyManpowerUsage,
      dailyEquipmentUsage,
      range
    );

    // Equipment Utilization
    const equipmentUtilization =
      equipmentReqs
        ?.map((req) => {
          const equipmentId = req.equipment_id;
          const plannedHours = req.planned_hours || 0;

          const actualHours =
            dailyEquipmentUsage
              ?.filter((usage) => usage.equipment_id === equipmentId)
              ?.reduce((sum, usage) => sum + (usage.hours_used || 0), 0) || 0;

          return {
            name: req.master_equipment?.name,
            plannedHours: plannedHours,
            actualHours: actualHours,
            utilization:
              plannedHours > 0 ? (actualHours / plannedHours) * 100 : 0,
          };
        })
        ?.filter((item) => item.plannedHours > 0 || item.actualHours > 0)
        ?.slice(0, 5) || [];

    return NextResponse.json({
      success: true,
      totals,
      charts: {
        progress: progressChart || [],
        materials: monthlyCosts.materials || [],
        manpower: monthlyCosts.manpower || [],
        equipment: monthlyCosts.equipment || [],
        costBreakdown: costBreakdown || [],
        budgetVsActual: budgetVsActual || [],
        equipmentUtilization: equipmentUtilization || [],
      },
      kpis: {
        overBudgetProjects:
          budgetVsActual?.filter((item) => item.actual > item.planned)
            ?.length || 0,
        underBudgetProjects:
          budgetVsActual?.filter((item) => item.actual <= item.planned)
            ?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error in /api/reports:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch report data" },
      { status: 500 }
    );
  }
}

// UPDATED: Show ALL projects, not just ones with costs > 0
// function calculateBudgetVsActual(
//   projects,
//   materialReqs,
//   manpowerReqs,
//   equipmentReqs,
//   dailyMaterialUsage,
//   dailyManpowerUsage,
//   dailyEquipmentUsage
// ) {
//   if (!projects || !projects.length) {
//     console.log("No projects found");
//     return [];
//   }

//   const result = projects.map((project) => {
//     const projectId = project.id;

//     const projectPlannedCost = calculateProjectPlannedCost(
//       projectId,
//       materialReqs,
//       manpowerReqs,
//       equipmentReqs
//     );

//     const projectActualCost = calculateProjectActualCost(
//       projectId,
//       dailyMaterialUsage,
//       dailyManpowerUsage,
//       dailyEquipmentUsage
//     );

//     console.log(`Project ${project.name} (${projectId}):`, {
//       planned: projectPlannedCost,
//       actual: projectActualCost,
//       progress: project.progress,
//       budget: project.budget,
//     });

//     return {
//       name:
//         project.name?.substring(0, 10) ||
//         `Project ${projectId.substring(0, 8)}`,
//       planned: projectPlannedCost,
//       actual: projectActualCost,
//       progress: project.progress || 0,
//       // Include full project name for tooltip
//       fullName: project.name,
//       // Include budget for reference
//       budget: project.budget || 0,
//     };
//   });

//   console.log("Final budget vs actual result - ALL PROJECTS:", result);
//   return result;
// }

function calculateBudgetVsActual(projects) {
  if (!projects || !projects.length) return [];

  return projects.map((project) => ({
    name:
      project.name?.substring(0, 10) || `Project ${project.id.substring(0, 8)}`,
    planned: project.budget || 0,
    actual: project.actual_cost || 0,
    progress: project.progress || 0,
    fullName: project.name,
  }));
}
// Helper function for planned costs per project
function calculateProjectPlannedCost(
  projectId,
  materialReqs,
  manpowerReqs,
  equipmentReqs
) {
  const materialCost =
    materialReqs
      ?.filter((m) => m.project_id === projectId)
      ?.reduce(
        (sum, req) =>
          sum + (req.master_materials?.unit_cost || 0) * (req.quantity || 0),
        0
      ) || 0;

  const manpowerCost =
    manpowerReqs
      ?.filter((m) => m.project_id === projectId)
      ?.reduce(
        (sum, req) =>
          sum +
          (req.master_manpower?.rate_per_hour || 0) * (req.planned_hours || 0),
        0
      ) || 0;

  const equipmentCost =
    equipmentReqs
      ?.filter((m) => m.project_id === projectId)
      ?.reduce(
        (sum, req) =>
          sum +
          (req.master_equipment?.rate_per_hour || 0) *
            (req.planned_hours || 0) +
          (req.master_equipment?.maintenance_rate || 0),
        0
      ) || 0;

  return materialCost + manpowerCost + equipmentCost;
}

// Calculate actual costs from daily usage tables
function calculateProjectActualCost(
  projectId,
  dailyMaterialUsage,
  dailyManpowerUsage,
  dailyEquipmentUsage
) {
  const materialCost =
    dailyMaterialUsage
      ?.filter((usage) => usage.project_id === projectId)
      ?.reduce(
        (sum, usage) =>
          sum +
          (usage.master_materials?.unit_cost || 0) * (usage.quantity_used || 0),
        0
      ) || 0;

  const manpowerCost =
    dailyManpowerUsage
      ?.filter((usage) => usage.project_id === projectId)
      ?.reduce(
        (sum, usage) =>
          sum +
          (usage.master_manpower?.rate_per_hour || 0) *
            (usage.hours_worked || 0),
        0
      ) || 0;

  const equipmentCost =
    dailyEquipmentUsage
      ?.filter((usage) => usage.project_id === projectId)
      ?.reduce(
        (sum, usage) =>
          sum +
          (usage.master_equipment?.rate_per_hour || 0) *
            (usage.hours_used || 0) +
          (usage.master_equipment?.maintenance_rate || 0),
        0
      ) || 0;

  return materialCost + manpowerCost + equipmentCost;
}

// Helper functions for monthly costs
function calculateMonthlyCosts(
  dailyMaterialUsage,
  dailyManpowerUsage,
  dailyEquipmentUsage,
  range
) {
  const materials = {};
  const manpower = {};
  const equipment = {};

  dailyMaterialUsage?.forEach((usage) => {
    const date = new Date(usage.usage_date);
    const month = date.toLocaleString("default", { month: "short" });
    const cost =
      (usage.master_materials?.unit_cost || 0) * (usage.quantity_used || 0);
    materials[month] = (materials[month] || 0) + cost;
  });

  dailyManpowerUsage?.forEach((usage) => {
    const date = new Date(usage.usage_date);
    const month = date.toLocaleString("default", { month: "short" });
    const cost =
      (usage.master_manpower?.rate_per_hour || 0) * (usage.hours_worked || 0);
    manpower[month] = (manpower[month] || 0) + cost;
  });

  dailyEquipmentUsage?.forEach((usage) => {
    const date = new Date(usage.usage_date);
    const month = date.toLocaleString("default", { month: "short" });
    const cost =
      (usage.master_equipment?.rate_per_hour || 0) * (usage.hours_used || 0) +
      (usage.master_equipment?.maintenance_rate || 0);
    equipment[month] = (equipment[month] || 0) + cost;
  });

  return {
    materials: Object.entries(materials).map(([month, cost]) => ({
      name: month,
      value: cost,
    })),
    manpower: Object.entries(manpower).map(([month, cost]) => ({
      name: month,
      value: cost,
    })),
    equipment: Object.entries(equipment).map(([month, cost]) => ({
      name: month,
      value: cost,
    })),
  };
}
