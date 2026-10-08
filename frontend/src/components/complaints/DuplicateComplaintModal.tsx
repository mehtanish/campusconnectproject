'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MapPin, Tag, ThumbsUp, Sparkles, X, User, Flame, Clock, CheckCircle2 } from 'lucide-react';
import { UpvoteButton } from './UpvoteButton';
import type { ComplaintResponse } from '@/types';

interface DuplicateComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingComplaint: ComplaintResponse;
  onUpvoteComplete?: () => void;
}

export function DuplicateComplaintModal({
  isOpen,
  onClose,
  existingComplaint,
  onUpvoteComplete,
}: DuplicateComplaintModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/20 space-y-6 text-left overflow-hidden"
        >
          {/* Top Decorative Amber Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-[var(--text-muted)] hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40 shadow-lg shadow-amber-500/20">
              <AlertTriangle className="w-7 h-7 animate-bounce text-amber-400" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wider bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Complaint Already Registered Here!</span>
              </div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
                An active issue exists for this location
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                A student has already registered a complaint for this location path. Review the original complaint below and <strong className="text-amber-400">upvote it to escalate its priority score</strong> on the Admin Portal!
              </p>
            </div>
          </div>

          {/* Original Complaint Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-4 shadow-inner">
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                  {existingComplaint.categoryName}
                </span>
                {existingComplaint.issueTagLabel && (
                  <span className="font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                    Tag: {existingComplaint.issueTagLabel}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
                  STATUS: {existingComplaint.status}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-extrabold border border-indigo-500/30 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Score: {existingComplaint.priorityScore.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                Original Complaint Headline
              </span>
              <h3 className="text-lg font-extrabold text-[var(--text-primary)]">
                &quot;{existingComplaint.title}&quot;
              </h3>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                Description & Impact
              </span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-[var(--border-color)]">
                {existingComplaint.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)]">
              <div className="flex items-center gap-1.5 text-indigo-300 font-mono">
                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate">{existingComplaint.locationPath}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Filed by {existingComplaint.studentName}</span>
                </span>
                <time className="flex items-center gap-1" dateTime={existingComplaint.createdAt}>
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Filed {new Date(existingComplaint.createdAt).toLocaleString()}
                </time>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[var(--border-color)]">
            <div className="text-xs text-amber-200/90 font-medium">
              Click <strong className="text-amber-400 underline">Upvote Complaint</strong> to increase priority score by +1.5 & save to your Upvoted History!
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-slate-800"
              >
                Close
              </button>

              <UpvoteButton
                complaintId={existingComplaint.id}
                initialCount={existingComplaint.upvoteCount}
                initialHasUpvoted={existingComplaint.hasUpvoted}
                onUpvoteSuccess={() => {
                  onUpvoteComplete?.();
                  onClose();
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
