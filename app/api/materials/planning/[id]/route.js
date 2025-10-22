import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();

    const { data: material, error } = await supabase
      .from("material_requirements")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(material);
  } catch (error) {
    console.error("Error updating material:", error);
    return NextResponse.json(
      { error: "Failed to update material" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from("material_requirements")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ message: "Material deleted successfully" });
  } catch (error) {
    console.error("Error deleting material:", error);
    return NextResponse.json(
      { error: "Failed to delete material" },
      { status: 500 }
    );
  }
}
