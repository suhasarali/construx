import MaterialRequisition from '../models/MaterialRequisition.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Requisition
// @route   POST /api/material-requisitions
// @access  Engineer
export const createRequisition = async (req, res) => {
    try {
        const { items, siteLocation, comments } = req.body;

        const requisition = await MaterialRequisition.create({
            items,
            siteLocation,
            comments,
            requestedBy: req.user.id,
        });

        res.status(201).json(requisition);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Requisitions
// @route   GET /api/material-requisitions
// @access  Engineer
export const getRequisitions = async (req, res) => {
    try {
        // If Worker/Engineer, see only own. Manager/Owner see all?
        // Requirement: Engineer raises, Manager approves.
        let query = {};
        if (req.user.role === 'Engineer') {
            query = { requestedBy: req.user.id };
        }

        const requisitions = await MaterialRequisition.find(query)
            .populate('requestedBy', 'name')
            .sort({ createdAt: -1 });

        res.json(requisitions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateRequisitionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const requisition = await MaterialRequisition.findById(req.params.id);

        if (!requisition) {
            return res.status(404).json({ message: 'Requisition not found' });
        }

        requisition.status = status;
        if (status === 'Approved') {
            requisition.approvedBy = req.user.id;
        }
        await requisition.save();

        res.json(requisition);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create Razorpay Order
// @route   POST /api/material-requisitions/payment/order
// @access  Manager
export const createPaymentOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        console.log('Creating Razorpay order for amount:', amount);

        const options = {
            amount: amount * 100, // amount in smallest currency unit (paise)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        console.log('Razorpay order created:', order);

        res.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Payment and Approve Requisition
// @route   POST /api/material-requisitions/payment/verify
// @access  Manager
export const verifyPaymentAndApprove = async (req, res) => {
    try {
        const { paymentId, orderId, signature, requisitionId, amount } = req.body;
        console.log('Verifying payment:', { paymentId, orderId, signature, requisitionId });

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(orderId + '|' + paymentId)
            .digest('hex');

        if (generated_signature === signature) {
            const requisition = await MaterialRequisition.findById(requisitionId);

            if (!requisition) {
                console.error('Requisition not found:', requisitionId);
                return res.status(404).json({ message: 'Requisition not found' });
            }

            requisition.status = 'Approved';
            requisition.approvedBy = req.user.id;
            requisition.payment = {
                amount: amount,
                paymentId: paymentId,
                orderId: orderId,
                status: 'Paid',
                paidAt: Date.now(),
            };

            await requisition.save();
            console.log('Payment verified and Requisition Approved:', requisition._id);

            res.json({ message: 'Payment verified and Requisition Approved', requisition });
        } else {
            console.error('Invalid payment signature');
            res.status(400).json({ message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: error.message });
    }
};
