'use client';
'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList,
    Plus,
    Calendar,
    MapPin,
    User,
    Search,
    X,
    Loader2
} from 'lucide-react';

export default function TasksPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<any[]>([]);
    const [workers, setWorkers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        assignedTo: 'Anyone', // 'Anyone', 'Everyone', or Worker ID
        deadline: '',
        siteLocation: 'Site A'
    });

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, workersRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/users/workers')
            ]);
            setTasks(tasksRes.data);
            setWorkers(workersRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload: any = {
                title: newTask.title,
                description: newTask.description,
                priority: newTask.priority,
                deadline: newTask.deadline || new Date(Date.now() + 86400000).toISOString(),
                siteLocation: { address: newTask.siteLocation, lat: 0, lng: 0 } // Mock coords
            };

            if (newTask.assignedTo === 'Everyone') {
                payload.assignToAll = true;
            } else if (newTask.assignedTo === 'Anyone') {
                payload.assignedTo = null;
            } else {
                payload.assignedTo = newTask.assignedTo;
            }

            await api.post('/tasks', payload);
            setIsModalOpen(false);
            setNewTask({
                title: '',
                description: '',
                priority: 'Medium',
                assignedTo: 'Anyone',
                deadline: '',
                siteLocation: 'Site A'
            });
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Failed to create task:', error);
            alert('Failed to create task. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'Medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'Low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'In Progress': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            case 'Pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen p-6 space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/50 backdrop-blur-md p-6 rounded-2xl border border-border/50 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                        <ClipboardList className="text-primary" size={32} />
                        Task Management
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Assign, track, and manage field operations efficiently.
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary/25"
                >
                    <Plus size={20} />
                    Create New Task
                </motion.button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {['All', 'Pending', 'In Progress', 'Completed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${filterStatus === status
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-card/50 text-muted-foreground border-border hover:bg-accent'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode='popLayout'>
                        {filteredTasks.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="col-span-full flex flex-col items-center justify-center h-64 text-muted-foreground bg-card/30 rounded-2xl border border-dashed border-border"
                            >
                                <ClipboardList size={48} className="mb-4 opacity-20" />
                                <p>No tasks found matching your criteria.</p>
                            </motion.div>
                        ) : (
                            filteredTasks.map((task) => (
                                <motion.div
                                    key={task._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className="group p-5 border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 hover:border-primary/20 h-full flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                                                {task.status}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                                            {task.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                                            {task.description}
                                        </p>

                                        <div className="space-y-2 text-sm text-muted-foreground mt-auto">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-primary/70" />
                                                <span>
                                                    {task.assignedTo
                                                        ? task.assignedTo.name
                                                        : task.assignToAll
                                                            ? 'Everyone'
                                                            : 'Anyone (Open)'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-primary/70" />
                                                <span>{new Date(task.deadline).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-primary/70" />
                                                <span>{task.siteLocation?.address || 'No Location'}</span>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Create Task Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden"
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                                <h2 className="text-xl font-bold">Create New Task</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Task Title</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="e.g., Fix Wiring at Site B"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                        placeholder="Detailed instructions..."
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Priority</label>
                                        <select
                                            className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                        >
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Deadline</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={newTask.deadline}
                                            onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Assign To</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={newTask.assignedTo}
                                        onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                    >
                                        <option value="Anyone">Anyone (Open Task)</option>
                                        <option value="Everyone">Everyone (Broadcast)</option>
                                        <optgroup label="Specific Worker">
                                            {workers.map(w => (
                                                <option key={w._id} value={w._id}>{w.name}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                        placeholder="Site Address"
                                        value={newTask.siteLocation}
                                        onChange={(e) => setNewTask({ ...newTask, siteLocation: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-accent transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-5 py-2.5 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {submitting && <Loader2 className="animate-spin" size={18} />}
                                        Create Task
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
