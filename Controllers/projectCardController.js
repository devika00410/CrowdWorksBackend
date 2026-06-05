import ProjectCard from "../Models/Project.js";
import ProjectDetail from "../Models/ProjectDetail.js";

// ─── GET ALL PROJECT CARDS ────────────────────────────────────────────────────

export const getAllProjectCards = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [projectCards, total] = await Promise.all([
      ProjectCard.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ProjectCard.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: projectCards,
      message: "Project cards fetched successfully",
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

// ─── GET PROJECT CARD BY ID ───────────────────────────────────────────────────

export const getProjectCardById = async (req, res) => {
  try {
    const { id } = req.params;

    const projectCard = await ProjectCard.findById(id).populate("detailId");

    if (!projectCard) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Project card not found",
      });
    }

    res.status(200).json({
      success: true,
      data: projectCard,
      message: "Project card fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};



export const createProjectCard = async (req, res) => {
  try {
    const { title, thumbnail, shortDescription, category, gallery } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Title and category are required",
      });
    }

    const projectCard = await ProjectCard.create({
      title,
      thumbnail,
      shortDescription,
      category,
      gallery,
    });

    res.status(201).json({
      success: true,
      data: projectCard,
      message: "Project card created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};
export const updateProjectCard = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedProject = await ProjectCard.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Project card not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedProject,
      message: "Project card updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};
// ─── DELETE PROJECT CARD ──────────────────────────────────────────────────────

export const deleteProjectCard = async (req, res) => {
  try {
    const { id } = req.params;

    const projectCard = await ProjectCard.findByIdAndDelete(id);

    if (!projectCard) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Project card not found",
      });
    }

    // Also delete the linked ProjectDetail
    if (projectCard.detailId) {
      await ProjectDetail.findByIdAndDelete(projectCard.detailId);
    }

    res.status(200).json({
      success: true,
      data: null,
      message: "Project card and its detail deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: error.message,
    });
  }
};