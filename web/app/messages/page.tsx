'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Send, MessageSquare, AlertCircle, User, Clock, Filter, CheckCircle2 } from 'lucide-react';


export default function MessagesPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); // All, Urgent, Normal

    // New Message Form
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState('Normal');
    const [targetRole, setTargetRole] = useState('All');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/messages');
            setMessages(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/messages', {
                title,
                content,
                priority,
                targetRoles: targetRole === 'All' ? ['Worker', 'Site_Engineer', 'Manager'] : [targetRole],
                type: 'Broadcast'
            });
            setTitle(''); setContent('');
            fetchMessages();
        } catch (error) {
            alert('Failed to send message');
        }
    };

    const filteredMessages = messages.filter((msg: any) =>
        filter === 'All' ? true : msg.priority === filter
    );

    return (
        <div className="h-[calc(100vh-1rem)] bg-background/50 p-4 font-sans flex flex-col overflow-hidden">
            <div className="max-w-7xl mx-auto w-full h-full flex flex-col gap-4">

                {/* Header */}
                <div className="flex items-center justify-between shrink-0 px-1">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Communication Feed</h1>
                        <p className="text-muted-foreground text-sm mt-1">Real-time site updates and announcements.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 min-h-0">
                    {/* Left Column: Compose */}
                    <div className="lg:col-span-5">
                        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/10 rounded-full text-primary">
                                    <Send size={18} />
                                </div>
                                <h2 className="text-base font-semibold text-foreground">New Broadcast</h2>
                            </div>

                            <form onSubmit={handleSend} className="space-y-4">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Subject</label>
                                        <input
                                            className="w-full bg-transparent border-b border-border py-1.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
                                            placeholder="Enter subject..."
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority</label>
                                        <div className="flex gap-2">
                                            {['Normal', 'Urgent'].map((p) => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setPriority(p)}
                                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${priority === p
                                                        ? p === 'Urgent' ? 'bg-red-500/10 border-red-500/20 text-red-600' : 'bg-primary/10 border-primary/20 text-primary'
                                                        : 'bg-transparent border-border text-muted-foreground hover:bg-muted'
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Message</label>
                                        <textarea
                                            className="w-full bg-muted/30 border border-border/50 rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none min-h-[100px] resize-y transition-all"
                                            placeholder="Type your message..."
                                            value={content}
                                            onChange={e => setContent(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Recipients</label>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['All', 'Worker', 'Site_Engineer'].map((role) => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setTargetRole(role)}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all border ${targetRole === role
                                                        ? 'bg-foreground text-background border-foreground'
                                                        : 'bg-transparent border-border text-muted-foreground hover:border-foreground/50'
                                                        }`}
                                                >
                                                    {role === 'All' ? 'Everyone' : role.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
                                    >
                                        <span>Post Message</span>
                                        <Send size={14} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Feed */}
                    <div className="lg:col-span-7 h-full flex flex-col gap-4 min-h-0">
                        <div className="flex items-center justify-between bg-card/30 p-1 rounded-lg border border-border/50 w-fit shrink-0">
                            {['All', 'Urgent', 'Normal'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${filter === f
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            {loading ? (
                                <div className="text-center py-12 text-muted-foreground animate-pulse">Loading updates...</div>
                            ) : filteredMessages.length === 0 ? (
                                <div className="text-center py-16 text-muted-foreground bg-card/30 rounded-2xl border border-dashed border-border">
                                    <MessageSquare size={32} className="mx-auto mb-3 opacity-20" />
                                    <p>No messages found in this category.</p>
                                </div>
                            ) : (
                                filteredMessages.map((msg: any) => (
                                    <div
                                        key={msg._id}
                                        className={`group relative bg-card border border-border/50 rounded-xl p-5 transition-all hover:border-border hover:shadow-sm ${msg.priority === 'Urgent' ? 'border-l-4 border-l-red-500' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${msg.priority === 'Urgent' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                                                    }`}>
                                                    {msg.priority === 'Urgent' ? <AlertCircle size={20} /> : <User size={20} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-foreground text-base truncate">{msg.title}</h3>
                                                        {msg.priority === 'Urgent' && (
                                                            <span className="bg-red-500/10 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                                                Urgent
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                                                        {msg.content}
                                                    </p>

                                                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <User size={12} />
                                                            <span className="font-medium">{msg.sender?.name || 'System Admin'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Clock size={12} />
                                                            <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="ml-auto">
                                                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-1 rounded">
                                                                To: {msg.targetRoles?.join(', ').replace(/_/g, ' ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
