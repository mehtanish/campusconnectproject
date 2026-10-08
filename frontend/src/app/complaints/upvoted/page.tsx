'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { ComplaintStatusTracker } from '@/components/complaints/ComplaintStatusTracker';
import { UpvoteButton } from '@/components/complaints/UpvoteButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThumbsUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
  Filter,
  PlusCircle,
  FileText,
  MessageSquare,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { ComplaintResponse } from '@/types';

export default function UpvotedComplaintsPage() {
  const { user } = useAuth();
  const [upvotedComplaints, setUpvotedComplaints] = useState<ComplaintResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');

  const fetchUpvotedComplaints = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<ComplaintResponse[]>('/api/complaints/upvoted');
      setUpvotedComplaints(res.data);
    } catch (err) {
      console.error('Failed to fetch upvoted complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUpvotedComplaints();
  }, []);

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
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Status Feed for Upvoted Issues</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Upvoted Complaints <span className="gradient-text">History</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Every complaint you upvote is stored here so you can get live status updates and admin notes in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/complaints/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity"
            >
              <PlusCircle className="w-4 h-4" />
              <span>File New Issue</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 space-y-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Total Upvoted
              </span>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {totalUpvoted}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ThumbsUp className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-5 space-y-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Active & In Progress
              </span>
              <div className="text-2xl font-bold text-amber-400">
                {activeUpvoted}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-5 space-y-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Resolved Issues
              </span>
              <div className="text-2xl font-bold text-emerald-400">
                {resolvedUpvoted}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Filter Status:
            </span>
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'ACTIVE', 'RESOLVED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 glass-card animate-pulse" />
              ))}
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-16 glass-card space-y-3">
              <ThumbsUp className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                {filter === 'ALL'
                  ? "You haven't upvoted any complaints yet."
                  : `No ${filter.toLowerCase()} upvoted complaints found.`}
              </p>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                When you or a classmate select a location with an existing issue, upvote it to escalate priority and track live status updates here!
              </p>
            </div>
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
                  className="glass-card p-6 space-y-5 border-l-4 border-l-indigo-500"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-md">
                          {item.categoryName}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                          TAG: {item.issueTagLabel || item.issueTag}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          Filed by {item.studentName}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          ID: {item.id}
                        </span>
                        <time
                          className="text-[10px] text-[var(--text-muted)]"
                          dateTime={item.upvotedAt || item.createdAt}
                        >
                          Upvoted {new Date(item.upvotedAt || item.createdAt).toLocaleString()}
                        </time>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-indigo-300 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
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

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-[var(--border-color)]">
                    {item.description}
                  </p>

                  {/* Live Status Tracker */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      Live Resolution Status
                    </div>
                    <ComplaintStatusTracker currentStatus={item.status} />
                  </div>

                  {/* Admin Response Note */}
                  {item.adminNote && (
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 space-y-1.5 shadow-lg">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Official Admin Note & Update:</span>
                      </div>
                      <p className="italic text-indigo-100">{item.adminNote}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
}
