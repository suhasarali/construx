import Invoice from '../models/Invoice.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// @desc    Get all invoices
// @route   GET /api/invoices
export const getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({}).sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Invoice Stats
// @route   GET /api/invoices/stats
export const getInvoiceStats = async (req, res) => {
    try {
        // Aggregate stats
        const stats = await Invoice.aggregate([
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: "$totalAmount" },
                    totalTax: {
                        $sum: {
                            $add: [
                                { $ifNull: ["$cgst", 0] },
                                { $ifNull: ["$sgst", 0] },
                                { $ifNull: ["$igst", 0] }
                            ]
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = stats[0] || { totalSpent: 0, totalTax: 0, count: 0 };
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Download Invoice PDF
// @route   GET /api/invoices/:id/download
export const downloadInvoicePDF = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);

        doc.pipe(res);

        // --- Header Section ---
        doc.fontSize(10).fillColor('#666666').text('YOUR LOGO', 50, 50); // MOCK LOGO
        doc.text('NO. 000001', 450, 50, { align: 'right' });

        doc.moveDown(2);

        // "INVOICE" Title
        doc.font('Helvetica-Bold').fontSize(40).fillColor('#000000').text('INVOICE', 50, 100);

        doc.fontSize(10).font('Helvetica-Bold').text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 50, 150);

        // Billed To / From
        const topInfoY = 180;

        doc.font('Helvetica-Bold').text('Billed to:', 50, topInfoY);
        doc.font('Helvetica').text('Construx Construction Co.', 50, topInfoY + 15);
        doc.text('123 Main Street', 50, topInfoY + 30);
        doc.text(`Attn: ${invoice.clientName}`, 50, topInfoY + 45);

        doc.font('Helvetica-Bold').text('From:', 350, topInfoY);
        doc.font('Helvetica').text('Firstbenchers Suppliers Ltd.', 350, topInfoY + 15);
        doc.text('Mumbai, India', 350, topInfoY + 30);
        doc.text('support@firstbenchers.com', 350, topInfoY + 45);

        // --- Table Section ---
        const tableTop = 260;

        // Table Header Background
        doc.rect(50, tableTop, 495, 25).fill('#e0e0e0');

        // Table Header Text
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10);
        const itemX = 60;
        const qtyX = 300;
        const priceX = 380;
        const amountX = 480;

        doc.text('Item', itemX, tableTop + 8);
        doc.text('Quantity', qtyX, tableTop + 8);
        doc.text('Price', priceX, tableTop + 8);
        doc.text('Amount', amountX, tableTop + 8);

        // Rows
        let y = tableTop + 40;
        doc.font('Helvetica').fontSize(10);

        invoice.items.forEach(item => {
            const price = (item.rate || 0).toFixed(2);
            const amount = (item.amount || 0).toFixed(2);

            doc.text(item.description, itemX, y);
            doc.text(item.quantity.toString(), qtyX, y);
            doc.text(price, priceX, y);
            doc.text(amount, amountX, y);

            y += 25;
        });

        // Divider
        doc.moveTo(50, y).lineTo(545, y).strokeColor('#eeeeee').stroke();
        y += 15;

        // --- Totals Section ---
        doc.font('Helvetica-Bold').fillColor('#000000');
        doc.text('Total', 400, y);
        doc.text(`INR ${(invoice.totalAmount || 0).toFixed(2)}`, 480, y);

        // Footer Notes & Payment Method
        const footerY = y + 50;
        doc.font('Helvetica-Bold').text('Payment method:', 50, footerY);
        doc.font('Helvetica').text('Bank Transfer / UPI', 150, footerY);

        doc.font('Helvetica-Bold').text('Note:', 50, footerY + 20);
        doc.font('Helvetica').text('Thank you for choosing us!', 150, footerY + 20);


        // --- Footer Wave Art ---
        // Simple wave simulation
        doc.save();
        doc.path('M 0 750 C 150 700, 350 780, 600 720 L 600 850 L 0 850 Z')
            .fill('#333333');

        doc.path('M 0 780 C 150 750, 400 820, 600 760 L 600 850 L 0 850 Z')
            .fillOpacity(0.3)
            .fill('#666666');

        doc.restore();

        doc.end();

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};
