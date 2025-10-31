import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Get all projects
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id");

    if (projectsError) throw projectsError;

    let updatedCount = 0;

    // Recalculate financials for each project
    for (const project of projects) {
      // Calculate planned costs (for budget)
      const [
        { data: materialReqs },
        { data: manpowerReqs },
        { data: equipmentReqs },
        { data: indirectCostReqs },
      ] = await Promise.all([
        supabase
          .from("material-requirements")
          .select("*, master_materials(*)")
          .eq("project_id", project.id),
        supabase
          .from("manpower_requirements")
          .select("*, master_manpower(*)")
          .eq("project_id", project.id),
        supabase
          .from("equipment_requirements")
          .select("*, master_equipment(*)")
          .eq("project_id", project.id),
        supabase
          .from("indirect_cost_requirements")
          .select("*, master_indirect_costs(*)")
          .eq("project_id", project.id),
      ]);

      // Calculate actual costs (for actual_cost)
      const [
        { data: dailyMaterialUsage },
        { data: dailyManpowerUsage },
        { data: dailyEquipmentUsage },
        { data: dailyIndirectCostUsage },
      ] = await Promise.all([
        supabase
          .from("daily_material_usage")
          .select("*, master_materials(*)")
          .eq("project_id", project.id),
        supabase
          .from("daily_manpower_usage")
          .select("*, master_manpower(*)")
          .eq("project_id", project.id),
        supabase
          .from("daily_equipment_usage")
          .select("*, master_equipment(*)")
          .eq("project_id", project.id),
        supabase
          .from("daily_indirect_cost_usage")
          .select("*, master_indirect_costs(*)")
          .eq("project_id", project.id),
      ]);

      // Calculate total planned cost (budget)
      const materialPlannedCost =
        materialReqs?.reduce(
          (sum, req) =>
            sum + (req.master_materials?.unit_cost || 0) * (req.quantity || 0),
          0
        ) || 0;

      const manpowerPlannedCost =
        manpowerReqs?.reduce(
          (sum, req) =>
            sum +
            (req.master_manpower?.rate_per_hour || 0) *
              (req.planned_hours || 0),
          0
        ) || 0;

      const equipmentPlannedCost =
        equipmentReqs?.reduce(
          (sum, req) =>
            sum +
            (req.master_equipment?.rate_per_hour || 0) *
              (req.planned_hours || 0) +
            (req.master_equipment?.maintenance_rate || 0),
          0
        ) || 0;
      const plannedIndirectCost =
        indirectCostReqs?.reduce((sum, req) => {
          const rate = req.master_indirect_costs?.rate_per_unit || 0;
          const quantity = req.planned_quantity || 0;
          return sum + rate * quantity;
        }, 0) || 0;

      const totalPlannedCost =
        materialPlannedCost +
        manpowerPlannedCost +
        equipmentPlannedCost +
        plannedIndirectCost;

      // Calculate total actual cost
      const materialActualCost =
        dailyMaterialUsage?.reduce(
          (sum, usage) =>
            sum +
            (usage.master_materials?.unit_cost || 0) *
              (usage.quantity_used || 0),
          0
        ) || 0;

      const manpowerActualCost =
        dailyManpowerUsage?.reduce(
          (sum, usage) =>
            sum +
            (usage.master_manpower?.rate_per_hour || 0) *
              (usage.hours_worked || 0),
          0
        ) || 0;

      const equipmentActualCost =
        dailyEquipmentUsage?.reduce(
          (sum, usage) =>
            sum +
            (usage.master_equipment?.rate_per_hour || 0) *
              (usage.hours_used || 0) +
            (usage.master_equipment?.maintenance_rate || 0),
          0
        ) || 0;
      const actualIndirectCost =
        dailyIndirectCostUsage?.reduce((sum, usage) => {
          const rate = usage.master_indirect_costs?.rate_per_unit || 0;
          const quantity = usage.quantity_used || 0;
          return sum + rate * quantity;
        }, 0) || 0;

      const totalActualCost =
        materialActualCost +
        manpowerActualCost +
        equipmentActualCost +
        actualIndirectCost;

      // Update project financials
      const { error: updateError } = await supabase
        .from("projects")
        .update({
          budget: totalPlannedCost,
          actual_cost: totalActualCost,
        })
        .eq("id", project.id);

      if (updateError) {
        console.error(`Error updating project ${project.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated financials for ${updatedCount} projects`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error recalculating financials:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
