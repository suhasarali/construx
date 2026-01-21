'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';

export default function Materials() {
  const [requisitions, setRequisitions] = useState([]);

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      const res = await api.get('/materials');
      setRequisitions(res.data);
    } catch (error) { console.error(error); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
        await api.put(`/materials/${id}/status`, { status });
        fetchRequisitions();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-black">Materials Management</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requisitions.map((req: any) => (
                <tr key={req._id}>
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{req.items[0]?.name}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{req.items[0]?.quantity} {req.items[0]?.unit}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{req.requestedBy?.name}</td>
                  <td className="py-4 px-6 text-sm font-bold text-gray-900">{req.status}</td>
                  <td className="py-4 px-6 text-sm font-medium space-x-2">
                    {req.status === 'Requested' && (
                        <>
                            <button onClick={() => updateStatus(req._id, 'Approved')} className="text-green-600 hover:text-green-900">Approve</button>
                            <button onClick={() => updateStatus(req._id, 'Rejected')} className="text-red-600 hover:text-red-900">Reject</button>
                        </>
                    )}
                    {req.status === 'Approved' && (
                        <button onClick={() => updateStatus(req._id, 'Delivered')} className="text-blue-600 hover:text-blue-900">Mark Delivered</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
