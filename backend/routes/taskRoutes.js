const express = require('express');
const router = express.Router();
const { createTask, getMyTasks, updateTaskStatus } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Manager', 'Owner'), createTask);
router.get('/', protect, getMyTasks);
router.put('/:id/status', protect, updateTaskStatus);

module.exports = router;
