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
            <h1 className="text-2xl font-bold text-foreground pr-20">Daily Progress Reports</h1>

            <div className="grid grid-cols-1 gap-6">
                {reports.map((report: any) => (
                    <div key={report._id} className="bg-card p-6 rounded-lg shadow border border-border">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">{report.type || 'DPR'} - {new Date(report.date).toLocaleDateString()}</h2>
                                <p className="text-muted-foreground">Submitted by: {report.submittedBy?.name}</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs font-medium">
                                {report.status || 'Submitted'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-foreground">Work Summary</h3>
                                <p className="text-muted-foreground bg-muted/50 p-3 rounded">{report.workSummary}</p>
                            </div>

                            {report.type !== 'WorkerLog' && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-foreground">Metrics</h3>
                                    <div className="flex gap-4">
                                        <div className="bg-muted/50 p-3 rounded flex-1">
                                            <span className="text-xs text-muted-foreground block">Labor Count</span>
                                            <span className="font-bold text-foreground">{report.laborCount}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {report.issuesRaised && (
                            <div className="mt-4">
                                <h3 className="font-semibold text-destructive">Issues Raised</h3>
                                <p className="text-destructive bg-destructive/10 p-3 rounded mt-1">{report.issuesRaised}</p>
                            </div>
                        )}

                        {report.photos && report.photos.length > 0 && (
                            <div className="mt-4">
                                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <ImageIcon size={18} /> Photos
                                </h3>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {report.photos.map((photo: any, idx: number) => {
                                        const isAbsolute = photo.url && photo.url.startsWith('http');
                                        const src = isAbsolute ? photo.url : `https://fb-quasar.vercel.app/${photo.url?.replace(/\\/g, '/')}`;
                                        return (
                                            <div key={idx} className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden border border-border">
                                                <img src={src} alt="Report" className="object-cover w-full h-full" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
