// app/api/reports/route.js
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "last_30_days";

  try {
    // Get all required data
    const [
      { data: projects },
      { data: manpower },
      { data: materials },
      { data: equipments },
    ] = await Promise.all([
      supabase.from("projects").select("*"),
      supabase.from("manpower").select("*"),
      supabase.from("material_requests").select("*"),
      supabase.from("equipment").select("*"),
    ]);

    // Compute totals
    const totals = {
      projects: projects?.length || 0,
      manpower: manpower?.length || 0,
      materials: materials?.length || 0,
      equipments: equipments?.length || 0,
    };

    // Example: progress per project
    const progressChart = projects?.map((p) => ({
      name: p.name || "Unnamed",
      value: p.progress || Math.floor(Math.random() * 100),
    }));

    // Example: material requests trend
    const materialsByMonth = materials?.reduce((acc, item) => {
      const date = new Date(item.created_at);
      const month = date.toLocaleString("default", { month: "short" });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const materialsChart = Object.entries(materialsByMonth || {}).map(
      ([month, value]) => ({ name: month, value })
    );

    return NextResponse.json({
      success: true,
      totals,
      charts: {
        progress: progressChart || [],
        materials: materialsChart || [],
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
