import express from 'express';
import { createTask, getTasks, updateTask, claimTask } from "../controllers/taskController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/', protect, authorize('Manager', 'Owner', 'Site_Engineer'), createTask);
router.get('/', protect, getTasks);
router.put('/:id', protect, updateTask);
router.put('/:id/claim', protect, authorize('Worker'), claimTask);

export default router;
