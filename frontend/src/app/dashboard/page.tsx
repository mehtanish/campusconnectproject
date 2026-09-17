'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { ComplaintStatusTracker } from '@/components/complaints/ComplaintStatusTracker';
import { UpvoteButton } from '@/components/complaints/UpvoteButton';
import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle2,
  Flame,
  PlusCircle,
  Search,
  ChevronRight,
  ShieldAlert,
  ThumbsUp,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { ComplaintResponse, ClaimResponse } from '@/types';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [claims, setClaims] = useState<ClaimResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [compRes, claimRes] = await Promise.all([
        api.get<ComplaintResponse[]>('/api/complaints/my').catch((err) => {
          console.error('Failed to fetch complaints:', err);
          return { data: [] as ComplaintResponse[] };
        }),
        api.get<ClaimResponse[]>('/api/lost-found/my-claims').catch((err) => {
          console.error('Failed to fetch claims:', err);
          return { data: [] as ClaimResponse[] };
        }),
      ]);
      setComplaints(compRes.data);
      setClaims(claimRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter((c) => c.status === 'RESOLVED').length;
  const activeComplaints = complaints.filter(
    (c) => c.status === 'PENDING' || c.status === 'APPROVED' || c.status === 'IN_PROGRESS'
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Welcome back, <span className="gradient-text">{user?.name || 'Student'}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Track your filed complaints, view status updates, and manage upvoted issues & lost item claims.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/complaints/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity"
            >
              <PlusCircle className="w-4 h-4" />
              <span>File Complaint</span>
            </Link>

            <Link
              href="/complaints/upvoted"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-semibold text-xs hover:bg-indigo-500/20 transition-all"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Upvoted History</span>
            </Link>

            <Link
              href="/lost-found"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] font-semibold text-xs hover:border-indigo-500/50 transition-all"
            >
              <Search className="w-4 h-4 text-indigo-400" />
              <span>Lost & Found</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5 space-y-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Total Filed
              </span>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                {totalComplaints}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-5 space-y-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Active Issues
              </span>
              <div className="text-2xl font-bold text-amber-400">
                {activeComplaints}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="glass-card p-5 space-y-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Resolved
              </span>
              <div className="text-2xl font-bold text-emerald-400">
                {resolvedComplaints}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Approved Lost Item Claims QR Code Section */}
        {claims.some((c) => c.status === 'APPROVED' && c.claimCode) && (
          <div className="glass-card p-6 border-indigo-500/30 bg-indigo-950/20 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Approved Handover QR Codes
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {claims
                .filter((c) => c.status === 'APPROVED' && c.claimCode)
                .map((claim) => (
                  <div
                    key={claim.id}
                    className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl flex items-center gap-4"
                  >
                    <div className="bg-white p-2 rounded-lg shrink-0">
                      <QRCodeSVG value={claim.claimCode!} size={80} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        APPROVED
                      </span>
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                        {claim.itemTitle}
                      </h4>
                      <div className="font-mono text-xs text-indigo-400 font-bold tracking-wider">
                        Code: {claim.claimCode}
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        Show this QR code to the admin at the handover desk.
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* My Complaints Timeline Feed */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            My Complaints Timeline
          </h3>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 glass-card animate-pulse" />
              ))}
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-16 glass-card space-y-3">
              <FileText className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
              <p className="text-sm text-[var(--text-secondary)]">
                You haven't filed any complaints yet.
              </p>
              <Link
                href="/complaints/new"
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 text-white"
              >
                <span>File your first complaint</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md">
                        {item.categoryName}
                      </span>
                      <h4 className="text-base font-semibold text-[var(--text-primary)]">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {item.locationPath}
                      </p>
                    </div>

                    <UpvoteButton
                      complaintId={item.id}
                      initialCount={item.upvoteCount}
                      initialHasUpvoted={item.hasUpvoted}
                      onUpvoteSuccess={() => fetchData()}
                    />
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {item.description}
                  </p>

                  {/* Status Progress Tracker */}
                  <ComplaintStatusTracker currentStatus={item.status} />

                  {/* Admin Response Note */}
                  {item.adminNote && (
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 space-y-1">
                      <span className="font-semibold text-indigo-400">
                        Official Admin Note:
                      </span>
                      <p className="italic">{item.adminNote}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
