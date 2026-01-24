import express from 'express';
import { registerFace, verifyFace, getEnrolledFaces } from '../controllers/faceAuthController.js';
import { protect } from '../middleware/authMiddleware.js'; // Assuming this exists

const router = express.Router();

router.post('/register', registerFace);
router.post('/verify', verifyFace);
router.get('/sync', getEnrolledFaces);

export default router;
