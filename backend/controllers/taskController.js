const Task = require('../models/Task');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Manager/Engineer
exports.createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, siteLocation, deadline } = req.body;

        const task = await Task.create({
            title,
            description,
            assignedTo,
            assignedBy: req.user.id,
            priority,
            siteLocation,
            deadline
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get tasks for logged in user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Worker') {
            query.assignedTo = req.user.id;
        } else {
            // Manager/Engineer sees all tasks created by them or all tasks? 
            // For now, let's say they see tasks they assigned OR all tasks if Manager
            if (req.user.role === 'Manager') {
                query = {}; // All tasks
            } else {
                query.assignedBy = req.user.id;
            }
        }

        const tasks = await Task.find(query).populate('assignedTo', 'name phone').sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id
// @access  Worker (update status) / Manager (update all)
exports.updateTask = async (req, res) => {
    try {
        const { status, progress, proofPhotos } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check permission
        if (req.user.role === 'Worker' && task.assignedTo.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        task.status = status || task.status;
        task.progress = progress || task.progress;
        
        if (proofPhotos) {
             task.proofPhotos = proofPhotos; // Expecting array of URLs
        }

        if (status === 'Completed') {
            task.completedAt = Date.now();
        }

        await task.save();
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
