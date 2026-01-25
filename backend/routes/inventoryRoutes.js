import express from 'express';
import { getInventory, addInventoryItem, recordTransaction, getItemLogs } from '../controllers/inventoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getInventory);
router.post('/', protect, addInventoryItem);
router.post('/transaction', protect, recordTransaction);
router.get('/:id/logs', protect, getItemLogs);

export default router;
