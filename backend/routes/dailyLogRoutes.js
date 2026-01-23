import express from 'express';
import { createLog, getLogs } from "../controllers/dailyLogController";
import { protect } from "../middleware/authMiddleware";
import upload from "../utils/upload";

const router = express.Router();

router.post('/', protect, upload.single('photo'), createLog);
router.get('/', protect, getLogs);

export default router;
