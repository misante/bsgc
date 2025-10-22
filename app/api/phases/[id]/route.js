// /app/api/phases/[id]/route.js
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const phaseId = params.id;

  try {
    const body = await req.json();
    const { status, progress } = body;

    // 1️⃣ Update phase
    const { data: updatedPhase, error: phaseError } = await supabase
      .from("phases")
      .update({ status, progress })
      .eq("id", phaseId)
      .select("*")
      .single();

    if (phaseError) {
      console.error("Phase update error:", phaseError);
      return NextResponse.json({ error: phaseError.message }, { status: 500 });
    }

    // 2️⃣ Recalculate project progress based on all its phases
    const { data: allPhases, error: phasesFetchError } = await supabase
      .from("phases")
      .select("id, progress")
      .eq("project_id", updatedPhase.project_id);

    if (phasesFetchError) {
      console.error("Error fetching phases for project:", phasesFetchError);
      return NextResponse.json(
        { error: phasesFetchError.message },
        { status: 500 }
      );
    }

    const totalProgress =
      allPhases.reduce((sum, p) => sum + (p.progress || 0), 0) /
      allPhases.length;

    // Determine project status based on progress
    let projectStatus = "Planning";
    if (totalProgress === 100) projectStatus = "Completed";
    else if (totalProgress > 0) projectStatus = "In Progress";

    // 3️⃣ Update the project
    const { data: updatedProject, error: projectError } = await supabase
      .from("projects")
      .update({ progress: totalProgress, status: projectStatus })
      .eq("id", updatedPhase.project_id)
      .select("*")
      .single();

    if (projectError) {
      console.error("Project update error:", projectError);
      return NextResponse.json(
        { error: projectError.message },
        { status: 500 }
      );
    }

    // 4️⃣ Return updated objects
    return NextResponse.json({
      updatedPhase,
      updatedProject,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
