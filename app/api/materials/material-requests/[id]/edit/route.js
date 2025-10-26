// app/api/materials/material-requests/[id]/route.js
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { material_id, requested_quantity, project_id, request_reason } =
      body;

    // Check if request exists and is pending
    const { data: existingRequest, error: fetchError } = await supabase
      .from("material_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    if (existingRequest.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Only pending requests can be edited" },
        { status: 400 }
      );
    }

    // Update the request
    const { data: updatedRequest, error: updateError } = await supabase
      .from("material_requests")
      .update({
        material_id,
        requested_quantity,
        project_id,
        request_reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating material request:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
