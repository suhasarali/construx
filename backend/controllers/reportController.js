const Report = require('../models/Report');

// @desc    Create DPR
// @route   POST /api/reports
// @access  Site_Engineer
exports.createReport = async (req, res) => {
    try {
        const { date, siteLocation, workSummary, laborCount, issuesRaised, remarks, type } = req.body;
        const photos = req.files ? req.files.map(file => ({ url: file.path })) : [];

        const report = await Report.create({
            submittedBy: req.user.id,
            date,
            type: type || 'DPR',
            siteLocation,
            workSummary,
            laborCount,
            photos,
            issuesRaised,
            remarks
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Reports
// @route   GET /api/reports
// @access  Manager, Site_Engineer
exports.getReports = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Site_Engineer' || req.user.role === 'Worker') {
            query.submittedBy = req.user.id;
        }

        const reports = await Report.find(query)
            .populate('submittedBy', 'name')
            .sort({ date: -1 });

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
