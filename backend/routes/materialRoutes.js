import express from 'express';
const router = express.Router();
import { createRequisition, getRequisitions, updateRequisitionStatus, createPaymentOrder, verifyPaymentAndApprove } from '../controllers/materialController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.post('/', protect, authorize('Engineer', 'Manager', 'Owner'), createRequisition);
router.get('/', protect, getRequisitions);
router.put('/:id/status', protect, authorize('Manager', 'Owner'), updateRequisitionStatus);
router.post('/payment/order', protect, authorize('Manager', 'Owner'), createPaymentOrder);
router.post('/payment/verify', protect, authorize('Manager', 'Owner'), verifyPaymentAndApprove);

export default router;
