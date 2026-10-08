'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { ComplaintStatusTracker } from '@/components/complaints/ComplaintStatusTracker';
import { UpvoteButton } from '@/components/complaints/UpvoteButton';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle2,
  PlusCircle,
  ThumbsUp,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { ComplaintResponse } from '@/types';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { GlowCard } from '@/components/ui/GlowCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const compRes = await api.get<ComplaintResponse[]>('/api/complaints/my').catch((err) => {
        console.error('Failed to fetch complaints:', err);
        return { data: [] as ComplaintResponse[] };
      });
      setComplaints(compRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) fetchData();
    });
    return () => { isMounted = false; };
  }, [fetchData]);

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'RESOLVED').length;
  const activeComplaints = complaints.filter(
    (c) => c.status === 'PENDING' || c.status === 'APPROVED' || c.status === 'IN_PROGRESS'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 cyber-grid-bg">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-display font-extrabold text-white">
              Welcome back, <span className="gradient-text-cyber">{user?.name || 'Student'}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Track your filed complaints, view status updates, and manage upvoted issues.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/complaints/new">
              <Button variant="cyber" size="sm" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                <span>File Complaint</span>
              </Button>
            </Link>

            <Link href="/complaints/upvoted">
              <Button variant="outline" size="sm" className="gap-2">
                <ThumbsUp className="w-4 h-4 text-cyan-400" />
                <span>Upvoted History</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Cyber Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title="Total Filed"
            value={totalComplaints}
            subtitle="Complaints registered by you"
            icon={<FileText className="w-5 h-5 text-cyan-400" />}
            glowColor="rgba(6, 182, 212, 0.2)"
          />
          <StatCard
            title="Active Issues"
            value={activeComplaints}
            subtitle="Currently under investigation"
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            glowColor="rgba(245, 158, 11, 0.2)"
          />
          <StatCard
            title="Resolved"
            value={resolvedComplaints}
            subtitle="Successfully closed by admins"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            glowColor="rgba(16, 185, 129, 0.2)"
          />
        </div>

        {/* My Complaints Timeline Feed */}
        <div className="space-y-4">
          <h3 className="text-lg font-display font-bold text-white">
            My Complaints Timeline
          </h3>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : complaints.length === 0 ? (
            <GlowCard className="text-center py-16 space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400 font-mono">
                You haven&apos;t filed any complaints yet.
              </p>
              <Link href="/complaints/new">
                <Button variant="cyber" size="sm">
                  <span>File your first complaint</span>
                </Button>
              </Link>
            </GlowCard>
          ) : (
            <div className="space-y-4">
              {complaints.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <GlowCard className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-md">
                          {item.categoryName}
                        </span>
                        <h4 className="text-base font-display font-bold text-white pt-1">
                          {item.title}
                        </h4>
                        <p className="text-xs font-mono text-slate-400">
                          {item.locationPath}
                        </p>
                      </div>

                      <UpvoteButton
                        complaintId={item.id}
                        initialCount={item.upvoteCount}
                        initialHasUpvoted={item.hasUpvoted}
                        onUpvoteSuccess={() => fetchData()}
                      />
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed text-left">
                      {item.description}
                    </p>

                    {/* Status Progress Tracker */}
                    <ComplaintStatusTracker currentStatus={item.status} />

                    {/* Admin Response Note */}
                    {item.adminNote && (
                      <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-200 space-y-1 text-left">
                        <span className="font-mono font-bold text-cyan-400">
                          Official Admin Note:
                        </span>
                        <p className="italic">{item.adminNote}</p>
                      </div>
                    )}
                  </GlowCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
