import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { status, ...updates } = await request.json();

    // If status is being updated to "Approved", update material quantity
    if (status === "Approved") {
      const { data: order } = await supabase
        .from("procurement_orders")
        .select("material_id, quantity")
        .eq("id", id)
        .single();

      if (order) {
        // Get current material quantity and min_stock_level
        const { data: material } = await supabase
          .from("materials")
          .select("quantity, min_stock_level")
          .eq("id", order.material_id)
          .single();

        if (material) {
          const newQuantity =
            parseFloat(material.quantity) + parseFloat(order.quantity);

          // Update material quantity
          await supabase
            .from("materials")
            .update({
              quantity: newQuantity,
              status: calculateStockStatus(
                newQuantity,
                material.min_stock_level
              ),
            })
            .eq("id", order.material_id);

          // Create inventory transaction
          await supabase.from("inventory_transactions").insert([
            {
              material_id: order.material_id,
              type: "IN",
              quantity: parseFloat(order.quantity),
              previous_stock: parseFloat(material.quantity),
              new_stock: newQuantity,
              reference_type: "PROCUREMENT",
              reference_id: id,
              notes: "Procurement order delivery",
            },
          ]);
        }
      }
    }

    const updateData = { ...updates };
    if (status) {
      updateData.status = status;
      updateData.approved_at =
        status === "Approved" ? new Date().toISOString() : null;
    }

    const { data: order, error } = await supabase
      .from("procurement_orders")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        materials (name, unit)
      `
      )
      .single();

    if (error) throw error;

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating procurement order:", error);
    return NextResponse.json(
      { error: "Failed to update procurement order" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from("procurement_orders")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({
      message: "Procurement order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting procurement order:", error);
    return NextResponse.json(
      { error: "Failed to delete procurement order" },
      { status: 500 }
    );
  }
}

function calculateStockStatus(quantity, minStock) {
  const qty = parseFloat(quantity);
  const min = parseFloat(minStock) || 0;

  if (qty === 0) return "Out of Stock";
  if (qty <= min) return "Low Stock";
  if (qty <= min * 1.5) return "On Order";
  return "In Stock";
}
