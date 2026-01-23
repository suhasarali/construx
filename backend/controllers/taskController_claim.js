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
