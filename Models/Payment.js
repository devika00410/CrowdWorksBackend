import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: [true, "Donation ID is required"],
    },
    razorpayOrderId: {
      type: String,
      trim: true,
    },
    transactionId: {        
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    razorpaySignature: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be greater than 0"],
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Card", "Net Banking", "Wallet", "Bank Transfer"],
    },
    gateway: {
      type: String,
      required: true,
      enum: ["Razorpay", "Stripe", "PayPal", "Other"],
      default: "Razorpay",
    },
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed", "Refunded"],
      default: "Pending",
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;