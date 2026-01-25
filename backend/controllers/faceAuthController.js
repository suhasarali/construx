import FaceData from '../models/FaceData.js';
import FaceLog from '../models/FaceLog.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';
import faceService from '../utils/faceService.js';

// @desc    Register a new face embedding
// @route   POST /api/face-auth/register
// @access  Private
export const registerFace = async (req, res) => {
    try {
        const { image } = req.body; // Expects Base64 image
        const userId = req.user._id;

        if (!image) {
            return res.status(400).json({ message: 'Invalid data. Image required.' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate Embedding via Python Service
        const result = await faceService.register(image);
        const embedding = result.embedding;

        // Upsert FaceData
        const faceData = await FaceData.findOneAndUpdate(
            { user: userId },
            { embedding: embedding, version: 'deepface-vgg' },
            { new: true, upsert: true }
        );

        res.status(201).json({ message: 'Face registered successfully', faceData });
    } catch (error) {
        console.error('Error registering face:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Verify face and mark attendance
// @route   POST /api/face-auth/verify
// @access  Private
export const verifyFace = async (req, res) => {
    try {
        const { location, deviceId, confidence, image } = req.body;
        const userId = req.user._id; // Get from token

        if (!image) {
            return res.status(400).json({ message: 'Image required for verification' });
        }

        // 1. Fetch User's Stored Face
        const faceData = await FaceData.findOne({ user: userId });
        if (!faceData) {
            return res.status(404).json({ message: 'No enrolled face found. Please enroll first.' });
        }

        // 2. Verify via Python Service
        const result = await faceService.verify(image, faceData.embedding);

        if (!result.match) {
            return res.status(401).json({ message: 'Face not recognized. Try again.' });
        }

        // 3. Log the verification attempt
        const faceLog = await FaceLog.create({
            user: userId,
            confidence: result.similarity,
            location,
            deviceId: deviceId || 'mobile',
            status: 'Success'
        });

        // 4. Mark Attendance
        // Check if attendance exists for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            user: userId,
            date: { $gte: today }
        });

        if (!attendance) {
            // Create Check-In
            attendance = await Attendance.create({
                user: userId,
                date: new Date(),
                checkInTime: new Date(),
                checkInLocation: {
                    lat: location?.latitude,
                    lng: location?.longitude,
                    // address: location?.address, // Optional
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
                lat: location?.latitude,
                lng: location?.longitude,
                // address: location?.address,
                withinFence: true
            };
            await attendance.save();
            res.status(200).json({ message: 'Face verified. Attendance Checked Out.', type: 'Check-Out', attendance });
        } else {
            res.status(200).json({ message: 'Face verified. Already marked for today.', type: 'Info', attendance });
        }

    } catch (error) {
        console.error('Error verifying face:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

// @desc    Get my face data
// @route   GET /api/face-auth/me
// @access  Private
export const getMyFaceData = async (req, res) => {
    try {
        const faceData = await FaceData.findOne({ user: req.user._id });
        if (!faceData) {
            return res.status(404).json({ message: 'Face data not found' });
        }
        res.status(200).json(faceData);
    } catch (error) {
        console.error('Error fetching face data:', error);
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
