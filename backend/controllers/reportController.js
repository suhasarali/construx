import Report from '../models/Report.js';

// @desc    Create DPR
// @route   POST /api/reports
// @access  Site_Engineer
export const createReport = async (req, res) => {
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
export const getReports = async (req, res) => {
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
// @desc    Update Report Status
// @route   PUT /api/reports/:id
// @access  Manager, Site_Engineer
export const updateReport = async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findById(req.params.id);

        if (report) {
            report.status = status || report.status;
            const updatedReport = await report.save();
            res.json(updatedReport);
        } else {
            res.status(404).json({ message: 'Report not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
