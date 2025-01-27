import { Request, Response } from "express";
import ProductModel from "../models/Product"; // Update the path to match your file structure

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price,productId } = req.body;

    const existingId = await ProductModel.findOne({productId});

    if(existingId) {
      res.status(408).json({
        message:"A product with same product id already exists"
      })
      return
    }
    // Validate the input fields
    if (!name || !description || !price ||!productId) {
      res.status(400).json({ message: "All fields are required: name, description, and price." });
      return
    }

    // Create a new product using the ProductModel
    const newProduct = new ProductModel({
      name,
      description,
      price,
      productId
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();

    // Send a success response with the created product
   res.status(201).json({
      message: "Product created successfully",
      product: savedProduct,
    });
    return
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return 
  }
};


export const getProductByProductId = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    // Check if productId is provided
    if (!productId) {
      res.status(400).json({
        message: "Product ID is required",
      });
      return;
    }

    // Find the product by productId
    const product = await ProductModel.findOne({ productId });

    if (!product) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    // Return the product details
    res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
    return
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
    return
  }
};