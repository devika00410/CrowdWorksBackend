import express from "express";
import {
  createDonationCampaign,
  getAllDonationCampaigns,
  getDonationCampaignById,
  updateDonationCampaign,
  updateRaisedAmount,
  deleteDonationCampaign,
} from "../controllers/donationCardController";

const router = express.Router();

router.post("/",                    createDonationCampaign);
router.get("/",                     getAllDonationCampaigns);
router.get("/:id",                  getDonationCampaignById);
router.put("/:id",                  updateDonationCampaign);
router.patch("/:id/raised-amount",  updateRaisedAmount);
router.delete("/:id",               deleteDonationCampaign);

export default router;