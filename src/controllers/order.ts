import { Request, Response } from "express";
import OrderModel from "../models/Order"; // Update the path to match your file structure
import { OrderSchema } from "../zod/order";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const parsedData = OrderSchema.safeParse(req.body);

    if (!parsedData.success) {
      // Validation failed
      res.status(400).json({
        message: "Validation error",
        errors: parsedData.error.errors, // Zod errors
        message2:parsedData.error.message
      });
      return;
    }

      // Extract the validated data
      const validData = parsedData.data;

    // Check if an order with the same product ID already exists
    const existingOrder = await OrderModel.findOne({ productId:validData.productId });
    if (existingOrder) {
      res.status(408).json({
        message: "An order with the same product ID already exists",
      });
      return;
    }

    // Create a new order
    const newOrder = new OrderModel(validData);
    // Save the order to the database
    const savedOrder = await newOrder.save();

    // Respond with the created order
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
