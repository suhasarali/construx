import express from 'express';
import { createReport, getReports, updateReport } from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.post('/', protect, upload.array('photos', 5), createReport);
router.get('/', protect, getReports);
router.put('/:id', protect, updateReport);

export default router;
