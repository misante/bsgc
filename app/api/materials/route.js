import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    let query = supabase.from("materials").select("*", { count: "exact" });

    // Apply filters
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const {
      data: materials,
      error,
      count,
    } = await query.range(from, to).order("created_at", { ascending: false });

    if (error) throw error;

    const totalPages = Math.ceil(count / limit);

    return NextResponse.json({
      materials,
      totalPages,
      currentPage: page,
      totalCount: count,
    });
  } catch (error) {
    console.error("Error fetching materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch materials" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const {
      name,
      category,
      quantity,
      unit,
      supplier,
      location,
      cost_per_unit,
      status,
      min_stock_level,
      project_phase,
      delivery_date,
    } = await request.json();

    // Calculate status based on quantity and min_stock_level
    const calculatedStatus = calculateStockStatus(quantity, min_stock_level);

    const { data: material, error } = await supabase
      .from("materials")
      .insert([
        {
          name,
          category,
          quantity: parseFloat(quantity),
          unit,
          supplier,
          location,
          cost_per_unit: cost_per_unit ? parseFloat(cost_per_unit) : null,
          status: status || calculatedStatus,
          min_stock_level: min_stock_level ? parseFloat(min_stock_level) : 0,
          project_phase,
          delivery_date,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Create inventory transaction
    await supabase.from("inventory_transactions").insert([
      {
        material_id: material.id,
        type: "INITIAL",
        quantity: parseFloat(quantity),
        previous_stock: 0,
        new_stock: parseFloat(quantity),
        reference_type: "CREATION",
        notes: "Initial material creation",
      },
    ]);

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error("Error creating material:", error);
    return NextResponse.json(
      { error: "Failed to create material" },
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
