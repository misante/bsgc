import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// ======================== GET ========================
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("project_id");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  try {
    let query = supabase
      .from("daily_costs")
      .select("*")
      .order("date", { ascending: false });

    if (projectId) query = query.eq("project_id", projectId);
    if (startDate && endDate)
      query = query.gte("date", startDate).lte("date", endDate);

    const { data, error } = await query;
    if (error) throw error;

    // Compute aggregated cost per category
    const totals = data.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + item.total_cost;
        acc.total += item.total_cost;
        return acc;
      },
      { total: 0, manpower: 0, material: 0, equipment: 0 }
    );

    return NextResponse.json({ success: true, data, totals });
  } catch (error) {
    console.error("Error fetching daily costs:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch daily costs" },
      { status: 500 }
    );
  }
}

// ======================== POST ========================
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      project_id,
      date,
      type,
      item_id,
      item_name,
      unit,
      quantity_used,
      rate,
      remarks,
    } = body;

    const { data, error } = await supabase.from("daily_costs").insert([
      {
        project_id,
        date,
        type,
        item_id,
        item_name,
        unit,
        quantity_used,
        rate,
        remarks,
      },
    ]);

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error recording daily cost:", error);
    return NextResponse.json(
      { success: false, message: "Failed to record daily cost" },
      { status: 500 }
    );
  }
}

// ======================== DELETE ========================
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    const { error } = await supabase.from("daily_costs").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting daily cost:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete daily cost" },
      { status: 500 }
    );
  }
}
