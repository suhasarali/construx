import express from 'express';
import { createLog, getLogs } from "../controllers/dailyLogController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.post('/', protect, upload.single('photo'), createLog);
router.get('/', protect, getLogs);

export default router;
