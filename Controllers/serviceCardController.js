import ServiceCard from "../Models/Service.js";
import ServiceDetail from "../Models/ServiceDetail.js";

// ─── GET ALL SERVICE CARDS ────────────────────────────────────────────────────

export const getAllServiceCards = async (req, res) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const skip = (Number(page) - 1) * Number(limit);

    const [serviceCards, total] = await Promise.all([
      ServiceCard.find(filter)
        .sort({ order: 1 })
        .skip(skip)
        .limit(Number(limit)),
      ServiceCard.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: serviceCards,
      message: "Service cards fetched successfully",
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

// ─── GET SERVICE CARD BY ID ───────────────────────────────────────────────────

export const getServiceCardById = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceCard = await ServiceCard.findById(id).populate("detailId");

    if (!serviceCard) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Service card not found",
      });
    }

    res.status(200).json({
      success: true,
      data: serviceCard,
      message: "Service card fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── CREATE SERVICE CARD ─────────────────────────────────────────────────────

export const createServiceCard = async (req, res) => {
  try {
    const { title, icon, shortDescription, isActive, order } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Title is required",
      });
    }

    const serviceCard = await ServiceCard.create({
      title,
      icon,
      shortDescription,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
    });

    res.status(201).json({
      success: true,
      data: serviceCard,
      message: "Service card created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── DELETE SERVICE CARD ──────────────────────────────────────────────────────

export const deleteServiceCard = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceCard = await ServiceCard.findByIdAndDelete(id);

    if (!serviceCard) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Service card not found",
      });
    }

    // Also delete the linked ServiceDetail
    if (serviceCard.detailId) {
      await ServiceDetail.findByIdAndDelete(serviceCard.detailId);
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "Service card and its detail deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};