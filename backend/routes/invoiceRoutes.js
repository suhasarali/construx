import express from 'express';
import { createInvoice, getInvoices } from "../controllers/invoiceController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = express.Router();

router.post('/', protect, authorize('Owner'), createInvoice);
router.get('/', protect, authorize('Owner'), getInvoices);

export default router;
