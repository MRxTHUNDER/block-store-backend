import express from "express";
import { createOrder } from "../controllers/order"; // Update the path

const router = express.Router();

// POST endpoint for creating an order
router.post("/place", createOrder);

export default router;
