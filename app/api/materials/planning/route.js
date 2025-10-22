import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: materials, error } = await supabase
      .from("material_requirements")
      .select("*")
      .order("required_date", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ materials: materials || [] });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const materialData = await request.json();
    const { data: material, error } = await supabase
      .from("material_requirements")
      .insert([materialData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { error: "Failed to create material" },
      { status: 500 }
    );
  }
}
