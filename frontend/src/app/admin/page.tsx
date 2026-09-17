'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { ComplaintPriorityQueue } from '@/components/complaints/ComplaintPriorityQueue';
import { motion } from 'framer-motion';
import {
  Shield,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Check,
  X,
  Flame,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import type { ComplaintResponse, ClaimResponse, AdminStats } from '@/types';

export default function AdminAnalyticsHub() {
  const { user, isSuperAdmin } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [pendingClaims, setPendingClaims] = useState<ClaimResponse[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Scanner state
  const [scanCode, setScanCode] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [compRes, claimRes, statsRes] = await Promise.all([
        api.get<ComplaintResponse[]>('/api/admin/complaints').catch((err) => {
          console.error('Failed to fetch admin complaints:', err);
          return { data: [] as ComplaintResponse[] };
        }),
        api.get<ClaimResponse[]>('/api/admin/claims/pending').catch((err) => {
          console.error('Failed to fetch pending claims:', err);
          return { data: [] as ClaimResponse[] };
        }),
        api.get<AdminStats>('/api/admin/stats').catch((err) => {
          console.error('Failed to fetch admin stats:', err);
          return { data: null };
        }),
      ]);

      setComplaints(compRes.data);
      setPendingClaims(claimRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveClaim = async (claimId: string) => {
    try {
      await api.post(`/api/admin/lost-found/${claimId}/approve`);
      toast.success('Claim approved! Secure 6-digit claim code generated.');
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to approve claim');
    }
  };

  const handleRejectClaim = async (claimId: string) => {
    try {
      await api.post(`/api/admin/lost-found/${claimId}/reject`);
      toast.success('Claim rejected.');
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to reject claim');
    }
  };

  const handleVerifyClaimCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCode.trim()) return;

    try {
      setIsVerifyingCode(true);
      const res = await api.post(`/api/lost-found/verify/${scanCode.trim()}`);
      toast.success(`Handover Complete! Item "${res.data.title}" marked as RETURNED.`);
      setScanCode('');
      fetchAdminData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Invalid or expired claim code');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const downloadReport = async (endpoint: string, filename: string) => {
    try {
      const response = await api.get(`/api/admin/reports/${endpoint}`, {
        responseType: 'arraybuffer',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`Report downloaded: ${filename}`);
    } catch (err: any) {
      console.error('Download error:', err);
      toast.error('Failed to download Excel report');
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header with Excel Export Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md uppercase">
                {user?.role}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mt-1">
              Admin Priority Hub & <span className="gradient-text">Analytics</span>
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              Domain-filtered priority queues, claim verification approvals, and Excel report generation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => downloadReport('export-complaints', 'complaints-report.xlsx')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs hover:bg-emerald-600/30 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Complaints (.xlsx)</span>
            </button>

            <button
              onClick={() => downloadReport('export-lost-found', 'lost-found-report.xlsx')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-semibold text-xs hover:bg-indigo-600/30 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Lost & Found (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Analytics Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 space-y-1">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Total Complaints
            </span>
            <div className="text-2xl font-extrabold text-[var(--text-primary)]">
              {stats?.totalComplaints ?? 0}
            </div>
          </div>

          <div className="glass-card p-4 space-y-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Pending Action
            </span>
            <div className="text-2xl font-extrabold text-amber-400">
              {stats?.pendingComplaints ?? 0}
            </div>
          </div>

          <div className="glass-card p-4 space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Resolved Issues
            </span>
            <div className="text-2xl font-extrabold text-emerald-400">
              {stats?.resolvedComplaints ?? 0}
            </div>
          </div>

          <div className="glass-card p-4 space-y-1">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Total Lost & Found
            </span>
            <div className="text-2xl font-extrabold text-indigo-400">
              {stats?.totalLostFound ?? 0}
            </div>
          </div>
        </div>

        {/* Handover Code Verification Bar */}
        <div className="glass-card p-5 border-indigo-500/30 bg-indigo-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-400" />
              Handover Office: Verify 6-Digit Claim Code / QR
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Enter the student's 6-digit claim code during item handover to mark as RETURNED.
            </p>
          </div>

          <form onSubmit={handleVerifyClaimCode} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              maxLength={6}
              value={scanCode}
              onChange={(e) => setScanCode(e.target.value.toUpperCase())}
              placeholder="e.g. X7K9A2"
              className="text-xs font-mono font-bold tracking-widest px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none uppercase w-36"
            />
            <button
              type="submit"
              disabled={isVerifyingCode || !scanCode}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              {isVerifyingCode ? 'Verifying...' : 'Verify Handover'}
            </button>
          </form>
        </div>

        {/* Pending Lost & Found Claims Review Section */}
        {pendingClaims.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Pending Item Claims Review ({pendingClaims.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="glass-card p-4 space-y-3 border-amber-500/20 bg-amber-500/5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                        Item: {claim.itemTitle}
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Claimant: {claim.claimantName} ({claim.claimantRollNo})
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md">
                      PENDING
                    </span>
                  </div>

                  <div className="p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs space-y-1">
                    <span className="font-semibold text-indigo-400">Proof Answers:</span>
                    <p className="text-[var(--text-secondary)] italic">{claim.proofDescription}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleRejectClaim(claim.id)}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApproveClaim(claim.id)}
                      className="flex items-center gap-1 text-xs font-semibold px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Claim</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complaint Priority Queue */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Domain Priority Queue
          </h3>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 glass-card animate-pulse" />
              ))}
            </div>
          ) : (
            <ComplaintPriorityQueue
              complaints={complaints}
              onRefresh={() => fetchAdminData()}
            />
          )}
        </div>
      </main>
    </div>
  );
}
