import express from "express";
import {
  createDonation,
  getAllDonations,
  getDonationById,
  updateDonation,
  contributeToDonation,
  toggleDonationActive,
  deleteDonation,
} from "../Controllers/donationCardController.js";

const router = express.Router();

router.post("/",                        createDonation);
router.get("/",                         getAllDonations);
router.get("/:id",                      getDonationById);
router.put("/:id",                      updateDonation);
router.patch("/:id/contribute",         contributeToDonation);
router.patch("/:id/toggle-active",      toggleDonationActive);
router.delete("/:id",                   deleteDonation);

export default router;