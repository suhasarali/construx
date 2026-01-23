import express from 'express';
import { createInvoice, getInvoices } from "../controllers/invoiceController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/', protect, authorize('Owner'), createInvoice);
router.get('/', protect, authorize('Owner'), getInvoices);

export default router;
