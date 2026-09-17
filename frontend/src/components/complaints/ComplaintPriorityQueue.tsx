'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  MessageSquare,
  Clock,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  User,
  MapPin,
  Tag,
} from 'lucide-react';
import { STATUS_CONFIG, type ComplaintResponse, type ComplaintStatus } from '@/types';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ComplaintPriorityQueueProps {
  complaints: ComplaintResponse[];
  onRefresh?: () => void;
}

export function ComplaintPriorityQueue({
  complaints,
  onRefresh,
}: ComplaintPriorityQueueProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'PRIORITY' | 'DATE' | 'UPVOTES'>('PRIORITY');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const filtered = complaints.filter((c) => {
    if (selectedStatus === 'ALL') return true;
    return c.status === selectedStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'PRIORITY') return b.priorityScore - a.priorityScore;
    if (sortBy === 'UPVOTES') return b.upvoteCount - a.upvoteCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleStatusChange = async (
    complaintId: string,
    newStatus: ComplaintStatus
  ) => {
    try {
      setUpdatingId(complaintId);
      const note = adminNotes[complaintId] || '';

      await api.patch(`/api/admin/complaints/${complaintId}/status`, {
        status: newStatus,
        adminNote: note,
      });

      toast.success(`Complaint status updated to ${newStatus}`);
      onRefresh?.();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-indigo-400 shrink-0" />
          {['ALL', 'PENDING', 'APPROVED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-indigo-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-medium bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
          >
            <option value="PRIORITY">Priority Score (High → Low)</option>
            <option value="UPVOTES">Most Upvoted</option>
            <option value="DATE">Newest First</option>
          </select>
        </div>
      </div>

      {/* Queue Cards Grid */}
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-[var(--border-color)] rounded-xl text-[var(--text-muted)]">
            No complaints found in this view.
          </div>
        ) : (
          sorted.map((item) => {
            const statusConfig = STATUS_CONFIG[item.status];
            const isHighPriority = item.priorityScore >= 20 || item.upvoteCount >= 15;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card p-4 space-y-3 transition-all ${
                  isHighPriority
                    ? 'border-amber-500/30 bg-amber-500/5 shadow-lg shadow-amber-500/5'
                    : ''
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {isHighPriority && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          <Flame className="w-3 h-3 animate-pulse" /> High Priority
                        </span>
                      )}
                      <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md">
                        {item.categoryName}
                      </span>
                    </div>

                    <h4 className="text-base font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </h4>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                      Priority: {item.priorityScore.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                  {item.description}
                </p>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] border-t border-[var(--border-color)]/60 pt-3">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    {item.studentName}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {item.locationPath}
                  </span>
                  {item.issueTag && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-indigo-400" />
                      {item.issueTag}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    {item.upvoteCount} Upvotes
                  </span>
                </div>

                {/* Admin Response & Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-secondary)]/50 p-3 rounded-xl border border-[var(--border-color)]">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Add official admin response note..."
                      value={adminNotes[item.id] ?? item.adminNote ?? ''}
                      onChange={(e) =>
                        setAdminNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      className="w-full text-xs bg-[var(--bg-card)] border border-[var(--border-color)] px-3 py-1.5 rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2">
                    <select
                      disabled={updatingId === item.id}
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value as ComplaintStatus)
                      }
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none ${statusConfig.bgColor} ${statusConfig.color} border-[var(--border-color)]`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="APPROVED">Approved</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
