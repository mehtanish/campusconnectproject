'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { GlowCard } from '@/components/ui/GlowCard';
import { Input } from '@/components/ui/Input';
import { CartoonPlaneBackground } from '@/components/background/CartoonPlaneBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Please enter your registered PICT student email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address format (e.g. name@pict.edu).';
    }

    if (!password) {
      newErrors.password = 'Password is required to authenticate.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setErrors({});
      const loggedUser = await login({ email: email.trim(), password });
      if (loggedUser.role !== 'STUDENT') {
        toast.success('Admin authenticated successfully!');
        router.push('/admin');
      } else {
        toast.success('Logged in successfully!');
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      const message = errorObj.response?.data?.error || 'Authentication failed. Please verify your credentials.';
      setErrors({ general: message });
      toast.error(message);
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
              <UserCheck className="w-7 h-7 text-cyan-200" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-white">
              Student Portal Sign In
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Sign in with your registered PICT Student Credentials
            </p>
          </div>

          {errors.general && (
            <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" aria-hidden="true" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label htmlFor="student-email" className="text-xs font-mono font-semibold text-slate-300">
                Student Email Address
              </label>
              <Input
                id="student-email"
                type="email"
                required
                value={email}
                error={errors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email || errors.general) {
                    setErrors((prev) => ({ ...prev, email: undefined, general: undefined }));
                  }
                }}
                placeholder="arjun@pict.edu"
                icon={<Mail className="w-4 h-4" aria-hidden="true" />}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="student-password" className="text-xs font-mono font-semibold text-slate-300">
                Password
              </label>
              <Input
                id="student-password"
                type="password"
                required
                value={password}
                error={errors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password || errors.general) {
                    setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
                  }
                }}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" aria-hidden="true" />}
              />
            </div>

            <Button
              type="submit"
              variant="cyber"
              size="lg"
              isLoading={isSubmitting}
              className="w-full gap-2 mt-2 min-h-[44px]"
            >
              <span>Sign In to Student Portal</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </form>

          <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-800">
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
