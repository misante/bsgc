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

    // Recalculate budget for each project
    for (const project of projects) {
      // Calculate planned costs using the same logic as in reports
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

      // Calculate total planned cost
      const materialCost =
        materialReqs?.reduce(
          (sum, req) =>
            sum + (req.master_materials?.unit_cost || 0) * (req.quantity || 0),
          0
        ) || 0;

      const manpowerCost =
        manpowerReqs?.reduce(
          (sum, req) =>
            sum +
            (req.master_manpower?.rate_per_hour || 0) *
              (req.planned_hours || 0),
          0
        ) || 0;

      const equipmentCost =
        equipmentReqs?.reduce(
          (sum, req) =>
            sum +
            (req.master_equipment?.rate_per_hour || 0) *
              (req.planned_hours || 0) +
            (req.master_equipment?.maintenance_rate || 0),
          0
        ) || 0;
      const indirectCost =
        indirectCostReqs?.reduce((sum, req) => {
          const rate = req.master_indirect_costs?.rate_per_unit || 0;
          const quantity = req.planned_quantity || 0;
          return sum + rate * quantity;
        }, 0) || 0;

      const totalPlannedCost =
        materialCost + manpowerCost + equipmentCost + indirectCost;

      // Update project budget
      const { error: updateError } = await supabase
        .from("projects")
        .update({ budget: totalPlannedCost })
        .eq("id", project.id);

      if (updateError) {
        console.error(`Error updating project ${project.id}:`, updateError);
      } else {
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated budgets for ${updatedCount} projects`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error recalculating budgets:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
