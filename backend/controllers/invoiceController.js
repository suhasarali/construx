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

        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);

        doc.pipe(res);

        // Header
        doc.fillColor('#444444')
           .fontSize(20)
           .text('INVOICE', 50, 57)
           .fontSize(10)
           .text('Construx Construction Co.', 200, 50, { align: 'right' })
           .text('123 Main Street', 200, 65, { align: 'right' })
           .text('Bangalore, India', 200, 80, { align: 'right' })
           .moveDown();

        // Invoice Details
        doc.fillColor('#000000')
           .fontSize(10)
           .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 150)
           .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 50, 165)
           .text(`Client: ${invoice.clientName}`, 300, 150, { align: 'right' })
           .moveDown();

        // Line Items Header
        let y = 220;
        doc.font('Helvetica-Bold')
           .text('Item', 50, y)
           .text('Qty', 250, y)
           .text('Rate', 300, y, { width: 90, align: 'right' })
           .text('Tax %', 400, y, { width: 50, align: 'right' })
           .text('Total', 450, y, { align: 'right' });
        
        doc.moveTo(50, y + 15).lineTo(550, y + 15).stroke();
        
        y += 25;
        doc.font('Helvetica');

        // Items
        invoice.items.forEach(item => {
            doc.text(item.description, 50, y)
               .text(item.quantity.toString(), 250, y)
               .text((item.rate || 0).toFixed(2), 300, y, { width: 90, align: 'right' })
               .text(`${item.gstRate || 18}%`, 400, y, { width: 50, align: 'right' }) 
               .text((item.amount || 0).toFixed(2), 450, y, { align: 'right' });
            y += 20;
        });

        doc.moveTo(50, y + 10).lineTo(550, y + 10).stroke();
        y += 20;

        // Totals
        const labelX = 250;
        const labelWidth = 190;
        const valX = 450;
        const valWidth = 100;
        
        doc.font('Helvetica-Bold');
        doc.text('Subtotal:', labelX, y, { width: labelWidth, align: 'right' });
        doc.text((invoice.subTotal || 0).toFixed(2), valX, y, { width: valWidth, align: 'right' });
        y += 15;

        doc.text('Tax (CGST+SGST):', labelX, y, { width: labelWidth, align: 'right' });
        const totalTax = (invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0);
        doc.text(totalTax.toFixed(2), valX, y, { width: valWidth, align: 'right' });
        y += 20;
        
        doc.fontSize(12)
           .text('Total Amount:', labelX, y, { width: labelWidth, align: 'right' });
        doc.text(`INR ${(invoice.totalAmount || 0).toFixed(2)}`, valX, y, { width: valWidth, align: 'right' });
        
        // Footer
        doc.fontSize(10)
           .text('Thank you for your business.', 50, 700, { align: 'center', width: 500 });

        doc.end();

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};
