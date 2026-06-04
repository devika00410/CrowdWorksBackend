import express from "express";
import {
  createDonationDetail,
  getAllDonationDetails,
  getDonationDetailById,
  getDonationsByCampaign,
  updateDonationStatus,
  deleteDonationDetail,
} from "../Controllers/donationDetailController.js";
import protect from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createDonationDetail);
router.get("/",  getAllDonationDetails);
router.get("/campaign/:donationCardId", getDonationsByCampaign);
router.get("/:id", getDonationDetailById);
router.patch("/:id/status", protect, updateDonationStatus);
router.delete("/:id", protect, deleteDonationDetail);

export default router;