'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import Cookies from 'js-cookie';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { phone, password });
      const { token, role } = res.data;

      if (role !== 'Owner' && role !== 'Manager') {
        setError('Unauthorized access. Owner/Manager only.');
        return;
      }

      Cookies.set('token', token);
      Cookies.set('role', role);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <div className="bg-card p-8 rounded shadow-md w-full max-w-md border border-border">
        <h1 className="text-2xl font-bold mb-6 text-center text-foreground">Construx Admin</h1>
        {error && <p className="text-destructive mb-4 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Phone Number"
            className="p-2 border border-input rounded bg-background text-foreground placeholder:text-muted-foreground"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 border border-input rounded bg-background text-foreground placeholder:text-muted-foreground"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90 font-medium">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
