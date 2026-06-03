import express from "express";
import{createBlogDetail, getAllBlogDetails, getBlogDetailById,
     updateBlogDetail, deleteBlogDetail} from "../Controllers/blogDetailController.js";


const router = express.Router();


router.post('/', createBlogDetail);
router.get('/', getAllBlogDetails);
router.get('/:id', getBlogDetailById);
router.put('/:id', updateBlogDetail);
router.delete('/:id', deleteBlogDetail);

export default router;