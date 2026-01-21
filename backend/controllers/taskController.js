const Task = require('../models/Task');

exports.createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, deadline } = req.body;
        
        // Only Manager/Owner can assign tasks
        if (req.user.role !== 'Manager' && req.user.role !== 'Owner') {
            return res.status(403).json({ message: 'Not authorized to assign tasks' });
        }

        const task = await Task.create({
            title,
            description,
            assignedTo,
            assignedBy: req.user.id,
            deadline,
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.assignedTo.toString() !== req.user.id && req.user.role !== 'Manager' && req.user.role !== 'Owner') {
            return res.status(403).json({ message: 'Not authorized to update this task' });
        }

        task.status = status;
        await task.save();

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
