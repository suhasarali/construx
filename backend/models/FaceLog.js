import mongoose from 'mongoose';

const faceLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    confidence: {
        type: Number,
        required: true
    },
    verificationMethod: {
        type: String,
        enum: ['Live', 'Offline_Sync'],
        default: 'Live'
    },
    location: {
        lat: Number,
        lng: Number,
        address: String
    },
    deviceId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Success', 'Failed'],
        default: 'Success'
    }
}, { timestamps: true });

const FaceLog = mongoose.model('FaceLog', faceLogSchema);

export default FaceLog;
