const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Worker
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    photoUrl: String, // URL to uploaded image
    location: {
        lat: Number,
        lng: Number,
    },
}, { timestamps: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
