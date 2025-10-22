// app/api/materials/procurement/orders/[id]/route.js
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data, error } = await supabase
      .from("inventory")
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating procurement order:", error);
    return NextResponse.json(
      { error: "Failed to update procurement order" },
      { status: 500 }
    );
  }
}
