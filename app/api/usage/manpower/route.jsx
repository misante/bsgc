import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("daily_manpower_usage")
      .insert([
        {
          project_id: body.project_id,
          manpower_id: body.manpower_id,
          hours_worked: body.hours_worked,
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

    let query = supabase.from("daily_manpower_usage").select(`
        *,
        master_manpower(role, rate_per_hour)
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
