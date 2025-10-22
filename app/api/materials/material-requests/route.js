// app/api/material-requests/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { material_id, requested_quantity, requested_by, request_reason } =
      await request.json();

    // Validate required fields
    if (!material_id || !requested_quantity || !requested_by) {
      return NextResponse.json(
        { error: "Material ID, quantity, and requester are required" },
        { status: 400 }
      );
    }

    // Check if material exists and has sufficient stock
    const { data: materialStock, error: stockError } = await supabase
      .from("material_stock")
      .select("total_quantity, master_materials(name, unit, min_stock_level)")
      .eq("master_material_id", material_id)
      .single();

    if (stockError || !materialStock) {
      return NextResponse.json(
        { error: "Material not found in stock" },
        { status: 404 }
      );
    }

    // Check if requested quantity is available
    if (
      parseFloat(requested_quantity) > parseFloat(materialStock.total_quantity)
    ) {
      return NextResponse.json(
        {
          error: "Insufficient stock",
          available: materialStock.total_quantity,
          requested: requested_quantity,
        },
        { status: 400 }
      );
    }

    // Create the material request
    const { data: materialRequest, error } = await supabase
      .from("material_requests")
      .insert([
        {
          material_id,
          requested_quantity,
          requested_by,
          request_reason,
          status: "pending",
        },
      ])
      .select(
        `
        *,
        master_materials (
          name,
          unit,
          category
        )
      `
      )
      .single();

    if (error) {
      console.error("Error creating material request:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: materialRequest,
      message: "Material request created successfully",
    });
  } catch (error) {
    console.error("Error in material-request API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;

    let query = supabase
      .from("material_requests")
      .select(
        `
        *,
        master_materials (
          name,
          unit,
          category,
          min_stock_level
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const {
      data: requests,
      error,
      count,
    } = await query.range((page - 1) * limit, page * limit - 1);

    if (error) {
      console.error("Error fetching material requests:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: requests,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error in material-requests GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
