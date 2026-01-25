import Inventory from '../models/Inventory.js';
import InventoryLog from '../models/InventoryLog.js';

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
export const getInventory = async (req, res) => {
    try {
        const inventory = await Inventory.find().sort({ name: 1 });
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Initialize/Add new inventory item
// @route   POST /api/inventory
// @access  Manager, Site_Engineer
export const addInventoryItem = async (req, res) => {
    try {
        const { name, quantity, unit, lowStockThreshold } = req.body;
        
        const exists = await Inventory.findOne({ name });
        if (exists) {
            return res.status(400).json({ message: 'Item already exists in inventory' });
        }

        const item = await Inventory.create({
            name,
            quantity: quantity || 0,
            unit,
            lowStockThreshold: lowStockThreshold || 10
        });

        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Record Stock Transaction (In/Out)
// @route   POST /api/inventory/transaction
// @access  Private
export const recordTransaction = async (req, res) => {
    try {
        const { inventoryId, type, quantity, reason, notes } = req.body;
        
        const item = await Inventory.findById(inventoryId);
        if (!item) {
            return res.status(404).json({ message: 'Inventory item not found' });
        }

        const qty = Number(quantity);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: 'Invalid quantity' });
        }

        // Update Stock
        if (type === 'IN') {
            item.quantity += qty;
        } else if (type === 'OUT') {
            if (item.quantity < qty) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }
            item.quantity -= qty;
        } else {
            return res.status(400).json({ message: 'Invalid transaction type' });
        }

        item.lastUpdated = Date.now();
        await item.save();

        // Create Log
        const log = await InventoryLog.create({
            inventoryId,
            type,
            quantity: qty,
            reason,
            notes,
            performedBy: req.user.id
        });

        res.json({ item, log });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Logs for specific item
// @route   GET /api/inventory/:id/logs
// @access  Private
export const getItemLogs = async (req, res) => {
    try {
        const logs = await InventoryLog.find({ inventoryId: req.params.id })
            .populate('performedBy', 'name')
            .sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
