'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { Card } from '@/components/ui/card';
import { Users, ClipboardList, CheckCircle, FileText, Pickaxe, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    attendanceCount: 0,
    tasksPending: 0,
    tasksCompleted: 0,
    totalLogs: 0,
    materialRequests: 0,
    pendingMaterials: 0
  });

  const [recentMaterials, setRecentMaterials] = useState([]);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/login');
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attRes, tasksRes, logsRes, reqRes] = await Promise.all([
        api.get('/attendance'),
        api.get('/tasks'),
        api.get('/reports'), // logs was also removed/merged into reports? No, reports endpoint handles all.
        api.get('/requests')
      ]);

      setStats({
        attendanceCount: attRes.data.length,
        tasksPending: tasksRes.data.filter((t: any) => t.status === 'Pending').length,
        tasksCompleted: tasksRes.data.filter((t: any) => t.status === 'Completed').length,
        totalLogs: logsRes.data.length,
        materialRequests: reqRes.data.length,
        pendingMaterials: reqRes.data.filter((m: any) => m.status === 'Pending').length
      });

      setRecentMaterials(reqRes.data.slice(0, 5));
    } catch (error) {
      console.error(error);
    }
  };

  const chartData = {
    labels: ['Attendance', 'Pending Tasks', 'Daily Logs', 'Material Reqs'],
    datasets: [
      {
        label: 'Project Metrics',
        data: [stats.attendanceCount, stats.tasksPending, stats.totalLogs, stats.pendingMaterials],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // blue-500
          'rgba(249, 115, 22, 0.8)', // orange-500
          'rgba(16, 185, 129, 0.8)', // emerald-500
          'rgba(239, 68, 68, 0.8)',  // red-500
        ],
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your construction site status.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Attendance" value={stats.attendanceCount} icon={Users} color="text-blue-500" />
        <StatsCard title="Pending Tasks" value={stats.tasksPending} icon={ClipboardList} color="text-orange-500" />
        <StatsCard title="Material Requests" value={stats.pendingMaterials} subtext={`Total: ${stats.materialRequests}`} icon={Pickaxe} color="text-red-500" />
        <StatsCard title="Work Logs" value={stats.totalLogs} icon={FileText} color="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <Card className="col-span-1 lg:col-span-4 p-6">
            <h2 className="text-xl font-semibold mb-6">Activity Overview</h2>
            <div className="h-[300px]">
                <Bar 
                  data={chartData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    scales: {
                      y: { grid: { color: 'rgba(0,0,0,0.05)' } },
                      x: { grid: { display: false } }
                    }
                  }} 
                />
            </div>
        </Card>

        <Card className="col-span-1 lg:col-span-3 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Material Requests</h2>
                <button onClick={() => router.push('/materials')} className="text-sm text-blue-600 hover:underline">View All</button>
            </div>
            <div className="space-y-4">
                {recentMaterials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <Pickaxe className="h-8 w-8 mb-2 opacity-50" />
                        <p>No recent requests</p>
                    </div>
                ) : recentMaterials.map((m: any) => (
                    <div key={m._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                         <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full shadow-sm">
                                <Pickaxe size={16} className="text-slate-600" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">{m.items[0]?.name}</p>
                                <p className="text-xs text-muted-foreground">{m.items[0]?.quantity} {m.items[0]?.unit}</p>
                            </div>
                         </div>
                         <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            m.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                            m.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                            'bg-orange-100 text-orange-700'
                         }`}>
                            {m.status}
                         </span>
                    </div>
                ))}
            </div>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, subtext, icon: Icon, color }: any) {
    return (
        <Card className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
                    <p className="text-2xl font-bold mt-2">{value}</p>
                    {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
                </div>
                <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
            </div>
        </Card>
    )
}
