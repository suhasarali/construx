const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date, // Normalized to midnight
        required: true,
    },
    checkInTime: {
        type: Date,
    },
    checkOutTime: {
        type: Date,
    },
    checkInLocation: {
        lat: Number,
        lng: Number,
        address: String,
        withinFence: Boolean
    },
    checkOutLocation: {
        lat: Number,
        lng: Number,
        address: String,
        withinFence: Boolean
    },
    checkInPhoto: String, // URL/Path to selfie
    checkOutPhoto: String, 
    status: {
        type: String, 
        enum: ['Present', 'Absent', 'Half-day', 'Pending_Approval', 'Rejected'],
        default: 'Absent',
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
}, { timestamps: true });

// Compound index to ensure one record per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
