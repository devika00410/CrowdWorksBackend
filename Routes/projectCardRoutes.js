import express from "express";
import protect from "../Middleware/authMiddleware.js";
import {
  getAllProjectCards,
  getProjectCardById,
  deleteProjectCard,
  createProjectCard,
  updateProjectCard
} from "../Controllers/projectCardController.js";

const router = express.Router();

router.get("/", getAllProjectCards);
router.get("/:id", getProjectCardById);
router.post("/", protect, createProjectCard);  
router.patch("/:id", protect, updateProjectCard);    
router.delete("/:id", protect, deleteProjectCard);

export default router;