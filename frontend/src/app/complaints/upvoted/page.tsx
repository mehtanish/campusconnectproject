'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { ComplaintStatusTracker } from '@/components/complaints/ComplaintStatusTracker';
import { UpvoteButton } from '@/components/complaints/UpvoteButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThumbsUp,
  Clock,
  CheckCircle2,
  MapPin,
  Sparkles,
  Filter,
  PlusCircle,
  MessageSquare,
} from 'lucide-react';
import api from '@/lib/api';
import type { ComplaintResponse } from '@/types';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { GlowCard } from '@/components/ui/GlowCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function UpvotedComplaintsPage() {
  const [upvotedComplaints, setUpvotedComplaints] = useState<ComplaintResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  const fetchUpvotedComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<ComplaintResponse[]>('/api/complaints/upvoted');
      setUpvotedComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch upvoted complaints:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) fetchUpvotedComplaints();
    });
    return () => { isMounted = false; };
  }, [fetchUpvotedComplaints]);

  const totalUpvoted = upvotedComplaints.length;
  const activeUpvoted = upvotedComplaints.filter(
    (c) => c.status === 'PENDING' || c.status === 'APPROVED' || c.status === 'IN_PROGRESS'
  ).length;
  const resolvedUpvoted = upvotedComplaints.filter((c) => c.status === 'RESOLVED').length;

  const filteredComplaints = upvotedComplaints.filter((item) => {
    if (filter === 'ACTIVE') {
      return item.status === 'PENDING' || item.status === 'APPROVED' || item.status === 'IN_PROGRESS';
    }
    if (filter === 'RESOLVED') {
      return item.status === 'RESOLVED';
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 cyber-grid-bg">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COMMUNITY PRIORITY FEED</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white">
              Upvoted Complaints <span className="gradient-text-cyber">History</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Every complaint you upvote is stored here so you can get live status updates and admin notes in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/complaints/new">
              <Button variant="cyber" size="sm" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                <span>File New Issue</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title="Total Upvoted"
            value={totalUpvoted}
            subtitle="Issues upvoted by you"
            icon={<ThumbsUp className="w-5 h-5 text-cyan-400" />}
            glowColor="rgba(6, 182, 212, 0.2)"
          />
          <StatCard
            title="Active / Pending"
            value={activeUpvoted}
            subtitle="Under investigation or in progress"
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            glowColor="rgba(245, 158, 11, 0.2)"
          />
          <StatCard
            title="Resolved Issues"
            value={resolvedUpvoted}
            subtitle="Closed community issues"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            glowColor="rgba(16, 185, 129, 0.2)"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Filter Status:
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                  filter === tab
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab === 'ALL' ? 'All Upvoted' : tab === 'ACTIVE' ? 'Active / Pending' : 'Resolved'}
              </button>
            ))}
          </div>
        </div>

        {/* Content Feed */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-36 w-full" />
              <Skeleton className="h-36 w-full" />
            </div>
          ) : filteredComplaints.length === 0 ? (
            <GlowCard className="text-center py-16 space-y-3">
              <ThumbsUp className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-300 font-mono">
                {filter === 'ALL'
                  ? "You haven't upvoted any complaints yet."
                  : `No ${filter.toLowerCase()} upvoted complaints found.`}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When you or a classmate select a location with an existing issue, upvote it to escalate priority and track live status updates here!
              </p>
            </GlowCard>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredComplaints.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <GlowCard className="p-6 space-y-5 border-l-4 border-l-cyan-400">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-md">
                            {item.categoryName}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-violet-300 bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-md">
                            TAG: {item.issueTagLabel || item.issueTag}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Filed by {item.studentName}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-display font-bold text-white pt-1">
                          {item.title}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{item.locationPath}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <UpvoteButton
                          complaintId={item.id}
                          initialCount={item.upvoteCount}
                          initialHasUpvoted={item.hasUpvoted}
                          onUpvoteSuccess={() => fetchUpvotedComplaints()}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-left">
                      {item.description}
                    </p>

                    {/* Live Status Tracker */}
                    <div className="space-y-2 text-left">
                      <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                        Live Resolution Status
                      </div>
                      <ComplaintStatusTracker currentStatus={item.status} />
                    </div>

                    {/* Admin Response Note */}
                    {item.adminNote && (
                      <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs text-cyan-200 space-y-1.5 shadow-lg text-left">
                        <div className="flex items-center gap-1.5 font-bold font-mono text-cyan-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Official Admin Note & Update:</span>
                        </div>
                        <p className="italic text-cyan-100">{item.adminNote}</p>
                      </div>
                    )}
                  </GlowCard>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
