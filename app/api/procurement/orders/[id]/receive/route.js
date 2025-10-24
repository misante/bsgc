// app/api/materials/procurement/orders/[id]/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data: orderData, error: orderDataError } = await supabase
      .from("procurement_orders")
      .select(
        `
          *,
          master_materials (
          id,
            name,
            unit,category
          ),
          suppliers (
            name,
            email,
            phone,
            address
          )
        `
      )
      .eq("id", id)
      .single();

    if (orderDataError) {
      console.error("Error updating order status:", orderDataError);
      return NextResponse.json(
        { error: orderDataError.message },
        { status: 400 }
      );
    }
    const updateInventoryData = {
      ...body,
      material_id: orderData.master_materials.id,
    };
    const { data, error } = await supabase
      .from("inventory")
      .insert([updateInventoryData])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating procurement order:", error);
    return NextResponse.json(
      { error: "Failed to update procurement order" },
      { status: 500 }
    );
  }
}
