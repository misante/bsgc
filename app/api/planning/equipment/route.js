import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("equipment_requirements")
      .select(
        `
        *,
        projects(name),
        master_equipment(name, type, rate_per_hour)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from("equipment_requirements")
      .insert([body])
      .select(
        `
        *,
        projects(name),
        master_equipment(name, type, rate_per_hour)
      `
      )
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

export async function PUT(request) {
  try {
    const body = await request.json();
    const { data, error } = await supabase
      .from("equipment_requirements")
      .update(body)
      .eq("id", body.id)
      .select(
        `
        *,
        projects(name),
        master_equipment(name, type, rate_per_hour)
      `
      )
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

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    const { error } = await supabase
      .from("equipment_requirements")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
