import FaceData from '../models/FaceData.js';
import FaceLog from '../models/FaceLog.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// @desc    Register a new face embedding
// @route   POST /api/face-auth/register
// @access  Private
export const registerFace = async (req, res) => {
    try {
        const { userId, embedding } = req.body;

        if (!userId || !embedding || embedding.length !== 128) {
            return res.status(400).json({ message: 'Invalid data. User ID and 128-d embedding required.' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Upsert FaceData
        const faceData = await FaceData.findOneAndUpdate(
            { user: userId },
            { embedding: embedding, version: 'v1' },
            { new: true, upsert: true }
        );

        res.status(201).json({ message: 'Face registered successfully', faceData });
    } catch (error) {
        console.error('Error registering face:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify face and mark attendance
// @route   POST /api/face-auth/verify
// @access  Private
export const verifyFace = async (req, res) => {
    try {
        const { userId, confidence, location, deviceId } = req.body;

        if (!userId || !confidence || !deviceId) {
            return res.status(400).json({ message: 'Missing verification details' });
        }

        // 1. Log the verification attempt
        const faceLog = await FaceLog.create({
            user: userId,
            confidence,
            location,
            deviceId,
            status: 'Success' // We assume client only sends success, or we can add logic for failed attempts
        });

        // 2. Mark Attendance
        // Check if attendance exists for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            user: userId,
            date: today
        });

        if (!attendance) {
            // Create Check-In
            attendance = await Attendance.create({
                user: userId,
                date: today,
                checkInTime: new Date(),
                checkInLocation: {
                    lat: location?.lat,
                    lng: location?.lng,
                    address: location?.address,
                    withinFence: true // Logic to check fence can be added here
                },
                status: 'Present',
                verifiedBy: userId // Self-verified via Face
            });
            res.status(200).json({ message: 'Face verified. Attendance Checked In.', type: 'Check-In', attendance });
        } else if (!attendance.checkOutTime) {
            // Create Check-Out
            attendance.checkOutTime = new Date();
            attendance.checkOutLocation = {
                lat: location?.lat,
                lng: location?.lng,
                address: location?.address,
                withinFence: true
            };
            await attendance.save();
            res.status(200).json({ message: 'Face verified. Attendance Checked Out.', type: 'Check-Out', attendance });
        } else {
            res.status(200).json({ message: 'Face verified. Already marked for today.', type: 'Info', attendance });
        }

    } catch (error) {
        console.error('Error verifying face:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all enrolled faces (for offline sync)
// @route   GET /api/face-auth/sync
// @access  Private (Manager/Admin)
export const getEnrolledFaces = async (req, res) => {
    try {
        // In a real app, filter by Site ID or Team
        const faces = await FaceData.find().populate('user', 'name role');

        const syncData = faces.map(f => ({
            userId: f.user._id,
            name: f.user.name,
            role: f.user.role,
            embedding: f.embedding
        }));

        res.status(200).json(syncData);
    } catch (error) {
        console.error('Error syncing faces:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
