'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Send, MessageSquare, AlertTriangle } from 'lucide-react';

export default function MessagesPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // New Message Form
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState('Normal');
    const [targetRole, setTargetRole] = useState('All'); // Worker, Site_Engineer, etc.

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

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Communication Center</h1>

            {/* Broadcast Form */}
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Send size={20} /> Send Broadcast</h2>
                <form onSubmit={handleSend} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder=" e.g., Site Safety Alert" value={title} onChange={e=>setTitle(e.target.value)} required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={priority} onChange={e=>setPriority(e.target.value)}>
                                <option value="Normal">Normal</option>
                                <option value="Urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message Content</label>
                        <textarea className="w-full border p-2 rounded h-32 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Type your broadcast message here..." value={content} onChange={e=>setContent(e.target.value)} required />
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="w-full md:w-auto">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                            <select className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={targetRole} onChange={e=>setTargetRole(e.target.value)}>
                                <option value="All">All Staff (Broadcast)</option>
                                <option value="Worker">Workers Only</option>
                                <option value="Site_Engineer">Engineers Only</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2">
                            <Send size={18} />
                            Send Broadcast
                        </button>
                    </div>
                </form>
            </div>

            {/* Message History / Queries */}
            <div className="bg-white rounded-lg shadow overflow-hidden p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><MessageSquare size={20} /> History & Queries</h2>
                <div className="space-y-4">
                    {messages.map((msg: any) => (
                        <div key={msg._id} className={`p-4 rounded border ${msg.priority === 'Urgent' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                            <div className="flex justify-between mb-2">
                                <h3 className="font-bold text-slate-800">{msg.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">{new Date(msg.createdAt).toLocaleString()}</span>
                                    {msg.priority === 'Urgent' && <AlertTriangle size={16} className="text-red-500" />}
                                </div>
                            </div>
                            <p className="text-slate-700">{msg.content}</p>
                            <div className="mt-2 text-xs text-slate-500">
                                Sent by: {msg.sender?.name || 'System'} | To: {msg.targetRoles?.join(', ')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
