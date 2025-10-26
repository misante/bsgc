import EmailService from "@/lib/emailService";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }
    // Fetch the order with supplier and material details
    const { data, error } = await supabase
      .from("procurement_orders")
      .select(
        `*, suppliers(id, name, email, phone), master_materials(name, unit)`
      )
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching procurement order:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (data.suppliers?.email) {
      try {
        // Use the fetched data instead of request body order
        await EmailService.sendProcurementOrderEmail(
          data,
          data.suppliers.email
        );

        // Update order to mark email as sent
        const { error: updateError } = await supabase
          .from("procurement_orders")
          .update({ status: "ordered", email_sent: true })
          .eq("id", orderId);

        if (updateError) {
          console.error("Error updating order status:", updateError);
          throw updateError;
        }

        return NextResponse.json(
          { message: "Email sent and order updated successfully" },
          { status: 200 }
        );
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Log email error but don't fail the request
        return NextResponse.json(
          {
            message: "Order updated but email sending failed",
            error: emailError.message,
          },
          { status: 200 }
        );
      }
    } else {
      console.warn("No supplier email found for order:", id);
      return NextResponse.json(
        { message: "Order found but no supplier email provided" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in PATCH /api/procurement_orders:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
