'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { GlowCard } from '@/components/ui/GlowCard';
import { Input } from '@/components/ui/Input';
import { CartoonPlaneBackground } from '@/components/background/CartoonPlaneBackground';

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
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      toast.error(errorObj.response?.data?.error || 'Admin login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 cyber-grid-bg relative overflow-hidden">
      <CartoonPlaneBackground />
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <GlowCard glowColor="rgba(139, 92, 246, 0.25)" className="w-full max-w-md p-8 space-y-6 shadow-2xl border-violet-500/30">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-violet-500/30 border border-violet-300/30">
              <Shield className="w-7 h-7 text-violet-200" />
            </div>
            <h2 className="text-2xl font-display font-extrabold text-white">
              Admin & Staff Portal
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Official PICT Campus Authority Authentication
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                Staff Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="super.admin@pict.edu"
                icon={<Mail className="w-4 h-4 text-cyan-400" />}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold text-slate-300">
                Admin Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4 text-cyan-400" />}
              />
            </div>

            <Button
              type="submit"
              variant="cyber"
              size="lg"
              isLoading={isSubmitting}
              className="w-full gap-2 mt-2"
            >
              <span>Sign In as Staff / Admin</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Staff Credentials Helper */}
          <div className="border-t border-slate-800 pt-4 space-y-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
              <AlertCircle className="w-3 h-3" />
              <span>Official Admin Credentials</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@campusconnect.edu');
                  setPassword('YourAdminPassword123!');
                }}
                className="px-3 py-1.5 bg-cyan-500/10 text-cyan-300 rounded-xl hover:bg-cyan-500/20 border border-cyan-500/30 font-mono cursor-pointer transition-colors"
              >
                Production Admin (admin@campusconnect.edu)
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 font-mono pt-2 border-t border-slate-800">
            Are you a student?{' '}
            <Link href="/login" className="font-bold text-cyan-400 hover:underline">
              Go to Student Login
            </Link>
          </div>
        </GlowCard>
      </main>
    </div>
  );
}
