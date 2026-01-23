const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Broadcast', 'Query', 'Direct'],
        required: true
    },
    title: String,
    content: {
        type: String,
        required: true
    },
    targetRoles: [{
        type: String,
        enum: ['Worker', 'Site_Engineer', 'Manager']
    }],
    targetUsers: [{
        type: mongoose.Schema.Types.ObjectId, // For direct messages or specific sites
        ref: 'User'
    }],
    priority: {
        type: String,
        enum: ['Normal', 'High', 'Urgent'],
        default: 'Normal'
    },
    parentMessage: { // For replies/threads
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    isReadBy: [{ // Array of User IDs who have read the message
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
