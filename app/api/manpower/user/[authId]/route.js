import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { authId } = await params;

    const { data, error } = await supabase
      .from("manpower")
      .select("*")
      .eq("auth_id", authId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "User not found in manpower table" },
          { status: 404 }
        );
      }

      console.error("❌ Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
export async function PUT(request, { params }) {
  const { authId } = await params;
  const body = await request.json();
  const { updateData } = body;
  try {
    const { data, error } = await supabase
      .from("manpower")
      .update(updateData)
      .eq("auth_id", authId)
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
