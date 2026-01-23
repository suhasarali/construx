'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { PenTool, Check, X } from 'lucide-react';

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

    const updateStatus = async (id: string, status: string) => {
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
        </div>
    );
}
