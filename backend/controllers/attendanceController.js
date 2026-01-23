const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { getDistance } = require('../utils/geoUtils');

// Temporary hardcoded site checking
const SITE_LOCATION = { lat: 12.9716, lng: 77.5946 }; // Example
const ALLOWED_RADIUS = 500; // meters



exports.checkIn = async (req, res) => {
    try {
        const { lat, lng, address } = req.body;
        const userId = req.user.id; // From middleware
        
        // Log received data for debugging
        console.log('CheckIn Data:', { lat, lng, userId, file: req.file });

        const dist = getDistance(lat, lng, SITE_LOCATION.lat, SITE_LOCATION.lng);
        const withinFence = dist <= ALLOWED_RADIUS;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({ user: userId, date: today });

        if (attendance) {
            return res.status(400).json({ message: 'Already marked attendance for today' });
        }

        const photoPath = req.file ? req.file.path : null;

        attendance = await Attendance.create({
            user: userId,
            date: today,
            checkInTime: new Date(),
            checkInLocation: { 
                lat, 
                lng, 
                address,
                withinFence
            },
            checkInPhoto: photoPath,
            status: withinFence ? 'Present' : 'Pending_Approval' // Manual approval if outside fence
        });

        res.status(201).json(attendance);
    } catch (error) {
        console.error('CheckIn Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.checkOut = async (req, res) => {
    try {
        const { lat, lng, address } = req.body;
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({ user: userId, date: today });

        if (!attendance) {
            return res.status(404).json({ message: 'No attendance record found for today' });
        }

        const dist = getDistance(lat, lng, SITE_LOCATION.lat, SITE_LOCATION.lng);
        const withinFence = dist <= ALLOWED_RADIUS;

        attendance.checkOutTime = new Date();
        attendance.checkOutLocation = {
            lat,
            lng,
            address,
            withinFence
        };
        if (req.file) {
            attendance.checkOutPhoto = req.file.path;
        }

        await attendance.save();

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ user: req.user.id }).sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get All Attendance for Site (Engineer/Manager)
// @route   GET /api/attendance/site
// @access  Manager, Site_Engineer
exports.getSiteAttendance = async (req, res) => {
    try {
        // ideally filter by siteId if user has one, or return all for now
        // For MVP, return all attendance records for today
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const attendance = await Attendance.find({
            date: { $gte: today }
        }).populate('user', 'name role email');
        
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Attendance (Engineer/Manager)
// @route   PUT /api/attendance/:id/verify
// @access  Manager, Site_Engineer
exports.verifyAttendance = async (req, res) => {
    try {
        const { status } = req.body; // 'Present', 'Rejected', etc.
        const attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        attendance.status = status;
        attendance.verifiedBy = req.user.id;
        await attendance.save();

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
