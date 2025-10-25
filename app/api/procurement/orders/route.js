// app/api/materials/procurement/orders/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: orders, error } = await supabase
      .from("procurement_orders")
      .select(
        `
        *,
        master_materials (id,name, unit, category),
        material-requirements (project_id, project_phase),
        suppliers (name, contact_person, email, phone)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ procurementOrders: orders || [] });
  } catch (error) {
    console.error("Error fetching procurement orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch procurement orders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("order body:", body);
    // const {
    //   requirement_id,
    //   master_material_id: material_id,
    //   material_name,
    //   supplier_id,
    //   supplier_name,
    //   quantity,
    //   unit_cost,
    //   total_cost,
    //   expected_delivery,
    //   project_phase,
    //   notes,
    // } = await request.json();

    // Create procurement order
    const { data: order, error } = await supabase
      .from("procurement_orders")
      .insert([
        {
          ...body,
          status: "pending",
          created_by: "Anteneh",
        },
      ])
      .select(
        `
        *,
        master_materials (id, name, unit, category,supplier),
        material-requirements (project_id, project_phase),
        suppliers (name, contact_person, email, phone)
      `
      )
      .single();

    if (error) {
      console.log("insert-error:", error);
      return NextResponse.json(error, { status: 500 });
    }
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating procurement order:", error);
    return NextResponse.json(
      { error: "Failed to create procurement order" },
      { status: 500 }
    );
  }
}
