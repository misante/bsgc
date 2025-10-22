// app/api/material-requests/[id]/deliver/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request, { params }) {
  const { id } = await params;

  try {
    const { signature, delivery_notes, delivered_at } = await request.json();

    // First, get the material request details
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

    if (materialRequest.status !== "approved") {
      return NextResponse.json(
        { error: "Only approved requests can be delivered" },
        { status: 400 }
      );
    }

    // Check stock availability before delivery
    const { data: materialStock, error: stockError } = await supabase
      .from("material_stock")
      .select("total_quantity")
      .eq("master_material_id", materialRequest.material_id)
      .single();

    const availableStock = materialStock?.total_quantity || 0;

    if (
      parseFloat(materialRequest.requested_quantity) >
      parseFloat(availableStock)
    ) {
      return NextResponse.json(
        {
          error: "Insufficient stock to complete delivery",
          available: availableStock,
          requested: materialRequest.requested_quantity,
        },
        { status: 400 }
      );
    }

    // Start transaction: Update request status AND reduce stock
    const { data: updatedRequest, error: updateError } = await supabase
      .from("material_requests")
      .update({
        status: "delivered",
        signature,
        delivery_notes,
        delivered_at,
        updated_at: new Date().toISOString(),
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
      console.error("Error updating delivery confirmation:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    // Reduce stock quantity upon delivery
    const newQuantity =
      parseFloat(availableStock) -
      parseFloat(materialRequest.requested_quantity);

    const { error: stockUpdateError } = await supabase
      .from("material_stock")
      .update({
        total_quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("master_material_id", materialRequest.material_id);

    if (stockUpdateError) {
      console.error("Error updating material stock:", stockUpdateError);

      // Revert the request status if stock update fails
      await supabase
        .from("material_requests")
        .update({
          status: "approved",
          signature: null,
          delivery_notes: null,
          delivered_at: null,
        })
        .eq("id", id);

      return NextResponse.json(
        { error: "Failed to update material stock" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: "Delivery confirmed and stock updated successfully",
    });
  } catch (error) {
    console.error("Error in deliver API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
