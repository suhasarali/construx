import Request from '../models/Request';

// @desc    Create a request
// @route   POST /api/requests
// @access  Site_Engineer
export const createRequest = async (req, res) => {
    try {
        const { type, items, siteLocation, urgency } = req.body;

        const request = await Request.create({
            requester: req.user.id,
            type,
            items,
            siteLocation,
            urgency
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all requests
// @route   GET /api/requests
// @access  Manager (All), Engineer (Own)
export const getRequests = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Site_Engineer') {
            query.requester = req.user.id;
        }

        const requests = await Request.find(query)
            .populate('requester', 'name role')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update request status (Approve/Reject)
// @route   PUT /api/requests/:id
// @access  Manager
export const updateRequestStatus = async (req, res) => {
    try {
        const { status, adminComments } = req.body;

        if (req.user.role !== 'Manager' && req.user.role !== 'Owner') {
            return res.status(403).json({ message: 'Not authorized to approve requests' });
        }

        const request = await Request.findByIdAndUpdate(
            req.params.id,
            { status, adminComments },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
