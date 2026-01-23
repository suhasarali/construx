import mongoose from 'mongoose';

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
    payment: {
        amount: Number,
        paymentId: String,
        orderId: String,
        status: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed'],
            default: 'Pending',
        },
        paidAt: Date,
    },
}, { timestamps: true });

const MaterialRequisition = mongoose.model('MaterialRequisition', materialRequisitionSchema);

export default MaterialRequisition;