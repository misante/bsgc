import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    // Initialize Chapa payment
    const response = await fetch(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: body.amount,
          currency: "ETB",
          email: body.email,
          first_name: body.firstName,
          last_name: body.lastName,
          tx_ref: body.reference,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/verify`,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments/success`,
        }),
      }
    );

    const data = await response.json();

    if (!data.status === "success") {
      throw new Error(data.message);
    }

    return NextResponse.json({ checkoutUrl: data.data.checkout_url });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
