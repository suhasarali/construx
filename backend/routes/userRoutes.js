const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/authController'); // Reusing auth controller logic for now
const { protect, authorize } = require('../middleware/authMiddleware');
const User = require('../models/User');

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

module.exports = router;
