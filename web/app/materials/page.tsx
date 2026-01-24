'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { PenTool, Check, X, CreditCard, FileText, Calculator, Eye, Download } from 'lucide-react';
import Script from 'next/script';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function MaterialsPage() {
    const [requests, setRequests] = useState([]);
    const [presets, setPresets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
        fetchPresets();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/requests');
            setRequests(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPresets = async () => {
        try {
            const res = await api.get('/requests/presets');
            setPresets(res.data);
        } catch (error) {
            console.error("Failed to fetch presets", error);
        }
    };

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'pay' | 'view'>('pay');
    const [selectedReq, setSelectedReq] = useState<any | null>(null);
    // Calculated values for display
    const [calcBreakdown, setCalcBreakdown] = useState<any>(null);

    const openPaymentModal = (req: any, mode: 'pay' | 'view' = 'pay') => {
        setSelectedReq(req);
        setViewMode(mode);

        // Calculate estimated price based on presets locally for preview
        // Note: Final calculation happens on backend
        let totalBase = 0;
        let totalTax = 0;
        const lineItems: any[] = [];

        req.items.forEach((item: any) => {
            const preset = presets.find((p: any) => p.name.toLowerCase() === item.name.toLowerCase());
            let rate = 0;
            let gstRate = 0;

            if (preset) {
                rate = preset.basePrice;
                gstRate = preset.gstRate;
            }

            const amount = rate * item.quantity;
            const gst = amount * (gstRate / 100);

            totalBase += amount;
            totalTax += gst;

            lineItems.push({
                name: item.name,
                qty: item.quantity,
                rate,
                amount,
                gst
            });
        });

        setCalcBreakdown({
            lineItems,
            totalBase,
            totalTax,
            totalAmount: Math.ceil(totalBase + totalTax)
        });

        setPaymentModalOpen(true);
    };

    const handlePayment = async () => {
        if (!selectedReq) return;

        console.log('Initiating payment for Request:', selectedReq._id);

        try {
            // 1. Create Order (Backend calculates exact amount)
            console.log('Creating order on backend...');
            const orderRes = await api.post('/requests/payment/order', { requestId: selectedReq._id });
            const { order, breakdown } = orderRes.data;
            console.log('Order created:', order);
            console.log('Breakdown:', breakdown);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Construx Material',
                description: `Payment for Request #${selectedReq._id.slice(-6)}`,
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
                            requisitionId: selectedReq._id,
                            breakdown: breakdown // Pass back for Invoice creation
                        });
                        console.log('Verification response:', verifyRes.data);

                        setPaymentModalOpen(false);
                        fetchRequests();
                        alert(`Payment Successful! Invoice Generated: #INV-${Date.now()}`); // Simple alert for now
                    } catch (verifyError) {
                        console.error('Payment verification failed:', verifyError);
                        alert('Payment verification failed');
                    }
                },
                prefill: {
                    name: selectedReq.requester?.name || 'Manager',
                    email: 'manager@example.com',
                    contact: '9999999999'
                },
                theme: {
                    color: '#3399cc'
                },
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                console.error('Razorpay payment failed:', response.error);
                alert(response.error.description);
            });
            rzp1.open();

        } catch (error: any) {
            console.error('Payment initiation failed:', error);
            alert(`Failed to initiate payment: ${error.response?.data?.message || error.message}`);
        }
    };

    const updateStatus = async (req: any, status: string) => {
        if (status === 'Approved') {
            openPaymentModal(req);
            return;
        }

        if (!confirm(`Mark request as ${status}?`)) return;
        try {
            await api.put(`/requests/${req._id}`, { status });
            fetchRequests();
        } catch (e) { alert('Failed to update'); }
    };

    const handleDownload = () => {
        if (!calcBreakdown || !selectedReq) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const date = new Date().toLocaleDateString();
        const itemsHtml = calcBreakdown.lineItems.map((item: any) => `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>₹${item.rate}</td>
                <td>₹${item.amount.toFixed(2)}</td>
                <td>₹${item.gst.toFixed(2)}</td>
            </tr>
        `).join('');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill Request #${selectedReq._id.slice(-6)}</title>
                <style>
                    body { font-family: sans-serif; padding: 40px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .title { font-size: 24px; font-weight: bold; }
                    .info { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { -color: #f8f8f8; }
                    .totals { float: right; width: 300px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .total-row { font-weight: bold; font-size: 18px; border-top: 1px solid #333; padding-top: 10px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="title">Material Bill Request</div>
                    <div>Date: ${date}</div>
                </div>
                <div class="info">
                    <strong>Request ID:</strong> ${selectedReq._id}<br>
                    <strong>Requester:</strong> ${selectedReq.requester?.name || 'Unknown'}<br>
                    <strong>Site:</strong> ${selectedReq.siteLocation?.address || 'Site A'}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th>Amount</th>
                            <th>GST</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <div class="totals">
                    <div class="row"><span>Subtotal:</span> <span>₹${calcBreakdown.totalBase.toFixed(2)}</span></div>
                    <div class="row"><span>Tax (GST):</span> <span>₹${calcBreakdown.totalTax.toFixed(2)}</span></div>
                    <div class="row total-row"><span>Total:</span> <span>₹${calcBreakdown.totalAmount}</span></div>
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground pr-20">Material & Equipment Requests</h1>

            <div className="grid grid-cols-1 gap-6">
                {/* Presets Info - Optional/Debug */}
                {/* <div className="bg-muted/50 p-4 rounded text-xs text-muted-foreground">
                     <strong>Active Presets:</strong> {presets.map(p => p.name).join(', ')}
                 </div> */}

                <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="p-4 font-semibold text-muted-foreground">Requester</th>
                                <th className="p-4 font-semibold text-muted-foreground">Required By</th>
                                <th className="p-4 font-semibold text-muted-foreground">Urgency</th>
                                <th className="p-4 font-semibold text-muted-foreground">Payment</th>
                                <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {requests.map((req: any) => (
                                <tr key={req._id} className="hover:bg-muted/50">
                                    <td className="p-4 font-medium text-foreground">{req.requester?.name || 'Unknown'}</td>
                                    <td className="p-4 text-sm text-foreground">
                                        {(() => {
                                            if (req.requiredBy) return new Date(req.requiredBy).toLocaleDateString();
                                            // Demo: Generate random future date based on ID
                                            const randomDays = (req._id ? (req._id.charCodeAt(req._id.length - 1) % 15) + 2 : 5); 
                                            const d = new Date();
                                            d.setDate(d.getDate() + randomDays);
                                            return d.toLocaleDateString();
                                        })()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${req.urgency === 'High' ? 'bg-red-500/20 text-red-500' :
                                            req.urgency === 'Urgent' ? 'bg-red-500/20 text-red-500' :
                                                'bg-blue-500/20 text-blue-500'
                                            }`}>
                                            {req.urgency}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {req.payment?.status === 'Paid' ? (
                                            <div className="text-green-500 text-xs font-bold flex items-center gap-1">
                                                <Check size={14} /> Paid ₹{req.payment.amount}
                                                {/* Could link to invoice here */}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground/50 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right space-x-2">
                                        {req.status === 'Pending' && (
                                            <>
                                                <button onClick={() => openPaymentModal(req, 'view')} className="text-blue-500 hover:bg-blue-500/10 p-1 rounded" title="Preview Bill">
                                                    <Eye size={18} />
                                                </button>
                                                <button onClick={() => updateStatus(req, 'Approved')} className="text-green-500 hover:bg-green-500/10 p-1 rounded" title="Approve & Pay">
                                                    <CreditCard size={18} />
                                                </button>
                                                <button onClick={() => updateStatus(req, 'Rejected')} className="text-red-500 hover:bg-red-500/10 p-1 rounded" title="Reject">
                                                    <X size={18} />
                                                </button>
                                            </>
                                        )}
                                        {req.status === 'Approved' && (
                                            <span className="text-green-500 font-medium text-sm">Approved</span>
                                        )}
                                        {req.status === 'Rejected' && (
                                            <span className="text-red-500 font-medium text-sm">Rejected</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            {/* Payment Modal */}
            {paymentModalOpen && selectedReq && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card p-6 rounded-lg w-full max-w-lg shadow-xl border border-border">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-foreground">
                            <FileText size={24} /> {viewMode === 'pay' ? 'Approve & Generate Invoice' : 'Bill Request Preview'}
                        </h2>

                        <div className="bg-muted/50 p-4 rounded mb-4 text-sm">
                            <h3 className="font-semibold mb-2 text-foreground">Request Summary</h3>
                            <div className="space-y-2 text-muted-foreground">
                                {calcBreakdown?.lineItems.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between">
                                        <span>{item.name} x {item.qty}</span>
                                        <span>
                                            {item.rate ? `₹${item.amount} (Rate: ${item.rate})` : 'Price not found'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-border my-2 pt-2 space-y-1">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>₹{calcBreakdown?.totalBase.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>GST (Tax)</span>
                                    <span>₹{calcBreakdown?.totalTax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg mt-2 text-foreground">
                                    <span>Total Payable</span>
                                    <span>₹{calcBreakdown?.totalAmount}</span>
                                </div>
                            </div>
                        </div>

                        {calcBreakdown?.totalAmount === 0 && (
                            <div className="p-3 bg-yellow-500/20 text-yellow-500 text-sm mb-4 rounded">
                                Warning: Calculated amount is 0. Check if material presets exist for these items.
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setPaymentModalOpen(false)}
                                className="px-4 py-2 text-muted-foreground hover:bg-muted rounded"
                            >
                                Close
                            </button>
                            {viewMode === 'view' && (
                                <button
                                    onClick={handleDownload}
                                    className="px-4 py-2 rounded flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
                                >
                                    <Download size={16} /> Download Bill
                                </button>
                            )}
                            {viewMode === 'pay' && (
                                <button
                                    onClick={handlePayment}
                                    disabled={calcBreakdown?.totalAmount === 0}
                                    className={`px-4 py-2 rounded flex items-center gap-2 text-primary-foreground ${calcBreakdown?.totalAmount === 0
                                        ? 'bg-muted cursor-not-allowed'
                                        : 'bg-primary hover:bg-primary/90'
                                        }`}
                                >
                                    <CreditCard size={16} /> Pay & Approve
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
