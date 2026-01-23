import Invoice from '../models/Invoice.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';

// @desc    Create Invoice
// @route   POST /api/invoices
// @access  Manager, Site_Engineer
export const createInvoice = async (req, res) => {
    try {
        const { clientName, clientGSTIN, items, taxRate = 18 } = req.body;

        // Calculate totals
        let subTotal = 0;
        items.forEach(item => {
            item.amount = item.quantity * item.rate;
            subTotal += item.amount;
        });

        const taxAmount = (subTotal * taxRate) / 100;
        const totalAmount = subTotal + taxAmount;

        // Simple equal split for demo
        const cgst = taxAmount / 2;
        const sgst = taxAmount / 2;
        const igst = 0; // assuming intra-state for simplicity

        const invoiceNumber = 'INV-' + Date.now();

        const invoice = await Invoice.create({
            invoiceNumber,
            clientName,
            clientGSTIN,
            items,
            subTotal,
            cgst,
            sgst,
            igst,
            totalAmount,
            status: 'Pending',
        });

        // Generate PDF
        const doc = new PDFDocument();
        const pdfPath = `uploads/invoices/${invoiceNumber}.pdf`;

        // Ensure directory exists
        const dir = 'uploads/invoices';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        doc.pipe(fs.createWriteStream(pdfPath));

        doc.fontSize(25).text('Invoice', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Invoice Number: ${invoiceNumber}`);
        doc.text(`Client: ${clientName}`);
        doc.text(`Date: ${new Date().toDateString()}`);
        doc.moveDown();

        items.forEach(item => {
            doc.text(`${item.description} - ${item.quantity} x ${item.rate} = ${item.amount}`);
        });

        doc.moveDown();
        doc.text(`Subtotal: ${subTotal}`);
        doc.text(`CGST: ${cgst}`);
        doc.text(`SGST: ${sgst}`);
        doc.text(`Total: ${totalAmount}`, { bold: true });

        doc.end();

        invoice.pdfUrl = pdfPath;
        await invoice.save();

        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Invoices
// @route   GET /api/invoices
// @access  Manager, Site_Engineer
export const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
