import express from "express";
import { createProduct, getProductByProductId } from "../controllers/product"; // Update the path

const router = express.Router();

// POST endpoint for creating products
router.post("/admin/v4/product/create", createProduct);
router.get("/product/fetch/:productId", getProductByProductId);

export default router;
