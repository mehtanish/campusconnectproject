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
  Trash2,
  MessageSquare,
  Send,
  ShieldAlert,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { ComplaintResponse, CommentResponse } from '@/types';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { GlowCard } from '@/components/ui/GlowCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Student comments input state
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

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

  // Student deletes own complaint (ALLOWED ONLY WHILE PENDING)
  const handleDeleteComplaint = async (complaintId: string, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to withdraw and delete complaint "${title}"? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(complaintId);
      await api.delete(`/api/complaints/${complaintId}`);
      toast.success('Complaint deleted successfully');
      fetchData();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Failed to delete complaint';
      toast.error(message || 'Failed to delete complaint');
    } finally {
      setDeletingId(null);
    }
  };

  // Student adds comment/reply to complaint
  const handleAddComment = async (complaintId: string) => {
    const content = (commentInputs[complaintId] || '').trim();
    if (!content) {
      toast.error('Please enter a comment before submitting');
      return;
    }

    try {
      setSubmittingComment((prev) => ({ ...prev, [complaintId]: true }));
      await api.post(`/api/complaints/${complaintId}/comments`, { content });
      setCommentInputs((prev) => ({ ...prev, [complaintId]: '' }));
      toast.success('Comment posted');
      fetchData();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Failed to post comment';
      toast.error(message || 'Failed to post comment');
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [complaintId]: false }));
    }
  };

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'RESOLVED').length;
  const activeComplaints = complaints.filter(
    (c) =>
      c.status === 'PENDING' ||
      c.status === 'ACCEPTED' ||
      c.status === 'APPROVED' ||
      c.status === 'IN_PROGRESS'
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
              Track your filed complaints, view admin response comments, and manage upvoted issues.
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
            <div className="space-y-5">
              {complaints.map((item) => {
                const comments: CommentResponse[] = item.comments || [];
                const isPending = item.status === 'PENDING';
                const isDeleting = deletingId === item.id;
                const commentInput = commentInputs[item.id] || '';
                const isSubmitting = submittingComment[item.id] || false;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <GlowCard className="p-6 space-y-4">
                      {/* Header with Title, Upvote & Conditional Delete Button */}
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1 text-left flex-1 min-w-[240px]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-md">
                              {item.categoryName}
                            </span>
                            {isPending && (
                              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                                Status: Pending Admin Review
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-display font-bold text-white pt-1">
                            {item.title}
                          </h4>
                          <p className="text-xs font-mono text-slate-400">
                            {item.locationPath}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* STUDENT-SIDE DELETE OPTION:
                              Only visible while status is still 'PENDING'.
                              Once an admin acts on it (accepted, rejected, in_progress, resolved),
                              hide delete so admin history/comments aren't lost. */}
                          {isPending && (
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDeleteComplaint(item.id, item.title)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete this complaint before admin acts on it"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                            </button>
                          )}

                          <UpvoteButton
                            complaintId={item.id}
                            initialCount={item.upvoteCount}
                            initialHasUpvoted={item.hasUpvoted}
                            onUpvoteSuccess={() => fetchData()}
                          />
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-left">
                        {item.description}
                      </p>

                      {/* Status Progress Tracker */}
                      <ComplaintStatusTracker currentStatus={item.status} />

                      {/* Legacy Admin Response Note if present */}
                      {item.adminNote && (
                        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-200 space-y-1 text-left">
                          <span className="font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Official Admin Note:
                          </span>
                          <p className="italic">{item.adminNote}</p>
                        </div>
                      )}

                      {/* COMMENTS & ADMIN CONVERSATION THREAD */}
                      <div className="pt-3 border-t border-slate-800 space-y-3 text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-cyan-400" />
                            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                              Admin Comments & Conversation ({comments.length})
                            </h5>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {comments.length === 0 ? 'No comments yet' : 'Live updates'}
                          </span>
                        </div>

                        {/* Comment messages list */}
                        {comments.length > 0 && (
                          <div className="space-y-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                            {comments.map((comment) => {
                              const isAdmin =
                                comment.authorRole && comment.authorRole !== 'STUDENT';

                              return (
                                <div
                                  key={comment.id}
                                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                                    isAdmin
                                      ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-100'
                                      : 'bg-slate-900 border-slate-800 text-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-white">
                                        {comment.authorName}
                                      </span>

                                      {isAdmin ? (
                                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                          Admin Official
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                          You (Author)
                                        </span>
                                      )}

                                      <span className="text-[10px] font-mono text-slate-400">
                                        {new Date(comment.createdAt).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                          month: 'short',
                                          day: 'numeric',
                                        })}
                                      </span>
                                    </div>
                                  </div>

                                  <p className="text-xs leading-relaxed whitespace-pre-wrap pt-0.5">
                                    {comment.content}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Student Reply / Comment Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Add a comment or follow-up for the admin..."
                            value={commentInput}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddComment(item.id);
                              }
                            }}
                            className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                          />

                          <button
                            type="button"
                            disabled={isSubmitting || !commentInput.trim()}
                            onClick={() => handleAddComment(item.id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send</span>
                          </button>
                        </div>
                      </div>
                    </GlowCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
