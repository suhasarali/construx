import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        required: true
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
