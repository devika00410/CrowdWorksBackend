import mongoose from "mongoose";

const donationDetailSchema = new mongoose.Schema(
  {
    donationCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: [true, "Donation card reference is required"],
    },

    message: {
      type: String,
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
      default: null,
    },

    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const DonationDetail = mongoose.model("DonationDetail", donationDetailSchema);

export default DonationDetail;