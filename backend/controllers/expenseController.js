import asyncHandler from 'express-async-handler';
import Expense from '../models/Expense.js';
import User from '../models/User.js';

// @desc    Add new daily expense
// @route   POST /api/expenses/add
// @access  Private (Engineer)
const addExpense = asyncHandler(async (req, res) => {
    const { amount, category, description, receiptUrl } = req.body;

    const expense = await Expense.create({
        user: req.user._id,
        amount,
        category,
        description,
        receiptUrl,
        type: 'Debit',
        status: 'Pending' // Auto-approved? Or Supervisor approves? Default Pending.
    });

    if (expense) {
        res.status(201).json(expense);
    } else {
        res.status(400);
        throw new Error('Invalid expense data');
    }
});

// @desc    Get Petty Cash Summary
// @route   GET /api/expenses/summary
// @access  Private
const getSummary = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Calculate Today's Spend
    const todaysExpenses = await Expense.find({
        user: req.user._id,
        type: 'Debit',
        createdAt: { $gte: today }
    });

    const todaySpent = todaysExpenses.reduce((acc, item) => acc + item.amount, 0);

    // 2. Calculate Total Balance (Credits - Debits)
    const allTxns = await Expense.find({ user: req.user._id });

    // Assume user starts with 0 or some allocation. 
    // We can sum all 'Credit' (Funds Received) and subtract all 'Debit' (Spent).
    const totalReceived = allTxns
        .filter(t => t.type === 'Credit' && t.status === 'Approved')
        .reduce((acc, item) => acc + item.amount, 0);

    const totalSpentAllTime = allTxns
        .filter(t => t.type === 'Debit')
        .reduce((acc, item) => acc + item.amount, 0);

    const balance = totalReceived - totalSpentAllTime;

    // 3. Recent Transactions
    const recent = await Expense.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5);

    res.json({
        todaySpent,
        balance: balance > 0 ? balance : 0, // Prevent negative if logic is loose
        recent
    });
});

// @desc    Request More Funds
// @route   POST /api/expenses/request-funds
// @access  Private
const requestFunds = asyncHandler(async (req, res) => {
    const { amount, reason } = req.body;

    // We log this as a 'Credit' request with status 'Pending'
    const request = await Expense.create({
        user: req.user._id,
        amount,
        category: 'Other', // Or 'FundRequest'
        description: `Fund Request: ${reason}`,
        type: 'Credit',
        status: 'Pending'
    });

    res.status(201).json(request);
});

export { addExpense, getSummary, requestFunds };
