'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { GlowCard } from '@/components/ui/GlowCard';
import { Button } from '@/components/ui/Button';
import { ComplaintStatusTracker } from '@/components/complaints/ComplaintStatusTracker';
import { formatTimeAgo } from '@/components/ui/HomeSections';
import api from '@/lib/api';
import type { ComplaintTrackResponse } from '@/types';
import {
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Flame,
  AlertCircle,
  ThumbsUp,
  MapPin,
  Tag,
  Calendar,
  Loader2,
  PlusCircle,
} from 'lucide-react';

function ComplaintTrackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialId = searchParams.get('id') || '';

  const [inputCode, setInputCode] = useState(initialId);
  const [ticket, setTicket] = useState<ComplaintTrackResponse | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(initialId));
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async (code: string) => {
    const clean = code.trim().replace(/^#/, '').toUpperCase();
    if (!clean) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get<ComplaintTrackResponse>(
        `/api/public/complaints/track/${encodeURIComponent(clean)}`
      );
      setTicket(res.data);
      setError(null);
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setError(
        errorObj.response?.data?.error ||
          `Ticket with reference "${clean}" was not found. Please double-check your code.`
      );
      setTicket(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (initialId) {
      Promise.resolve().then(() => {
        if (isMounted) fetchTicket(initialId);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [initialId, fetchTicket]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const clean = inputCode.trim().replace(/^#/, '').toUpperCase();
    setIsLoading(true);
    router.push(`/complaints?id=${encodeURIComponent(clean)}`);
    fetchTicket(clean);
  };

  const getStatusBadge = (status: string) => {
    const norm = (status || '').toUpperCase();
    switch (norm) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Resolved
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '4s' }} />
            In Progress
          </span>
        );
      case 'ACCEPTED':
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/15 border border-blue-500/30 text-blue-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Accepted
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            Rejected
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>OFFICIAL PICT TICKET TRACKER</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
          Complaint Status & Resolution Tracking
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Look up real-time administrative triage progress and facilities updates using your 8-character reference code.
        </p>
      </div>

      {/* Search Input Bar */}
      <GlowCard className="p-4 sm:p-6 bg-slate-900/80 border-slate-800">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="Enter Reference Code (e.g. CMP-1048)"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm uppercase tracking-wider focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>
          <Button
            type="submit"
            variant="cyber"
            size="md"
            isLoading={isLoading}
            className="px-6 min-h-[48px] font-mono text-xs font-bold"
          >
            Track Status
          </Button>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </GlowCard>

      {/* Ticket Details View */}
      {isLoading ? (
        <div className="p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Fetching ticket status from campus repository...</p>
        </div>
      ) : ticket ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <GlowCard className="p-6 sm:p-8 space-y-6 bg-slate-950 border-cyan-500/30 shadow-2xl">
            {/* Ticket Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">Official Reference Code</span>
                <div className="text-2xl font-mono font-extrabold text-cyan-300">
                  #{ticket.referenceId || ticket.id}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(ticket.status)}
              </div>
            </div>

            {/* Lifecycle Tracker */}
            <div className="py-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-2">Resolution Lifecycle</span>
              <ComplaintStatusTracker currentStatus={ticket.status} />
            </div>

            {/* Title & Description */}
            <div className="space-y-3 pt-2">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white leading-snug">
                {ticket.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                {ticket.description}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" /> Location
                </span>
                <p className="text-xs font-semibold text-slate-200 truncate">{ticket.locationPath}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3 text-violet-400" /> Issue Type
                </span>
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {ticket.issueTagLabel || ticket.issueTag}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-400" /> Last Activity
                </span>
                <p className="text-xs font-semibold text-slate-200">
                  {formatTimeAgo(ticket.updatedAt || ticket.createdAt)}
                </p>
              </div>
            </div>

            {/* Admin Note if present */}
            {ticket.adminNote && (
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/40 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold uppercase">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Official Admin Resolution Note</span>
                </div>
                <p className="text-xs text-cyan-100 leading-relaxed font-sans pl-6">
                  {ticket.adminNote}
                </p>
              </div>
            )}

            {/* Footer Information */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ThumbsUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>{ticket.upvoteCount} students confirmed this issue</span>
              </span>
              <span>Updated: {new Date(ticket.updatedAt || ticket.createdAt).toLocaleDateString()}</span>
            </div>
          </GlowCard>

          {/* Quick Action Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="secondary" size="md" className="w-full sm:w-auto">
                Back to Command Center
              </Button>
            </Link>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/complaints/upvoted" className="w-full sm:w-auto">
                <Button variant="secondary" size="md" className="w-full sm:w-auto">
                  View Upvoted Feed
                </Button>
              </Link>
              <Link href="/complaints/new" className="w-full sm:w-auto">
                <Button variant="cyber" size="md" className="w-full sm:w-auto gap-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>File New Complaint</span>
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      ) : !initialId ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800 space-y-4">
          <div className="size-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 grid place-items-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Ready for Ticket Lookup</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Enter your ticket reference ID (such as CMP-1048) in the search box above to track live progress.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/complaints/upvoted">
              <Button variant="secondary" size="sm" className="gap-2">
                <span>Browse All Active Campus Issues</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function ComplaintTrackingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 cyber-grid-bg">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            </div>
          }
        >
          <ComplaintTrackContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
