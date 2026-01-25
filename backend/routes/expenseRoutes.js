import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { addExpense, getSummary, requestFunds } from '../controllers/expenseController.js';

const router = express.Router();

router.post('/add', protect, addExpense);
router.get('/summary', protect, getSummary);
router.post('/request-funds', protect, requestFunds);

export default router;
