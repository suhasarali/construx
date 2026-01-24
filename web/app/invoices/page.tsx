'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Download, FileText, TrendingUp, DollarSign, Package } from 'lucide-react';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState({ totalSpent: 0, totalTax: 0, count: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [invRes, statsRes] = await Promise.all([
                api.get('/invoices'),
                api.get('/invoices/stats')
            ]);
            setInvoices(invRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error("Failed to fetch invoices", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadInvoice = async (id: string, number: string) => {
        try {
            const response = await api.get(`/invoices/${id}/download`, {
                responseType: 'blob', // Important for file handling
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${number}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error("Download failed", error);
            alert("Failed to download PDF");
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-foreground pr-20">Invoices & Financials</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-lg shadow border-l-4 border-blue-500 border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-muted-foreground font-medium">Total Spending</h3>
                        <DollarSign className="text-blue-500" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-foreground">₹{stats.totalSpent.toLocaleString()}</p>
                </div>

                <div className="bg-card p-6 rounded-lg shadow border-l-4 border-emerald-500 border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-muted-foreground font-medium">Tax Paid (GST)</h3>
                        <TrendingUp className="text-emerald-500" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-foreground">₹{stats.totalTax.toLocaleString()}</p>
                </div>

                <div className="bg-card p-6 rounded-lg shadow border-l-4 border-purple-500 border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-muted-foreground font-medium">Total Invoices</h3>
                        <FileText className="text-purple-500" size={20} />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stats.count}</p>
                </div>
            </div>

            {/* Invoices List */}
            <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
                <div className="p-4 border-b border-border bg-muted/50 flex items-center gap-2">
                    <FileText size={18} className="text-muted-foreground" />
                    <h2 className="font-semibold text-foreground">Recent Invoices</h2>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="p-4 font-semibold text-muted-foreground">Invoice #</th>
                            <th className="p-4 font-semibold text-muted-foreground">Date</th>
                            <th className="p-4 font-semibold text-muted-foreground">Client / Requested By</th>
                            <th className="p-4 font-semibold text-muted-foreground">Amount</th>
                            <th className="p-4 font-semibold text-muted-foreground">Status</th>
                            <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading invoices...</td></tr>
                        ) : invoices.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No invoices found.</td></tr>
                        ) : (
                            invoices.map((inv: any) => (
                                <tr key={inv._id} className="hover:bg-muted/50">
                                    <td className="p-4 font-medium text-primary">{inv.invoiceNumber}</td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {new Date(inv.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 text-sm text-foreground">{inv.clientName}</td>
                                    <td className="p-4 font-bold text-foreground">₹{inv.totalAmount.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-bold">
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => downloadInvoice(inv._id, inv.invoiceNumber)}
                                            className="flex items-center gap-1 text-muted-foreground hover:text-primary ml-auto"
                                        >
                                            <Download size={16} /> <span className="text-sm">Download</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
