import express from "express";
import {getAllBlogCards, getBlogCardById, deleteBlogCard} from "../Controllers/blogCardController.js";

const router = express.Router();

router.get('/', getAllBlogCards);
router.get('/:id', getBlogCardById);
router.delete('/:id', deleteBlogCard);


export default router;


