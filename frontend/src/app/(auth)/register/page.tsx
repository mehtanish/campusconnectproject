'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Lock, Mail, User as UserIcon, Hash, ArrowRight, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { GlowCard } from '@/components/ui/GlowCard';
import { Input } from '@/components/ui/Input';

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
      await register({ name, email, rollNo, password });
      toast.success('Student account created successfully!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      toast.error(errorObj.response?.data?.error || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 cyber-grid-bg">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <GlowCard glowColor="rgba(6, 182, 212, 0.2)" className="w-full max-w-md p-8 space-y-6 shadow-2xl border-cyan-500/30">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/30 border border-cyan-300/30">
              <GraduationCap className="w-7 h-7 text-cyan-200" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-white">
              Student Registration
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Create your official PICT student account to file complaints and track issues
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                Full Name
              </label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Arjun Sharma"
                icon={<UserIcon className="w-4 h-4" />}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                PICT Campus Email
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arjun@pict.edu"
                icon={<Mail className="w-4 h-4" />}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                Student Roll Number / Registration ID
              </label>
              <Input
                type="text"
                required
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="CS2024001"
                icon={<Hash className="w-4 h-4" />}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                Password
              </label>
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
              />
            </div>

            <Button
              type="submit"
              variant="cyber"
              size="lg"
              isLoading={isSubmitting}
              className="w-full gap-2 mt-2"
            >
              <span>Register Student Account</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4 font-mono">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-cyan-400 hover:underline">
              Sign in to Student Portal
            </Link>
          </div>
        </GlowCard>
      </main>
    </div>
  );
}
