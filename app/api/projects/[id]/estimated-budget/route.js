import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const projectId = params.id;

  try {
    // Get all requirements for the project
    const [
      { data: materialReqs },
      { data: manpowerReqs },
      { data: equipmentReqs },
    ] = await Promise.all([
      supabase
        .from("material-requirements")
        .select("*, master_materials(*)")
        .eq("project_id", projectId),
      supabase
        .from("manpower_requirements")
        .select("*, master_manpower(*)")
        .eq("project_id", projectId),
      supabase
        .from("equipment_requirements")
        .select("*, master_equipment(*)")
        .eq("project_id", projectId),
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
          (req.master_manpower?.rate_per_hour || 0) * (req.planned_hours || 0),
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

    const estimatedBudget = materialCost + manpowerCost + equipmentCost;

    return NextResponse.json({
      success: true,
      estimatedBudget,
      breakdown: {
        materialCost,
        manpowerCost,
        equipmentCost,
      },
    });
  } catch (error) {
    console.error("Error calculating estimated budget:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
