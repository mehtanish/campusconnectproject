'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { GlowCard } from '@/components/ui/GlowCard';
import { Input } from '@/components/ui/Input';
import { CartoonPlaneBackground } from '@/components/background/CartoonPlaneBackground';

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
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      toast.error(errorObj.response?.data?.error || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 cyber-grid-bg relative overflow-hidden">
      <CartoonPlaneBackground />
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <GlowCard glowColor="rgba(6, 182, 212, 0.2)" className="w-full max-w-md p-8 space-y-6 shadow-2xl border-cyan-500/30">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/30 border border-cyan-300/30">
              <UserCheck className="w-7 h-7 text-cyan-200" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-white">
              Student Portal Sign In
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Sign in with your registered PICT Student Credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                Student Email Address
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
                Password
              </label>
              <Input
                type="password"
                required
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
              <span>Sign In to Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Demo Login Helper */}
          <div className="border-t border-slate-800 pt-4 space-y-2 text-center">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              Student Quick Demo
            </span>
            <div className="flex justify-center text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setEmail('arjun@pict.edu');
                  setPassword('password123');
                }}
                className="px-3.5 py-1.5 bg-cyan-500/10 text-cyan-300 rounded-xl hover:bg-cyan-500/20 border border-cyan-500/30 font-mono font-semibold transition-all cursor-pointer"
              >
                Auto-fill Demo Student (Arjun)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
            <span className="text-slate-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold text-cyan-400 hover:underline">
                Register
              </Link>
            </span>
            <Link href="/admin/login" className="font-bold text-violet-400 hover:underline">
              Admin Portal →
            </Link>
          </div>
        </GlowCard>
      </main>
    </div>
  );
}
