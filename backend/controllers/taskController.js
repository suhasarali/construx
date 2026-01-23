const Task = require('../models/Task');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Manager/Engineer
exports.createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, siteLocation, deadline, assignToAll } = req.body;

        if (assignToAll) {
            // "Everyone" - Create a task for each worker
            const User = require('../models/User');
            const workers = await User.find({ role: 'Worker' });
            
            const tasks = await Promise.all(workers.map(worker => Task.create({
                title,
                description,
                assignedTo: worker._id,
                assignedBy: req.user.id,
                priority,
                siteLocation,
                deadline
            })));
            
            return res.status(201).json({ message: `Created ${tasks.length} tasks for all workers` });
        }

        // Single assignment or "Anyone" (assignedTo is null/undefined)
        // If assignedTo is "Anyone" string or null from frontend, we store null in DB
        const targetUser = (assignedTo === 'Anyone' || assignedTo === '') ? null : assignedTo;

        const task = await Task.create({
            title,
            description,
            assignedTo: targetUser,
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
            query.$or = [
                { assignedTo: req.user.id },
                { assignedTo: null } // Open tasks
            ];
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
        if (req.user.role === 'Worker') {
            // Allow if assigned to them OR if task is unassigned (claiming it)
            // But if unassigned, we must better ensure they are claiming it (setting assignedTo = self)
            // For now, if they can see it (checked in getTasks), let's see.
            // If task.assignedTo is null, anyone can update it.
            // We should auto-assign if it's null and they are updating status?
            // Actually, let's keep it simple: if assignedTo matches OR if assignedTo is null.
            if (task.assignedTo && task.assignedTo.toString() !== req.user.id) {
                 return res.status(401).json({ message: 'Not authorized' });
            }
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

// @desc    Claim an unassigned task
// @route   PUT /api/tasks/:id/claim
// @access  Worker
exports.claimTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.assignedTo) {
            return res.status(400).json({ message: 'Task is already assigned' });
        }

        task.assignedTo = req.user.id;
        task.status = 'In Progress';
        await task.save();

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
