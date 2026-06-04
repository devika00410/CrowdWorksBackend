import express from "express";
import {
  getAllProjectCards,
  getProjectCardById,
  deleteProjectCard,
} from "../Controllers/projectCardController.js";

const router = express.Router();

router.get("/", getAllProjectCards);
router.get("/:id", getProjectCardById);
router.delete("/:id", deleteProjectCard);

export default router;