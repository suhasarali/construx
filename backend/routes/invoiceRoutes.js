const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Owner'), createInvoice);
router.get('/', protect, authorize('Owner'), getInvoices);

module.exports = router;
