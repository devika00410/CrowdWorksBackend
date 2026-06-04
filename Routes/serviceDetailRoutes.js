import express from "express";
import {
  createServiceDetail,
  getAllServiceDetails,
  getServiceDetailById,
  updateServiceDetail,
  deleteServiceDetail,
} from "../Controllers/serviceDetailController.js";

const router = express.Router();

router.post("/",      createServiceDetail);
router.get("/",       getAllServiceDetails);
router.get("/:id",    getServiceDetailById);
router.put("/:id",    updateServiceDetail);
router.delete("/:id", deleteServiceDetail);

export default router;