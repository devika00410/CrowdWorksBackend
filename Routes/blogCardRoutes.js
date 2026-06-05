import express from "express";
import {
  getAllBlogCards,
  getBlogCardById,
  deleteBlogCard,
  createBlogCard,
  updateBlogCard
} from "../Controllers/blogCardController.js";
import protect from "../Middleware/authMiddleware.js";
const router = express.Router();


router.post('/', protect, createBlogCard);
router.get('/', getAllBlogCards);
router.get('/:id', getBlogCardById);
router.patch('/:id', protect, updateBlogCard);
router.delete('/:id', protect, deleteBlogCard);

export default router;