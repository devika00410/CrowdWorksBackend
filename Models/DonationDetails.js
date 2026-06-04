import mongoose from "mongoose";

const donationDetailSchema = new mongoose.Schema(
  {
    donationCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: [true, "Donation card reference is required"],
    },

    // Donation amount selected by the user
    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [1, "Amount must be at least $1"],
    },

    // Payment method selected
    paymentMethod: {
      type: String,
      enum: ["test_donation", "offline_donation", "credit_card"],
      required: [true, "Payment method is required"],
      default: "credit_card",
    },

    // Personal info from the form
    firstName: {
      type: String,
      trim: true,
      required: [true, "First name is required"],
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      trim: true,
      required: [true, "Last name is required"],
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Email address is required"],
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
      default: null,
    },

    // Payment gateway reference (populated after payment processing)
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    // Donation status
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const DonationDetail = mongoose.model("DonationDetail", donationDetailSchema);

export default DonationDetail;