const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Manager', 'Owner', 'Site_Engineer'), createTask);
router.get('/', protect, getTasks);
router.put('/:id', protect, updateTask);

module.exports = router;
