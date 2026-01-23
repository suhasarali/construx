import express from 'express';
import { getInvoices, getInvoiceStats, downloadInvoicePDF } from '../controllers/invoiceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getInvoices);
router.get('/stats', protect, authorize('Manager', 'Owner'), getInvoiceStats);
router.get('/:id/download', protect, downloadInvoicePDF);

export default router;
