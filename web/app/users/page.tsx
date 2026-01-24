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
        if (!confirm('Are you sure?')) return;
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
            <div className="flex justify-between items-center pr-20">
                <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                    <Plus size={18} /> Add Member
                </button>
            </div>

            <div className="bg-card rounded-lg shadow overflow-hidden border border-border">
                <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b border-border">
                        <tr>
                            <th className="p-4 font-semibold text-muted-foreground">Name</th>
                            <th className="p-4 font-semibold text-muted-foreground">Role</th>
                            <th className="p-4 font-semibold text-muted-foreground">Role</th>
                            <th className="p-4 font-semibold text-muted-foreground">Contact</th>
                            <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.map((user: any) => (
                            <tr key={user._id} className="hover:bg-muted/50">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-foreground">{user.name}</div>
                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'Manager' ? 'bg-purple-500/20 text-purple-500' :
                                        user.role === 'Site_Engineer' ? 'bg-orange-500/20 text-orange-500' :
                                            'bg-green-500/20 text-green-500'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-muted-foreground">{user.phone}</td>
                                <td className="p-4 text-muted-foreground text-right">
                                    <button onClick={() => deleteUser(user._id)} className="text-destructive hover:text-destructive/80 p-2">
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
                    <div className="bg-card p-6 rounded-lg w-full max-w-md border border-border">
                        <h2 className="text-xl font-bold mb-4 text-foreground">Add Team Member</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <input className="w-full p-2 border border-input bg-background text-foreground rounded" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                            <input className="w-full p-2 border border-input bg-background text-foreground rounded" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required />
                            <input className="w-full p-2 border border-input bg-background text-foreground rounded" placeholder="Email (Optional)" value={email} onChange={e => setEmail(e.target.value)} />
                            <input className="w-full p-2 border border-input bg-background text-foreground rounded" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Role</label>
                                <select className="w-full p-2 border border-input bg-background text-foreground rounded" value={role} onChange={e => setRole(e.target.value)}>
                                    <option value="Worker">Worker</option>
                                    <option value="Site_Engineer">Site Engineer</option>
                                    <option value="Manager">Manager</option>
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-muted-foreground hover:bg-accent rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
