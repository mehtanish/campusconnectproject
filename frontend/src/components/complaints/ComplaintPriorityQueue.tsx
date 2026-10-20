'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  ArrowUpDown,
  User,
  MapPin,
  Tag,
  CheckCircle2,
  Clock,
  RefreshCw,
  XCircle,
  ShieldCheck,
  Trash2,
  MessageSquare,
  Send,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { STATUS_CONFIG, type ComplaintResponse, type ComplaintStatus, type CommentResponse } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ComplaintPriorityQueueProps {
  complaints: ComplaintResponse[];
  onRefresh?: () => void;
}

type AdminWorkflowTab = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ALL';

export function ComplaintPriorityQueue({
  complaints,
  onRefresh,
}: ComplaintPriorityQueueProps) {
  const [activeTab, setActiveTab] = useState<AdminWorkflowTab>('NEW');
  const [sortBy, setSortBy] = useState<'UPVOTES' | 'PRIORITY' | 'DATE'>('UPVOTES');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingComplaintId, setDeletingComplaintId] = useState<string | null>(null);

  // Comments state per complaint
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<Record<string, boolean>>({});
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // Tab counts
  const pendingCount = complaints.filter((c) => c.status === 'PENDING').length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'ACCEPTED' || c.status === 'APPROVED' || c.status === 'IN_PROGRESS'
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED').length;
  const rejectedCount = complaints.filter((c) => c.status === 'REJECTED').length;

  // Filter complaints based on active workflow tab
  const tabFiltered = complaints.filter((c) => {
    if (activeTab === 'NEW') {
      return c.status === 'PENDING';
    }
    if (activeTab === 'IN_PROGRESS') {
      return c.status === 'ACCEPTED' || c.status === 'APPROVED' || c.status === 'IN_PROGRESS';
    }
    if (activeTab === 'RESOLVED') {
      return c.status === 'RESOLVED';
    }
    return true; // 'ALL' tab includes all
  });

  // Filter by search query
  const searched = tabFiltered.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.locationPath.toLowerCase().includes(q) ||
      (c.studentName && c.studentName.toLowerCase().includes(q)) ||
      (c.issueTag && c.issueTag.toLowerCase().includes(q))
    );
  });

  // Sort complaints
  const sorted = [...searched].sort((a, b) => {
    if (sortBy === 'UPVOTES') return b.upvoteCount - a.upvoteCount;
    if (sortBy === 'PRIORITY') return b.priorityScore - a.priorityScore;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Status Change Handler
  const handleStatusChange = async (
    complaintId: string,
    newStatus: ComplaintStatus
  ) => {
    try {
      setUpdatingId(complaintId);
      await api.patch(`/api/admin/complaints/${complaintId}/status`, {
        status: newStatus,
      });

      const readableStatus = newStatus.replace('_', ' ');
      toast.success(`Complaint moved to ${readableStatus}`);
      onRefresh?.();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Failed to update status';
      toast.error(message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Complaint Deletion Handler (Admin)
  const handleDeleteComplaint = async (complaintId: string, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to completely delete complaint "${title}"? This will remove all associated comments and upvotes.`
      )
    ) {
      return;
    }

    try {
      setDeletingComplaintId(complaintId);
      await api.delete(`/api/admin/complaints/${complaintId}`);
      toast.success('Complaint deleted successfully');
      onRefresh?.();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Failed to delete complaint';
      toast.error(message || 'Failed to delete complaint');
    } finally {
      setDeletingComplaintId(null);
    }
  };

  // Add Comment Handler
  const handleAddComment = async (complaintId: string) => {
    const content = (commentInputs[complaintId] || '').trim();
    if (!content) {
      toast.error('Please enter a comment message before submitting');
      return;
    }

    try {
      setIsSubmittingComment((prev) => ({ ...prev, [complaintId]: true }));
      await api.post(`/api/admin/complaints/${complaintId}/comments`, { content });

      setCommentInputs((prev) => ({ ...prev, [complaintId]: '' }));
      toast.success('Comment added (visible to complaint author)');
      onRefresh?.();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Failed to add comment';
      toast.error(message || 'Failed to add comment');
    } finally {
      setIsSubmittingComment((prev) => ({ ...prev, [complaintId]: false }));
    }
  };

  // Delete Comment Handler (Moderation)
  const handleDeleteComment = async (
    complaintId: string,
    commentId: string,
    authorName: string
  ) => {
    if (
      !window.confirm(
        `Delete this comment by ${authorName}? (Comment moderation)`
      )
    ) {
      return;
    }

    try {
      setDeletingCommentId(commentId);
      await api.delete(`/api/admin/complaints/${complaintId}/comments/${commentId}`);
      toast.success('Comment removed');
      onRefresh?.();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : 'Failed to delete comment';
      toast.error(message || 'Failed to delete comment');
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* 3 Main Workflow Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tab 1: New Complaints */}
        <button
          type="button"
          onClick={() => setActiveTab('NEW')}
          className={`relative flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'NEW'
              ? 'bg-amber-500/15 border-amber-500/50 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeTab === 'NEW' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-wider uppercase text-amber-400">
                Tab 1 • Action Required
              </div>
              <h3 className="text-sm font-display font-bold text-white">
                New Complaints
              </h3>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full ${
              activeTab === 'NEW'
                ? 'bg-amber-500 text-slate-950 font-extrabold'
                : 'bg-slate-800 text-amber-400'
            }`}
          >
            {pendingCount}
          </span>
        </button>

        {/* Tab 2: Accepted / In Progress */}
        <button
          type="button"
          onClick={() => setActiveTab('IN_PROGRESS')}
          className={`relative flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'IN_PROGRESS'
              ? 'bg-cyan-500/15 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeTab === 'IN_PROGRESS' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-400">
                Tab 2 • Under Resolution
              </div>
              <h3 className="text-sm font-display font-bold text-white">
                Accepted / In Progress
              </h3>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full ${
              activeTab === 'IN_PROGRESS'
                ? 'bg-cyan-500 text-slate-950 font-extrabold'
                : 'bg-slate-800 text-cyan-400'
            }`}
          >
            {inProgressCount}
          </span>
        </button>

        {/* Tab 3: Resolved Complaints */}
        <button
          type="button"
          onClick={() => setActiveTab('RESOLVED')}
          className={`relative flex items-center justify-between p-4 rounded-xl border text-left transition-all cursor-pointer ${
            activeTab === 'RESOLVED'
              ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeTab === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
                Tab 3 • Closed History
              </div>
              <h3 className="text-sm font-display font-bold text-white">
                Resolved Complaints
              </h3>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full ${
              activeTab === 'RESOLVED'
                ? 'bg-emerald-500 text-slate-950 font-extrabold'
                : 'bg-slate-800 text-emerald-400'
            }`}
          >
            {resolvedCount}
          </span>
        </button>
      </div>

      {/* Filter, Sort & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search complaints by title, location, student..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* View Details / Extras */}
        <div className="flex items-center gap-3 justify-end flex-wrap">
          {rejectedCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'ALL' ? 'NEW' : 'ALL')}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/40'
                  : 'text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              {activeTab === 'ALL' ? 'Showing All Views' : `Include Rejected (${rejectedCount})`}
            </button>
          )}

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'UPVOTES' | 'PRIORITY' | 'DATE')}
              className="text-xs font-medium bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="UPVOTES">Most Upvoted (Live)</option>
              <option value="PRIORITY">Priority Score (High → Low)</option>
              <option value="DATE">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      {sorted.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-2">
          <AlertTriangle className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">
            {activeTab === 'NEW' && 'No new pending complaints awaiting triage.'}
            {activeTab === 'IN_PROGRESS' && 'No active or in-progress complaints in this queue.'}
            {activeTab === 'RESOLVED' && 'No resolved complaints to show.'}
            {activeTab === 'ALL' && 'No complaints found.'}
          </p>
          <p className="text-xs text-slate-500 font-mono">
            Complaints will appear here dynamically as students file or upvote them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {sorted.map((item) => {
              const statusInfo = STATUS_CONFIG[item.status as ComplaintStatus] || {
                label: item.status,
                color: 'text-slate-400',
                bgColor: 'bg-slate-800',
              };

              const comments: CommentResponse[] = item.comments || [];
              const commentInput = commentInputs[item.id] || '';
              const isSubmitting = isSubmittingComment[item.id] || false;
              const isUpdating = updatingId === item.id;
              const isDeletingComplaint = deletingComplaintId === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4 transition-all hover:border-slate-700/80"
                >
                  {/* Top Bar: Metadata & Live Upvotes */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                        #{item.id.substring(0, 8)}
                      </span>

                      <span
                        className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.color} ${statusInfo.bgColor} border-current/20`}
                      >
                        {statusInfo.label}
                      </span>

                      <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                        {item.categoryName}
                      </span>
                    </div>

                    {/* LIVE UPVOTE COUNT BADGE */}
                    <div className="flex items-center gap-3">
                      {item.highPriority && (
                        <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                          High Demand (15+ Upvotes)
                        </span>
                      )}

                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold font-mono text-xs shadow-sm">
                        <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{item.upvoteCount} Upvotes</span>
                      </div>

                      <div className="text-xs font-mono text-slate-400">
                        Score: <span className="font-bold text-white">{item.priorityScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Complaint Details */}
                  <div className="space-y-1.5">
                    <h3 className="text-base font-display font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Location, Student & Tag Info */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                    <span className="flex items-center gap-1.5 text-cyan-300">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{item.locationPath}</span>
                    </span>

                    {item.studentName && (
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reporter: {item.studentName}</span>
                      </span>
                    )}

                    {item.issueTagLabel && (
                      <span className="flex items-center gap-1.5 text-slate-400">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{item.issueTagLabel}</span>
                      </span>
                    )}

                    <span className="text-slate-500 ml-auto">
                      Filed {new Date(item.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Action Bar according to Active Tab */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* VIEW 1: NEW COMPLAINTS ACTIONS */}
                      {(item.status === 'PENDING' || activeTab === 'NEW') && (
                        <React.Fragment>
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(item.id, 'ACCEPTED')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Accept</span>
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(item.id, 'REJECTED')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>Reject</span>
                          </button>

                          <button
                            type="button"
                            disabled={isDeletingComplaint}
                            onClick={() => handleDeleteComplaint(item.id, item.title)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Complaint</span>
                          </button>
                        </React.Fragment>
                      )}

                      {/* VIEW 2: ACCEPTED / IN PROGRESS ACTIONS */}
                      {(item.status === 'ACCEPTED' || item.status === 'APPROVED' || item.status === 'IN_PROGRESS') && (
                        <React.Fragment>
                          {item.status !== 'IN_PROGRESS' && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(item.id, 'IN_PROGRESS')}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>Mark In Progress</span>
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(item.id, 'RESOLVED')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Mark Resolved</span>
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(item.id, 'REJECTED')}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4 text-slate-400" />
                            <span>Reject</span>
                          </button>
                        </React.Fragment>
                      )}

                      {/* VIEW 3: RESOLVED ACTIONS */}
                      {item.status === 'RESOLVED' && (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Successfully Resolved</span>
                          </span>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(item.id, 'IN_PROGRESS')}
                            className="px-2.5 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          >
                            Re-open
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* COMMENTS & ADMIN NOTES SECTION (Visible to Author & Admin) */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                          Comments & Official Updates ({comments.length})
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400/80">
                        Visible to Complaint Author
                      </span>
                    </div>

                    {/* Comments List */}
                    {comments.length > 0 && (
                      <div className="space-y-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                        {comments.map((comment) => {
                          const isAdminAuthor = comment.authorRole && comment.authorRole !== 'STUDENT';
                          const isDeletingThis = deletingCommentId === comment.id;

                          return (
                            <div
                              key={comment.id}
                              className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1 relative group"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-white">
                                    {comment.authorName}
                                  </span>

                                  {isAdminAuthor ? (
                                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                      Admin
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                      Student
                                    </span>
                                  )}

                                  <span className="text-[10px] font-mono text-slate-500">
                                    {new Date(comment.createdAt).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </span>
                                </div>

                                {/* COMMENT MODERATION: DELETE ANY INDIVIDUAL COMMENT */}
                                <button
                                  type="button"
                                  disabled={isDeletingThis}
                                  title="Delete comment (Moderation)"
                                  onClick={() =>
                                    handleDeleteComment(item.id, comment.id, comment.authorName)
                                  }
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                                {comment.content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Comment Input Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add a comment or update for the student author..."
                        value={commentInput}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
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
                        <span>Post</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
