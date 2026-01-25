'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const res = await api.post('/auth/login', { phone, password });
      const { token, role } = res.data;

      if (role !== 'Owner' && role !== 'Manager') {
        setError('Access restricted to management personnel.');
        setIsLoading(false);
        return;
      }

      Cookies.set('token', token);
      Cookies.set('role', role);

      router.push('/dashboard');

    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed.');
      setIsLoading(false);
    }
  };

  // Animation variants for the background lines
  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 0.3,
      transition: {
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse" as const,
        repeatDelay: 1
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans text-white selection:bg-yellow-500/30">

      {/* --- Background Effects: "The AI Architect" --- */}

      {/* 1. Deep Void Gradient */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-[#050505] to-[#050505]" />

      {/* 2. Base Blueprint Grid */}
      <div className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* 3. Generative Floor Plan Animation */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-30">
          {[...Array(15)].map((_, i) => (
            <motion.rect
              key={i}
              x={`${Math.random() * 100}%`}
              y={`${Math.random() * 100}%`}
              width={`${50 + Math.random() * 200}`}
              height={`${50 + Math.random() * 200}`}
              fill="none"
              stroke={i % 2 === 0 ? "#FACC15" : "#555"} // Yellow or Grey lines
              strokeWidth={Math.random() * 1.5 + 0.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 1, 1],
                opacity: [0, 1, 1, 0],
                fill: ["rgba(250, 204, 21, 0)", "rgba(250, 204, 21, 0)", "rgba(250, 204, 21, 0.05)", "rgba(250, 204, 21, 0)"]
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5,
                repeatDelay: Math.random() * 3
              }}
            />
          ))}

          {/* Connecting Nodes/Measurements */}
          {[...Array(20)].map((_, i) => (
            <motion.circle
              key={`dot-${i}`}
              cx={`${Math.random() * 100}%`}
              cy={`${Math.random() * 100}%`}
              r="2"
              fill="#FACC15"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
            />
          ))}
        </svg>
      </div>

      {/* 4. Scanning "Analysis" Bar */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none border-b border-yellow-500/20 w-full h-[1px] shadow-[0_0_20px_rgba(250,204,21,0.2)]"
        initial={{ top: '-10%' }}
        animate={{ top: '110%' }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* 5. Vignette Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] opacity-80" />
      <motion.div
        className="absolute bottom-20 right-20 w-48 h-48 border border-white/10 rounded-full z-0"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />


      {/* --- Login Card --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8"
      >
        {/* Glassmorphism Card */}
        <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl" />

        <div className="relative z-20 flex flex-col items-center">
          {/* Logo Section */}
          <motion.div
            className="mb-8 p-4 bg-[#161616] rounded-2xl border-2 border-yellow-400/50 shadow-[0_0_40px_rgba(250,204,21,0.3)] overflow-hidden"
            whileHover={{ scale: 1.05, borderColor: "#FACC15", boxShadow: "0 0 60px rgba(250,204,21,0.5)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-web.jpg" alt="Construx Logo" className="h-16 w-16 object-contain" />
          </motion.div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h1>
            <p className="text-zinc-400 text-sm mt-2">Enter your credentials to access the workspace</p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-zinc-500 group-focus-within:text-yellow-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 bg-black/40 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500 group-focus-within:text-yellow-500 transition-colors" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-10 pr-3 py-3 bg-black/40 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-yellow-500/20 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>

      {/* Footer / Version */}
      <div className="absolute bottom-6 text-zinc-600 text-xs font-mono">
        CONSTRUX FIELD MANAGEMENT // v2.4.0
      </div>
    </div>
  );
}
