// app/api/inventory/receipt-history/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const master_material_id = searchParams.get("master_material_id");

    if (!master_material_id) {
      return NextResponse.json(
        { error: "master_material_id is required" },
        { status: 400 }
      );
    }

    const { data: receiptHistory, error } = await supabase
      .from("inventory")
      .select(
        `
        *,
        procurement_orders (
          id,
          supplier_name
        )
      `
      )
      .eq("master_material_id", master_material_id)
      .order("received_date", { ascending: false });

    if (error) {
      console.error("Error fetching receipt history:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: receiptHistory,
    });
  } catch (error) {
    console.error("Error in receipt-history API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
