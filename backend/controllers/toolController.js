import Tool from '../models/Tool.js';
import ToolLog from '../models/ToolLog.js';

// @desc    Create a new tool
// @route   POST /api/tools
// @access  Private (Owner, Manager, Site_Engineer)
export const createTool = async (req, res) => {
    try {
        const { name, uniqueId, description, condition, purchaseDate } = req.body;

        const toolExists = await Tool.findOne({ uniqueId });
        if (toolExists) {
            return res.status(400).json({ message: 'Tool with this ID already exists' });
        }

        const tool = await Tool.create({
            name,
            uniqueId,
            description,
            condition,
            purchaseDate
        });

        res.status(201).json(tool);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all tools
// @route   GET /api/tools
// @access  Private
export const getTools = async (req, res) => {
    try {
        // Optional: Filter by status via query ?status=Available
        const filter = {};
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const tools = await Tool.find(filter).populate('currentHolder', 'name role');
        res.json(tools);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single tool by ID or uniqueId
// @route   GET /api/tools/:id
// @access  Private
export const getToolById = async (req, res) => {
    try {
        const tool = await Tool.findById(req.params.id).populate('currentHolder', 'name phone');
        if (tool) {
            res.json(tool);
        } else {
            // Try searching by uniqueId if not valid ObjectId or not found
            const toolByUnique = await Tool.findOne({ uniqueId: req.params.id }).populate('currentHolder', 'name phone');
            if (toolByUnique) {
                res.json(toolByUnique);
            } else {
                res.status(404).json({ message: 'Tool not found' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check Out a tool (Borrow)
// @route   POST /api/tools/:id/checkout
// @access  Private
export const checkOutTool = async (req, res) => {
    try {
        const tool = await Tool.findById(req.params.id);
        const { notes, location } = req.body;

        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }

        if (tool.status !== 'Available') {
            return res.status(400).json({ message: `Tool is currently ${tool.status}` });
        }

        // Update Tool
        tool.status = 'In-Use';
        tool.currentHolder = req.user._id;
        tool.dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        await tool.save();

        // Create Log
        await ToolLog.create({
            tool: tool._id,
            user: req.user._id,
            action: 'Check-Out',
            notes,
            condition: tool.condition,
            location
        });

        res.json({ message: 'Tool checked out successfully', tool });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check In a tool (Return)
// @route   POST /api/tools/:id/checkin
// @access  Private
export const checkInTool = async (req, res) => {
    try {
        const tool = await Tool.findById(req.params.id);
        const { notes, condition, location } = req.body;

        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }

        if (tool.status === 'Available') {
            return res.status(400).json({ message: 'Tool is already checked in' });
        }

        // Optional: Check if the user returning it is the current holder or a manager/site engineer
        // Allowing Site Engineers to force check-in is useful.

        // Update Tool
        tool.status = 'Available';
        tool.currentHolder = null;
        tool.dueDate = null;
        if (condition) tool.condition = condition;
        await tool.save();

        // Create Log
        await ToolLog.create({
            tool: tool._id,
            user: req.user._id,
            action: 'Check-In',
            notes,
            condition: tool.condition,
            location
        });

        res.json({ message: 'Tool checked in successfully', tool });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get tool history logs
// @route   GET /api/tools/:id/logs
// @access  Private (Owner, Manager, Site_Engineer)
export const getToolLogs = async (req, res) => {
    try {
        const logs = await ToolLog.find({ tool: req.params.id })
            .populate('user', 'name role')
            .sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
