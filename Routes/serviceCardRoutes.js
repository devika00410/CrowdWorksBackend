import express from "express";
import {
  getAllServiceCards,
  getServiceCardById,
  deleteServiceCard,
} from "../Controllers/serviceCardController.js";

const router = express.Router();

router.get("/",       getAllServiceCards);
router.get("/:id",    getServiceCardById);
router.delete("/:id", deleteServiceCard);

export default router;