import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all material requirements from Supabase with master material data
    const { data: requirements, error } = await supabase
      .from("material-requirements")
      .select(
        `
        *,
        master-material:master_material_id (
          id,
          name,
          category,
          unit,
          supplier,
          unit_cost
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Transform the data to match your frontend structure
    const transformedRequirements = requirements.map((requirement) => ({
      ...requirement,
      master_materials: requirement["master-material"],
    }));
    return NextResponse.json({
      success: true,
      requirements: transformedRequirements || [],
      count: transformedRequirements?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching material requirements:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch material requirements",
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
    const requiredFields = [
      "master_material_id",
      "required_date",
      "project_id",
      "project_phase",
      "quantity",
      "unit_cost",
      "material_name",
      "status",
    ];
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

    // Calculate total cost
    const quantity = parseFloat(body.quantity) || 0;
    const unitCost = parseFloat(body.unit_cost) || 0;
    const totalCost = quantity * unitCost;

    // Prepare data for Supabase
    const requirementData = {
      master_material_id: parseInt(body.master_material_id),
      material_name: body.material_name,
      required_date: body.required_date,
      project_id: body.project_id,
      project_phase: body.project_phase,
      quantity: quantity,
      supplier: body.supplier,
      unit_cost: unitCost,
      total_cost: totalCost,
      status: "planned",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Insert into Supabase
    const { data: newRequirement, error } = await supabase
      .from("material-requirements")
      .insert([requirementData])
      .select(
        `
        *,
        master-material:master_material_id (
          id,
          name,
          category,
          unit,
          supplier,
          unit_cost
        )
      `
      )
      .single();

    if (error) {
      throw error;
    }

    // Transform the response
    const transformedRequirement = {
      ...newRequirement,
      master_materials: newRequirement["master-material"],
    };

    return NextResponse.json(
      {
        success: true,
        requirement: transformedRequirement,
        message: "Material requirement created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating material requirement:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create material requirement",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
