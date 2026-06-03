import mongoose from "mongoose";

const donationCampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,                              
    },

    image: {
      type: String,
      required: [true, "Image is required"],    
    },

    raisedAmount: {
      type: Number,
      default: 0,                              
      min: [0, "Raised amount cannot be negative"],
    },

    goalAmount: {
      type: Number,
      required: [true, "Goal amount is required"],
      min: [1, "Goal must be greater than 0"],  
    },

    currency: {
      type: String,
      default: "USD",
      enum: ["INR", "USD", "EUR"],
    },

    isActive: {
      type: Boolean,
      default: true,                         
    },

    detailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DonationDetail",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── VIRTUAL: auto-calculate progress percentage ──────────────────────────────
donationCardSchema.virtual("progressPercentage").get(function () {
  if (this.goalAmount === 0) return 0;
  return Math.min(Math.round((this.raisedAmount / this.goalAmount) * 100), 100);
});

const Donation = mongoose.model("Donation", donationCardSchema);

export default Donation;