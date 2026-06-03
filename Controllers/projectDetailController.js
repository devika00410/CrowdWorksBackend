import ProjectDetail from "../models/ProjectDetail.js";
import ProjectCard from "../models/Project.js";

// ─── CREATE PROJECT DETAIL ────────────────────────────────────────────────────

export const createProjectDetail = async (req, res) => {
  try {
    const {
      title,
      thumbnail,
      shortDescription,
      category,
      description,
      sections,
    } = req.body;

    // 1. Create ProjectDetail first
    const projectDetail = await ProjectDetail.create({
      title,
      description,
      sections,
      projectCardId: null,        // temp, will update after card is created
    });

    // 2. Create ProjectCard and link to ProjectDetail
    const projectCard = await ProjectCard.create({
      title,
      thumbnail,
      shortDescription,
      category,
      detailId: projectDetail._id,
    });

    // 3. Link ProjectCard back to ProjectDetail
    projectDetail.projectCardId = projectCard._id;
    await projectDetail.save();

    res.status(201).json({
      success: true,
      data: { projectCard, projectDetail },
      message: "Project created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── GET ALL PROJECT DETAILS ──────────────────────────────────────────────────

export const getAllProjectDetails = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [projectDetails, total] = await Promise.all([
      ProjectDetail.find()
        .populate("projectCardId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ProjectDetail.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: projectDetails,
      message: "Project details fetched successfully",
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

// ─── GET PROJECT DETAIL BY ID ─────────────────────────────────────────────────

export const getProjectDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    const projectDetail = await ProjectDetail.findById(id).populate("projectCardId");

    if (!projectDetail) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Project detail not found",
      });
    }

    res.status(200).json({
      success: true,
      data: projectDetail,
      message: "Project detail fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── UPDATE PROJECT DETAIL ────────────────────────────────────────────────────

export const updateProjectDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      thumbnail,
      shortDescription,
      category,
      description,
      sections,
    } = req.body;

    // 1. Update ProjectDetail
    const projectDetail = await ProjectDetail.findByIdAndUpdate(
      id,
      { title, description, sections },
      { new: true, runValidators: true }
    );

    if (!projectDetail) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Project detail not found",
      });
    }

    // 2. Sync card fields
    if (projectDetail.projectCardId) {
      await ProjectCard.findByIdAndUpdate(
        projectDetail.projectCardId,
        { title, thumbnail, shortDescription, category },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      data: projectDetail,
      message: "Project updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};

// ─── DELETE PROJECT DETAIL ────────────────────────────────────────────────────

export const deleteProjectDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const projectDetail = await ProjectDetail.findByIdAndDelete(id);

    if (!projectDetail) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Project detail not found",
      });
    }

    // Also delete the linked ProjectCard
    if (projectDetail.projectCardId) {
      await ProjectCard.findByIdAndDelete(projectDetail.projectCardId);
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "Project detail and its card deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};