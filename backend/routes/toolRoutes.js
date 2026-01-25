import express from 'express';
import {
    createTool,
    getTools,
    getToolById,
    checkOutTool,
    checkInTool,
    getToolLogs
} from '../controllers/toolController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('Owner', 'Manager', 'Site_Engineer'), createTool)
    .get(protect, getTools);

router.route('/:id')
    .get(protect, getToolById);

router.route('/:id/checkout')
    .post(protect, checkOutTool);

router.route('/:id/checkin')
    .post(protect, checkInTool);

router.route('/:id/logs')
    .get(protect, authorize('Owner', 'Manager', 'Site_Engineer'), getToolLogs);

export default router;
