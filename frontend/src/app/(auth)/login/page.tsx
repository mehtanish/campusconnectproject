'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Activity, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
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
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md glass-card p-8 space-y-6 shadow-2xl relative">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30">
              <UserCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Student Portal Sign In
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Sign in with your registered PICT Student Credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                Student Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. arjun@pict.edu"
                className="w-full text-xs p-3.5 bg-slate-950/60 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Password
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
              <span>{isSubmitting ? 'Signing in...' : 'Sign In to Student Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Helper */}
          <div className="border-t border-[var(--border-color)] pt-4 space-y-2 text-center">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Student Quick Demo
            </span>
            <div className="flex justify-center text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setEmail('arjun@pict.edu');
                  setPassword('password123');
                }}
                className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg hover:bg-indigo-500/20 border border-indigo-500/20 font-semibold"
              >
                Auto-fill Demo Student (Arjun)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border-color)]">
            <span className="text-[var(--text-secondary)]">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-indigo-400 hover:underline">
                Register
              </Link>
            </span>
            <Link href="/admin/login" className="font-bold text-cyan-400 hover:underline">
              Admin / Staff Portal →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

