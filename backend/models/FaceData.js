import mongoose from 'mongoose';

const faceDataSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    embedding: {
        type: [Number], // 128-dimensional vector
        required: true,
        validate: [arrayLimit, '{PATH} must be 128 numbers']
    },
    version: {
        type: String,
        default: 'v1' // To handle model upgrades (e.g., Facenet -> MobileFaceNet)
    }
}, { timestamps: true });

function arrayLimit(val) {
    return val.length === 128;
}

const FaceData = mongoose.model('FaceData', faceDataSchema);

export default FaceData;
