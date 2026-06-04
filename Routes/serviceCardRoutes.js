import express from "express";
import {
  getAllServiceCards,
  getServiceCardById,
  deleteServiceCard,
  createServiceCard,
} from "../Controllers/serviceCardController.js";
import protect from "../Middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllServiceCards);
router.get("/:id", getServiceCardById);
router.post("/", protect, createServiceCard);
router.delete("/:id", protect, deleteServiceCard);

export default router;