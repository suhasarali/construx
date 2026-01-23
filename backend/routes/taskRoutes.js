import express from 'express';
import { createTask, getTasks, updateTask } from "../controllers/taskController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = express.Router();

router.post('/', protect, authorize('Manager', 'Owner', 'Site_Engineer'), createTask);
router.get('/', protect, getTasks);
router.put('/:id', protect, updateTask);
router.put('/:id/claim', protect, authorize('Worker'), claimTask);

export default router;
