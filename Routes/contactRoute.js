import express from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  deleteContact,
} from "../Controllers/contactController.js";
import protect from "../Middleware/authMiddleware.js";

const router = express.Router();

router.post("/",  createContact);
router.get("/",  protect, getAllContacts);
router.get("/:id", protect, getContactById);
router.delete("/:id", protect, deleteContact);

export default router;