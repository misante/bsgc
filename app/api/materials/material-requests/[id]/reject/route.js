// app/api/material-requests/[id]/reject/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request, { params }) {
  const { id } = await params;

  const { rejected_by, rejection_reason } = await request.json();
  try {
    if (!rejected_by) {
      return NextResponse.json(
        { error: "Rejector name is required" },
        { status: 400 }
      );
    }

    const { data: request, error: requestError } = await supabase
      .from("material_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (requestError || !request) {
      return NextResponse.json(
        { error: "Material request not found" },
        { status: 404 }
      );
    }

    if (request.status !== "pending") {
      return NextResponse.json(
        { error: `Request is already ${request.status}` },
        { status: 400 }
      );
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from("material_requests")
      .update({
        status: "rejected",
        approved_by: rejected_by, // Using approved_by field for rejector
        rejected_at: new Date().toISOString(),
        request_reason: rejection_reason
          ? `${request.request_reason || ""} [REJECTED: ${rejection_reason}]`
          : request.request_reason,
      })
      .eq("id", id)
      .select(
        `
        *,
        master_materials (
          name,
          unit
        )
      `
      )
      .single();

    if (updateError) {
      console.error("Error rejecting material request:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: "Material request rejected successfully",
    });
  } catch (error) {
    console.error("Error in reject material request API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
