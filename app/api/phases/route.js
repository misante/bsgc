// /app/api/phases/route.js
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Missing projectId parameter" },
        { status: 400 }
      );
    }

    // Fetch phases for the project
    const { data: phases, error } = await supabase
      .from("phases")
      .select("*")
      .eq("project_id", projectId);
    //   .order("order_index", { ascending: true }); // optional: order by phase

    if (error) {
      console.error("Supabase error fetching phases:", error);
      return NextResponse.json(
        { error: "Failed to fetch phases" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: phases });
  } catch (err) {
    console.error("GET /api/phases error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
