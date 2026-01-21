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
    location: {
        lat: Number,
        lng: Number,
        address: String,
    },
    status: {
        type: String, // Present, Absent, Half-day
        default: 'Absent',
    },
}, { timestamps: true });

// Compound index to ensure one record per user per day
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
