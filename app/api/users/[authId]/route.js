import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { authId } = await params;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", authId)
      .single();

    if (error) {
      console.error("❌ Supabase lookup error:", error);

      // Check if it's a "not found" error or something else
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "User not found in Supabase" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Server error in user API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
