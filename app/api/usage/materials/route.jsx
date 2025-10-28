import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    // Insert into daily_material_usage table
    const { data, error } = await supabase
      .from("daily_material_usage")
      .insert([
        {
          project_id: body.project_id,
          material_id: body.material_id,
          quantity_used: body.quantity_used,
          usage_date: body.date,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");
    const date = searchParams.get("date");

    let query = supabase.from("daily_material_usage").select(`
        *,
        master_materials(name, unit_cost)
      `);

    if (projectId) query = query.eq("project_id", projectId);
    if (date) query = query.eq("usage_date", date);

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
