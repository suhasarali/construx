'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AttendancePage() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            // Need endpoint for all site attendance
            const res = await api.get('/attendance/site');
            setAttendance(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Attendance Overview</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Employee</th>
                            <th className="p-4 font-semibold text-slate-600">Role</th>
                            <th className="p-4 font-semibold text-slate-600">Date</th>
                            <th className="p-4 font-semibold text-slate-600">Status</th>
                            <th className="p-4 font-semibold text-slate-600">Check In</th>
                            <th className="p-4 font-semibold text-slate-600">Check Out</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {attendance.map((record: any) => (
                            <tr key={record._id} className="hover:bg-slate-50">
                                <td className="p-4 font-medium">{record.user?.name || 'Unknown'}</td>
                                <td className="p-4 text-sm text-slate-500">{record.user?.role}</td>
                                <td className="p-4 text-sm">{new Date(record.date).toLocaleDateString()}</td>
                                <td className="p-4">
                                     <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-medium ${
                                        record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                        record.status === 'Absent' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                     }`}>
                                        {record.status === 'Present' ? <CheckCircle size={12} /> : null}
                                        {record.status}
                                     </span>
                                </td>
                                <td className="p-4 text-sm">
                                    {record.checkInTime ? (
                                        <div className="flex items-center gap-2">
                                            <div className="text-slate-900">{new Date(record.checkInTime).toLocaleTimeString()}</div>
                                            {record.checkInLocation?.withinFence ? 
                                                <span title="On Site" className="w-2 h-2 rounded-full bg-green-500"></span> : 
                                                <span title="Off Site" className="w-2 h-2 rounded-full bg-red-500"></span>
                                            }
                                        </div>
                                    ) : '--'}
                                </td>
                                <td className="p-4 text-sm">{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '--'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
