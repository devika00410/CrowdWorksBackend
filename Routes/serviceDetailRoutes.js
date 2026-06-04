import express from "express";
import {
  createServiceDetail,
  getAllServiceDetails,
  getServiceDetailById,
  updateServiceDetail,
  deleteServiceDetail,
} from "../Controllers/serviceDetailController.js";
import protect from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/",  protect,    createServiceDetail);
router.get("/",       getAllServiceDetails);
router.get("/:id",    getServiceDetailById);
router.put("/:id",    protect, updateServiceDetail);
router.delete("/:id", protect, deleteServiceDetail);

export default router;