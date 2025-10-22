// app/api/inventory/material-stock/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const offset = (page - 1) * limit;

    // Start with base query
    let query = supabase.from("material_stock").select(
      `
        *,
        master_materials (
          id,
          name,
          unit,
          category,
          min_stock_level,
          created_at
        ),
        procurement_orders!last_procurement_order_id (
          id,
          supplier_name
        )
      `,
      { count: "exact" }
    );

    // Apply search filter
    if (search) {
      query = query.or(`
        master_materials.name.ilike.%${search}%,
        master_materials.category.ilike.%${search}%,
        location.ilike.%${search}%,
        batch_number.ilike.%${search}%,
        supplier_name.ilike.%${search}%
      `);
    }

    // Apply category filter
    if (category && category !== "all") {
      query = query.eq("master_materials.category", category);
    }

    // Apply status filter
    if (status && status !== "all") {
      switch (status) {
        case "in_stock":
          query = query.gt("total_quantity", 0);
          break;
        case "low_stock":
          query = query.lte(
            "total_quantity",
            supabase.r("master_materials.min_stock_level")
          );
          query = query.gt("total_quantity", 0);
          break;
        case "out_of_stock":
          query = query.eq("total_quantity", 0);
          break;
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Order by last received date
    query = query.order("last_received_date", { ascending: false });

    const { data: stockData, error, count } = await query;

    if (error) {
      console.error("Error fetching material stock:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      data: stockData,
      totalPages,
      totalCount: count,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error in material-stock API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
