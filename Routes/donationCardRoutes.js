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
import protect from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createDonation);
router.get("/", getAllDonations);
router.get("/:id", getDonationById);
router.put("/:id", protect, updateDonation);
router.patch("/:id/contribute", protect, contributeToDonation);
router.patch("/:id/toggle-active", protect, toggleDonationActive);
router.delete("/:id", protect, deleteDonation);

export default router;