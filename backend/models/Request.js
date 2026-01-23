import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Material', 'Equipment', 'Other'],
        required: true
    },
    items: [{
        name: String,
        quantity: Number,
        unit: String,
        comments: String
    }],
    siteLocation: {
        lat: Number,
        lng: Number,
        address: String
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Partially_Approved', 'Rejected', 'Fulfilled'],
        default: 'Pending'
    },
    adminComments: String,
    urgency: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    payment: {
        amount: Number,
        paymentId: String,
        orderId: String,
        status: {
            type: String,
            enum: ['Pending', 'Paid', 'Failed'],
            default: 'Pending',
        },
        method: String,
        paidAt: Date,
    }
}, { timestamps: true });

const Request = mongoose.model('Request', requestSchema);

export default Request;