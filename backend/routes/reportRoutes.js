import express from 'express';
import { createReport, getReports } from "../controllers/reportController";
import { protect } from "../middleware/authMiddleware";
import upload from "../utils/upload";

const router = express.Router();

router.post('/', protect, upload.array('photos', 5), createReport);
router.get('/', protect, getReports);

export default router;
