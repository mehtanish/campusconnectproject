'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { CascadingCategorySelector } from '@/components/complaints/CascadingCategorySelector';
import { DuplicateBanner } from '@/components/complaints/DuplicateBanner';
import { DuplicateComplaintModal } from '@/components/complaints/DuplicateComplaintModal';
import { PlusCircle, FileText, Tag, Send, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import type { Category, ComplaintResponse, DuplicateCheckResponse, IssueType } from '@/types';

export default function FileComplaintPage() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isLoading: isAuthLoading } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [locationPath, setLocationPath] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [issueTag, setIssueTag] = useState<string>('');

  // Controlled vocabulary — loaded from the API, not hardcoded
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [isLoadingIssueTypes, setIsLoadingIssueTypes] = useState<boolean>(true);

  const [isCheckingDedup, setIsCheckingDedup] = useState<boolean>(false);
  const [duplicateMatch, setDuplicateMatch] = useState<ComplaintResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Guard against unauthenticated visitors and admins
  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      toast.error('Please log in to your student account to file a complaint.');
      router.push('/login');
    } else if (isAdmin) {
      toast.info('Admins cannot file complaints. Redirecting to Admin Hub.');
      router.push('/admin');
    }
  }, [isAuthenticated, isAdmin, isAuthLoading, router]);

  // Fetch controlled-vocabulary issue types from the API on mount.
  useEffect(() => {
    async function fetchIssueTypes() {
      try {
        setIsLoadingIssueTypes(true);
        const res = await api.get<IssueType[]>('/api/issue-types');
        setIssueTypes(res.data);
        // Pre-select the first option so the field is never empty
        if (res.data.length > 0) {
          setIssueTag(res.data[0].stableKey);
        }
      } catch (err) {
        console.error('Failed to fetch issue types:', err);
        toast.error('Could not load issue types. Please refresh.');
      } finally {
        setIsLoadingIssueTypes(false);
      }
    }
    fetchIssueTypes();
  }, []);

  // Reactive dedup check: fires automatically whenever locationPath changes (upon selecting the 4 levels).
  useEffect(() => {
    if (!locationPath) return;
    triggerDedupCheck(locationPath);
  }, [locationPath]);

  if (isAuthLoading || !isAuthenticated || isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="glass-card p-8 space-y-4 max-w-sm">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto animate-spin">
              <PlusCircle className="w-6 h-6" />
            </div>
            <p className="text-xs text-[var(--text-secondary)] font-semibold">
              Verifying authorization...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Trigger deduplication check when 4-level locationPath is set.
  const triggerDedupCheck = async (locPath: string) => {
    if (!locPath) return;

    try {
      setIsCheckingDedup(true);
      const res = await api.post<DuplicateCheckResponse>('/api/complaints/check-duplicate', {
        locationPath: locPath,
      });

      if (res.data.isDuplicate && res.data.existingComplaint) {
        setDuplicateMatch(res.data.existingComplaint);
        setIsModalOpen(true);
        toast.warning(
          'Active complaint already registered at this location! Please upvote the existing complaint.',
          { duration: 6000 }
        );
      } else {
        setDuplicateMatch(null);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed dedup check:', err);
    } finally {
      setIsCheckingDedup(false);
    }
  };

  const handleCategorySelect = (category: Category, path: string) => {
    setSelectedCategory(category);
    setLocationPath(path);
    triggerDedupCheck(path);
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setIssueTag(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      toast.error('Please select the exact campus location path from the drop-downs.');
      return;
    }
    if (!issueTag) {
      toast.error('Please select an issue type.');
      return;
    }
    // BLOCK submission if an active duplicate exists.
    if (duplicateMatch) {
      setIsModalOpen(true);
      toast.error(
        'A complaint for this location path already exists. Please upvote the existing complaint in the popup window!',
        { duration: 6000 }
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/api/complaints', {
        title,
        description,
        categoryId: selectedCategory.id,
        locationPath,
        issueTag, // stable key from the controlled vocabulary
      });

      toast.success('Complaint submitted successfully! Domain admin notified.');
      router.push('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to submit complaint';
      toast.error(errMsg, { duration: 6000 });
      if (locationPath) {
        // Automatically fetch and show the existing complaint modal & upvote button
        await triggerDedupCheck(locationPath);
        setIsModalOpen(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group issue types by their groupKey for a more readable dropdown
  const groupedIssueTypes = issueTypes.reduce<Record<string, IssueType[]>>((acc, it) => {
    if (!acc[it.groupKey]) acc[it.groupKey] = [];
    acc[it.groupKey].push(it);
    return acc;
  }, {});

  const GROUP_LABELS: Record<string, string> = {
    wifi:        '📡 Wi-Fi & Network',
    washroom:    '🚿 Washrooms & Plumbing',
    mess:        '🍽️ Mess & Dining',
    academic:    '🏫 Academic Infrastructure',
    maintenance: '🔧 General Maintenance',
    security:    '🛡️ Security & Gate',
    general:     '📌 General',
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PICT Campus Parameterized Deduplication System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            File a <span className="gradient-text">Campus Issue Complaint</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Select the exact building, floor, and room from the drop-downs, then choose the issue type.
            If another student already reported an issue here, you can upvote it instantly!
          </p>
        </div>

        {/* Prominent Active Duplicate Banner (Top of Form) */}
        {duplicateMatch && (
          <DuplicateBanner
            existingComplaint={duplicateMatch}
            onUpvoteComplete={() => {
              toast.success('Complaint upvoted successfully! Saved to your Upvoted History.');
              router.push('/complaints/upvoted');
            }}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Campus Infrastructure Dropdown Selector */}
          <div className="glass-card p-6 border border-[var(--border-color)] space-y-4">
            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <span>Step 1: Select PICT Location</span>
            </h2>
            <CascadingCategorySelector onSelectCategory={handleCategorySelect} />
          </div>

          {/* Step 2: Issue Type — from controlled vocabulary */}
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Step 2: Select Issue Type
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-cyan-400" />
                What type of issue is this?
              </label>

              {isLoadingIssueTypes ? (
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  Loading issue types…
                </div>
              ) : issueTypes.length === 0 ? (
                <div className="flex items-center gap-2 text-xs text-rose-400 py-3">
                  <AlertCircle className="w-4 h-4" />
                  Could not load issue types. Please refresh the page.
                </div>
              ) : (
                <select
                  value={issueTag}
                  onChange={handleTagChange}
                  required
                  className="w-full text-xs p-3.5 bg-slate-950/80 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                >
                  {Object.entries(groupedIssueTypes).map(([groupKey, types]) => (
                    <optgroup key={groupKey} label={GROUP_LABELS[groupKey] ?? groupKey}>
                      {types.map((it) => (
                        <option key={it.stableKey} value={it.stableKey}>
                          {it.displayLabel}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}

              {/* Dedup spinner hint */}
              {isCheckingDedup && (
                <div className="flex items-center gap-1.5 text-xs text-indigo-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Checking for existing complaints at this location…
                </div>
              )}
            </div>

            {/* Active Duplicate Banner */}
            {duplicateMatch && (
              <DuplicateBanner
                existingComplaint={duplicateMatch}
                onUpvoteComplete={() => {
                  toast.success('Complaint upvoted successfully! Saved to your Upvoted History.');
                  router.push('/complaints/upvoted');
                }}
              />
            )}

            {/* Title */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                Complaint Headline / Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Washroom closed and unclean on Floor 1 of A3 Building"
                className="w-full text-xs p-3.5 bg-slate-950/60 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                Detailed Description & Impact
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide extra context (e.g. flush not working, door locked, affected timing)..."
                className="w-full text-xs p-3.5 bg-slate-950/60 border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-xs font-semibold px-5 py-3 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !selectedCategory || !issueTag || !!duplicateMatch}
              className="btn-kinetic px-7 py-3.5 text-xs flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Registering Complaint...'
                  : duplicateMatch
                  ? '⚠️ Duplicate Exists — Upvote Instead'
                  : 'Register Complaint'}
              </span>
            </button>
          </div>
        </form>
      </main>

      {/* Duplicate Complaint Modal Popup */}
      {duplicateMatch && (
        <DuplicateComplaintModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          existingComplaint={duplicateMatch}
          onUpvoteComplete={() => {
            toast.success('Complaint upvoted successfully! Saved to your Upvoted History.');
            router.push('/complaints/upvoted');
          }}
        />
      )}
    </div>
  );
}
