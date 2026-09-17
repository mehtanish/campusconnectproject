'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, RefreshCw, XCircle, ShieldCheck } from 'lucide-react';
import type { ComplaintStatus } from '@/types';

interface ComplaintStatusTrackerProps {
  currentStatus: ComplaintStatus;
}

const STEPS: { status: ComplaintStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: 'PENDING', label: 'Pending', icon: Clock },
  { status: 'APPROVED', label: 'Approved', icon: ShieldCheck },
  { status: 'IN_PROGRESS', label: 'In Progress', icon: RefreshCw },
  { status: 'RESOLVED', label: 'Resolved', icon: CheckCircle2 },
];

export function ComplaintStatusTracker({ currentStatus }: ComplaintStatusTrackerProps) {
  if (currentStatus === 'REJECTED') {
    return (
      <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl">
        <XCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-semibold">Complaint Rejected</span>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <div className="w-full py-3">
      <div className="relative flex items-center justify-between">
        {/* Progress Bar Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-[var(--border-color)] -translate-y-1/2 z-0 rounded-full" />

        {/* Active Progress Fill */}
        <motion.div
          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 -translate-y-1/2 z-0 rounded-full"
          initial={{ width: '0%' }}
          animate={{
            width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {/* Step Nodes */}
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.status} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCurrent
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/30'
                    : isPassed
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isCurrent && step.status === 'IN_PROGRESS' ? 'animate-spin' : ''}`} />

                {/* Pulse effect on current active node */}
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full bg-indigo-500/40 animate-ping -z-10" />
                )}
              </motion.div>

              <span
                className={`mt-2 text-xs font-medium transition-colors ${
                  isCurrent
                    ? 'text-indigo-400 font-semibold'
                    : isPassed
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
