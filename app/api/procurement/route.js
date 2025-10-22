import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    let query = supabase.from("procurement_orders").select(
      `
        *,
        master_materials (name, unit, category)
      `,
      { count: "exact" }
    );

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const {
      data: orders,
      error,
      count,
    } = await query.range(from, to).order("created_at", { ascending: false });

    if (error) throw error;

    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      orders: orders || [],
      totalPages,
      currentPage: page,
      totalCount: count,
    });
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
    const {
      material_id,
      quantity,
      supplier_name,
      expected_delivery,
      project_phase,
      priority,
      notes,
    } = await request.json();

    // Get material details for cost calculation
    const { data: material, error: materialError } = await supabase
      .from("materials")
      .select("cost_per_unit")
      .eq("id", material_id)
      .single();

    if (materialError) throw materialError;

    const unit_cost = material.cost_per_unit;
    const total_cost = unit_cost ? unit_cost * parseFloat(quantity) : null;

    const { data: order, error } = await supabase
      .from("procurement_orders")
      .insert([
        {
          material_id,
          quantity: parseFloat(quantity),
          supplier_name,
          unit_cost,
          total_cost,
          expected_delivery,
          project_phase,
          priority: priority || "Medium",
          notes,
          status: "Pending",
        },
      ])
      .select(
        `
        *,
        materials (name, unit)
      `
      )
      .single();

    if (error) throw error;

    // Update material status to "On Order"
    await supabase
      .from("materials")
      .update({ status: "On Order" })
      .eq("id", material_id);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating procurement order:", error);
    return NextResponse.json(
      { error: "Failed to create procurement order" },
      { status: 500 }
    );
  }
}
