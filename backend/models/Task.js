import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Worker
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Manager
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending',
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    siteLocation: {
        lat: Number,
        lng: Number,
        address: String
    },
    deadline: Date,
    completedAt: Date,
    progress: { // 0 to 100
        type: Number,
        default: 0
    },
    proofPhotos: [String] // URLs for completion proof
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;