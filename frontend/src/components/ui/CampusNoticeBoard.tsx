'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellRing,
  Radio,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  X,
  FileText,
  Pin,
  Calendar,
  UserCheck,
  AlertTriangle,
  Info,
  Zap,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Notice, NoticeCategory, NoticePriority } from '@/types/notice';
import { getPublishedNotices } from '@/lib/notices';

export function CampusNoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [incomingPulse, setIncomingPulse] = useState(false);

  // Load notices and set up listener for live updates from Admin Portal
  const loadNotices = useCallback(() => {
    const data = getPublishedNotices();
    setNotices(data);
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.resolve().then(() => {
      if (isMounted) loadNotices();
    });

    const handleUpdate = () => {
      loadNotices();
      // Trigger incoming pulse when updated
      setIncomingPulse(true);
      const t = setTimeout(() => setIncomingPulse(false), 3000);
      return () => clearTimeout(t);
    };

    window.addEventListener('campus-notices-updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('campus-notices-updated', handleUpdate);
    };
  }, [loadNotices]);

  // Periodic incoming notice micro-pulse simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setIncomingPulse(true);
      setTimeout(() => setIncomingPulse(false), 2500);
    }, 18000);
    return () => clearInterval(interval);
  }, []);

  // Category badge colors & styling
  const getCategoryBadgeStyle = (category: NoticeCategory) => {
    switch (category) {
      case 'URGENT':
      case 'IMPORTANT':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-rose-500/10';
      case 'EXAMINATION':
      case 'ACADEMIC':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-cyan-500/10';
      case 'EVENT':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-purple-500/10';
      case 'MAINTENANCE':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-amber-500/10';
      default:
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30 shadow-blue-500/10';
    }
  };

  const getPriorityBadgeStyle = (priority: NoticePriority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
      case 'HIGH':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
      case 'NORMAL':
        return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40';
      default:
        return 'text-slate-400 bg-slate-500/20 border-slate-500/40';
    }
  };

  const filteredNotices = notices.filter((n) => {
    if (filter === 'ALL') return true;
    if (filter === 'PINNED') return n.pinned;
    return n.category === filter;
  });

  return (
    <div className="relative w-full max-w-[620px] mx-auto select-none">
      {/* ── SUPER ADMIN BROADCAST FLOW MICROINTERACTION ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800/80 backdrop-blur-md text-[10px] font-mono text-slate-400"
      >
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>SUPER ADMIN</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="hidden sm:inline tracking-wider">LIVE BROADCAST</span>
          <span className="text-cyan-500 font-bold">➔</span>
        </div>
        <div className="flex items-center gap-1 text-purple-300 font-semibold">
          <Radio className="w-3 h-3 text-purple-400" />
          <span>NOTICE BOARD</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-slate-500">
          <span className="text-purple-500 font-bold">➔</span>
          <span className="text-slate-300">STUDENTS / FACULTY</span>
        </div>
      </motion.div>

      {/* ── MAIN FLOATING HUD ELECTRONIC BOARD ────────────────────────────────── */}
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative rounded-2xl p-5 border border-cyan-500/30 bg-slate-950/85 backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden"
      >
        {/* Futuristic Scanline Effect */}
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl opacity-40">
          <motion.div
            animate={{ y: ['-100%', '300%'] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
            className="w-full h-24 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent border-b border-cyan-400/30"
          />
        </div>

        {/* Ambient Corner Glow accents */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* HUD Top Coordinates & Bar Meta */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 tracking-wider mb-3 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">PICT // CAMPUS NETWORK</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-500">SYS_ID: 0x9F4B</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              LIVE
            </span>
          </div>
        </div>

        {/* Notice Board Main Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-pulse" />
              <h2 className="text-lg sm:text-xl font-display font-extrabold tracking-tight text-white flex items-center gap-2">
                CAMPUS NOTICE BOARD
                {incomingPulse && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-normal px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  >
                    <Sparkles className="w-3 h-3 text-purple-300 animate-spin" />
                    NEW
                  </motion.span>
                )}
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 pl-4">
              PICT • GENERAL & ACADEMIC BROADCAST
            </p>
          </div>

          {/* Status Indicators Pill */}
          <div className="flex items-center gap-2 text-[10px] font-mono self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM ONLINE
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
              {notices.length} NOTICES
            </span>
          </div>
        </div>

        {/* Quick Category Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none text-[11px] font-mono">
          {['ALL', 'EXAMINATION', 'EVENT', 'URGENT', 'MAINTENANCE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-md transition-all whitespace-nowrap ${
                filter === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20 font-bold'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── NOTICE CARDS SCROLLABLE CONTAINER ──────────────────────────────── */}
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {filteredNotices.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
              NO ACTIVE NOTICES FOUND FOR CATEGORY: {filter}
            </div>
          ) : (
            filteredNotices.map((notice, idx) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => setSelectedNotice(notice)}
                className="group relative rounded-xl p-3.5 bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer shadow-md hover:shadow-cyan-500/10 hover:-translate-y-0.5"
              >
                {/* Notice Header Row: Category Badge + Pinned + Date */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getCategoryBadgeStyle(
                        notice.category
                      )}`}
                    >
                      {notice.category}
                    </span>
                    {notice.pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                        <Pin className="w-2.5 h-2.5 fill-amber-400" />
                        PINNED
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>
                      {new Date(notice.publishedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Title & Short Snippet */}
                <h3 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-1 pr-6">
                  {notice.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans mb-2">
                  {notice.description}
                </p>

                {/* Footer Action Row */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/50 text-[10px] font-mono text-slate-400">
                  <span className="text-slate-400">
                    By <strong className="text-cyan-400 font-semibold">{notice.createdBy}</strong>
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-1 transition-transform font-semibold">
                    Read Notice <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* HUD Footer Status */}
        <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span>NODE: PICT-01</span>
            <span>•</span>
            <span>CHANNEL: GENERAL</span>
            <span>•</span>
            <span className="text-emerald-400">SYNC: 100%</span>
          </div>
          <div className="hidden sm:block text-slate-400">
            SECURE CHANNEL • ADMIN BROADCAST
          </div>
        </div>
      </motion.div>

      {/* ── EXPANDED NOTICE MODAL OVERLAY ────────────────────────────────────── */}
      <AnimatePresence>
        {selectedNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative w-full max-w-xl rounded-2xl border border-cyan-500/40 bg-slate-900/95 p-6 shadow-[0_0_60px_rgba(6,182,212,0.25)] text-slate-200"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedNotice(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Category & Priority Header */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${getCategoryBadgeStyle(
                    selectedNotice.category
                  )}`}
                >
                  {selectedNotice.category}
                </span>
                <span
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${getPriorityBadgeStyle(
                    selectedNotice.priority
                  )}`}
                >
                  {selectedNotice.priority} PRIORITY
                </span>
                {selectedNotice.pinned && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
                    <Pin className="w-3 h-3 fill-amber-400" />
                    PINNED TO TOP
                  </span>
                )}
              </div>

              {/* Modal Title */}
              <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white mb-3">
                {selectedNotice.title}
              </h2>

              {/* Metadata Panel */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono mb-4 text-slate-400">
                <div>
                  <span className="text-slate-400 block text-[10px]">PUBLISHED DATE:</span>
                  <span className="text-slate-200 font-semibold">
                    {new Date(selectedNotice.publishedAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PUBLISHED BY:</span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                    {selectedNotice.createdBy}
                  </span>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-2 mb-6">
                <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Official Notice Content:
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-4 rounded-xl border border-slate-800/60 whitespace-pre-line">
                  {selectedNotice.description}
                </p>
              </div>

              {/* Attachment Indicator if applicable */}
              {selectedNotice.attachmentUrl && (
                <div className="mb-6 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono text-cyan-200">
                      Document Attachment Included
                    </span>
                  </div>
                  <a
                    href={selectedNotice.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline font-semibold"
                  >
                    View File <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs font-mono transition-colors shadow-lg shadow-cyan-500/20"
                >
                  CLOSE NOTICE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
