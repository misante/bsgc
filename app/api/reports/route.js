// import { supabase } from "@/lib/supabase";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//   const { searchParams } = new URL(request.url);
//   const range = searchParams.get("range") || "last_30_days";

//   try {
//     // Get all required data with cost calculations
//     const [
//       { data: projects },
//       { data: manpowerReqs },
//       { data: materialReqs },
//       { data: equipmentReqs },
//       { data: masterMaterials },
//       { data: masterManpower },
//       { data: masterEquipment },
//       { data: budgets },
//     ] = await Promise.all([
//       supabase.from("projects").select("*, budgets(*)"),
//       supabase.from("manpower_requirements").select("*, master_manpower(*)"),
//       supabase.from("material_requests").select("*, master_materials(*)"),
//       supabase.from("equipment_requirements").select("*, master_equipment(*)"),
//       supabase.from("master_materials").select("*"),
//       supabase.from("master_manpower").select("*"),
//       supabase.from("master_equipment").select("*"),
//       supabase.from("budgets").select("*"),
//     ]);

//     // Calculate PLANNED Costs (based on requirements)
//     const plannedMaterialCost =
//       materialReqs?.reduce((sum, req) => {
//         const unitCost = req.master_materials?.unit_cost || 0;
//         return sum + unitCost * req.planned_quantity;
//       }, 0) || 0;

//     const plannedManpowerCost =
//       manpowerReqs?.reduce((sum, req) => {
//         const rate = req.master_manpower?.rate_per_hour || 0;
//         const hours = req.planned_hours || 0;
//         return sum + rate * hours;
//       }, 0) || 0;

//     const plannedEquipmentCost =
//       equipmentReqs?.reduce((sum, req) => {
//         const rate = req.master_equipment?.rate_per_hour || 0;
//         const hours = req.planned_hours || 0;
//         const maintenance = req.master_equipment?.maintenance_rate || 0;
//         return sum + rate * hours + maintenance;
//       }, 0) || 0;

//     const totalPlannedCost =
//       plannedMaterialCost + plannedManpowerCost + plannedEquipmentCost;

//     // Calculate ACTUAL Costs (based on actual usage)
//     const actualMaterialCost =
//       materialReqs
//         ?.filter((m) => m.status === "delivered")
//         ?.reduce((sum, req) => {
//           const unitCost = req.master_materials?.unit_cost || 0;
//           return (
//             sum +
//             unitCost * (req.actual_quantity_used || req.requested_quantity)
//           );
//         }, 0) || 0;

//     const actualManpowerCost =
//       manpowerReqs?.reduce((sum, req) => {
//         const rate = req.master_manpower?.rate_per_hour || 0;
//         const hours = req.actual_hours || 0;
//         return sum + rate * hours;
//       }, 0) || 0;

//     const actualEquipmentCost =
//       equipmentReqs?.reduce((sum, req) => {
//         const rate = req.master_equipment?.rate_per_hour || 0;
//         const hours = req.actual_hours || 0;
//         const maintenance = req.master_equipment?.maintenance_rate || 0;
//         return sum + rate * hours + maintenance;
//       }, 0) || 0;

//     const totalActualCost =
//       actualMaterialCost + actualManpowerCost + actualEquipmentCost;

//     // FIXED: Cost Variance now compares Planned vs Actual instead of Budget vs Actual
//     const costVariance = totalPlannedCost - totalActualCost;

//     // Calculate total budget from budgets table
//     const totalBudget =
//       budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0;

//     // Earned Value Analysis - using planned cost as the baseline
//     const earnedValue =
//       projects?.reduce((sum, project) => {
//         const projectPlannedCost = calculateProjectPlannedCost(
//           project.id,
//           materialReqs,
//           manpowerReqs,
//           equipmentReqs
//         );
//         const progress = project.progress || 0;
//         return sum + (projectPlannedCost * progress) / 100;
//       }, 0) || 0;

//     // FIXED: Use planned cost for PV calculation instead of budget
//     const plannedValue = totalPlannedCost * 0.8; // Simplified - 80% of planned cost
//     const CPI = totalActualCost > 0 ? earnedValue / totalActualCost : 0;
//     const SPI = plannedValue > 0 ? earnedValue / plannedValue : 0;

//     // Equipment Utilization
//     const equipmentUtilization =
//       equipmentReqs
//         ?.map((req) => ({
//           name: req.master_equipment?.name,
//           plannedHours: req.planned_hours || 0,
//           actualHours: req.actual_hours || 0,
//           utilization:
//             req.planned_hours > 0
//               ? ((req.actual_hours || 0) / req.planned_hours) * 100
//               : 0,
//           costEfficiency:
//             req.actual_hours > 0
//               ? ((req.master_equipment?.rate_per_hour || 0) *
//                   req.actual_hours) /
//                 req.actual_hours
//               : 0,
//         }))
//         ?.sort((a, b) => b.costEfficiency - a.costEfficiency)
//         ?.slice(0, 5) || [];

//     // Enhanced totals with both planned and actual costs
//     const totals = {
//       projects: projects?.length || 0,
//       manpower: manpowerReqs?.length || 0,
//       materials: materialReqs?.length || 0,
//       equipments: equipmentReqs?.length || 0,

//       // Cost Metrics - using plannedCost as the baseline
//       budget: totalBudget, // Keep for reference but not used in variance
//       plannedCost: totalPlannedCost, // This is now our "Total Budget" in UI
//       actualCost: totalActualCost,
//       costVariance: costVariance, // Now this is planned vs actual

//       // Actual Cost Breakdown
//       actualMaterialCost: actualMaterialCost,
//       actualManpowerCost: actualManpowerCost,
//       actualEquipmentCost: actualEquipmentCost,

//       // Planned Cost Breakdown
//       plannedMaterialCost: plannedMaterialCost,
//       plannedManpowerCost: plannedManpowerCost,
//       plannedEquipmentCost: plannedEquipmentCost,

//       // Performance Metrics
//       earnedValue: earnedValue,
//       plannedValue: plannedValue,
//       CPI: CPI,
//       SPI: SPI,
//     };

//     // Charts Data
//     const progressChart = projects?.map((p) => ({
//       name: p.name?.substring(0, 12) || "Unnamed",
//       value: p.progress || 0,
//       budget: p.budgets?.amount || 0,
//     }));

//     const costBreakdown = [
//       {
//         name: "Materials",
//         planned: plannedMaterialCost,
//         actual: actualMaterialCost,
//         color: "#3b82f6",
//       },
//       {
//         name: "Manpower",
//         planned: plannedManpowerCost,
//         actual: actualManpowerCost,
//         color: "#10b981",
//       },
//       {
//         name: "Equipment",
//         planned: plannedEquipmentCost,
//         actual: actualEquipmentCost,
//         color: "#f59e0b",
//       },
//     ];

//     const monthlyCosts = calculateMonthlyCosts(
//       materialReqs,
//       manpowerReqs,
//       equipmentReqs,
//       range
//     );

//     // FIXED: This now shows Planned vs Actual by project
//     const budgetVsActual = calculateBudgetVsActual(
//       projects,
//       materialReqs,
//       manpowerReqs,
//       equipmentReqs
//     );

//     return NextResponse.json({
//       success: true,
//       totals,
//       charts: {
//         progress: progressChart || [],
//         materials: monthlyCosts.materials || [],
//         manpower: monthlyCosts.manpower || [],
//         equipment: monthlyCosts.equipment || [],
//         costBreakdown: costBreakdown || [],
//         budgetVsActual: budgetVsActual || [],
//         equipmentUtilization: equipmentUtilization || [],
//       },
//       kpis: {
//         // FIXED: These now compare planned vs actual costs per project
//         overBudgetProjects:
//           projects?.filter((p) => {
//             const projectPlannedCost = calculateProjectPlannedCost(
//               p.id,
//               materialReqs,
//               manpowerReqs,
//               equipmentReqs
//             );
//             const projectActualCost = calculateProjectActualCost(
//               p.id,
//               materialReqs,
//               manpowerReqs,
//               equipmentReqs
//             );
//             return projectActualCost > projectPlannedCost;
//           })?.length || 0,
//         underBudgetProjects:
//           projects?.filter((p) => {
//             const projectPlannedCost = calculateProjectPlannedCost(
//               p.id,
//               materialReqs,
//               manpowerReqs,
//               equipmentReqs
//             );
//             const projectActualCost = calculateProjectActualCost(
//               p.id,
//               materialReqs,
//               manpowerReqs,
//               equipmentReqs
//             );
//             return projectActualCost <= projectPlannedCost;
//           })?.length || 0,
//       },
//     });
//   } catch (error) {
//     console.error("Error in /api/reports:", error);
//     return NextResponse.json(
//       { success: false, error: "Failed to fetch report data" },
//       { status: 500 }
//     );
//   }
// }

// // Helper functions
// function calculateMonthlyCosts(
//   materialReqs,
//   manpowerReqs,
//   equipmentReqs,
//   range
// ) {
//   const materials = {};
//   const manpower = {};
//   const equipment = {};

//   // Process material costs by month
//   materialReqs
//     ?.filter((m) => m.status === "delivered")
//     ?.forEach((req) => {
//       const date = new Date(req.created_at);
//       const month = date.toLocaleString("default", { month: "short" });
//       const cost =
//         (req.master_materials?.unit_cost || 0) *
//         (req.actual_quantity_used || req.requested_quantity);
//       materials[month] = (materials[month] || 0) + cost;
//     });

//   // Process manpower costs by month
//   manpowerReqs?.forEach((req) => {
//     const date = new Date(req.created_at);
//     const month = date.toLocaleString("default", { month: "short" });
//     const cost =
//       (req.master_manpower?.rate_per_hour || 0) * (req.actual_hours || 0);
//     manpower[month] = (manpower[month] || 0) + cost;
//   });

//   // Process equipment costs by month
//   equipmentReqs?.forEach((req) => {
//     const date = new Date(req.created_at);
//     const month = date.toLocaleString("default", { month: "short" });
//     const cost =
//       (req.master_equipment?.rate_per_hour || 0) * (req.actual_hours || 0) +
//       (req.master_equipment?.maintenance_rate || 0);
//     equipment[month] = (equipment[month] || 0) + cost;
//   });

//   return {
//     materials: Object.entries(materials).map(([month, cost]) => ({
//       name: month,
//       value: cost,
//     })),
//     manpower: Object.entries(manpower).map(([month, cost]) => ({
//       name: month,
//       value: cost,
//     })),
//     equipment: Object.entries(equipment).map(([month, cost]) => ({
//       name: month,
//       value: cost,
//     })),
//   };
// }

// // Helper function for planned costs per project
// function calculateProjectPlannedCost(
//   projectId,
//   materialReqs,
//   manpowerReqs,
//   equipmentReqs
// ) {
//   const materialCost =
//     materialReqs
//       ?.filter((m) => m.project_id === projectId)
//       ?.reduce(
//         (sum, req) =>
//           sum + (req.master_materials?.unit_cost || 0) * req.planned_quantity,
//         0
//       ) || 0;

//   const manpowerCost =
//     manpowerReqs
//       ?.filter((m) => m.project_id === projectId)
//       ?.reduce(
//         (sum, req) =>
//           sum +
//           (req.master_manpower?.rate_per_hour || 0) * (req.planned_hours || 0),
//         0
//       ) || 0;

//   const equipmentCost =
//     equipmentReqs
//       ?.filter((m) => m.project_id === projectId)
//       ?.reduce(
//         (sum, req) =>
//           sum +
//           (req.master_equipment?.rate_per_hour || 0) *
//             (req.planned_hours || 0) +
//           (req.master_equipment?.maintenance_rate || 0),
//         0
//       ) || 0;

//   return materialCost + manpowerCost + equipmentCost;
// }

// function calculateBudgetVsActual(
//   projects,
//   materialReqs,
//   manpowerReqs,
//   equipmentReqs
// ) {
//   return (
//     projects?.map((project) => {
//       const projectPlannedCost = calculateProjectPlannedCost(
//         project.id,
//         materialReqs,
//         manpowerReqs,
//         equipmentReqs
//       );
//       const projectActualCost = calculateProjectActualCost(
//         project.id,
//         materialReqs,
//         manpowerReqs,
//         equipmentReqs
//       );

//       return {
//         name: project.name?.substring(0, 10) || "Project",
//         planned: projectPlannedCost,
//         actual: projectActualCost,
//         progress: project.progress || 0,
//       };
//     }) || []
//   );
// }

// function calculateProjectActualCost(
//   projectId,
//   materialReqs,
//   manpowerReqs,
//   equipmentReqs
// ) {
//   const materialCost =
//     materialReqs
//       ?.filter((m) => m.project_id === projectId && m.status === "delivered")
//       ?.reduce(
//         (sum, req) =>
//           sum +
//           (req.master_materials?.unit_cost || 0) *
//             (req.actual_quantity_used || req.requested_quantity),
//         0
//       ) || 0;

//   const manpowerCost =
//     manpowerReqs
//       ?.filter((m) => m.project_id === projectId)
//       ?.reduce(
//         (sum, req) =>
//           sum +
//           (req.master_manpower?.rate_per_hour || 0) * (req.actual_hours || 0),
//         0
//       ) || 0;

//   const equipmentCost =
//     equipmentReqs
//       ?.filter((m) => m.project_id === projectId)
//       ?.reduce(
//         (sum, req) =>
//           sum +
//           (req.master_equipment?.rate_per_hour || 0) * (req.actual_hours || 0) +
//           (req.master_equipment?.maintenance_rate || 0),
//         0
//       ) || 0;

//   return materialCost + manpowerCost + equipmentCost;
// }
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "last_30_days";

  try {
    // Get all required data with cost calculations
    const [
      { data: projects },
      { data: manpowerReqs },
      { data: materialReqs },
      { data: equipmentReqs },
      { data: masterMaterials },
      { data: masterManpower },
      { data: masterEquipment },
      { data: budgets },
      // NEW: Get daily usage data from separate tables
      { data: dailyMaterialUsage },
      { data: dailyManpowerUsage },
      { data: dailyEquipmentUsage },
    ] = await Promise.all([
      supabase.from("projects").select("*, budgets(*)"),
      supabase.from("manpower_requirements").select("*, master_manpower(*)"),
      supabase.from("material-requirements").select("*, master_materials(*)"),
      supabase.from("equipment_requirements").select("*, master_equipment(*)"),
      supabase.from("master_materials").select("*"),
      supabase.from("master_manpower").select("*"),
      supabase.from("master_equipment").select("*"),
      supabase.from("budgets").select("*"),
      // NEW: Daily usage tables
      supabase.from("daily_material_usage").select("*, master_materials(*)"),
      supabase.from("daily_manpower_usage").select("*, master_manpower(*)"),
      supabase.from("daily_equipment_usage").select("*, master_equipment(*)"),
    ]);

    // Calculate PLANNED Costs (based on requirements) - UNCHANGED
    const plannedMaterialCost =
      materialReqs?.reduce((sum, req) => {
        const unitCost = req.master_materials?.unit_cost || 0;
        return sum + unitCost * req.quantity;
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

    // UPDATED: Calculate ACTUAL Costs from daily usage tables
    const actualMaterialCost =
      dailyMaterialUsage?.reduce((sum, usage) => {
        const unitCost = usage.master_materials?.unit_cost || 0;
        return sum + unitCost * usage.quantity_used;
      }, 0) || 0;

    const actualManpowerCost =
      dailyManpowerUsage?.reduce((sum, usage) => {
        const rate = usage.master_manpower?.rate_per_hour || 0;
        return sum + rate * usage.hours_worked;
      }, 0) || 0;

    const actualEquipmentCost =
      dailyEquipmentUsage?.reduce((sum, usage) => {
        const rate = usage.master_equipment?.rate_per_hour || 0;
        const maintenance = usage.master_equipment?.maintenance_rate || 0;
        return sum + rate * usage.hours_used + maintenance;
      }, 0) || 0;

    const totalActualCost =
      actualMaterialCost + actualManpowerCost + actualEquipmentCost;

    // Cost Variance compares Planned vs Actual
    const costVariance = totalPlannedCost - totalActualCost;

    // Calculate total budget from budgets table
    const totalBudget =
      budgets?.reduce((sum, budget) => sum + budget.amount, 0) || 0;

    // Earned Value Analysis - using planned cost as the baseline
    const earnedValue =
      projects?.reduce((sum, project) => {
        const projectPlannedCost = calculateProjectPlannedCost(
          project.id,
          materialReqs,
          manpowerReqs,
          equipmentReqs
        );
        const progress = project.progress || 0;
        return sum + (projectPlannedCost * progress) / 100;
      }, 0) || 0;

    // Use planned cost for PV calculation instead of budget
    const plannedValue = totalPlannedCost * 0.8; // Simplified - 80% of planned cost
    const CPI = totalActualCost > 0 ? earnedValue / totalActualCost : 0;
    const SPI = plannedValue > 0 ? earnedValue / plannedValue : 0;

    // Equipment Utilization - UPDATED to use daily usage data
    const equipmentUtilization =
      equipmentReqs
        ?.map((req) => {
          const equipmentId = req.equipment_id;
          const plannedHours = req.planned_hours || 0;

          // Calculate actual hours from daily usage
          const actualHours =
            dailyEquipmentUsage
              ?.filter((usage) => usage.equipment_id === equipmentId)
              ?.reduce((sum, usage) => sum + usage.hours_used, 0) || 0;

          return {
            name: req.master_equipment?.name,
            plannedHours: plannedHours,
            actualHours: actualHours,
            utilization:
              plannedHours > 0 ? (actualHours / plannedHours) * 100 : 0,
            costEfficiency:
              actualHours > 0
                ? ((req.master_equipment?.rate_per_hour || 0) * actualHours) /
                  actualHours
                : 0,
          };
        })
        ?.sort((a, b) => b.costEfficiency - a.costEfficiency)
        ?.slice(0, 5) || [];

    // Enhanced totals with both planned and actual costs
    const totals = {
      projects: projects?.length || 0,
      manpower: manpowerReqs?.length || 0,
      materials: materialReqs?.length || 0,
      equipments: equipmentReqs?.length || 0,
      dailyMaterialUsage: dailyMaterialUsage?.length || 0,
      dailyManpowerUsage: dailyManpowerUsage?.length || 0,
      dailyEquipmentUsage: dailyEquipmentUsage?.length || 0,

      // Cost Metrics - using plannedCost as the baseline
      budget: totalBudget, // Keep for reference but not used in variance
      plannedCost: totalPlannedCost, // This is now our "Total Budget" in UI
      actualCost: totalActualCost,
      costVariance: costVariance, // Now this is planned vs actual

      // Actual Cost Breakdown (from daily usage)
      actualMaterialCost: actualMaterialCost,
      actualManpowerCost: actualManpowerCost,
      actualEquipmentCost: actualEquipmentCost,

      // Planned Cost Breakdown (from requirements)
      plannedMaterialCost: plannedMaterialCost,
      plannedManpowerCost: plannedManpowerCost,
      plannedEquipmentCost: plannedEquipmentCost,

      // Performance Metrics
      earnedValue: earnedValue,
      plannedValue: plannedValue,
      CPI: CPI,
      SPI: SPI,
    };

    // Charts Data
    const progressChart = projects?.map((p) => ({
      name: p.name?.substring(0, 12) || "Unnamed",
      value: p.progress || 0,
      budget: p.budgets?.amount || 0,
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

    // UPDATED: Monthly costs now use daily usage data
    const monthlyCosts = calculateMonthlyCosts(
      dailyMaterialUsage,
      dailyManpowerUsage,
      dailyEquipmentUsage,
      range
    );

    // This shows Planned vs Actual by project
    const budgetVsActual = calculateBudgetVsActual(
      projects,
      materialReqs,
      manpowerReqs,
      equipmentReqs,
      dailyMaterialUsage,
      dailyManpowerUsage,
      dailyEquipmentUsage
    );

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
        // These compare planned vs actual costs per project
        overBudgetProjects:
          projects?.filter((p) => {
            const projectPlannedCost = calculateProjectPlannedCost(
              p.id,
              materialReqs,
              manpowerReqs,
              equipmentReqs
            );
            const projectActualCost = calculateProjectActualCost(
              p.id,
              dailyMaterialUsage,
              dailyManpowerUsage,
              dailyEquipmentUsage
            );
            return projectActualCost > projectPlannedCost;
          })?.length || 0,
        underBudgetProjects:
          projects?.filter((p) => {
            const projectPlannedCost = calculateProjectPlannedCost(
              p.id,
              materialReqs,
              manpowerReqs,
              equipmentReqs
            );
            const projectActualCost = calculateProjectActualCost(
              p.id,
              dailyMaterialUsage,
              dailyManpowerUsage,
              dailyEquipmentUsage
            );
            return projectActualCost <= projectPlannedCost;
          })?.length || 0,
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

// UPDATED: Helper functions to use daily usage data
function calculateMonthlyCosts(
  dailyMaterialUsage,
  dailyManpowerUsage,
  dailyEquipmentUsage,
  range
) {
  const materials = {};
  const manpower = {};
  const equipment = {};

  // Process material costs by month from daily usage
  dailyMaterialUsage?.forEach((usage) => {
    const date = new Date(usage.usage_date);
    const month = date.toLocaleString("default", { month: "short" });
    const cost = (usage.master_materials?.unit_cost || 0) * usage.quantity_used;
    materials[month] = (materials[month] || 0) + cost;
  });

  // Process manpower costs by month from daily usage
  dailyManpowerUsage?.forEach((usage) => {
    const date = new Date(usage.usage_date);
    const month = date.toLocaleString("default", { month: "short" });
    const cost =
      (usage.master_manpower?.rate_per_hour || 0) * usage.hours_worked;
    manpower[month] = (manpower[month] || 0) + cost;
  });

  // Process equipment costs by month from daily usage
  dailyEquipmentUsage?.forEach((usage) => {
    const date = new Date(usage.usage_date);
    const month = date.toLocaleString("default", { month: "short" });
    const cost =
      (usage.master_equipment?.rate_per_hour || 0) * usage.hours_used +
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

// Helper function for planned costs per project (UNCHANGED - uses requirements)
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
          sum + (req.master_materials?.unit_cost || 0) * req.quantity,
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

// UPDATED: Calculate budget vs actual using daily usage data
function calculateBudgetVsActual(
  projects,
  materialReqs,
  manpowerReqs,
  equipmentReqs,
  dailyMaterialUsage,
  dailyManpowerUsage,
  dailyEquipmentUsage
) {
  return (
    projects?.map((project) => {
      const projectPlannedCost = calculateProjectPlannedCost(
        project.id,
        materialReqs,
        manpowerReqs,
        equipmentReqs
      );
      const projectActualCost = calculateProjectActualCost(
        project.id,
        dailyMaterialUsage,
        dailyManpowerUsage,
        dailyEquipmentUsage
      );

      return {
        name: project.name?.substring(0, 10) || "Project",
        planned: projectPlannedCost,
        actual: projectActualCost,
        progress: project.progress || 0,
      };
    }) || []
  );
}

// UPDATED: Calculate actual costs from daily usage tables
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
          sum + (usage.master_materials?.unit_cost || 0) * usage.quantity_used,
        0
      ) || 0;

  const manpowerCost =
    dailyManpowerUsage
      ?.filter((usage) => usage.project_id === projectId)
      ?.reduce(
        (sum, usage) =>
          sum +
          (usage.master_manpower?.rate_per_hour || 0) * usage.hours_worked,
        0
      ) || 0;

  const equipmentCost =
    dailyEquipmentUsage
      ?.filter((usage) => usage.project_id === projectId)
      ?.reduce(
        (sum, usage) =>
          sum +
          (usage.master_equipment?.rate_per_hour || 0) * usage.hours_used +
          (usage.master_equipment?.maintenance_rate || 0),
        0
      ) || 0;

  return materialCost + manpowerCost + equipmentCost;
}
