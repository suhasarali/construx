import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Material', 'Transport', 'Food', 'Tools', 'Repair', 'Other']
    },
    description: {
        type: String,
        required: true
    },
    receiptUrl: {
        type: String, // URL/Base64 of image
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Approved', 'Pending', 'Rejected'],
        default: 'Pending'
    },
    type: {
        type: String,
        enum: ['Debit', 'Credit'], // Debit = Spent, Credit = Received Funds
        default: 'Debit'
    }
}, {
    timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
