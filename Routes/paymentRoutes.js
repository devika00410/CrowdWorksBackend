import express from "express";
import {
  createOrder,
  verifyPayment,
  handleWebhook,
  getAllPayments,
  getPaymentById,
  refundPayment,
} from "../Controllers/paymentController.js";
// import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── Public Routes ───────────────────────────
// Webhook must use raw body parser — register BEFORE express.json() in app.js
// app.use("/api/payments/webhook", express.raw({ type: "application/json" }), paymentRoutes);
router.post("/webhook", handleWebhook);

// Donation flow (called from frontend)
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

// ─── Admin Routes ─────────────────────────────
// Uncomment protect & adminOnly middleware when auth is ready
router.get("/", /* protect, adminOnly, */ getAllPayments);
router.get("/:id", /* protect, adminOnly, */ getPaymentById);
router.post("/:id/refund", /* protect, adminOnly, */ refundPayment);

export default router;