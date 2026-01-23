const express = require('express');
const router = express.Router();
const { createRequisition, getRequisitions, updateRequisitionStatus } = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Engineer', 'Manager', 'Owner'), createRequisition);
router.get('/', protect, getRequisitions);
router.put('/:id/status', protect, authorize('Manager', 'Owner'), updateRequisitionStatus);

export default router;
