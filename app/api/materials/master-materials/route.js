import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all master materials from Supabase
    const { data: materials, error } = await supabase
      .from("master_materials")
      .select("*")
      .order("name");

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      materials: materials || [],
      count: materials?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching master materials:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch master materials",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["name", "category", "unit", "unit_cost"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Prepare data for Supabase
    const materialData = {
      name: body.name,
      category: body.category,
      unit: body.unit,
      min_stock_level: parseInt(body.min_stock_level) || 0,
      supplier: body.supplier || "",
      unit_cost: parseFloat(body.unit_cost) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert into Supabase
    const { data: newMaterial, error } = await supabase
      .from("master_materials")
      .insert([materialData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        material: newMaterial,
        message: "Master material created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating master material:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create master material",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
