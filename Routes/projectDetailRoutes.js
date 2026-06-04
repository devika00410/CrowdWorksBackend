import express from "express";
import {
  createProjectDetail,
  getAllProjectDetails,
  getProjectDetailById,
  updateProjectDetail,
  deleteProjectDetail,
} from "../Controllers/projectDetailController.js";
import protect from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createProjectDetail);
router.get("/", getAllProjectDetails);
router.get("/:id", getProjectDetailById);
router.put("/:id", protect, updateProjectDetail);
router.delete("/:id", protect, deleteProjectDetail);

export default router;