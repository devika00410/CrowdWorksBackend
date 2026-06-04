import ServiceDetail from "../Models/ServiceDetail.js";
import ServiceCard from "../Models/Service.js";

// ─── CREATE SERVICE DETAIL ────────────────────────────────────────────────────

export const createServiceDetail = async (req, res) => {
  try {
    const {
      title,
      shortDescription,
      thumbnail,
      icon,
      order,
      isActive,
      bannerImage,
      longDescription,
      features,
      gallery,
    } = req.body;

    // 1. Create ServiceDetail first
    const serviceDetail = await ServiceDetail.create({
      bannerImage,
      longDescription,
      features,
      gallery,
      serviceCardId: null,        // temp, will update after card is created
    });

    // 2. Create ServiceCard and link to ServiceDetail
    const serviceCard = await ServiceCard.create({
      title,
      shortDescription,
      thumbnail,
      icon,
      order,
      isActive,
      detailId: serviceDetail._id,
    });

    // 3. Link ServiceCard back to ServiceDetail
    serviceDetail.serviceCardId = serviceCard._id;
    await serviceDetail.save();

    res.status(201).json({
      success: true,
      data: { serviceCard, serviceDetail },
      message: "Service created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── GET ALL SERVICE DETAILS ──────────────────────────────────────────────────

export const getAllServiceDetails = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [serviceDetails, total] = await Promise.all([
      ServiceDetail.find()
        .populate("serviceCardId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ServiceDetail.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: serviceDetails,
      message: "Service details fetched successfully",
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

// ─── GET SERVICE DETAIL BY ID ─────────────────────────────────────────────────

export const getServiceDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceDetail = await ServiceDetail.findById(id).populate("serviceCardId");

    if (!serviceDetail) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Service detail not found",
      });
    }

    res.status(200).json({
      success: true,
      data: serviceDetail,
      message: "Service detail fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── UPDATE SERVICE DETAIL ────────────────────────────────────────────────────

export const updateServiceDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      shortDescription,
      thumbnail,
      icon,
      order,
      isActive,
      bannerImage,
      longDescription,
      features,
      gallery,
    } = req.body;

    // 1. Update ServiceDetail
    const serviceDetail = await ServiceDetail.findByIdAndUpdate(
      id,
      { bannerImage, longDescription, features, gallery },
      { new: true, runValidators: true }
    );

    if (!serviceDetail) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Service detail not found",
      });
    }

    // 2. Sync card fields
    if (serviceDetail.serviceCardId) {
      await ServiceCard.findByIdAndUpdate(
        serviceDetail.serviceCardId,
        { title, shortDescription, thumbnail, icon, order, isActive },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      data: serviceDetail,
      message: "Service updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── DELETE SERVICE DETAIL ────────────────────────────────────────────────────

export const deleteServiceDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceDetail = await ServiceDetail.findByIdAndDelete(id);

    if (!serviceDetail) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Service detail not found",
      });
    }

    // Also delete the linked ServiceCard
    if (serviceDetail.serviceCardId) {
      await ServiceCard.findByIdAndDelete(serviceDetail.serviceCardId);
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "Service detail and its card deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};