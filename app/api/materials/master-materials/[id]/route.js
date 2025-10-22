import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Fetch specific master material from Supabase
    const { data: material, error } = await supabase
      .from("master_materials")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Master material not found",
          },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      material: material,
    });
  } catch (error) {
    console.error("Error fetching master material:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch master material",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if material exists
    const { data: existingMaterial, error: fetchError } = await supabase
      .from("master_materials")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Master material not found",
          },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Prepare update data
    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Ensure numeric fields are properly converted
    if (body.unit_cost !== undefined)
      updateData.unit_cost = parseFloat(body.unit_cost) || 0;
    if (body.current_stock !== undefined)
      updateData.current_stock = parseFloat(body.current_stock) || 0;
    if (body.min_stock_level !== undefined)
      updateData.min_stock_level = parseFloat(body.min_stock_level) || 0;

    // Update material in Supabase
    const { data: updatedMaterial, error } = await supabase
      .from("master_materialss")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      material: updatedMaterial,
      message: "Master material updated successfully",
    });
  } catch (error) {
    console.error("Error updating master material:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update master material",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Check if material exists
    const { data: existingMaterial, error: fetchError } = await supabase
      .from("master_materials")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Master material not found",
          },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Delete material from Supabase
    const { error } = await supabase
      .from("master_materials")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Master material deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting master material:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete master material",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
