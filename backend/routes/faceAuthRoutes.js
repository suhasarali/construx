import express from 'express';
import { registerFace, verifyFace, getEnrolledFaces, getMyFaceData } from '../controllers/faceAuthController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', protect, registerFace);
router.post('/verify', protect, verifyFace);
router.get('/me', protect, getMyFaceData);
router.get('/sync', protect, getEnrolledFaces);

export default router;
