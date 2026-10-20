'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import {
  Lock,
  Mail,
  User as UserIcon,
  Hash,
  ArrowRight,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  LayoutDashboard,
  Home,
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/Button';
import { GlowCard } from '@/components/ui/GlowCard';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    rollNo?: string;
    password?: string;
    general?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredData, setRegisteredData] = useState<{ name: string; email: string; rollNo: string } | null>(null);

  const { register } = useAuth();
  const router = useRouter();

  const validate = () => {
    const newErrors: {
      name?: string;
      email?: string;
      rollNo?: string;
      password?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Full name must contain at least 2 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Campus email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please provide a valid email address (e.g. yourname@pict.edu).';
    }

    if (!rollNo.trim()) {
      newErrors.rollNo = 'Student Roll Number or Registration ID is required.';
    } else if (rollNo.trim().length < 3) {
      newErrors.rollNo = 'Please enter a valid Roll Number (e.g. CS2024001).';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
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
      await register({
        name: name.trim(),
        email: email.trim(),
        rollNo: rollNo.trim().toUpperCase(),
        password,
      });

      setRegisteredData({
        name: name.trim(),
        email: email.trim(),
        rollNo: rollNo.trim().toUpperCase(),
      });
      setIsRegistered(true);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#6366f1', '#10b981'],
        });
      } catch {
        // Confetti fallback
      }

      toast.success('Student account created successfully!');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      const message = errorObj.response?.data?.error || 'Registration failed. Please check details.';
      setErrors({ general: message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 cyber-grid-bg">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        {isRegistered && registeredData ? (
          /* Confirmation Screen */
          <GlowCard glowColor="rgba(16, 185, 129, 0.25)" className="w-full max-w-lg p-8 space-y-6 shadow-2xl border-emerald-500/40 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full uppercase">
                STUDENT PROFILE ACTIVE
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white pt-2">
                Welcome to CampusConnect, {registeredData.name}!
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Your official PICT student credentials have been securely activated.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Student Roll No:</span>
                <span className="text-cyan-300 font-bold">{registeredData.rollNo}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Campus Email:</span>
                <span className="text-slate-200">{registeredData.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Access Tier:</span>
                <span className="text-emerald-400 font-bold">PICT Student Node</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Button
                variant="cyber"
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="w-full gap-2 min-h-[44px]"
              >
                <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                <span>Go to Student Dashboard</span>
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => router.push('/complaints/new')}
                  className="gap-2 min-h-[44px]"
                >
                  <PlusCircle className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  <span>Report an Issue</span>
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => router.push('/')}
                  className="gap-2 min-h-[44px]"
                >
                  <Home className="w-4 h-4" aria-hidden="true" />
                  <span>Return Home</span>
                </Button>
              </div>
            </div>
          </GlowCard>
        ) : (
          /* Registration Form */
          <GlowCard glowColor="rgba(6, 182, 212, 0.2)" className="w-full max-w-md p-8 space-y-6 shadow-2xl border-cyan-500/30">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/30 border border-cyan-300/30">
                <GraduationCap className="w-7 h-7 text-cyan-200" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-display font-extrabold text-white">
                Student Registration
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Create your official PICT student account to file complaints and track issues
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
                <label htmlFor="reg-name" className="text-xs font-mono font-semibold text-slate-300">
                  Full Name
                </label>
                <Input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  error={errors.name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name || errors.general) {
                      setErrors((prev) => ({ ...prev, name: undefined, general: undefined }));
                    }
                  }}
                  placeholder="Arjun Sharma"
                  icon={<UserIcon className="w-4 h-4" aria-hidden="true" />}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-email" className="text-xs font-mono font-semibold text-slate-300">
                  PICT Campus Email
                </label>
                <Input
                  id="reg-email"
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
                <label htmlFor="reg-rollno" className="text-xs font-mono font-semibold text-slate-300">
                  Student Roll Number / Registration ID
                </label>
                <Input
                  id="reg-rollno"
                  type="text"
                  required
                  value={rollNo}
                  error={errors.rollNo}
                  onChange={(e) => {
                    setRollNo(e.target.value);
                    if (errors.rollNo || errors.general) {
                      setErrors((prev) => ({ ...prev, rollNo: undefined, general: undefined }));
                    }
                  }}
                  placeholder="CS2024001"
                  icon={<Hash className="w-4 h-4" aria-hidden="true" />}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="reg-password" className="text-xs font-mono font-semibold text-slate-300">
                  Password
                </label>
                <Input
                  id="reg-password"
                  type="password"
                  required
                  minLength={6}
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
                <span>Register Student Account</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </form>

            <div className="text-center text-xs text-slate-400 border-t border-slate-800 pt-4 font-mono">
              Already registered?{' '}
              <Link href="/login" className="font-bold text-cyan-400 hover:underline">
                Sign in to Student Portal
              </Link>
            </div>
          </GlowCard>
        )}
      </main>
    </div>
  );
}
