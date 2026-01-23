import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
    },
    clientName: {
        type: String,
        required: true,
    },
    clientGSTIN: String,
    date: {
        type: Date,
        default: Date.now,
    },
    items: [{
        description: String,
        quantity: Number,
        rate: Number, // Price per unit
        amount: Number, // qty * rate
    }],
    subTotal: Number,
    cgst: Number, // % or Amount
    sgst: Number,
    igst: Number,
    totalAmount: Number,
    status: {
        type: String,
        enum: ['Pending', 'Paid', 'Cancelled'],
        default: 'Pending',
    },
    pdfUrl: String, // Path to generated PDF
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;