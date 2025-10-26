import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET - Check if user exists in manpower table OR get all manpower
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const auth_id = searchParams.get("auth_id");

    // If auth_id is provided, check for specific user
    if (auth_id) {
      if (!auth_id) {
        return NextResponse.json(
          { error: "User ID is required" },
          { status: 400 }
        );
      }

      // Check if user exists in manpower table
      const { data: manpower, error } = await supabase
        .from("manpower")
        .select("*")
        .eq("auth_id", auth_id)
        .eq("status", "active")
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No user found - this is expected for new registrations
          return NextResponse.json({
            exists: false,
            manpower: null,
          });
        }
        throw error;
      }

      return NextResponse.json({
        exists: true,
        manpower,
      });
    }
    // If no auth_id, return all manpower records
    else {
      // Get all active manpower records
      const { data: manpower, error } = await supabase
        .from("manpower")
        .select("*")
        .eq("status", "active")
        .order("first_name", { ascending: true });

      if (error) {
        console.error("Supabase error fetching all manpower:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json(manpower || []);
    }
  } catch (error) {
    console.error("Error in manpower API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new manpower record
export async function POST(request) {
  try {
    const { manpowerData } = await request.json();

    if (!manpowerData) {
      return NextResponse.json(
        { error: "Manpower data is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("manpower")
      .insert([manpowerData])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update manpower record
export async function PUT(request) {
  try {
    const { id, updates } = await request.json();

    if (!id || !updates) {
      return NextResponse.json(
        { error: "ID and updates are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("manpower")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// OPTIONS - For CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
