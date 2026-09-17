'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Lock, Mail, User as UserIcon, Hash, ArrowRight, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await register({ name, email, rollNo, password, role: 'STUDENT' });
      toast.success('Student account created successfully!');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Student Registration
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Create your official PICT student account to file complaints and track issues
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-indigo-400" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Sharma"
                className="w-full text-xs p-3.5 bg-slate-950/60 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                PICT Campus Email
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
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
                Student Roll Number / Registration ID
              </label>
              <input
                type="text"
                required
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="e.g. CS2024001"
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
                minLength={6}
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
              <span>{isSubmitting ? 'Creating Account...' : 'Register Student Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-4">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-indigo-400 hover:underline">
              Sign in to Student Portal
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

