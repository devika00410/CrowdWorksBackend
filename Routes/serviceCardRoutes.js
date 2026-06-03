import express from "express";
import {
  getAllServiceCards,
  getServiceCardById,
  deleteServiceCard,
} from "../controllers/serviceCardController";

const router = express.Router();

router.get("/",       getAllServiceCards);
router.get("/:id",    getServiceCardById);
router.delete("/:id", deleteServiceCard);

export default router;