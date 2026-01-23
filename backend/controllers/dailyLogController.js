import DailyLog from '../models/DailyLog';

// @desc    Create Log
// @route   POST /api/daily-logs
// @access  Worker
export const createLog = async (req, res) => {
    try {
        const { description, lat, lng, date } = req.body;

        // Photo path from multer
        const photoUrl = req.file ? req.file.path : null;

        const log = await DailyLog.create({
            user: req.user.id,
            date: date || new Date(),
            description,
            photoUrl,
            location: { lat, lng },
        });

        res.status(201).json(log);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Logs
// @route   GET /api/daily-logs
// @access  Worker
export const getLogs = async (req, res) => {
    try {
        let query = {};
        // If Worker, own logs. Manager, all logs.
        if (req.user.role === 'Worker') {
            query = { user: req.user.id };
        }

        const logs = await DailyLog.find(query)
            .populate('user', 'name')
            .sort({ date: -1 });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
