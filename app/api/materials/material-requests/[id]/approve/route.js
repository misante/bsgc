// app/api/material-requests/[id]/approve/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request, { params }) {
  const { id } = await params;
  const { approved_by, status } = await request.json();

  try {
    if (!approved_by) {
      return NextResponse.json(
        { error: "Approver name is required" },
        { status: 400 }
      );
    }

    // Get the material request
    const { data: materialRequest, error: requestError } = await supabase
      .from("material_requests")
      .select(
        `
        *,
        master_materials (
          name,
          unit
        )
      `
      )
      .eq("id", id)
      .single();

    if (requestError || !materialRequest) {
      console.error("Error fetching material request:", requestError);
      return NextResponse.json(
        { error: "Material request not found" },
        { status: 404 }
      );
    }

    if (materialRequest.status !== "pending") {
      return NextResponse.json(
        { error: `Request is already ${materialRequest.status}` },
        { status: 400 }
      );
    }

    // Check stock availability for information (but don't block approval)
    const { data: materialStock, error: stockError } = await supabase
      .from("material_stock")
      .select("total_quantity")
      .eq("master_material_id", materialRequest.material_id)
      .single();

    const availableStock = materialStock?.total_quantity || 0;

    // Update material request status (stock will be reduced upon delivery)
    const { data: updatedRequest, error: updateError } = await supabase
      .from("material_requests")
      .update({
        status,
        approved_by,
        approved_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        master_materials (
          name,
          unit
        )
      `
      )
      .single();

    if (updateError) {
      console.error("Error updating material request:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message:
        availableStock >= parseFloat(materialRequest.requested_quantity)
          ? "Material request approved - Ready for delivery"
          : "Material request approved - Insufficient stock available for delivery",
      stock_info: {
        available: availableStock,
        requested: materialRequest.requested_quantity,
        sufficient:
          availableStock >= parseFloat(materialRequest.requested_quantity),
      },
    });
  } catch (error) {
    console.error("Error in approve material request API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
