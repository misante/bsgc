// app/api/indirect-costs/master/route.js
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

const table = "master_indirect_costs";

// 🟢 CREATE
export async function POST(request) {
  const body = await request.json();
  const { data, error } = await supabase.from(table).insert(body).select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

// 🟡 READ
export async function GET() {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("created_at", { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

// 🔵 UPDATE
export async function PATCH(request) {
  const { id, ...updates } = await request.json();
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", id)
    .select();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

// 🔴 DELETE
export async function DELETE(request) {
  const { id } = await request.json();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: "Deleted successfully" });
}
