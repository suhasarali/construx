const MaterialRequisition = require('../models/MaterialRequisition');

exports.createRequisition = async (req, res) => {
    try {
        const { items, siteLocation, comments } = req.body;

        const requisition = await MaterialRequisition.create({
            items,
            siteLocation,
            comments,
            requestedBy: req.user.id,
        });

        res.status(201).json(requisition);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getRequisitions = async (req, res) => {
    try {
        // If Worker/Engineer, see only own. Manager/Owner see all?
        // Requirement: Engineer raises, Manager approves.
        let query = {};
        if (req.user.role === 'Engineer') {
            query = { requestedBy: req.user.id };
        }
        
        const requisitions = await MaterialRequisition.find(query)
            .populate('requestedBy', 'name')
            .sort({ createdAt: -1 });
            
        res.json(requisitions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateRequisitionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const requisition = await MaterialRequisition.findById(req.params.id);

        if (!requisition) {
            return res.status(404).json({ message: 'Requisition not found' });
        }

        requisition.status = status;
        if (status === 'Approved') {
            requisition.approvedBy = req.user.id;
        }
        await requisition.save();

        res.json(requisition);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
