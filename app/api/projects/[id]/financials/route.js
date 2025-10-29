import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const projectId = params.id;

  try {
    // Get project data with financial information
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (projectError) throw projectError;

    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Calculate financial metrics
    const costVariance = (project.budget || 0) - (project.actual_cost || 0);
    const variancePercentage =
      project.budget > 0 ? (costVariance / project.budget) * 100 : 0;

    // Get detailed breakdown for additional insights
    const [
      { data: materialReqs },
      { data: manpowerReqs },
      { data: equipmentReqs },
      { data: dailyMaterialUsage },
      { data: dailyManpowerUsage },
      { data: dailyEquipmentUsage },
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
      supabase
        .from("daily_material_usage")
        .select("*, master_materials(*)")
        .eq("project_id", projectId),
      supabase
        .from("daily_manpower_usage")
        .select("*, master_manpower(*)")
        .eq("project_id", projectId),
      supabase
        .from("daily_equipment_usage")
        .select("*, master_equipment(*)")
        .eq("project_id", projectId),
    ]);

    // Calculate planned cost breakdown
    const plannedBreakdown = {
      materials:
        materialReqs?.reduce(
          (sum, req) =>
            sum + (req.master_materials?.unit_cost || 0) * (req.quantity || 0),
          0
        ) || 0,
      manpower:
        manpowerReqs?.reduce(
          (sum, req) =>
            sum +
            (req.master_manpower?.rate_per_hour || 0) *
              (req.planned_hours || 0),
          0
        ) || 0,
      equipment:
        equipmentReqs?.reduce(
          (sum, req) =>
            sum +
            (req.master_equipment?.rate_per_hour || 0) *
              (req.planned_hours || 0) +
            (req.master_equipment?.maintenance_rate || 0),
          0
        ) || 0,
    };

    // Calculate actual cost breakdown
    const actualBreakdown = {
      materials:
        dailyMaterialUsage?.reduce(
          (sum, usage) =>
            sum +
            (usage.master_materials?.unit_cost || 0) *
              (usage.quantity_used || 0),
          0
        ) || 0,
      manpower:
        dailyManpowerUsage?.reduce(
          (sum, usage) =>
            sum +
            (usage.master_manpower?.rate_per_hour || 0) *
              (usage.hours_worked || 0),
          0
        ) || 0,
      equipment:
        dailyEquipmentUsage?.reduce(
          (sum, usage) =>
            sum +
            (usage.master_equipment?.rate_per_hour || 0) *
              (usage.hours_used || 0) +
            (usage.master_equipment?.maintenance_rate || 0),
          0
        ) || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        // Basic project info
        id: project.id,
        name: project.name,
        progress: project.progress || 0,

        // Financial summary
        budget: project.budget || 0,
        actualCost: project.actual_cost || 0,
        costVariance: costVariance,
        variancePercentage: variancePercentage,

        // Detailed breakdowns
        plannedBreakdown,
        actualBreakdown,

        // Usage statistics
        usageStats: {
          materialRequirements: materialReqs?.length || 0,
          manpowerRequirements: manpowerReqs?.length || 0,
          equipmentRequirements: equipmentReqs?.length || 0,
          materialUsageEntries: dailyMaterialUsage?.length || 0,
          manpowerUsageEntries: dailyManpowerUsage?.length || 0,
          equipmentUsageEntries: dailyEquipmentUsage?.length || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching project financials:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
