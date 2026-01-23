import mongoose from 'mongoose';

const materialPresetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    unit: String, // e.g., "50kg bag", "kg", "liter"
    basePrice: {
        type: Number,
        required: true
    },
    hsnCode: String,
    gstRate: {
        type: Number, // Percentage, e.g., 18 for 18%
        default: 18
    }
}, { timestamps: true });

const MaterialPreset = mongoose.model('MaterialPreset', materialPresetSchema);

export default MaterialPreset;
