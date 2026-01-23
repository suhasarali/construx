import express from 'express';
const router = express.Router();
import { createRequisition, getRequisitions, updateRequisitionStatus } from '../controllers/materialController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.post('/', protect, authorize('Engineer', 'Manager', 'Owner'), createRequisition);
router.get('/', protect, getRequisitions);
router.put('/:id/status', protect, authorize('Manager', 'Owner'), updateRequisitionStatus);

export default router;
