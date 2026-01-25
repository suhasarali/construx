import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema({
    inventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
        required: true
    },
    type: {
        type: String,
        enum: ['IN', 'OUT'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        enum: ['Purchase', 'Delivery', 'Usage', 'Wastage', 'Theft', 'Damaged', 'Correction', 'Other'],
        required: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notes: String,
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);

export default InventoryLog;
