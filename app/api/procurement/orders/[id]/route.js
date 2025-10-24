import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { EmailService } from "@/lib/emailService";

export async function POST(request, { params }) {
  const { id } = await params;
  const updates = await request.json();

  try {
    // 1. Update the order status to 'approved'
    const { data: updatedOrder, error: updateError } = await supabase
      .from("procurement_orders")
      .update({
        ...updates,
        approved_by: "Besu",
        approved_at: new Date().toDateString(),
      })
      .eq("id", id)
      .select(
        `
        *,
        master_materials (
          name,
          unit,category
        ),
        suppliers (
          name,
          email,
          phone,
          address
        )
      `
      )
      .single();

    if (updateError) {
      console.error("Error updating order status:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    //2. Send email to supplier with PDF attachment
    // if (updatedOrder.suppliers?.email) {
    //   try {
    //     await EmailService.sendProcurementOrderEmail(
    //       updatedOrder,
    //       updatedOrder.suppliers.email
    //     );

    //     // Update order to mark email as sent
    //     await supabase
    //       .from("procurement_orders")
    //       .update({ status: "Ordered", email_sent: true })
    //       .eq("id", id);

    //     console.log(
    //       `Email sent successfully to ${updatedOrder.suppliers.email}`
    //     );
    //   } catch (emailError) {
    //     console.error("Error sending email:", emailError);
    //     // Don't fail the request if email fails, but log it
    //   }
    // } else {
    //   console.warn("No supplier email found for order:", id);
    // }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Order approved successfully and email sent to supplier",
    });
  } catch (error) {
    console.error("Error in approve order API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
