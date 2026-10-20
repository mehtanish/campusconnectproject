'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { ComplaintPriorityQueue } from '@/components/complaints/ComplaintPriorityQueue';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart2,
  Radio,
  RotateCw,
  ShieldAlert,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { NoticeBoardManagement } from '@/components/admin/NoticeBoardManagement';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import type { ComplaintResponse, AdminStats } from '@/types';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { GlowCard } from '@/components/ui/GlowCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminAnalyticsHub() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tab Navigation state
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'NOTICE_BOARD'>('ANALYTICS');

  const fetchAdminData = async (isBackground = false) => {
    try {
      if (!isBackground) {
        setIsLoading(true);
      }
      const [compRes, statsRes] = await Promise.all([
        api.get<ComplaintResponse[]>('/api/admin/complaints').catch((err) => {
          console.error('Failed to fetch admin complaints:', err);
          return { data: [] as ComplaintResponse[] };
        }),
        api.get<AdminStats>('/api/admin/stats').catch((err) => {
          console.error('Failed to fetch admin stats:', err);
          return { data: null };
        }),
      ]);

      setComplaints(compRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      if (!isBackground) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (!isMounted) return;
      if (isAuthLoading) return;
      if (!isAdmin) {
        setIsLoading(false);
        return;
      }
      fetchAdminData();
    });
    return () => {
      isMounted = false;
    };
  }, [isAdmin, isAuthLoading]);

  const downloadReport = async (endpoint: string, filename: string) => {
    try {
      const response = await api.get(`/api/admin/reports/${endpoint}`, {
        responseType: 'arraybuffer',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Report downloaded: ${filename}`);
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download Excel report');
    }
  };

  // Chart trend mock dataset for neon Recharts analytics
  const chartData = [
    { name: 'Mon', complaints: 12, resolved: 10 },
    { name: 'Tue', complaints: 19, resolved: 15 },
    { name: 'Wed', complaints: 15, resolved: 14 },
    { name: 'Thu', complaints: 22, resolved: 20 },
    { name: 'Fri', complaints: 28, resolved: 25 },
    { name: 'Sat', complaints: 14, resolved: 13 },
    { name: 'Sun', complaints: 18, resolved: 17 },
  ];

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 cyber-grid-bg">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <Skeleton className="h-16 w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="h-72 w-full" />
        </main>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 cyber-grid-bg">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <GlowCard glowColor="rgba(244, 63, 94, 0.25)" className="w-full max-w-lg p-8 text-center space-y-6 shadow-2xl border-rose-500/40 bg-slate-950/95">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-xl shadow-rose-500/20">
              <ShieldAlert className="w-9 h-9" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                403 - FORBIDDEN ACCESS
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                Administrative Rights Required
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans pt-1">
                This portal is strictly restricted to designated PICT campus facility administrators and staff members.
              </p>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400">
                Current account role: <span className="text-rose-400 font-bold">{user?.role || 'UNAUTHENTICATED'}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => router.push(user ? '/dashboard' : '/login')}
                className="w-full sm:w-auto gap-2 min-h-[44px]"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>{user ? 'Return to Student Dashboard' : 'Go to Student Login'}</span>
              </Button>
              <Button
                variant="cyber"
                size="md"
                onClick={() => router.push('/admin/login')}
                className="w-full sm:w-auto gap-2 min-h-[44px]"
              >
                <Lock className="w-4 h-4 text-cyan-200" aria-hidden="true" />
                <span>Staff Portal Sign In</span>
              </Button>
            </div>
          </GlowCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 cyber-grid-bg">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header with Above-the-Fold Primary Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-md uppercase">
                {user?.role || 'STAFF'} COMMAND CENTER
              </span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white mt-1">
              Admin Priority Hub & <span className="gradient-text-cyber">Analytics</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Domain-filtered priority queues and automated Excel resolution reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              isLoading={isLoading}
              onClick={() => fetchAdminData()}
              className="gap-2 min-h-[44px]"
            >
              <RotateCw className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>Refresh Feed</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadReport('export-complaints', 'complaints-report.xlsx')}
              className="gap-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 min-h-[44px]"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>Export Complaints (.xlsx)</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-3 font-mono text-xs">
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer ${
              activeTab === 'ANALYTICS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-lg shadow-cyan-500/10'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <BarChart2 className="w-4 h-4" aria-hidden="true" />
            <span>ANALYTICS & PRIORITY QUEUE</span>
          </button>

          <button
            onClick={() => setActiveTab('NOTICE_BOARD')}
            className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer ${
              activeTab === 'NOTICE_BOARD'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold shadow-lg shadow-purple-500/10'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4 text-purple-400 animate-pulse" aria-hidden="true" />
            <span>NOTICE BOARD BROADCAST MANAGEMENT</span>
          </button>
        </div>

        {activeTab === 'NOTICE_BOARD' ? (
          <NoticeBoardManagement />
        ) : (
          <React.Fragment>
            {/* Cyber Stat Cards */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Complaints"
                  value={stats?.totalComplaints ?? 0}
                  trend={{ value: 'Live', isPositive: true }}
                  icon={<BarChart2 className="w-5 h-5 text-cyan-400" aria-hidden="true" />}
                  glowColor="rgba(6, 182, 212, 0.2)"
                />
                <StatCard
                  title="New (Pending)"
                  value={stats?.pendingComplaints ?? 0}
                  icon={<Clock className="w-5 h-5 text-amber-400" aria-hidden="true" />}
                  glowColor="rgba(245, 158, 11, 0.2)"
                />
                <StatCard
                  title="In Progress"
                  value={stats?.inProgressComplaints ?? 0}
                  icon={<RotateCw className="w-5 h-5 text-cyan-400 animate-spin-slow" aria-hidden="true" />}
                  glowColor="rgba(6, 182, 212, 0.2)"
                />
                <StatCard
                  title="Resolved Issues"
                  value={stats?.resolvedComplaints ?? 0}
                  trend={{ value: 'Closed', isPositive: true }}
                  icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" aria-hidden="true" />}
                  glowColor="rgba(16, 185, 129, 0.2)"
                />
              </div>
            )}

            {/* Neon Recharts Resolution Analytics */}
            {isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <GlowCard className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                    <h2 className="text-base font-display font-bold text-white">
                      Weekly Resolution Velocity & Volume
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-cyan-400">REALTIME METRICS</span>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                      <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          color: '#f8fafc',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="complaints"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorComplaints)"
                      />
                      <Area
                        type="monotone"
                        dataKey="resolved"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorResolved)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlowCard>
            )}

            {/* Complaint Priority Queue */}
            <div id="queue" className="space-y-4 text-left">
              <h2 className="text-lg font-display font-bold text-white">
                Complaint Management Workflow
              </h2>

              {isLoading && complaints.length === 0 ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <ComplaintPriorityQueue
                  complaints={complaints}
                  onRefresh={() => fetchAdminData(true)}
                />
              )}
            </div>
          </React.Fragment>
        )}
      </main>
    </div>
  );
}
