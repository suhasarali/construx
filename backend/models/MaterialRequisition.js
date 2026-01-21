const mongoose = require('mongoose');

const materialRequisitionSchema = new mongoose.Schema({
    items: [{
        name: String,
        quantity: Number,
        unit: String, // kg, bags, liters
    }],
    siteLocation: String,
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Engineer
    },
    status: {
        type: String,
        enum: ['Requested', 'Approved', 'Rejected', 'Delivered'],
        default: 'Requested',
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Manager/Owner
    },
    comments: String,
}, { timestamps: true });

module.exports = mongoose.model('MaterialRequisition', materialRequisitionSchema);
