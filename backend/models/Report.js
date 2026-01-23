import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date, // Normalized date
        required: true
    },
    type: {
        type: String,
        enum: ['DPR', 'WorkerLog'],
        default: 'DPR'
    },
    siteLocation: {
        lat: Number,
        lng: Number,
        address: String
    },
    workSummary: {
        type: String,
        required: true
    },
    laborCount: {
        type: Number,
        default: 0
    },
    photos: [{
        url: String,
        caption: String
    }],
    issuesRaised: String,
    remarks: String,
    status: {
        type: String,
        enum: ['Submitted', 'Reviewed', 'Action_Required'],
        default: 'Submitted'
    }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

export default Report;