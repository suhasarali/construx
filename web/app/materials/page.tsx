'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { PenTool, Check, X, CreditCard } from 'lucide-react';
import Script from 'next/script';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function MaterialsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            // const res = await api.get('/materials'); // DEPRECATED
            const res = await api.get('/requests');
            setRequests(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedReq, setSelectedReq] = useState<string | null>(null);
    const [amount, setAmount] = useState('');

    const openPaymentModal = (id: string) => {
        setSelectedReq(id);
        setPaymentModalOpen(true);
    };

    const handlePayment = async () => {
        if (!amount || isNaN(Number(amount))) return alert('Please enter a valid amount');
        
        console.log('Initiating payment for amount:', amount);

        try {
            // 1. Create Order
            console.log('Creating order on backend...');
            const orderRes = await api.post('/requests/payment/order', { amount: Number(amount) });
            console.log('Order created response:', orderRes.data);
            const order = orderRes.data;

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Construx Material',
                description: 'Material Approval Payment',
                order_id: order.id,
                handler: async function (response: any) {
                    console.log('Razorpay success callback:', response);
                    try {
                        // 2. Verify Payment
                        console.log('Verifying payment with backend...');
                        const verifyRes = await api.post('/requests/payment/verify', {
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id,
                            signature: response.razorpay_signature,
                            requisitionId: selectedReq,
                            amount: Number(amount)
                        });
                        console.log('Verification response:', verifyRes.data);
                        
                        setPaymentModalOpen(false);
                        setAmount('');
                        fetchRequests();
                        alert('Payment Successful & Approved!');
                    } catch (verifyError) {
                        console.error('Payment verification failed:', verifyError);
                        alert('Payment verification failed');
                    }
                },
                prefill: {
                    name: 'Manager Name', // You could fetch this from user context
                    email: 'manager@example.com',
                    contact: '9999999999'
                },
                theme: {
                    color: '#3399cc'
                },
                config: {
                    display: {
                        blocks: {
                            upi: {
                                name: "Pay via UPI",
                                instruments: [
                                    {
                                        method: "upi"
                                    }
                                ]
                            },
                        },
                        sequence: ["block.upi"],
                        preferences: {
                            show_default_blocks: true
                        }
                    }
                }
            };
            
            console.log('Opening Razorpay options:', options);
            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any){
                    console.error('Razorpay payment failed:', response.error);
                    alert(response.error.description);
            });
            rzp1.open();

        } catch (error) {
            console.error('Payment initiation failed:', error);
            alert('Failed to initiate payment');
        }
    };

    const updateStatus = async (id: string, status: string) => {
        if (status === 'Approved') {
            openPaymentModal(id);
            return;
        }

        if(!confirm(`Mark request as ${status}?`)) return;
        try {
            await api.put(`/requests/${id}`, { status });
            fetchRequests();
        } catch (e) { alert('Failed to update'); }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Material & Equipment Requests</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Requester</th>
                            <th className="p-4 font-semibold text-slate-600">Type</th>
                            <th className="p-4 font-semibold text-slate-600">Items</th>
                            <th className="p-4 font-semibold text-slate-600">Urgency</th>
                            <th className="p-4 font-semibold text-slate-600">Status</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {requests.map((req: any) => (
                            <tr key={req._id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium">{req.requester?.name || 'Unknown'}</td>
                                <td className="p-4 text-sm">{req.type || 'Material'}</td>
                                <td className="p-4 text-sm">
                                    <ul className="list-disc list-inside">
                                        {req.items.map((i: any, idx: number) => (
                                            <li key={idx}>{i.name} ({i.quantity} {i.unit})</li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        req.urgency === 'High' ? 'bg-red-100 text-red-700' : 
                                        req.urgency === 'Urgent' ? 'bg-red-100 text-red-700' :
                                        'bg-blue-50 text-blue-600'
                                    }`}>
                                        {req.urgency}
                                    </span>
                                </td>
                                <td className="p-4">
                                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        req.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                        req.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                                        'bg-orange-100 text-orange-700'
                                     }`}>
                                        {req.status}
                                     </span>
                                </td>
                                <td className="p-4 text-right space-x-2">
                                    {req.status === 'Pending' && (
                                        <>
                                            <button onClick={() => updateStatus(req._id, 'Approved')} className="text-green-600 hover:bg-green-50 p-1 rounded" title="Approve">
                                                <Check size={18} />
                                            </button>
                                            <button onClick={() => updateStatus(req._id, 'Rejected')} className="text-red-600 hover:bg-red-50 p-1 rounded" title="Reject">
                                                <X size={18} />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            {/* Payment Modal */}
            {paymentModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Approve & Pay</h2>
                        <p className="text-sm text-slate-600 mb-4">Enter the amount to sanction for this material request.</p>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                            <input 
                                type="number" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full border rounded p-2"
                                placeholder="Enter amount"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setPaymentModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handlePayment}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                            >
                                <CreditCard size={16} /> Pay (UPI/Card) & Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
