Nice, this is a clean setup already. Let’s walk through how to pipe your existing `createOrder` data into Formspark so your client can see orders in the Formspark dashboard, while still saving everything in MongoDB.

You already have:
- Express API (`createOrder`)
- MongoDB order schema
- Formspark form id: `8kD18NU7e` (from the screenshot)
- Zapier key (for later automations)

### 1. Understand what Formspark expects

From your screenshot, Formspark wants a POST request to:

`https://submit-form.com/8kD18NU7e` 

with a body containing regular form fields, like:

- `name`
- `email`
- `message`
- plus any other fields you define in that form .

For your use case, you’ll send order data fields instead of a basic contact form.

### 2. Decide the data mapping

You have an order document like:

```json
{
  "name": "Rovr TarantulaX",
  "price": "20,999",
  "quantity": "1",
  "coupon": "",
  "discount": "0",
  "deliveryFee": "Free",
  "subTotal": "20999.00",
  "total": "20999.00",
  "firstName": "Aman",
  "lastName": "Kumar",
  "phoneNumber": "1234567890",
  "email": "amanking4321@gmail.com",
  "address": "Noida",
  "apartment": "Radha sky",
  "city": "Noida",
  "state": "Uttar Pradesh",
  "zipCode": "201306",
  "country": "India"
}
```

In Formspark, you can:
- Either create matching fields (e.g. `firstName`, `lastName`, `productName`, etc.).
- Or send a few “summary” fields + one `message` field that contains a stringified summary like `"Rovr TarantulaX x1, total 20999, address ..."`.

For visibility in the dashboard, it’s nicer to have separate fields (name, email, product, total, etc.).

### 3. Add a server-side Formspark call in `createOrder`

You’ll call Formspark from your backend **after** successfully saving the order, so the Formspark dashboard is effectively a reporting layer, not your source of truth.

Using `node-fetch` or `axios` is simplest. Here’s a step-by-step modification of your controller:

#### Step 3.1 – Install HTTP client (if not already)

```bash
npm install axios
```

#### Step 3.2 – Extract a helper to send data to Formspark

Create e.g. `src/utils/formspark.ts`:

```ts
import axios from "axios";

const FORMSPARK_FORM_ID = "8kD18NU7e"; // from your screenshot
const FORMSPARK_URL = `https://submit-form.com/${FORMSPARK_FORM_ID}`;

export async function sendOrderToFormspark(order: any) {
  // Map your DB fields to Formspark fields
  const payload = {
    // buyer info
    firstName: order.firstName,
    lastName: order.lastName,
    email: order.email,
    phoneNumber: order.phoneNumber,

    // address info
    address: order.address,
    apartment: order.apartment,
    city: order.city,
    state: order.state,
    zipCode: order.zipCode,
    country: order.country,

    // product/order info
    productName: order.name,
    quantity: order.quantity,
    price: order.price,
    discount: order.discount,
    deliveryFee: order.deliveryFee,
    subTotal: order.subTotal,
    total: order.total,

    // optional: a human-readable summary for quick view in dashboard
    summary: `Order for ${order.firstName} ${order.lastName}: ${order.name} x${order.quantity} | Total: ${order.total}`,
  };

  // Send as form-encoded or JSON – Formspark supports standard form posts and JSON
  await axios.post(FORMSPARK_URL, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
```

Formspark accepts POST requests with form data; using JSON is fine for most setups and simpler from Node. 

#### Step 3.3 – Call the helper from `createOrder`

Update your controller:

```ts
import { Request, Response } from "express";
import OrderModel from "../models/Order";
import { OrderSchema } from "../zod/order";
import { sendOrderToFormspark } from "../utils/formspark";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const parsedData = OrderSchema.safeParse(req.body);

    if (!parsedData.success) {
      res.status(400).json({
        message: "Validation error",
        errors: parsedData.error.errors,
        message2: parsedData.error.message,
      });
      return;
    }

    const validData = parsedData.data;

    const existingOrder = await OrderModel.findOne({
      productId: validData.productId,
    });
    if (existingOrder) {
      res.status(408).json({
        message: "An order with the same product ID already exists",
      });
      return;
    }

    const newOrder = new OrderModel(validData);
    const savedOrder = await newOrder.save();

    // Important: don't block core flow if Formspark fails.
    try {
      await sendOrderToFormspark(savedOrder);
    } catch (formsparkError) {
      console.error("Failed to send order to Formspark:", formsparkError);
      // Optionally log to your observability stack, but don't fail the order.
    }

    res.status(201).json({
      message: "Order created successfully",
      order: savedOrder,
    });
    return;
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
    return;
  }
};
```

That’s it: every time an order is created, a corresponding submission appears in your Formspark form dashboard with the mapped fields.

### 4. Configure the Formspark form to match those fields

In the Formspark UI (screenshot “How-to” tab): 

1. Ensure your form has fields defined with the **same names** you’re sending:
   - `firstName`, `lastName`, `email`, `phoneNumber`, etc.
2. You don’t need to use the HTML `<form>` on your frontend at all; you’re submitting programmatically from the backend.
3. After a test order, you should see a new “submission” entry under that form with all those fields populated.

You can later:
- Use Zapier key to trigger workflows when a new Formspark submission happens (e.g. push to Google Sheets, send email, etc.). 

### 5. Using Zapier (outline for later)

Once submissions are flowing into Formspark:

- In Zapier, choose Formspark as the trigger app.
- Trigger: “New form submission”.
- Connect your Zapier key / Formspark account.
- Pick your `BlockStore-Orders` form (`8kD18NU7e`).
- Map those fields (`firstName`, `productName`, `total`, etc.) into any target app (Sheets, Slack, etc.). 

***

To make this concrete: do you want to send **all** order fields to Formspark, or just a subset like customer info + product + total? If you list exactly which fields your client cares about seeing in the dashboard, we can refine the payload and naming so the Formspark UI is as clean as possible.