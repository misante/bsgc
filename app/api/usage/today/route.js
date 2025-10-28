import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0];

    const [
      { data: materialUsage },
      { data: manpowerUsage },
      { data: equipmentUsage },
    ] = await Promise.all([
      supabase
        .from("daily_material_usage")
        .select("*, master_materials(*)")
        .eq("usage_date", date)
        .eq("project_id", projectId),
      supabase
        .from("daily_manpower_usage")
        .select("*, master_manpower(*)")
        .eq("usage_date", date)
        .eq("project_id", projectId),
      supabase
        .from("daily_equipment_usage")
        .select("*, master_equipment(*)")
        .eq("usage_date", date)
        .eq("project_id", projectId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        materials: materialUsage || [],
        manpower: manpowerUsage || [],
        equipment: equipmentUsage || [],
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
