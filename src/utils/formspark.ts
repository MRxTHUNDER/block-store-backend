import axios from "axios";

export async function sendOrderToFormspark(order: any) {
  const formsparkFormId = process.env.FORMSPARK_FORM_ID;
  const formsparkBaseUrl = process.env.FORMSPARK_BASE_URL || "https://submit-form.com";

  if (!formsparkFormId) {
    console.warn("Formspark ID not configured in environment variables (FORMSPARK_FORM_ID). Skipping submission.");
    return;
  }

  const formsparkUrl = `${formsparkBaseUrl.replace(/\/$/, "")}/${formsparkFormId}`;
  console.log(`Submitting order to Formspark endpoint: ${formsparkUrl}`);

  // Map database fields to Formspark fields
  const payload = {
    // Buyer Info
    firstName: order.firstName,
    lastName: order.lastName,
    email: order.email,
    phoneNumber: order.phoneNumber,

    // Address Info
    address: order.address,
    apartment: order.apartment,
    city: order.city,
    state: order.state,
    zipCode: order.zipCode,
    country: order.country,

    // Product/Order Info
    productId: order.productId,
    productName: order.name,
    name: order.name, // standard form field support
    quantity: order.quantity,
    price: order.price,
    discount: order.discount,
    deliveryFee: order.deliveryFee,
    subTotal: order.subTotal,
    total: order.total,

    // Human-readable summary for quick view in dashboard
    summary: `Order for ${order.firstName} ${order.lastName}: ${order.name} (x${order.quantity}) | Total: ${order.total}`,
    message: `Order for ${order.firstName} ${order.lastName}: ${order.name} (x${order.quantity}) | Total: ${order.total}`, // standard form field support
  };

  try {
    await axios.post(formsparkUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
    });
    console.log(`Successfully submitted order ${order._id} to Formspark.`);
  } catch (error: any) {
    console.error(`Failed to submit order to Formspark. Status: ${error.response?.status}, Error: ${error.message}`);
    throw error; // Re-throw to handle/log it in the controller
  }
}
