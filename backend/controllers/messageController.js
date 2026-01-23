import Message from '../models/Message.js';

// @desc    Send Message
// @route   POST /api/messages
// @access  Manager, Site_Engineer
export const sendMessage = async (req, res) => {
    try {
        const { type, title, content, targetRoles, targetUsers, priority, parentMessage } = req.body;

        // Validation based on roles
        if (type === 'Broadcast' && (req.user.role === 'Worker')) {
            return res.status(403).json({ message: 'Workers cannot send broadcasts' });
        }

        const message = await Message.create({
            sender: req.user.id,
            type,
            title,
            content,
            targetRoles,
            targetUsers,
            priority,
            parentMessage
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Messages
// @route   GET /api/messages
// @access  Manager, Site_Engineer
export const getMessages = async (req, res) => {
    try {
        // Find messages where:
        // 1. TargetRoles includes user's role
        // 2. OR TargetUsers includes user's ID
        // 3. OR Sender is user (to see sent messages)
        // 4. OR it is a Broadcast (visible to all relevant roles)

        const query = {
            $or: [
                { targetRoles: req.user.role },
                { targetUsers: req.user.id },
                { sender: req.user.id }
            ]
        };

        const messages = await Message.find(query)
            .populate('sender', 'name role')
            .sort({ createdAt: -1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
