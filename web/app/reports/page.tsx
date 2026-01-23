'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { FileText, Image as ImageIcon } from 'lucide-react';

export default function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await api.get('/reports');
            setReports(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Daily Progress Reports</h1>

            <div className="grid grid-cols-1 gap-6">
                {reports.map((report: any) => (
                    <div key={report._id} className="bg-white p-6 rounded-lg shadow border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-bold">{report.type || 'DPR'} - {new Date(report.date).toLocaleDateString()}</h2>
                                <p className="text-slate-500">Submitted by: {report.submittedBy?.name}</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {report.status || 'Submitted'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-700">Work Summary</h3>
                                <p className="text-slate-600 bg-slate-50 p-3 rounded">{report.workSummary}</p>
                            </div>
                            
                            {report.type !== 'WorkerLog' && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-slate-700">Metrics</h3>
                                    <div className="flex gap-4">
                                        <div className="bg-slate-50 p-3 rounded flex-1">
                                            <span className="text-xs text-slate-500 block">Labor Count</span>
                                            <span className="font-bold">{report.laborCount}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {report.issuesRaised && (
                            <div className="mt-4">
                                <h3 className="font-semibold text-red-600">Issues Raised</h3>
                                <p className="text-red-500 bg-red-50 p-3 rounded mt-1">{report.issuesRaised}</p>
                            </div>
                        )}
                        
                        {report.photos && report.photos.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <ImageIcon size={18} /> Photos
                                </h3>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {report.photos.map((photo: any, idx: number) => (
                                        <div key={idx} className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden border">
                                           {/* Use server URL for images if local */}
                                           <img src={photo.url ? `http://localhost:5000/${photo.url.replace(/\\/g, '/')}` : ''} alt="Report" className="object-cover w-full h-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
