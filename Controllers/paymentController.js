import crypto from "crypto";
import Razorpay from "razorpay";
import Payment from "../Models/Payment.js";
import DonationDetail from "../Models/DonationDetails.js";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────
// @desc    Create Razorpay order & Payment record
// @route   POST /api/payments/create-order
// @access  Public
// ─────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { donationId, amount } = req.body;

    if (!donationId || !amount) {
      return res.status(400).json({
        success: false,
        message: "donationId and amount are required",
      });
    }

    // Create order on Razorpay (amount in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `donation_${donationId}_${Date.now()}`,
    });

    // Save pending payment record
    const payment = await Payment.create({
      donationId,
      razorpayOrderId: razorpayOrder.id,
      amount,
      gateway: "Razorpay",
      status: "Pending",
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        paymentId: payment._id,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Verify Razorpay payment signature & mark success
// @route   POST /api/payments/verify
// @access  Public
// ─────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      donationDetailId,
    } = req.body;

    // 1. Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: invalid signature",
      });
    }

    // 2. Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        transactionId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "Success",
        paidAt: new Date(),
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found",
      });
    }

    // 3. Update donation detail status & link payment
    if (donationDetailId) {
      await DonationDetail.findByIdAndUpdate(donationDetailId, {
        status: "completed",
        paymentId: payment._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during payment verification",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Razorpay webhook handler
// @route   POST /api/payments/webhook
// @access  Public (Razorpay server)
// ─────────────────────────────────────────────
export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // Validate webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
    }

    const { event, payload } = req.body;

    switch (event) {
      case "payment.captured": {
        const { id: transactionId, order_id, amount, method } = payload.payment.entity;

        await Payment.findOneAndUpdate(
          { razorpayOrderId: order_id },
          {
            transactionId,
            status: "Success",
            paymentMethod: mapRazorpayMethod(method),
            amount: amount / 100,
            paidAt: new Date(),
          }
        );
        break;
      }

      case "payment.failed": {
        const { order_id } = payload.payment.entity;
        await Payment.findOneAndUpdate(
          { razorpayOrderId: order_id },
          { status: "Failed" }
        );
        break;
      }

      case "refund.created": {
        const { payment_id } = payload.refund.entity;
        await Payment.findOneAndUpdate(
          { transactionId: payment_id },
          { status: "Refunded" }
        );
        break;
      }

      default:
        break;
    }

    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Webhook processing error",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all payments (admin)
// @route   GET /api/payments
// @access  Private/Admin
// ─────────────────────────────────────────────
export const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, gateway, donationId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (gateway) filter.gateway = gateway;
    if (donationId) filter.donationId = donationId;

    const skip = (Number(page) - 1) * Number(limit);

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate("donationId", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Payment.countDocuments(filter),
    ]);

    // Total successful amount
    const totalCollected = await Payment.aggregate([
      { $match: { status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      success: true,
      total,
      totalCollected: totalCollected[0]?.total || 0,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: payments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching payments",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Get single payment by ID
// @route   GET /api/payments/:id
// @access  Private/Admin
// ─────────────────────────────────────────────
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate(
      "donationId",
      "title goalAmount"
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching payment",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Initiate refund for a payment
// @route   POST /api/payments/:id/refund
// @access  Private/Admin
// ─────────────────────────────────────────────
export const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.status !== "Success") {
      return res.status(400).json({
        success: false,
        message: `Cannot refund a payment with status: ${payment.status}`,
      });
    }

    // Initiate refund via Razorpay
    await razorpay.payments.refund(payment.transactionId, {
      amount: Math.round(payment.amount * 100), // full refund
    });

    payment.status = "Refunded";
    await payment.save();

    res.status(200).json({
      success: true,
      message: "Refund initiated successfully",
      data: payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while processing refund",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// Helper: map Razorpay method string to schema enum
// ─────────────────────────────────────────────
const mapRazorpayMethod = (method) => {
  const map = {
    upi: "UPI",
    card: "Card",
    netbanking: "Net Banking",
    wallet: "Wallet",
    emandate: "Bank Transfer",
  };
  return map[method] || "Card";
};