import express from "express";
import { createProduct } from "../controllers/product"; // Update the path

const router = express.Router();

// POST endpoint for creating products
router.post("/create", createProduct);

export default router;
