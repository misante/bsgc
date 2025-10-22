import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 🟢 GET all common task templates
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("task_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching task templates:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 🟢 POST new common task template
export async function POST(request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("task_templates")
      .insert([
        {
          task_name: body.task_name,
          description: body.description || null,
          priority: body.priority,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error adding task template:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
