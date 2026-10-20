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
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, logout } = useAuth();
  const router = useRouter();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Staff email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid official staff email format.';
    }

    if (!password) {
      newErrors.password = 'Administrator password is required.';
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
      if (loggedUser.role === 'STUDENT') {
        logout();
        const accessDeniedMsg = 'Access Denied: Student accounts cannot access the administrative portal.';
        setErrors({ general: accessDeniedMsg });
        toast.error(accessDeniedMsg);
        return;
      }
      toast.success('Admin authenticated successfully!');
      router.push('/admin');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      const message = errorObj.response?.data?.error || 'Admin authentication failed. Check credentials.';
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
        <GlowCard glowColor="rgba(139, 92, 246, 0.25)" className="w-full max-w-md p-8 space-y-6 shadow-2xl border-violet-500/30">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-violet-500/30 border border-violet-300/30">
              <Shield className="w-7 h-7 text-violet-200" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-display font-extrabold text-white">
              Admin & Staff Portal
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Official PICT Campus Authority Authentication
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
              <label htmlFor="staff-email" className="text-xs font-mono font-semibold text-slate-300">
                Staff Email Address
              </label>
              <Input
                id="staff-email"
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
                placeholder="admin@campusconnect.edu"
                icon={<Mail className="w-4 h-4 text-cyan-400" aria-hidden="true" />}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="staff-password" className="text-xs font-mono font-semibold text-slate-300">
                Admin Password
              </label>
              <Input
                id="staff-password"
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
                icon={<Lock className="w-4 h-4 text-cyan-400" aria-hidden="true" />}
              />
            </div>

            <Button
              type="submit"
              variant="cyber"
              size="lg"
              isLoading={isSubmitting}
              className="w-full gap-2 mt-2 min-h-[44px]"
            >
              <span>Sign In as Staff / Admin</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 font-mono pt-4 border-t border-slate-800">
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
