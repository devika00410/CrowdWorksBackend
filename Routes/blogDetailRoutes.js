import express from "express";
import{createBlogDetail, getAllBlogDetails, getBlogDetailById,
     updateBlogDetail, deleteBlogDetail} from "../Controllers/blogDetailController.js";

import protect from "../Middleware/authMiddleware.js";
const router = express.Router();


router.post('/', protect, createBlogDetail);
router.get('/', getAllBlogDetails);
router.get('/:id', getBlogDetailById);
router.put('/:id', protect, updateBlogDetail);
router.delete('/:id', protect, deleteBlogDetail);

export default router;