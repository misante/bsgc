import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// export async function PUT(request, { params }) {
//   const { id } = await params;
//   try {
//     const body = await request.json();

//     const { data, error } = await supabase
//       .from("tasks")
//       .update({ ...body, updated_at: new Date().toISOString() })
//       .eq("id", id);

//     if (error) {
//       console.log("update error:", error);
//       return NextResponse.json({ error }, { status: 400 });
//     }
//     return NextResponse.json({ data });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    const { data, error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      console.log("delete error:", error);
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = await params; // task id
  const body = await req.json();

  const progress = body.progress ? Number(body.progress) : null;
  const weight = body.weight ? Number(body.weight) : null;
  // Destructure fields you expect to update
  const { task_name, description, start_date, end_date, status } = body;

  // 🧩 Step 1. Update the task itself
  const { data: updatedTask, error: updateError } = await supabase
    .from("tasks")
    .update({
      task_name,
      description,
      progress,
      start_date,
      end_date,
      // Automatically set status based on progress if progress is provided
      status:
        typeof progress === "number" && !isNaN(progress)
          ? progress === 100
            ? "Completed"
            : progress > 0
            ? "In Progress"
            : "Pending"
          : status,
      updated_at: new Date(),
    })
    .eq("id", id)
    .select("id, phase_id, weight, progress")
    .single();

  if (updateError) {
    console.error(updateError);
    return Response.json({ error: updateError.message }, { status: 400 });
  }
  console.log("updatedTask", updatedTask);
  console.log("type-of-progress?", typeof progress);
  // 🧩 Step 2. Recalculate Phase Progress
  if (updatedTask?.phase_id) {
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("weight, progress")
      .eq("phase_id", updatedTask.phase_id);

    if (tasksError) {
      console.error(tasksError);
      return Response.json({ error: tasksError.message }, { status: 400 });
    }
    const phaseProgress = tasks.reduce(
      (sum, t) => sum + (t.progress * t.weight) / 100,
      0
    );
    console.log("phase-progress:", phaseProgress);
    const phaseStatus =
      phaseProgress === 100
        ? "Completed"
        : phaseProgress > 0
        ? "In Progress"
        : "Pending";

    const { error: phaseError } = await supabase
      .from("phases")
      .update({ progress: phaseProgress, status: phaseStatus })
      .eq("id", updatedTask.phase_id);

    if (phaseError) {
      console.error(phaseError);
      return Response.json({ error: phaseError.message }, { status: 400 });
    }

    // 🧩 Step 3. Recalculate Project Progress
    const { data: phase } = await supabase
      .from("phases")
      .select("project_id")
      .eq("id", updatedTask.phase_id)
      .single();

    if (phase?.project_id) {
      const { data: phases, error: phasesError } = await supabase
        .from("phases")
        .select("weight, progress")
        .eq("project_id", phase.project_id);
      if (phasesError) {
        console.error(phasesError);
        return Response.json({ error: phasesError.message }, { status: 400 });
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
        .eq("id", phase.project_id);

      if (projectError) {
        console.error(projectError);
        return Response.json({ error: projectError.message }, { status: 400 });
      }
    }

    return Response.json({
      success: true,
      message: "Task and related progress updated successfully",
    });
  }

  return Response.json({
    success: true,
    message: "Task updated (no phase association)",
  });
}
// export async function DELETE(request, { params }) {
//   const { id } = await params;
//   try {
//     const { data, error } = await supabase.from("tasks").delete().eq("id", id);
//     if (error) {
//       console.log("delete error:", error);
//       return NextResponse.json({ error }, { status: 400 });
//     }
//     return NextResponse.json({ data });
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
