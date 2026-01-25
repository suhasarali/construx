import mongoose from 'mongoose';

const toolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    uniqueId: {
        type: String, // E.g., TOOL-101
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Available', 'In-Use', 'Maintenance', 'Lost'],
        default: 'Available'
    },
    currentHolder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    condition: {
        type: String,
        enum: ['New', 'Good', 'Fair', 'Poor', 'Broken'],
        default: 'Good'
    },
    purchaseDate: {
        type: Date
    },
    dueDate: {
        type: Date
    },
    lastMaintenance: {
        type: Date
    }
}, { timestamps: true });

const Tool = mongoose.model('Tool', toolSchema);

export default Tool;
