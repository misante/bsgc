import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { updateProjectProgress } from "@/utils/projects/updateProgress";

// 🟢 GET all tasks
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🟢 POST new custom task
export async function POST(request) {
  try {
    const body = await request.json();

    const { data: insertedTask, error } = await supabase
      .from("tasks")
      .insert([
        {
          task_name: body.task_name,
          description: body.description || null,
          project_id: parseInt(body.project_id),
          assigned_to: parseInt(body.assigned_to),
          priority: body.priority,
          start_date: body.start_date,
          end_date: body.end_date,
          status: body.status || "Pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update project progress
    if (insertedTask.project_id) {
      await updateProjectProgress(insertedTask.project_id);
    }

    return NextResponse.json({ success: true, data: insertedTask });
  } catch (error) {
    console.error("Error adding task:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🟢 PUT (update task)
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();

    if (!id)
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });

    const { data: updatedTask, error } = await supabase
      .from("tasks")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (updatedTask.project_id) {
      await updateProjectProgress(updatedTask.project_id);
    }

    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🟢 DELETE task
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });

    const { data: task, error: fetchError } = await supabase
      .from("tasks")
      .select("project_id")
      .eq("id", id)
      .single();
    if (fetchError) throw fetchError;

    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);
    if (deleteError) throw deleteError;

    if (task?.project_id) {
      await updateProjectProgress(task.project_id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
