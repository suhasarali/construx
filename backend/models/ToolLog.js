import mongoose from 'mongoose';

const toolLogSchema = new mongoose.Schema({
    tool: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tool',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['Check-Out', 'Check-In', 'Maintenance-Start', 'Maintenance-End', 'Report-Issue'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String
    },
    condition: {
        type: String // Condition at time of log
    },
    location: {
        lat: Number,
        lng: Number
    }
}, { timestamps: true });

const ToolLog = mongoose.model('ToolLog', toolLogSchema);

export default ToolLog;
