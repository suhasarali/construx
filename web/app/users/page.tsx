'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/api';
import { Plus, Search, Trash2, Edit2, Shield } from 'lucide-react';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Worker');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Need an endpoint to get all users. Often admins have a specific route
            // Or simple /auth/users if we implement it.
            // Let's assume GET /auth/users exists or I need to create it.
            // For now, I'll assume /auth/users is implemented on the backend.
            // Wait, I didn't verify if I created `getUsers` controller.
            // I checked `authController.js` previously, usually it has register/login.
            // I might need to add a getUsers method. 
            // I'll try calling it, if fails I'll fix backend.
            const res = await api.get('/auth/users'); 
            setUsers(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', {
                name,
                email, // Optional for worker but let's include
                phone,
                password,
                role
            });
            setShowModal(false);
            fetchUsers();
            resetForm();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed');
        }
    };

    const deleteUser = async (id: string) => {
        if(!confirm('Are you sure?')) return;
        try {
            await api.delete(`/auth/users/${id}`);
            fetchUsers();
        } catch (e) { alert('Failed to delete'); }
    }

    const resetForm = () => {
        setName(''); setPhone(''); setEmail(''); setPassword(''); setRole('Worker');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Team Management</h1>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <Plus size={18} /> Add Member
                </button>
            </div>

            <div className="bg-white rounded-lg shadowoverflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-slate-600">Name</th>
                            <th className="p-4 font-semibold text-slate-600">Role</th>
                            <th className="p-4 font-semibold text-slate-600">Role</th>
                            <th className="p-4 font-semibold text-slate-600">Contact</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {users.map((user: any) => (
                            <tr key={user._id} className="hover:bg-slate-50">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-xs text-slate-500">{user.email}</div>
                                    </div>
                                </td>
                                <td className="p-4">
                                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        user.role === 'Manager' ? 'bg-purple-100 text-purple-700' :
                                        user.role === 'Site_Engineer' ? 'bg-orange-100 text-orange-700' :
                                        'bg-green-100 text-green-700'
                                     }`}>
                                        {user.role}
                                     </span>
                                </td>
                                <td className="p-4 text-slate-600">{user.phone}</td>
                                <td className="p-4 text-slate-600 text-right">
                                    <button onClick={() => deleteUser(user._id)} className="text-red-500 hover:text-red-700 p-2">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add Team Member</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <input className="w-full p-2 border rounded" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} required />
                            <input className="w-full p-2 border rounded" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} required />
                            <input className="w-full p-2 border rounded" placeholder="Email (Optional)" value={email} onChange={e=>setEmail(e.target.value)} />
                             <input className="w-full p-2 border rounded" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
                             
                             <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <select className="w-full p-2 border rounded bg-white" value={role} onChange={e=>setRole(e.target.value)}>
                                    <option value="Worker">Worker</option>
                                    <option value="Site_Engineer">Site Engineer</option>
                                    <option value="Manager">Manager</option>
                                </select>
                             </div>

                             <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create</button>
                             </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
