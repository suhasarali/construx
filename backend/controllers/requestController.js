import Request from '../models/Request.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create a request
// @route   POST /api/requests
// @access  Site_Engineer
export const createRequest = async (req, res) => {
    try {
        const { type, items, siteLocation, urgency } = req.body;

        const request = await Request.create({
            requester: req.user.id,
            type,
            items,
            siteLocation,
            urgency
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all requests
// @route   GET /api/requests
// @access  Manager (All), Engineer (Own)
export const getRequests = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'Site_Engineer') {
            query.requester = req.user.id;
        }

        const requests = await Request.find(query)
            .populate('requester', 'name role')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update request status (Approve/Reject)
// @route   PUT /api/requests/:id
// @access  Manager
export const updateRequestStatus = async (req, res) => {
    try {
        const { status, adminComments } = req.body;

        if (req.user.role !== 'Manager' && req.user.role !== 'Owner') {
            return res.status(403).json({ message: 'Not authorized to approve requests' });
        }

        const request = await Request.findByIdAndUpdate(
            req.params.id,
            { status, adminComments },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create Razorpay Order
// @route   POST /api/requests/payment/order
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

// @desc    Verify Payment and Approve Request
// @route   POST /api/requests/payment/verify
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
            const request = await Request.findById(requisitionId);

            if (!request) {
                console.error('Request not found:', requisitionId);
                return res.status(404).json({ message: 'Request not found' });
            }

            // Fetch payment details to get method (UPI, Card, etc)
            const paymentDetails = await razorpay.payments.fetch(paymentId);
            console.log('Payment Details Fetched:', paymentDetails.method);

            request.status = 'Approved';
            request.payment = {
                amount: amount,
                paymentId: paymentId,
                orderId: orderId,
                status: 'Paid',
                method: paymentDetails.method, // 'upi', 'card', 'netbanking'
                paidAt: Date.now(),
            };

            await request.save();
            console.log('Payment verified and Request Approved:', request._id);

            res.json({ message: 'Payment verified and Request Approved', request });
        } else {
            console.error('Invalid payment signature');
            res.status(400).json({ message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: error.message });
    }
};
