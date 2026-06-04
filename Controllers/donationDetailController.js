import DonationDetail from "../Models/DonationDetails.js";
import Donation from "../Models/Donation.js";

// ─────────────────────────────────────────────
// @desc    Create a new donation detail (submit donation form)
// @route   POST /api/donation-details
// @access  Public
// ─────────────────────────────────────────────
export const createDonationDetail = async (req, res) => {
  try {
    const {
      donationCard,
      amount,
      paymentMethod,
      firstName,
      lastName,
      email,
      message,
    } = req.body;

    // Verify the referenced donation card exists
    const donation = await Donation.findById(donationCard);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation campaign not found",
      });
    }

    const donationDetail = await DonationDetail.create({
      donationCard,
      amount,
      paymentMethod,
      firstName,
      lastName,
      email,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Donation submitted successfully",
      data: donationDetail,
    });
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating donation",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all donation details (admin)
// @route   GET /api/donation-details
// @access  Private/Admin
// ─────────────────────────────────────────────
export const getAllDonationDetails = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentMethod,
      donationCard,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (donationCard) filter.donationCard = donationCard;

    const skip = (Number(page) - 1) * Number(limit);

    const [donationDetails, total] = await Promise.all([
      DonationDetail.find(filter)
        .populate("donationCard", "title goalAmount raisedAmount")
        .populate("paymentId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      DonationDetail.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: donationDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching donation details",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Get a single donation detail by ID
// @route   GET /api/donation-details/:id
// @access  Private/Admin
// ─────────────────────────────────────────────
export const getDonationDetailById = async (req, res) => {
  try {
    const donationDetail = await DonationDetail.findById(req.params.id)
      .populate("donationCard", "title goalAmount raisedAmount")
      .populate("paymentId");

    if (!donationDetail) {
      return res.status(404).json({
        success: false,
        message: "Donation detail not found",
      });
    }

    res.status(200).json({
      success: true,
      data: donationDetail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching donation detail",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Get all donations for a specific campaign
// @route   GET /api/donation-details/campaign/:donationCardId
// @access  Private/Admin
// ─────────────────────────────────────────────
export const getDonationsByCampaign = async (req, res) => {
  try {
    const { donationCardId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { donationCard: donationCardId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [donations, total] = await Promise.all([
      DonationDetail.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      DonationDetail.countDocuments(filter),
    ]);

    // Total amount raised from completed donations
    const totalRaised = await DonationDetail.aggregate([
      { $match: { donationCard: donationCardId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      success: true,
      total,
      totalRaised: totalRaised[0]?.total || 0,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching campaign donations",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Update donation status (e.g. after payment gateway callback)
// @route   PATCH /api/donation-details/:id/status
// @access  Private/Admin
// ─────────────────────────────────────────────
export const updateDonationStatus = async (req, res) => {
  try {
    const { status, paymentId } = req.body;

    const allowedStatuses = ["pending", "completed", "failed", "refunded"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`,
      });
    }

    const updateData = { status };
    if (paymentId) updateData.paymentId = paymentId;

    const donationDetail = await DonationDetail.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!donationDetail) {
      return res.status(404).json({
        success: false,
        message: "Donation detail not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation status updated successfully",
      data: donationDetail,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while updating donation status",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────
// @desc    Delete a donation detail
// @route   DELETE /api/donation-details/:id
// @access  Private/Admin
// ─────────────────────────────────────────────
export const deleteDonationDetail = async (req, res) => {
  try {
    const donationDetail = await DonationDetail.findByIdAndDelete(req.params.id);

    if (!donationDetail) {
      return res.status(404).json({
        success: false,
        message: "Donation detail not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Donation detail deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting donation detail",
      error: error.message,
    });
  }
};