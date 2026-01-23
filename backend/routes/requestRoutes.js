import express from 'express';
import { createRequest, getRequests, updateRequestStatus, createPaymentOrder, verifyPaymentAndApprove, getMaterialPresets } from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/', protect, createRequest);
router.get('/', protect, getRequests);
router.get('/presets', protect, getMaterialPresets);
router.put('/:id', protect, updateRequestStatus);
router.post('/payment/order', protect, createPaymentOrder);
router.post('/payment/verify', protect, verifyPaymentAndApprove);

export default router;
