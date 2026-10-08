'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
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
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : 'Failed to update status';
      toast.error(message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4 text-left">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-cyan-400 shrink-0" />
          {['ALL', 'PENDING', 'APPROVED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  selectedStatus === status
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'PRIORITY' | 'DATE' | 'UPVOTES')}
            className="text-xs font-medium bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="PRIORITY">Priority Score (High → Low)</option>
            <option value="UPVOTES">Most Upvoted</option>
            <option value="DATE">Newest First</option>
          </select>
        </div>
      </div>

      {/* Queue items */}
      {sorted.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl text-xs">
          No complaints found matching status filter.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((item) => {
            const statusInfo = STATUS_CONFIG[item.status as ComplaintStatus] || {
              label: item.status,
              color: 'text-slate-400 bg-slate-800',
            };

            return (
              <motion.div
                key={item.id}
                layout
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-cyan-400">
                      {item.id.substring(0, 8)}...
                    </span>
                    <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Flame className="w-3.5 h-3.5" /> {item.upvoteCount} Upvotes
                    </span>
                    <span className="text-slate-400">
                      Priority: <strong className="text-white">{item.priorityScore.toFixed(1)}</strong>
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1 border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {item.locationPath}
                  </span>
                  {item.studentName && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" /> {item.studentName}
                    </span>
                  )}
                  {item.issueTag && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Tag className="w-3.5 h-3.5" /> {item.issueTag}
                    </span>
                  )}
                </div>

                {/* Admin Status Actions */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <input
                    type="text"
                    placeholder="Admin note (optional)..."
                    value={adminNotes[item.id] || ''}
                    onChange={(e) =>
                      setAdminNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                  />

                  <div className="flex items-center gap-1.5">
                    {(['IN_PROGRESS', 'RESOLVED', 'REJECTED'] as ComplaintStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          disabled={updatingId === item.id || item.status === st}
                          onClick={() => handleStatusChange(item.id, st)}
                          className="px-2.5 py-1 text-[11px] font-mono font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-40 transition-colors"
                        >
                          {st.replace('_', ' ')}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
