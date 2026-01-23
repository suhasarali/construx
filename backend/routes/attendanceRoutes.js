import express from 'express';
import { checkIn, checkOut, getAttendance, getSiteAttendance, verifyAttendance } from "../controllers/attendanceController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.post('/checkin', protect, upload.single('photo'), checkIn);
router.post('/checkout', protect, upload.single('photo'), checkOut);
router.get('/', protect, getAttendance);
router.get('/site', protect, authorize('Manager', 'Site_Engineer'), getSiteAttendance);
router.put('/:id/verify', protect, authorize('Manager', 'Site_Engineer'), verifyAttendance);

export default router;
