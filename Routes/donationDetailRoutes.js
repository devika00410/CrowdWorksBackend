import express from "express";
import {
  createDonationDetail,
  getAllDonationDetails,
  getDonationDetailById,
  getDonationsByCampaign,
  updateDonationStatus,
  deleteDonationDetail,
} from "../Controllers/donationDetailController.js";

const router = express.Router();

router.post("/", createDonationDetail);
router.get("/", getAllDonationDetails);
router.get("/campaign/:donationCardId", getDonationsByCampaign);
router.get("/:id", getDonationDetailById);
router.patch("/:id/status", updateDonationStatus);
router.delete("/:id", deleteDonationDetail);

export default router;