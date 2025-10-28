import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// CREATE
export async function POST(req) {
  const body = await req.json();
  try {
    const { data, error } = await supabase
      .from("master_manpower")
      .insert([body])
      .select();
    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// READ
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("master_manpower")
      .select("id, role, category, rate_per_hour")
      .order("role", { ascending: true });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// UPDATE
export async function PUT(req) {
  const { id, ...updates } = await req.json();
  try {
    const { data, error } = await supabase
      .from("master_manpower")
      .update(updates)
      .eq("id", id)
      .select();
    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    const { error } = await supabase
      .from("master_manpower")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
