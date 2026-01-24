'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Chart, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    BarController,
    LineController,
    ArcElement
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    BarController,
    LineController,
    ArcElement
);

import { Card } from '@/components/ui/card';
import {
    Users,
    ClipboardList,
    Pickaxe,
    ChevronDown,
    Activity,
    TrendingUp,
    Zap,
    Target,
    AlertTriangle,
    CheckCircle2,
    PieChart,
    Trophy,
    CalendarClock,
    Clock,
    Hammer,
    CircleDollarSign,
    HardHat
} from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();

    // --- State ---
    const [stats, setStats] = useState({
        attendanceCount: 0,
        tasksPending: 0,
        tasksCompleted: 0,
        totalLogs: 0,
        materialRequests: 0,
        pendingMaterials: 0,
        urgentRequests: 0
    });

    const [businessKPIs, setBusinessKPIs] = useState({
        totalSpent: 0,    // REPLACED Burn Rate
        weeklyOutput: 0,  // REPLACED Velocity
        efficiency: 0,
        healthScore: 100,
        completionRate: 0, // REPLACED Forecast
        otp: 0,
        activeWorkers: 0  // REPLACED Utilization
    });

    const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
    const [urgentItems, setUrgentItems] = useState<any[]>([]);
    const [projects, setProjects] = useState<string[]>([]);
    const [selectedProject, setSelectedProject] = useState('All Projects');
    const [unifiedChartData, setUnifiedChartData] = useState<any>(null);
    const [costBreakdownData, setCostBreakdownData] = useState<any>(null);

    const [taskStatusData, setTaskStatusData] = useState<any>(null); // REPLACED workerStats
    const [rawData, setRawData] = useState<{ tasks: any[], requests: any[], attendance: any[] }>({ tasks: [], requests: [], attendance: [] });

    // --- Effects ---
    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (rawData.tasks.length > 0) {
            updateDashboard(rawData.tasks, rawData.requests, rawData.attendance, selectedProject);
        }
    }, [selectedProject, rawData]);

    // --- Data Fetching ---
    const fetchData = async () => {
        try {
            const [attRes, tasksRes, logsRes, reqRes] = await Promise.all([
                api.get('/attendance'),
                api.get('/tasks'),
                api.get('/reports'),
                api.get('/requests')
            ]);

            const tasks = tasksRes.data;
            const requests = reqRes.data;
            const attendance = attRes.data;

            setRawData({ tasks, requests, attendance });

            const locations = new Set<string>();
            tasks.forEach((t: any) => t.siteLocation?.address && locations.add(t.siteLocation.address));
            requests.forEach((r: any) => r.siteLocation?.address && locations.add(r.siteLocation.address));
            setProjects(Array.from(locations));

        } catch (error: any) {
            console.error(error);
            if (error.response?.status === 401) {
                router.push('/login');
            }
        }
    };

    // --- Dashboard Logic ---
    const updateDashboard = (tasks: any[], requests: any[], attendance: any[], project: string) => {
        const isAll = project === 'All Projects';

        const filteredTasks = isAll ? tasks : tasks.filter((t: any) => t.siteLocation?.address === project);
        const filteredRequests = isAll ? requests : requests.filter((r: any) => r.siteLocation?.address === project);
        const filteredAttendance = isAll ? attendance : attendance.filter((a: any) => a.checkInLocation?.address === project);

        const pendingReqs = filteredRequests.filter((m: any) => m.status === 'Pending');
        const urgentReqs = filteredRequests.filter((m: any) => m.status === 'Pending' && (m.urgency === 'High' || m.urgency === 'Critical'));

        setStats({
            attendanceCount: filteredAttendance.length,
            tasksPending: filteredTasks.filter((t: any) => t.status === 'Pending').length,
            tasksCompleted: filteredTasks.filter((t: any) => t.status === 'Completed').length,
            totalLogs: 0,
            materialRequests: filteredRequests.length,
            pendingMaterials: pendingReqs.length,
            urgentRequests: urgentReqs.length
        });

        setRecentMaterials(filteredRequests.slice(0, 5));
        setUrgentItems(urgentReqs.slice(0, 5));

        // --- KPIs ---
        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        // 1. Total Spent (Cumulative)
        const allApprovedRequests = filteredRequests.filter((r: any) =>
            (r.status === 'Approved' || r.status === 'Fulfilled')
        );
        const totalSpent = allApprovedRequests.reduce((sum: number, r: any) => sum + (r.payment?.amount || 0), 0);

        // 2. Weekly Output (Tasks Last 7 Days)
        const recentCompletedTasks = filteredTasks.filter((t: any) =>
            t.status === 'Completed' &&
            t.completedAt &&
            new Date(t.completedAt) >= sevenDaysAgo
        );
        const weeklyOutput = recentCompletedTasks.length;
        const velocity = weeklyOutput / 7; // Keep for internal calc if needed

        // 3. Efficiency
        const totalCompleted = filteredTasks.filter((t: any) => t.status === 'Completed').length;
        const efficiency = totalCompleted > 0 ? totalSpent / totalCompleted : 0;

        // 4. Health Score
        let health = 100;
        if (urgentReqs.length > 0) health -= (urgentReqs.length * 10);
        if (stats.tasksPending > 20) health -= 10;
        health = Math.max(0, health);

        // 5. Completion Rate (Replaced Forecast)
        const totalTasks = filteredTasks.length;
        const completedCount = filteredTasks.filter((t: any) => t.status === 'Completed').length;
        const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

        // 6. On-Time Performance (OTP)
        const completedTasks = filteredTasks.filter((t: any) => t.status === 'Completed');
        const onTimeTasks = completedTasks.filter((t: any) => {
            if (!t.deadline || !t.completedAt) return true;
            return new Date(t.completedAt) <= new Date(t.deadline);
        });
        const otp = completedTasks.length > 0 ? (onTimeTasks.length / completedTasks.length) * 100 : 100;

        // 7. Active Workers (Attendance)
        const activeWorkers = filteredAttendance.length;

        setBusinessKPIs({
            totalSpent,
            weeklyOutput,
            efficiency,
            healthScore: health,
            completionRate,
            otp,
            activeWorkers
        });

        // --- Unified Chart Data ---
        const dateMap = new Map<string, { cost: number, tasksCompleted: number, tasksCreated: number }>();

        const addToMap = (dateStr: string, type: 'cost' | 'tasksCompleted' | 'tasksCreated', value: number) => {
            if (!dateMap.has(dateStr)) {
                dateMap.set(dateStr, { cost: 0, tasksCompleted: 0, tasksCreated: 0 });
            }
            const entry = dateMap.get(dateStr)!;
            entry[type] += value;
        };

        filteredRequests.forEach((r: any) => {
            if (r.status === 'Approved' || r.status === 'Fulfilled') {
                addToMap(new Date(r.createdAt).toLocaleDateString(), 'cost', r.payment?.amount || 0);
            }
        });

        filteredTasks.forEach((t: any) => {
            addToMap(new Date(t.createdAt).toLocaleDateString(), 'tasksCreated', 1);
            if (t.status === 'Completed' && t.completedAt) {
                addToMap(new Date(t.completedAt).toLocaleDateString(), 'tasksCompleted', 1);
            }
        });

        const sortedDates = Array.from(dateMap.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        const labels: string[] = [];
        const costData: number[] = [];
        const progressData: number[] = [];

        let runningCost = 0;
        let runningTasks = 0;

        sortedDates.forEach(date => {
            const entry = dateMap.get(date)!;
            runningCost += entry.cost;
            runningTasks += entry.tasksCompleted;

            labels.push(date);
            costData.push(runningCost);
            progressData.push(runningTasks);
        });

        setUnifiedChartData({
            labels,
            datasets: [
                {
                    type: 'line' as const,
                    label: 'Cumulative Cost (₹)',
                    data: costData,
                    borderColor: '#EF4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    yAxisID: 'y',
                    tension: 0.4,
                    fill: true,
                    order: 2
                },
                {
                    type: 'bar' as const,
                    label: 'Completed Tasks',
                    data: progressData,
                    backgroundColor: '#3B82F6',
                    borderColor: '#3B82F6',
                    yAxisID: 'y1',
                    order: 1,
                    barThickness: 10,
                    borderRadius: 4
                }
            ]
        });

        // --- Cost Breakdown Data (Doughnut) ---
        const categoryMap = new Map<string, number>();
        filteredRequests.forEach((r: any) => {
            if (r.status === 'Approved' || r.status === 'Fulfilled') {
                const itemName = r.items[0]?.name || 'Other';
                const amount = r.payment?.amount || 0;
                categoryMap.set(itemName, (categoryMap.get(itemName) || 0) + amount);
            }
        });

        const sortedCategories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5); // Top 5
        setCostBreakdownData({
            labels: sortedCategories.map(c => c[0]),
            datasets: [{
                data: sortedCategories.map(c => c[1]),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)', // Blue
                    'rgba(16, 185, 129, 0.8)', // Green
                    'rgba(249, 115, 22, 0.8)', // Orange
                    'rgba(239, 68, 68, 0.8)',  // Red
                    'rgba(139, 92, 246, 0.8)', // Purple
                ],
                borderWidth: 0
            }]
        });

        // --- Task Status Distribution (Pie) ---
        const statusCounts = { Pending: 0, 'In Progress': 0, Completed: 0, Review: 0 };
        filteredTasks.forEach((t: any) => {
            const status = t.status || 'Pending';
            if (statusCounts[status as keyof typeof statusCounts] !== undefined) {
                statusCounts[status as keyof typeof statusCounts]++;
            } else {
                statusCounts['Pending']++;
            }
        });

        setTaskStatusData({
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',   // Pending (Red)
                    'rgba(59, 130, 246, 0.8)',  // In Progress (Blue)
                    'rgba(16, 185, 129, 0.8)',  // Completed (Green)
                    'rgba(249, 115, 22, 0.8)',  // Review (Orange)
                ],
                borderWidth: 0
            }]
        });
    };

    const chartOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: { position: 'top', labels: { usePointStyle: true } },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13 },
                bodyFont: { size: 12 }
            }
        },
        scales: {
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: { display: true, text: 'Cumulative Cost (₹)' },
                grid: { color: 'rgba(0,0,0,0.05)' }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: { display: true, text: 'Tasks Completed' },
                grid: { drawOnChartArea: false }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    return (
        <div className="min-h-screen p-4 space-y-4">

            {/* --- Bento Grid Container --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* 1. Header (Span 4) */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/50 backdrop-blur-md p-6 rounded-2xl border border-border/50 shadow-sm">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                            Command Center
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Business Intelligence & Real-time Monitoring
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
                            <ChevronDown size={16} />
                        </div>
                        <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="h-10 pl-4 pr-10 rounded-lg border border-border bg-background text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none min-w-[220px]"
                        >
                            <option value="All Projects">All Projects</option>
                            {projects.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>

                {/* 2. KPIs Container (Span 4) - Internal Grid for 6 items */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <KPICard
                        title="Total Spent"
                        value={`₹${Math.round(businessKPIs.totalSpent).toLocaleString()}`}
                        subtext="Cumulative"
                        icon={CircleDollarSign}
                        color="text-red-500"
                        trend="Financials"
                    />
                    <KPICard
                        title="Weekly Output"
                        value={`${businessKPIs.weeklyOutput}`}
                        subtext="tasks (7d)"
                        icon={Zap}
                        color="text-blue-500"
                        trend="Velocity"
                    />
                    <KPICard
                        title="Efficiency"
                        value={`₹${Math.round(businessKPIs.efficiency).toLocaleString()}`}
                        subtext="per task"
                        icon={Target}
                        color="text-emerald-500"
                        trend="Avg Cost"
                    />
                    <KPICard
                        title="Progress"
                        value={`${Math.round(businessKPIs.completionRate)}%`}
                        subtext="tasks completed"
                        icon={CheckCircle2}
                        color="text-teal-500"
                        trend="Completion"
                    />
                    <KPICard
                        title="On-Time %"
                        value={`${Math.round(businessKPIs.otp)}%`}
                        subtext="deadline met"
                        icon={Clock}
                        color={businessKPIs.otp >= 90 ? "text-green-500" : "text-orange-500"}
                        trend="Punctuality"
                    />
                    <KPICard
                        title="Active Workers"
                        value={`${businessKPIs.activeWorkers}`}
                        subtext="on-site today"
                        icon={HardHat}
                        color="text-indigo-500"
                        trend="Workforce"
                    />
                </div>

                {/* 3. Unified Chart (Span 3, Row 2) */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-3 row-span-2 p-6 border-none shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <TrendingUp size={18} className="text-primary" />
                                Financial vs Time Progression
                            </h2>
                            <p className="text-xs text-muted-foreground">Correlation between spending and task completion</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-[300px]">
                        {unifiedChartData && unifiedChartData.labels.length > 0 ? (
                            <Chart type='bar' data={unifiedChartData} options={chartOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border">
                                No sufficient data for analytics
                            </div>
                        )}
                    </div>
                </Card>

                {/* 4. Live Monitoring (Span 1, Row 2) */}
                <div className="col-span-1 md:col-span-2 lg:col-span-1 row-span-2 flex flex-col gap-4 h-full">
                    {/* Active Alerts */}
                    <Card className="flex-1 p-5 border-none shadow-md bg-red-500/5 ring-1 ring-red-500/20 overflow-y-auto max-h-[300px]">
                        <div className="flex items-center justify-between mb-4 sticky top-0 bg-transparent">
                            <h3 className="font-bold text-red-600 flex items-center gap-2">
                                <AlertTriangle size={18} />
                                Urgent Alerts
                            </h3>
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{stats.urgentRequests}</span>
                        </div>
                        <div className="space-y-3">
                            {urgentItems.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic">No urgent issues.</p>
                            ) : urgentItems.map((item: any) => (
                                <div key={item._id} className="bg-background/80 p-3 rounded-lg border border-red-100 shadow-sm text-sm">
                                    <p className="font-medium text-foreground">{item.items[0]?.name}</p>
                                    <p className="text-xs text-red-500 font-semibold mt-1">
                                        {item.urgency} • {item.siteLocation?.address || 'Unknown Loc'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Site Status */}
                    <Card className="flex-1 p-5 border-none shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold flex items-center gap-2">
                                <Users size={18} className="text-blue-500" />
                                Site Status
                            </h3>
                            <span className="text-xs font-medium text-green-500 flex items-center gap-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                Live
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-2">
                            <div className="bg-muted/30 p-3 rounded-xl text-center">
                                <p className="text-2xl font-bold text-foreground">{stats.attendanceCount}</p>
                                <p className="text-xs text-muted-foreground">Active Workers</p>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-xl text-center">
                                <p className="text-2xl font-bold text-foreground">{stats.tasksPending}</p>
                                <p className="text-xs text-muted-foreground">Pending Tasks</p>
                            </div>
                        </div>
                        <button onClick={() => router.push('/attendance')} className="w-full text-xs font-medium bg-primary/10 text-primary py-2 rounded-lg hover:bg-primary/20 transition-colors">
                            View Attendance Log
                        </button>
                    </Card>
                </div>

                {/* 5. Deep Dive Analytics (Span 4, Row 1) */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Cost Breakdown */}
                    <Card className="p-6 border-none shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <PieChart size={18} className="text-purple-500" />
                                Cost Breakdown
                            </h2>
                            <p className="text-xs text-muted-foreground">Top 5 spending categories</p>
                        </div>
                        <div className="h-[200px] flex items-center justify-center">
                            {costBreakdownData && costBreakdownData.labels.length > 0 ? (
                                <Doughnut
                                    data={costBreakdownData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } }
                                    }}
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground">No spending data yet</p>
                            )}
                        </div>
                    </Card>

                    {/* Task Status Distribution */}
                    <Card className="p-6 border-none shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <ClipboardList size={18} className="text-blue-500" />
                                Task Status
                            </h2>
                            <p className="text-xs text-muted-foreground">Current workload distribution</p>
                        </div>
                        <div className="h-[200px] flex items-center justify-center">
                            {taskStatusData ? (
                                <Doughnut
                                    data={taskStatusData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } }
                                    }}
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground">No task data available</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* 6. Recent Activity (Span 4) */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-4 p-6 border-none shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold">Recent Material Requisitions</h2>
                        <button onClick={() => router.push('/materials')} className="text-sm text-primary hover:underline">View All</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentMaterials.map((m: any) => (
                            <div key={m._id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
                                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                                    <Pickaxe size={18} className="text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{m.items[0]?.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{m.siteLocation?.address}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${m.status === 'Approved' ? 'bg-green-500/10 text-green-600' :
                                    m.status === 'Rejected' ? 'bg-red-500/10 text-red-600' :
                                        'bg-orange-500/10 text-orange-600'
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

function KPICard({ title, value, subtext, icon: Icon, color, trend }: any) {
    return (
        <Card className="col-span-1 p-5 border-none shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50 hover:ring-primary/30 transition-all h-full flex flex-col justify-between">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
                    {subtext && <p className="text-xs text-muted-foreground mt-0.5">{subtext}</p>}
                </div>
                <div className={`p-2.5 rounded-xl bg-background shadow-sm ${color}`}>
                    <Icon size={20} />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
                <span className="text-[10px] font-semibold bg-muted px-2 py-0.5 rounded-md text-muted-foreground uppercase tracking-wide">
                    {trend}
                </span>
            </div>
        </Card>
    )
}
