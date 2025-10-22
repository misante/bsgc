// app/api/tasks/batch-update/route.js

import { supabase } from "@/lib/supabase";

export async function POST(req) {
  const body = await req.json();
  const { updates } = body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return Response.json({ error: "Invalid updates array" }, { status: 400 });
  }

  const affectedPhases = new Set();
  const affectedProjects = new Set();

  // Step 1: Update all tasks and collect affected phases
  for (const patch of updates) {
    const { id, progress } = patch;
    if (!id || typeof progress !== "number") {
      continue; // Skip invalid patches
    }

    const numProgress = Number(progress);
    const status =
      numProgress === 100
        ? "Completed"
        : numProgress > 0
        ? "In Progress"
        : "Pending";

    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update({
        progress: numProgress,
        status,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select("id, phase_id")
      .single();

    if (updateError) {
      console.error(updateError);
      // Continue or rollback? For now, continue but log
    } else if (updatedTask?.phase_id) {
      affectedPhases.add(updatedTask.phase_id);
    }
  }

  // Step 2: Recalculate affected phases and collect affected projects
  for (const phaseId of affectedPhases) {
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("weight, progress")
      .eq("phase_id", phaseId);

    if (tasksError) {
      console.error(tasksError);
      continue;
    }

    const phaseProgress = tasks.reduce(
      (sum, t) => sum + (t.progress * t.weight) / 100,
      0
    );
    const phaseStatus =
      phaseProgress === 100
        ? "Completed"
        : phaseProgress > 0
        ? "In Progress"
        : "Pending";

    const { error: phaseError } = await supabase
      .from("phases")
      .update({ progress: phaseProgress, status: phaseStatus })
      .eq("id", phaseId);

    if (phaseError) {
      console.error(phaseError);
    } else {
      // Get project_id for this phase
      const { data: phase, error: phaseFetchError } = await supabase
        .from("phases")
        .select("project_id")
        .eq("id", phaseId)
        .single();

      if (!phaseFetchError && phase?.project_id) {
        affectedProjects.add(phase.project_id);
      }
    }
  }

  // Step 3: Recalculate affected projects
  for (const projectId of affectedProjects) {
    const { data: phases, error: phasesError } = await supabase
      .from("phases")
      .select("weight, progress")
      .eq("project_id", projectId);

    if (phasesError) {
      console.error(phasesError);
      continue;
    }

    const projectProgress = phases.reduce(
      (sum, p) => sum + (p.progress * p.weight) / 100,
      0
    );
    const projectStatus =
      projectProgress === 100
        ? "Completed"
        : projectProgress > 0
        ? "In Progress"
        : "Pending";

    const { error: projectError } = await supabase
      .from("projects")
      .update({ progress: projectProgress, status: projectStatus })
      .eq("id", projectId);

    if (projectError) {
      console.error(projectError);
    }
  }

  return Response.json({
    success: true,
    message: "Batch update completed",
  });
}
