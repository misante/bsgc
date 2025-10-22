import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // Await params before using
    const { id } = await params;

    // Fetch specific material requirement from Supabase with master material data
    const { data: requirement, error } = await supabase
      .from("material-requirements")
      .select(
        `
        *,
        master-material:master_material_id (
          id,
          name,
          category,
          unit,
          min_stock_level,
          supplier,
          unit_cost
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Material requirement not found",
          },
          { status: 404 }
        );
      }
      throw error;
    }

    // Transform the data to match your frontend structure
    const transformedRequirement = {
      ...requirement,
      master_materials: requirement["master-material"],
    };

    return NextResponse.json({
      success: true,
      requirement: transformedRequirement,
    });
  } catch (error) {
    console.error("Error fetching material requirement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch material requirement",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    // Await params before using
    const { id } = await params;
    const body = await request.json();

    // Check if requirement exists
    const { data: existingRequirement, error: fetchError } = await supabase
      .from("material-requirements")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Material requirement not found",
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

    // Recalculate total cost if quantity or unit_cost changed
    if (body.quantity !== undefined || body.unit_cost !== undefined) {
      const quantity =
        body.quantity !== undefined
          ? parseFloat(body.quantity)
          : existingRequirement.quantity;
      const unitCost =
        body.unit_cost !== undefined
          ? parseFloat(body.unit_cost)
          : existingRequirement.unit_cost;
      updateData.total_cost = quantity * unitCost;
    }

    // Ensure numeric fields are properly converted
    if (body.quantity !== undefined)
      updateData.quantity = parseFloat(body.quantity) || 0;
    if (body.unit_cost !== undefined)
      updateData.unit_cost = parseFloat(body.unit_cost) || 0;
    if (body.total_cost !== undefined)
      updateData.total_cost = parseFloat(body.total_cost) || 0;

    // Update requirement in Supabase
    const { data: updatedRequirement, error } = await supabase
      .from("material-requirements")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        master-material:master_material_id (
          id,
          name,
          category,
          unit,
          min_stock_level,
          supplier,
          unit_cost
        )
      `
      )
      .single();

    if (error) {
      throw error;
    }

    // Transform the response
    const transformedRequirement = {
      ...updatedRequirement,
      master_materials: updatedRequirement["master-material"],
    };

    return NextResponse.json({
      success: true,
      requirement: transformedRequirement,
      message: "Material requirement updated successfully",
    });
  } catch (error) {
    console.error("Error updating material requirement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update material requirement",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Await params before using
    const { id } = await params;

    // Check if requirement exists
    const { data: existingRequirement, error: fetchError } = await supabase
      .from("material-requirements")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          {
            success: false,
            error: "Material requirement not found",
          },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Delete requirement from Supabase
    const { error } = await supabase
      .from("material-requirements")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Material requirement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting material requirement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete material requirement",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
