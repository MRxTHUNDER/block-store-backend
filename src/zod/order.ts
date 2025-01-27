import { z } from "zod";

export const OrderSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }), // Required
  price: z.string().nonempty({ message: "Price is required" }), // Required
  productId: z.string().nonempty({ message: "Product ID is required" }), // Required
  quantity: z.string().nonempty({ message: "Quantity is required" }), // Required
  coupan: z.string().optional(), // Optional
  discount: z.string().default("0"), // Optional with default value
  deliveryFee: z.string().default("Free"), // Optional with default value
  subTotal: z.string().optional(), // Optional
  total: z.string().optional(), // Optional
  firstName: z.string().nonempty({ message: "First name is required" }), // Required
  lastName: z.string().nonempty({ message: "Last name is required" }), // Required
  phoneNumber: z.string().nonempty({ message: "Phone number is required" }), // Required
  email: z.string().email({ message: "Invalid email address" }), // Required and must be a valid email
  address: z.string().nonempty({ message: "Address is required" }), // Required
  apartment: z.string().nonempty({ message: "Apartment is required" }), // Optional
  city: z.string().nonempty({ message: "City is required" }), // Required
  state: z.string().nonempty({ message: "State is required" }), // Required
  zipCode: z.string().nonempty({ message: "Zip code is required" }), // Required
  country: z.string().nonempty({ message: "Country is required" }), // Required
});

// Infer the TypeScript type for the schema
export type OrderType = z.infer<typeof OrderSchema>;
