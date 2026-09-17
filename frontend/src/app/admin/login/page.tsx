'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Shield, Lock, Mail, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await login({ email, password });
      toast.success('Admin authenticated successfully!');
      router.push('/admin');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Admin login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-card p-8 space-y-6 border border-indigo-500/30 shadow-2xl relative">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/40">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Admin & Staff Portal
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Official PICT Campus Authority Authentication
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                Staff Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. wifi.admin@pict.edu"
                className="w-full text-xs p-3.5 bg-slate-950/60 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-3.5 bg-slate-950/60 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-xs font-bold py-3.5 rounded-xl btn-kinetic flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In as Staff / Admin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Staff Credentials Helper */}
          <div className="border-t border-[var(--border-color)] pt-4 space-y-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              <AlertCircle className="w-3 h-3" />
              <span>Official Admin Accounts</span>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setEmail('wifi.admin@pict.edu');
                  setPassword('admin123');
                }}
                className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 border border-amber-500/30"
              >
                WiFi Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('super.admin@pict.edu');
                  setPassword('superadmin123');
                }}
                className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 border border-cyan-500/30"
              >
                Super Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-[var(--text-secondary)]">
            Are you a student?{' '}
            <Link href="/login" className="font-semibold text-indigo-400 hover:underline">
              Go to Student Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
