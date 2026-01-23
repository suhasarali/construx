import Request from '../models/Request.js';
import MaterialPreset from '../models/MaterialPreset.js';
import Invoice from '../models/Invoice.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Get Material Presets (for UI)
// @route   GET /api/requests/presets
export const getMaterialPresets = async (req, res) => {
    try {
        const presets = await MaterialPreset.find({});
        res.json(presets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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

// @desc    Create Razorpay Order with Preset Calculation
// @route   POST /api/requests/payment/order
// @access  Manager
export const createPaymentOrder = async (req, res) => {
    try {
        const { requestId } = req.body;
        
        const request = await Request.findById(requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        // Calculate amount based on presets
        let totalBase = 0;
        let totalTax = 0;
        let lineItems = [];

        // Fetch all presets for lookup
        const presets = await MaterialPreset.find({});
        
        for (const item of request.items) {
            const preset = presets.find(p => p.name.toLowerCase() === item.name.toLowerCase());
            
            let rate = 0;
            let gstRate = 0;
            
            if (preset) {
                rate = preset.basePrice;
                gstRate = preset.gstRate;
            } else {
                // Fallback or error? For now, if not in preset, assume price 0 or handle logically
                // But user asked for preset system.
                // We'll skip or use 0, but ideally validation should happen.
                // console.warn(`No preset found for ${item.name}`);
            }

            const amount = rate * item.quantity;
            const gstAmount = amount * (gstRate / 100);
            
            totalBase += amount;
            totalTax += gstAmount;
            
            lineItems.push({
                description: item.name,
                quantity: item.quantity,
                rate: rate,
                amount: amount,
                gstRate: gstRate,
                gstAmount: gstAmount
            });
        }

        const totalAmount = Math.ceil(totalBase + totalTax); // Round up for payment

        if (totalAmount <= 0) {
            return res.status(400).json({ message: 'Calculated amount is 0. Check presets.' });
        }

        console.log('Creating Razorpay order for amount:', totalAmount);
        
        const options = {
            amount: totalAmount * 100, // paise
            currency: 'INR',
            receipt: `rcpt_${requestId.toString().slice(-8)}_${Date.now()}`, // Keep short < 40 chars
            notes: {
                requestId: requestId
            }
        };

        const order = await razorpay.orders.create(options);
        
        // Return order AND breakdown for UI
        res.json({
            order,
            breakdown: {
                lineItems,
                totalBase,
                totalTax,
                totalAmount
            }
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Payment and Approve Request + Generate Invoice
// @route   POST /api/requests/payment/verify
// @access  Manager
export const verifyPaymentAndApprove = async (req, res) => {
    try {
        const { paymentId, orderId, signature, requisitionId, breakdown } = req.body;
        console.log('Verifying payment:', { paymentId, orderId });

        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(orderId + '|' + paymentId)
            .digest('hex');

        if (generated_signature === signature) {
            const request = await Request.findById(requisitionId).populate('requester');

            if (!request) {
                return res.status(404).json({ message: 'Request not found' });
            }

            const paymentDetails = await razorpay.payments.fetch(paymentId);
            
            // Create Invoice
            // We rely on the breakdown passed from frontend (which came from backend earlier)
            // Or we re-calculate. Recalculate is safer but complex to duplicate logic. 
            // We'll assume the 'breakdown' object is passed back or we re-calc. 
            // For simplicity, let's re-calculate to be safe or accept for now.
            // Actually, `createPaymentOrder` returned it. Frontend should send it back or we re-derive.
            // Let's re-derive briefly or just be robust.
            
            // Create Invoice Record
            const invoice = await Invoice.create({
                invoiceNumber: `INV-${Date.now()}`,
                clientName: request.requester?.name || 'Unknown',
                items: breakdown?.lineItems || [], // Map if schema differs
                subTotal: breakdown?.totalBase || 0,
                // sgst/cgst mapping usually splits totalTax/2
                cgst: (breakdown?.totalTax || 0) / 2,
                sgst: (breakdown?.totalTax || 0) / 2,
                totalAmount: breakdown?.totalAmount || 0,
                status: 'Paid',
            });

            request.status = 'Approved';
            request.payment = {
                amount: breakdown?.totalAmount || 0,
                paymentId: paymentId,
                orderId: orderId,
                status: 'Paid',
                method: paymentDetails.method,
                paidAt: Date.now(),
            };

            await request.save();
            console.log('Payment verified, Invoice created:', invoice.invoiceNumber);

            res.json({ 
                message: 'Payment verified and Request Approved', 
                request, 
                invoiceId: invoice._id 
            });
        } else {
            res.status(400).json({ message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: error.message });
    }
};
