// app/api/materials/material-requests/[id]/route.js
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { canceled_by } = body;

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
        { success: false, error: "Only pending requests can be deleted" },
        { status: 400 }
      );
    }

    // Update the request
    const { data: canceledRequest, error: cancelError } = await supabase
      .from("material_requests")
      .update({
        status: "canceled",
        canceled_by,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (cancelError) throw cancelError;

    return NextResponse.json({
      success: true,
      data: canceledRequest,
    });
  } catch (error) {
    console.error("Error cancelling material request:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
