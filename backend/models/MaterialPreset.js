import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
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

const Material = mongoose.model('Material', materialSchema);

export default Material;
