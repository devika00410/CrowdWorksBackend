import DonationCampaign from "../models/DonationCampaign.model.js";

// ─── CREATE DONATION CAMPAIGN ─────────────────────────────────────────────────

export const createDonationCampaign = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      image,
      goalAmount,
      currency,
      isActive,
    } = req.body;

    const campaign = await DonationCampaign.create({
      title,
      description,
      category,
      image,
      goalAmount,
      currency,
      isActive,
    });

    res.status(201).json({
      success: true,
      data: campaign,
      message: "Donation campaign created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── GET ALL DONATION CAMPAIGNS ───────────────────────────────────────────────

export const getAllDonationCampaigns = async (req, res) => {
  try {
    const { category, isActive, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (Number(page) - 1) * Number(limit);

    const [campaigns, total] = await Promise.all([
      DonationCampaign.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      DonationCampaign.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: campaigns,
      message: "Donation campaigns fetched successfully",
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── GET DONATION CAMPAIGN BY ID ──────────────────────────────────────────────

export const getDonationCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await DonationCampaign.findById(id).populate("detailId");

    if (!campaign) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Donation campaign not found",
      });
    }

    res.status(200).json({
      success: true,
      data: campaign,
      message: "Donation campaign fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── UPDATE DONATION CAMPAIGN ─────────────────────────────────────────────────

export const updateDonationCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      image,
      goalAmount,
      currency,
      isActive,
    } = req.body;

    const campaign = await DonationCampaign.findByIdAndUpdate(
      id,
      { title, description, category, image, goalAmount, currency, isActive },
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Donation campaign not found",
      });
    }

    res.status(200).json({
      success: true,
      data: campaign,
      message: "Donation campaign updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── UPDATE RAISED AMOUNT ─────────────────────────────────────────────────────

export const updateRaisedAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Valid amount is required",
      });
    }

    const campaign = await DonationCampaign.findByIdAndUpdate(
      id,
      { $inc: { raisedAmount: amount } },       // adds donated amount to raised
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Donation campaign not found",
      });
    }

    res.status(200).json({
      success: true,
      data: campaign,
      message: "Raised amount updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── DELETE DONATION CAMPAIGN ─────────────────────────────────────────────────

export const deleteDonationCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await DonationCampaign.findByIdAndDelete(id);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Donation campaign not found",
      });
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "Donation campaign deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};