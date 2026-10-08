'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, MapPin, Tag, ThumbsUp, Sparkles, Clock, CheckCircle2, User } from 'lucide-react';
import { UpvoteButton } from './UpvoteButton';
import type { ComplaintResponse } from '@/types';

interface DuplicateBannerProps {
  existingComplaint: ComplaintResponse;
  onUpvoteComplete?: () => void;
}

export function DuplicateBanner({
  existingComplaint,
  onUpvoteComplete,
}: DuplicateBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="p-6 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-amber-950/30 shadow-2xl backdrop-blur-xl space-y-5"
    >
      <div className="flex items-start justify-between gap-4 border-b border-amber-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40 shadow-lg shadow-amber-500/20">
            <AlertTriangle className="w-6 h-6 animate-pulse text-amber-400" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Complaint Already Registered Here!</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
              An active issue has already been reported for this location path. You can upvote it below to escalate its priority!
            </p>
          </div>
        </div>

        <div className="shrink-0 font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
          STATUS: {existingComplaint.status}
        </div>
      </div>

      {/* Existing Complaint Details Card */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-500/20 space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
            Category: {existingComplaint.categoryName}
          </span>
          {existingComplaint.issueTagLabel && (
            <span className="font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-md border border-cyan-500/20">
              Tag: {existingComplaint.issueTagLabel}
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-[var(--text-primary)]">
          "{existingComplaint.title}"
        </h3>

        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {existingComplaint.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-indigo-300 font-mono pt-1">
          <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="truncate">{existingComplaint.locationPath}</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            Filed by {existingComplaint.studentName}
          </span>
          <time className="flex items-center gap-1.5" dateTime={existingComplaint.createdAt}>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            {new Date(existingComplaint.createdAt).toLocaleString()}
          </time>
        </div>
      </div>

      {/* Direct Upvote Call to Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        <div className="text-xs text-amber-200/90 font-medium">
          The complaint you are trying to register is already registered. <br className="hidden sm:inline" />
          <strong className="text-amber-400 underline">Upvote it now to increase its priority score for admins!</strong>
        </div>

        <div className="shrink-0">
          <UpvoteButton
            complaintId={existingComplaint.id}
            initialCount={existingComplaint.upvoteCount}
            initialHasUpvoted={existingComplaint.hasUpvoted}
            onUpvoteSuccess={() => onUpvoteComplete?.()}
          />
        </div>
      </div>
    </motion.div>
  );
}
