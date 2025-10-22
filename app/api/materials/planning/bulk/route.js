import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { materials } = await request.json();

    const { data, error } = await supabase.from("material_requirements").upsert(
      materials.map((material) => ({
        ...material,
        updated_at: new Date().toISOString(),
      }))
    );

    if (error) throw error;

    return NextResponse.json({
      message: "Materials saved successfully",
      count: materials.length,
    });
  } catch (error) {
    console.error("Error bulk saving materials:", error);
    return NextResponse.json(
      { error: "Failed to save materials" },
      { status: 500 }
    );
  }
}
