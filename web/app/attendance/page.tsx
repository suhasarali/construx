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
            <h1 className="text-2xl font-bold text-foreground pr-20">Attendance Overview</h1>

            <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="p-4 font-semibold text-muted-foreground">Employee</th>
                            <th className="p-4 font-semibold text-muted-foreground">Role</th>
                            <th className="p-4 font-semibold text-muted-foreground">Date</th>
                            <th className="p-4 font-semibold text-muted-foreground">Status</th>
                            <th className="p-4 font-semibold text-muted-foreground">Check In</th>
                            <th className="p-4 font-semibold text-muted-foreground">Check Out</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {attendance.map((record: any) => (
                            <tr key={record._id} className="hover:bg-muted/50">
                                <td className="p-4 font-medium text-foreground">{record.user?.name || 'Unknown'}</td>
                                <td className="p-4 text-sm text-muted-foreground">{record.user?.role}</td>
                                <td className="p-4 text-sm text-foreground">{new Date(record.date).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-medium ${record.status === 'Present' ? 'bg-green-500/20 text-green-500' :
                                        record.status === 'Absent' ? 'bg-red-500/20 text-red-500' :
                                            'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                        {record.status === 'Present' ? <CheckCircle size={12} /> : null}
                                        {record.status}
                                    </span>
                                </td>
                                <td className="p-4 text-sm text-foreground">
                                    {record.checkInTime ? (
                                        <div className="flex items-center gap-2">
                                            <div className="text-foreground">{new Date(record.checkInTime).toLocaleTimeString()}</div>
                                            {record.checkInLocation?.withinFence ?
                                                <span title="On Site" className="w-2 h-2 rounded-full bg-green-500"></span> :
                                                <span title="Off Site" className="w-2 h-2 rounded-full bg-red-500"></span>
                                            }
                                        </div>
                                    ) : '--'}
                                </td>
                                <td className="p-4 text-sm text-foreground">{record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '--'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
