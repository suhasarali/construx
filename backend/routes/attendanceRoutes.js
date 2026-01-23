const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getAttendance, getSiteAttendance, verifyAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

router.post('/checkin', protect, upload.single('photo'), checkIn);
router.post('/checkout', protect, upload.single('photo'), checkOut);
router.get('/', protect, getAttendance);
router.get('/site', protect, authorize('Manager', 'Site_Engineer'), getSiteAttendance);
router.put('/:id/verify', protect, authorize('Manager', 'Site_Engineer'), verifyAttendance);

module.exports = router;
