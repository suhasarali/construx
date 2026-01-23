import express from 'express';
import { createRequest, getRequests, updateRequestStatus } from "../controllers/requestController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post('/', protect, createRequest);
router.get('/', protect, getRequests);
router.put('/:id', protect, updateRequestStatus);

export default router;
