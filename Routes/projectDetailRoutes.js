import express from "express";
import {
  createProjectDetail,
  getAllProjectDetails,
  getProjectDetailById,
  updateProjectDetail,
  deleteProjectDetail,
} from "../controllers/projectDetailController";

const router = express.Router();

router.post("/",      createProjectDetail);
router.get("/",       getAllProjectDetails);
router.get("/:id",    getProjectDetailById);
router.put("/:id",    updateProjectDetail);
router.delete("/:id", deleteProjectDetail);

export default router;