import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Get project phases with project information
    const { data: phases, error } = await supabase
      .from("phases")
      .select(
        `
        *,
        projects (name, description, status)
      `
      )
      .order("start_date", { ascending: true });

    if (error) throw error;

    // Format data for Gantt chart
    const ganttData =
      phases?.map((phase) => ({
        id: phase.id,
        name: phase.name,
        start: phase.start_date,
        end: phase.end_date,
        progress: phase.progress || 0,
        dependencies: phase.dependencies,
        project: phase.projects?.name,
      })) || [];

    return NextResponse.json(ganttData);
  } catch (error) {
    console.error("Error fetching project schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch project schedule" },
      { status: 500 }
    );
  }
}
