const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper to calculate distance in meters
const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

// Hardcoded Site Location for Demo (User requested hardcoding in previous convo, but I will make it config or passed in)
// Ideally, Project model should hold site location. For now, assuming single site center.
const SITE_LOCATION = { lat: 18.5204, lng: 73.8567 }; // Example: Pune
const ALLOWED_RADIUS = 500; // meters

exports.markCheckIn = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const userId = req.user.id;

        // Verify Location
        // In a real app, site location comes from a Project model assigned to the user
        const dist = getDistanceFromLatLonInMeters(lat, lng, SITE_LOCATION.lat, SITE_LOCATION.lng);
        
        if (dist > ALLOWED_RADIUS) {
            return res.status(400).json({ message: 'You are not on site location. Check-in denied.' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({ user: userId, date: today });

        if (attendance) {
            return res.status(400).json({ message: 'Already marked attendance for today' });
        }

        attendance = await Attendance.create({
            user: userId,
            date: today,
            checkInTime: new Date(),
            location: { lat, lng },
            status: 'Present',
        });

        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markCheckOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({ user: userId, date: today });

        if (!attendance) {
            return res.status(404).json({ message: 'No attendance record found for today' });
        }

        attendance.checkOutTime = new Date();
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
