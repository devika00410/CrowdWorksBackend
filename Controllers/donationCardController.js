import Donation from "../Models/Donation.js";
import mongoose from "mongoose";

// ─── Helper ───────────────────────────────────────────────────────────────────

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── CREATE ───────────────────────────────────────────────────────────────────

/**
 * POST /api/donations
 * Create a new donation campaign.
 */
export const createDonation = async (req, res) => {
  try {
    const { title, description, category, image, goalAmount, currency } =
      req.body;

    const donation = await Donation.create({
      title,
      description,
      category,
      image,
      goalAmount,
      currency,
    });

    return res.status(201).json({
      success: true,
      message: "Donation campaign created successfully",
      data: donation,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: errors });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── READ ALL ─────────────────────────────────────────────────────────────────

/**
 * GET /api/donations
 * Fetch all campaigns with optional filters and pagination.
 *
 * Query params:
 *   - category   : filter by category (case-insensitive)
 *   - isActive   : "true" | "false"
 *   - currency   : "INR" | "USD" | "EUR"
 *   - page       : page number (default 1)
 *   - limit      : items per page (default 10)
 *   - sort       : field to sort by, prefix "-" for descending (default -createdAt)
 */
export const getAllDonations = async (req, res) => {
  try {
    const {
      category,
      isActive,
      currency,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const filter = {};
    if (category) filter.category = { $regex: category, $options: "i" };
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (currency) filter.currency = currency;

    const skip = (Number(page) - 1) * Number(limit);
    const sortField = sort.startsWith("-")
      ? { [sort.slice(1)]: -1 }
      : { [sort]: 1 };

    const [donations, total] = await Promise.all([
      Donation.find(filter).sort(sortField).skip(skip).limit(Number(limit)),
      Donation.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: donations,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── READ ONE ─────────────────────────────────────────────────────────────────

/**
 * GET /api/donations/:id
 * Fetch a single campaign by ID, populating its detail document.
 */
export const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid donation ID" });

    const donation = await Donation.findById(id).populate("detailId");
    if (!donation)
      return res
        .status(404)
        .json({ success: false, message: "Donation campaign not found" });

    return res.status(200).json({ success: true, data: donation });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────

/**
 * PUT /api/donations/:id
 * Update any editable fields of a campaign.
 */
export const updateDonation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid donation ID" });

    // Prevent direct tampering of derived/internal fields via the body
    const { raisedAmount, ...safeFields } = req.body;

    const donation = await Donation.findByIdAndUpdate(id, safeFields, {
      new: true,
      runValidators: true,
    });

    if (!donation)
      return res
        .status(404)
        .json({ success: false, message: "Donation campaign not found" });

    return res.status(200).json({
      success: true,
      message: "Donation campaign updated successfully",
      data: donation,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: errors });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CONTRIBUTE ───────────────────────────────────────────────────────────────

/**
 * PATCH /api/donations/:id/contribute
 * Increment raisedAmount safely using $inc.
 * Body: { amount: Number }
 */
export const contributeToDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!isValidId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid donation ID" });

    if (!amount || typeof amount !== "number" || amount <= 0)
      return res
        .status(400)
        .json({ success: false, message: "Amount must be a positive number" });

    const donation = await Donation.findById(id);
    if (!donation)
      return res
        .status(404)
        .json({ success: false, message: "Donation campaign not found" });

    if (!donation.isActive)
      return res
        .status(400)
        .json({ success: false, message: "This campaign is no longer active" });

    donation.raisedAmount += amount;

    // Auto-deactivate when goal is met
    if (donation.raisedAmount >= donation.goalAmount) {
      donation.isActive = false;
    }

    await donation.save();

    return res.status(200).json({
      success: true,
      message: "Contribution recorded successfully",
      data: donation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── TOGGLE ACTIVE ────────────────────────────────────────────────────────────

/**
 * PATCH /api/donations/:id/toggle-active
 * Flip the isActive flag of a campaign.
 */
export const toggleDonationActive = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid donation ID" });

    const donation = await Donation.findById(id);
    if (!donation)
      return res
        .status(404)
        .json({ success: false, message: "Donation campaign not found" });

    donation.isActive = !donation.isActive;
    await donation.save();

    return res.status(200).json({
      success: true,
      message: `Campaign is now ${donation.isActive ? "active" : "inactive"}`,
      data: donation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

/**
 * DELETE /api/donations/:id
 * Permanently remove a campaign.
 */
export const deleteDonation = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id))
      return res
        .status(400)
        .json({ success: false, message: "Invalid donation ID" });

    const donation = await Donation.findByIdAndDelete(id);
    if (!donation)
      return res
        .status(404)
        .json({ success: false, message: "Donation campaign not found" });

    return res.status(200).json({
      success: true,
      message: "Donation campaign deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};