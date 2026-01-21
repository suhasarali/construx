const express = require('express');
const router = express.Router();
const { markCheckIn, markCheckOut, getAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.post('/checkin', protect, markCheckIn);
router.post('/checkout', protect, markCheckOut);
router.get('/', protect, getAttendance);

module.exports = router;
