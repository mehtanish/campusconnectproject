'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { GlowCard } from './GlowCard';
import { Button } from './Button';
import api from '@/lib/api';
import { ComplaintActivityResponse, ComplaintTrackResponse, ComplaintStatus } from '@/types';
import {
  Activity,
  Search,
  ArrowRight,
  ShieldCheck,
  Flame,
  Clock,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Zap,
  Lock,
  Users,
  Loader2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ThumbsUp,
} from 'lucide-react';

export { Footer } from '@/components/layout/Footer';

// ─────────────────────────────────────────────────────────────────────────────
// Relative time helper ("12m ago" style)
// ─────────────────────────────────────────────────────────────────────────────
export function formatTimeAgo(dateString?: string | null): string {
  if (!dateString) return 'just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Live Activity Feed & Track Complaint Box Component
// ─────────────────────────────────────────────────────────────────────────────
export interface ActivityItem {
  id: string;
  title: string;
  building: string;
  status: ComplaintStatus | string;
  timeAgo: string;
}

export function LiveFeedAndTrack() {
  // Live Activity Stream State
  const [activities, setActivities] = useState<ComplaintActivityResponse[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Track Complaint Status State
  const [trackId, setTrackId] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState<ComplaintTrackResponse | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Fetch Live Activity from Real Complaints table
  const fetchActivities = useCallback(async (isSilent = false) => {
    if (isSilent) setIsRefreshing(true);

    try {
      const res = await api.get<ComplaintActivityResponse[]>('/api/public/complaints/activity');
      if (Array.isArray(res.data)) {
        setActivities(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch live complaints stream', err);
    } finally {
      setIsLoadingActivities(false);
      setIsRefreshing(false);
    }
  }, []);

  // Poll real-time activity stream every 30 seconds
  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) fetchActivities();
    });
    const interval = setInterval(() => {
      if (isMounted) fetchActivities(true);
    }, 30000); // 30 seconds
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [fetchActivities]);

  // Real Track Complaint Lookup Handler
  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = trackId.trim();
    if (!raw) return;

    // Normalize: strip leading '#' and convert to uppercase
    const cleanRef = raw.replace(/^#/, '').toUpperCase();

    // Verify format: expect 8-character CMP-XXXX code or UUID
    if (cleanRef.length !== 8 && cleanRef.length !== 36) {
      setLookupError('Reference code must be 8 characters in format CMP-XXXX (e.g. CMP-1048)');
      setLookupResult(null);
      return;
    }

    try {
      setIsLookingUp(true);
      setLookupError(null);
      setLookupResult(null);

      const res = await api.get<ComplaintTrackResponse>(
        `/api/public/complaints/track/${encodeURIComponent(cleanRef)}`
      );
      setLookupResult(res.data);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      const msg =
        errorObj.response?.data?.error ||
        `No complaint found with ticket reference "${cleanRef}". Please verify your 8-character code.`;
      setLookupError(msg);
      setLookupResult(null);
    } finally {
      setIsLookingUp(false);
    }
  };

  const getStatusBadge = (status: ComplaintStatus | string) => {
    const norm = (status || '').toUpperCase();
    switch (norm) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" aria-hidden="true" />
            Resolved
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
            <Clock className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} aria-hidden="true" />
            In Progress
          </span>
        );
      case 'ACCEPTED':
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300">
            <ShieldCheck className="w-3 h-3 text-blue-400" aria-hidden="true" />
            Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-300">
            <AlertCircle className="w-3 h-3 text-rose-400" aria-hidden="true" />
            Rejected
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Flame className="w-3 h-3 text-amber-400" aria-hidden="true" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch">
      {/* Left Column: Real Live Activity Stream (7 cols) */}
      <GlowCard className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between text-left relative overflow-hidden">
        <div>
          <div className="flex items-center justify-between mb-6 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 grid place-items-center">
                <Activity className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-xl font-display font-extrabold text-white">Live Activity Stream</h3>
                <p className="text-xs text-slate-400">Real-time status updates across PICT campus</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-400">LIVE TICKER</span>
            </div>
          </div>

          {/* Activity Feed Items from Real DB */}
          <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
            {isLoadingActivities ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 animate-pulse space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-slate-800 rounded w-28" />
                      <div className="h-4 bg-slate-800 rounded w-16" />
                    </div>
                    <div className="h-4 bg-slate-800 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-900/30 border border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-sm font-semibold text-white">All Campus Systems Nominal</p>
                <p className="text-xs text-slate-400">No active complaints logged in the last period.</p>
              </div>
            ) : (
              activities.map((act) => {
                const refCode = act.referenceId || act.id;
                return (
                  <motion.div
                    key={act.complaintId || refCode}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">{refCode}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-mono text-slate-300">{act.building || 'Campus Facilities'}</span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-white leading-snug">
                        {act.title}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      {getStatusBadge(act.status)}
                      <span className="text-xs text-slate-400 font-mono" title={act.updatedAt || act.createdAt}>
                        {formatTimeAgo(act.updatedAt || act.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Updates auto-refresh every 30 seconds</span>
          </div>
          <Link href="/complaints/upvoted" className="text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1">
            View All Complaints <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </GlowCard>

      {/* Right Column: Track Your Complaint Box (5 cols) */}
      <GlowCard className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between text-left relative overflow-hidden bg-gradient-to-br from-slate-950 via-cyan-950/20 to-slate-950">
        <div>
          <div className="size-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 grid place-items-center mb-6 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Search className="w-6 h-6" aria-hidden="true" />
          </div>

          <h3 className="text-2xl font-display font-extrabold text-white mb-2">
            Track Complaint Status
          </h3>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            Enter your 8-character Complaint Reference Code to check real-time admin resolution progress.
          </p>

          <form onSubmit={handleTrackSubmit} className="space-y-4">
            <div>
              <label htmlFor="complaint-id-input" className="block text-xs font-mono font-semibold text-slate-300 mb-2">
                COMPLAINT TICKET ID
              </label>
              <div className="relative">
                <input
                  id="complaint-id-input"
                  type="text"
                  value={trackId}
                  onChange={(e) => {
                    setTrackId(e.target.value);
                    if (lookupError) setLookupError(null);
                  }}
                  placeholder="e.g. CMP-1048"
                  maxLength={36}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono text-sm uppercase tracking-wider"
                />
                <button
                  type="submit"
                  disabled={isLookingUp}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {isLookingUp ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <span>Lookup</span>
                  )}
                </button>
              </div>
            </div>

            {/* Validation or Lookup Error */}
            {lookupError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-mono text-rose-300 bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{lookupError}</span>
              </motion.div>
            )}

            {/* Real Complaint Status Card Display */}
            {lookupResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-xl space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-mono text-sm font-bold text-cyan-400">
                    #{lookupResult.referenceId || lookupResult.id}
                  </span>
                  <div>{getStatusBadge(lookupResult.status)}</div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white leading-snug">{lookupResult.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    📍 {lookupResult.locationPath}
                  </p>
                </div>

                {lookupResult.adminNote && (
                  <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200">
                    <span className="font-mono font-bold text-[10px] uppercase text-cyan-400 block mb-0.5">
                      Admin Update
                    </span>
                    {lookupResult.adminNote}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400 font-mono">
                  <span className="flex items-center gap-1 text-slate-300">
                    <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" /> {lookupResult.upvoteCount} upvotes
                  </span>
                  <span>Updated {formatTimeAgo(lookupResult.updatedAt || lookupResult.createdAt)}</span>
                </div>

                <div className="pt-1">
                  <Link
                    href={`/complaints?id=${encodeURIComponent(lookupResult.referenceId || lookupResult.id)}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold transition-all"
                  >
                    <span>View Ticket Details</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            )}
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <span>Instant notification dispatched on status change</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />
            <span>Duplicate issues automatically linked</span>
          </div>
        </div>
      </GlowCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. FAQ Accordion Component
// ─────────────────────────────────────────────────────────────────────────────
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Are my complaint submissions completely anonymous?',
    answer: 'Yes. Student identity details are kept strictly confidential by default. Only designated campus infrastructure administrators process issue resolution tickets.',
    icon: Lock,
  },
  {
    id: 'faq-2',
    question: 'How long does it usually take for an issue to be resolved?',
    answer: 'Urgent electrical or water emergencies are attended within 2 to 4 hours. General maintenance issues are processed within 24 to 48 business hours.',
    icon: Clock,
  },
  {
    id: 'faq-3',
    question: 'What happens when a duplicate complaint is detected?',
    answer: 'Our automated deduplication engine scans category and building locations to aggregate matching issues. Your vote adds to the existing ticket priority score instead of creating duplicate noise.',
    icon: Zap,
  },
  {
    id: 'faq-4',
    question: 'How do upvotes affect complaint resolution priority?',
    answer: 'Upvotes directly raise a complaint’s priority score. Tickets reaching high-priority thresholds are highlighted on domain admin dashboards for urgent attention.',
    icon: ShieldCheck,
  },
  {
    id: 'faq-5',
    question: 'Who can access the Admin Command Center?',
    answer: 'Only verified PICT department heads, rector staff, and authorized maintenance team members with secure credentials can log into the Admin Command Center.',
    icon: Users,
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 text-left">
      {FAQ_DATA.map((faq, idx) => {
        const isOpen = openIndex === idx;
        const Icon = faq.icon;
        return (
          <div
            key={faq.id}
            className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
              isOpen
                ? 'bg-slate-900/90 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <button
              type="button"
              onClick={() => toggleAccordion(idx)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${idx}`}
              className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`size-10 rounded-xl border grid place-items-center shrink-0 transition-colors ${
                    isOpen
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <h3 className="text-base sm:text-lg font-display font-bold text-white leading-snug">
                  {faq.question}
                </h3>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-cyan-400' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-answer-${idx}`}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-6 pb-6 pt-2 text-sm text-slate-300 leading-relaxed border-t border-slate-800/50 ml-14">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Final CTA Banner Component
// ─────────────────────────────────────────────────────────────────────────────
export function CTABanner() {
  return (
    <div className="relative w-full rounded-3xl p-8 sm:p-12 overflow-hidden border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-slate-950 to-violet-950/40 text-center shadow-2xl shadow-cyan-500/10">
      {/* Glow Orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-violet-500/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
          <span>FAST CAMPUS LOGISTICS</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight">
          Report an issue in <span className="gradient-text-cyber">30 seconds</span>
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Help keep Pune Institute of Computer Technology safe, clean, and operating at peak performance.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/complaints/new">
            <Button size="lg" className="cyber-button-glow font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 px-8 py-3.5 text-base rounded-xl w-full sm:w-auto">
              File a Complaint Now <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="border-slate-700 text-white hover:bg-slate-900/80 px-8 py-3.5 text-base rounded-xl w-full sm:w-auto">
              Student Portal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
