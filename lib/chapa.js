export const initializeChapa = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.chapa.co/checkout.js";
    script.async = true;
    script.onload = () => resolve(window.Chapa);
    document.head.appendChild(script);
  });
};

export const makePayment = async (paymentData) => {
  try {
    const Chapa = await initializeChapa();

    const config = {
      publicKey: process.env.NEXT_PUBLIC_CHAPA_PUBLIC_KEY,
      tx_ref: paymentData.reference,
      amount: paymentData.amount,
      currency: "ETB",
      email: paymentData.email,
      first_name: paymentData.firstName,
      last_name: paymentData.lastName,
      title: paymentData.title,
      description: paymentData.description,
      callback: (response) => {
        console.log("Payment response:", response);
        // Handle payment success
      },
      onClose: () => {
        console.log("Payment window closed");
      },
    };

    Chapa.pay(config);
  } catch (error) {
    console.error("Payment error:", error);
    throw error;
  }
};
