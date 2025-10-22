import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const { updateData } = body;
  try {
    const { data, error } = await supabase
      .from("manpower")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
