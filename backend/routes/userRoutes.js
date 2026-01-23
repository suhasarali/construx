import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get all workers
// @route   GET /api/users/workers
// @access  Manager, Site_Engineer
router.get('/workers', protect, authorize('Manager', 'Site_Engineer', 'Owner'), async (req, res) => {
    try {
        const workers = await User.find({ role: 'Worker' }).select('name _id phone');
        res.json(workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
