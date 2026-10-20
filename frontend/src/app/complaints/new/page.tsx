'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { CascadingCategorySelector } from '@/components/complaints/CascadingCategorySelector';
import { DuplicateBanner } from '@/components/complaints/DuplicateBanner';
import { DuplicateComplaintModal } from '@/components/complaints/DuplicateComplaintModal';
import {
  FileText,
  Tag,
  Send,
  Sparkles,
  Loader2,
  Check,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Building2,
  MapPin,
  Copy,
  RotateCcw,
  Home,
  LayoutDashboard,
  AlertCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import type { Category, ComplaintResponse, DuplicateCheckResponse, IssueType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GlowCard } from '@/components/ui/GlowCard';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';

export default function FileComplaintPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isLoading: isAuthLoading } = useAuth();

  // Wizard Step State (1: Location/Category, 2: Details, 3: Review, 4: Success Ticket)
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [locationPath, setLocationPath] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [issueTag, setIssueTag] = useState<string>('');

  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [isLoadingIssueTypes, setIsLoadingIssueTypes] = useState<boolean>(true);

  const [duplicateMatch, setDuplicateMatch] = useState<ComplaintResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Field validation and confirmation states
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; description?: string; location?: string }>({});
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Submitted ticket result state
  const [createdComplaint, setCreatedComplaint] = useState<ComplaintResponse | null>(null);

  // Guard against admins filing complaints
  useEffect(() => {
    if (isAuthLoading) return;
    if (isAdmin) {
      toast.info('Admins cannot file complaints. Redirecting to Admin Hub.');
      router.push('/admin');
    }
  }, [isAdmin, isAuthLoading, router]);

  // Fetch issue types on mount
  useEffect(() => {
    async function fetchIssueTypes() {
      try {
        setIsLoadingIssueTypes(true);
        const res = await api.get<IssueType[]>('/api/issue-types');
        setIssueTypes(res.data);
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

  const triggerDedupCheck = async (locPath: string) => {
    if (!locPath) return;

    try {
      const res = await api.post<DuplicateCheckResponse>('/api/complaints/check-duplicate', {
        locationPath: locPath,
      });

      if (res.data.isDuplicate && res.data.existingComplaint) {
        setDuplicateMatch(res.data.existingComplaint);
        setIsModalOpen(true);
      } else {
        setDuplicateMatch(null);
      }
    } catch (err) {
      console.error('Dedup check failed:', err);
    }
  };

  const validateStep2 = () => {
    const errors: { title?: string; description?: string } = {};
    if (!title.trim()) {
      errors.title = 'Please enter a descriptive complaint title.';
    } else if (title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters long (e.g. Broken Projector in Lab 204).';
    }

    if (!description.trim()) {
      errors.description = 'Please provide detailed context regarding the issue.';
    } else if (description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters long to provide sufficient context.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCopyTracking = () => {
    if (!createdComplaint) return;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://campusconnectproject-nu.vercel.app';
    const refCode = createdComplaint.referenceId || createdComplaint.id;
    const trackingUrl = `${baseUrl}/complaints?id=${refCode}`;
    const copyText = `CampusConnect PICT Complaint #${refCode}: ${createdComplaint.title}\nStatus: ${createdComplaint.status}\nTracking: ${trackingUrl}`;
    navigator.clipboard.writeText(copyText);
    setHasCopied(true);
    toast.success('Tracking reference and details copied to clipboard!');
    setTimeout(() => setHasCopied(false), 2500);
  };

  const handleResetForAnother = () => {
    setCurrentStep(1);
    setSelectedCategory(null);
    setLocationPath('');
    setTitle('');
    setDescription('');
    setCreatedComplaint(null);
    setDuplicateMatch(null);
    setFieldErrors({});
    if (issueTypes.length > 0) {
      setIssueTag(issueTypes[0].stableKey);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!selectedCategory) {
      toast.error('Please select the exact campus location path.');
      return;
    }
    if (!issueTag) {
      toast.error('Please select an issue type.');
      return;
    }
    if (duplicateMatch) {
      setIsModalOpen(true);
      toast.error('A complaint for this location already exists. Please upvote it!');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post<ComplaintResponse>('/api/complaints', {
        title: title.trim(),
        description: description.trim(),
        categoryId: selectedCategory.id,
        locationPath,
        issueTag,
      });

      setCreatedComplaint(res.data);
      setCurrentStep(4); // Advance to ticket confirmation screen

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#6366f1', '#10b981'],
        });
      } catch {
        // Fallback if canvas is unavailable
      }

      toast.success('Complaint registered successfully! Official ticket generated.');
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number; data?: { error?: string; message?: string; existingComplaint?: ComplaintResponse } } };
      const existingComplaint = errorObj.response?.data?.existingComplaint;
      if (existingComplaint) {
        setDuplicateMatch(existingComplaint);
        setIsModalOpen(true);
        toast.warning('This issue was just reported. You can review or upvote the existing complaint.');
      } else {
        const errMsg = errorObj.response?.data?.message || errorObj.response?.data?.error || 'Failed to submit complaint';
        toast.error(errMsg, { duration: 6000 });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !isAuthenticated || isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <Card className="p-8 space-y-4 max-w-sm">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" aria-hidden="true" />
            <p className="text-xs text-slate-400 font-mono">Verifying authorization...</p>
          </Card>
        </div>
      </div>
    );
  }

  const groupedIssueTypes = issueTypes.reduce<Record<string, IssueType[]>>((acc, it) => {
    if (!acc[it.groupKey]) acc[it.groupKey] = [];
    acc[it.groupKey].push(it);
    return acc;
  }, {});

  const GROUP_LABELS: Record<string, string> = {
    wifi: '📡 Wi-Fi & Network',
    washroom: '🚿 Washrooms & Plumbing',
    mess: '🍽️ Mess & Dining',
    academic: '🏫 Academic Infrastructure',
    maintenance: '🔧 General Maintenance',
    security: '🛡️ Security & Gate',
    general: '📌 General',
  };

  const steps = [
    { number: 1, label: 'Location & Category' },
    { number: 2, label: 'Issue Details' },
    { number: 3, label: 'Review & Confirm' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 cyber-grid-bg">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono mb-2">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>PARAMETERIZED DEDUPLICATION ENGINE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            File a <span className="gradient-text-cyber">Campus Issue Complaint</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Follow the 3-step wizard to register your complaint with automated priority triage.
          </p>
        </div>

        {/* Wizard Step Progress Bar */}
        {currentStep <= 3 && (
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              {steps.map((s) => (
                <div key={s.number} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-all ${
                      currentStep === s.number
                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400'
                        : currentStep > s.number
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {currentStep > s.number ? <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" /> : s.number}
                  </div>
                  <span
                    className={`hidden sm:inline text-xs font-semibold ${
                      currentStep === s.number ? 'text-cyan-300' : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-emerald-400 rounded-full"
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Prominent Active Duplicate Banner */}
        {duplicateMatch && currentStep <= 3 && (
          <DuplicateBanner
            existingComplaint={duplicateMatch}
            onUpvoteComplete={() => {
              toast.success('Complaint upvoted successfully! Saved to your Upvoted History.');
              router.push('/complaints/upvoted');
            }}
          />
        )}

        {/* Wizard Step Content */}
        <AnimatePresence mode="wait">
          {/* STEP 1: CATEGORY & LOCATION */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <Card className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h2 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                    Step 1: Select Infrastructure Location
                  </h2>
                </div>

                <p className="text-xs text-slate-400">
                  Select the exact campus hierarchy where this issue exists to run deduplication.
                </p>

                <CascadingCategorySelector
                  onSelectCategory={(cat: Category, path: string) => {
                    setSelectedCategory(cat);
                    setLocationPath(path);
                    triggerDedupCheck(path);
                    setFieldErrors((prev) => ({ ...prev, location: undefined }));
                  }}
                />

                {fieldErrors.location && (
                  <p role="alert" className="text-xs text-rose-400 font-mono flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{fieldErrors.location}</span>
                  </p>
                )}
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="cyber"
                  disabled={!selectedCategory || !!duplicateMatch}
                  onClick={() => {
                    if (!selectedCategory) {
                      setFieldErrors((prev) => ({ ...prev, location: 'Please complete the location selection.' }));
                      return;
                    }
                    setCurrentStep(2);
                  }}
                  className="gap-2 min-h-[44px]"
                >
                  <span>Continue to Issue Details</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ISSUE DETAILS */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <Card className="space-y-5">
                <h2 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-3">
                  <Tag className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  Step 2: Define Issue & Details
                </h2>

                <div className="space-y-2">
                  <label htmlFor="issue-tag-select" className="text-xs font-mono font-semibold text-slate-300">
                    Category Issue Type
                  </label>
                  {isLoadingIssueTypes ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" aria-hidden="true" />
                      <span>Loading controlled vocabulary...</span>
                    </div>
                  ) : (
                    <Select
                      id="issue-tag-select"
                      value={issueTag}
                      onChange={(e) => setIssueTag(e.target.value)}
                      required
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
                    </Select>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="complaint-title" className="text-xs font-mono font-semibold text-slate-300">
                    Complaint Title / Headline
                  </label>
                  <Input
                    id="complaint-title"
                    required
                    value={title}
                    error={fieldErrors.title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (fieldErrors.title) {
                        setFieldErrors((prev) => ({ ...prev, title: undefined }));
                      }
                    }}
                    placeholder="e.g. WiFi Access Point down on Floor 2 of A2 Building"
                    icon={<FileText className="w-4 h-4" aria-hidden="true" />}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="complaint-desc" className="text-xs font-mono font-semibold text-slate-300">
                    Detailed Description
                  </label>
                  <textarea
                    id="complaint-desc"
                    rows={4}
                    required
                    value={description}
                    aria-invalid={!!fieldErrors.description}
                    aria-describedby={fieldErrors.description ? 'desc-error' : undefined}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (fieldErrors.description) {
                        setFieldErrors((prev) => ({ ...prev, description: undefined }));
                      }
                    }}
                    placeholder="Provide full context regarding the infrastructure issue..."
                    className={`w-full text-xs p-3.5 bg-slate-900/60 border rounded-xl text-slate-100 placeholder:text-slate-500 backdrop-blur-md focus:outline-none focus:ring-2 transition-colors ${
                      fieldErrors.description
                        ? 'border-rose-500/80 focus:border-rose-400 focus:ring-rose-500/20 text-white'
                        : 'border-slate-700/80 focus:border-cyan-400 focus:ring-cyan-500/20'
                    }`}
                  />
                  {fieldErrors.description && (
                    <p id="desc-error" role="alert" className="text-xs text-rose-400 font-mono flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{fieldErrors.description}</span>
                    </p>
                  )}
                </div>
              </Card>

              <div className="flex justify-between gap-3">
                <Button variant="secondary" onClick={() => setCurrentStep(1)} className="gap-2 min-h-[44px]">
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Back to Location</span>
                </Button>
                <Button
                  variant="cyber"
                  onClick={() => {
                    if (validateStep2()) {
                      setCurrentStep(3);
                    }
                  }}
                  className="gap-2 min-h-[44px]"
                >
                  <span>Review & Confirm</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: REVIEW & SUBMIT */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <GlowCard className="space-y-5">
                <h2 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-3">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  Step 3: Review Complaint Package
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Location Path</span>
                    <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
                      <span>{locationPath}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Issue Type</span>
                    <div className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-violet-400 shrink-0" aria-hidden="true" />
                      <span>{issueTag}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-left">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Title & Headline</span>
                  <div className="text-sm font-bold text-slate-100">{title}</div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase pt-2 block">Description</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
                </div>
              </GlowCard>

              <div className="flex justify-between gap-3">
                <Button variant="secondary" onClick={() => setCurrentStep(2)} className="gap-2 min-h-[44px]">
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Edit Details</span>
                </Button>
                <Button
                  variant="cyber"
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
                  className="gap-2 min-h-[44px]"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Submit Official Complaint</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS TICKET CONFIRMATION SCREEN */}
          {currentStep === 4 && createdComplaint && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <GlowCard className="p-8 space-y-6 text-center border-cyan-500/40 bg-slate-950/90 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full uppercase">
                    REGISTRATION CONFIRMED
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-2">
                    Complaint Ticket Issued
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Official ticket registered and queued for PICT campus facilities triage.
                  </p>
                </div>

                {/* Cyberpunk Ticket Details Card */}
                <div className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 text-left space-y-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500/20 border-b border-l border-cyan-500/30 rounded-bl-xl font-mono text-[10px] text-cyan-300">
                    OFFICIAL TICKET
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Complaint Reference</span>
                    <div className="font-mono text-base font-bold text-cyan-300 flex items-center justify-between">
                      <span>#{createdComplaint.referenceId || createdComplaint.id}</span>
                      <span className="text-xs text-slate-400 font-sans font-normal">{locationPath}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Headline</span>
                    <div className="text-xs font-semibold text-slate-100">{createdComplaint.title}</div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">Status</span>
                      <div className="pt-1">
                        <Badge status={createdComplaint.status}>{createdComplaint.status}</Badge>
                      </div>
                    </div>
                    {/* QR Code */}
                    <div className="p-2 bg-white rounded-xl shadow-lg" title="Scan to verify complaint ticket">
                      <QRCodeSVG
                        value={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://campusconnectproject-nu.vercel.app'}/complaints?id=${createdComplaint.referenceId || createdComplaint.id}`}
                        size={64}
                        aria-label="Official complaint verification QR code"
                        role="img"
                      />
                    </div>
                  </div>
                </div>

                {/* Primary Next Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={handleCopyTracking}
                    className="gap-2 w-full sm:w-auto min-h-[44px]"
                  >
                    {hasCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                        <span>Reference Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                        <span>Copy Tracking Ref</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="cyber"
                    size="md"
                    onClick={() => router.push('/dashboard')}
                    className="gap-2 w-full sm:w-auto min-h-[44px]"
                  >
                    <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
                    <span>View in Dashboard</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleResetForAnother}
                    className="gap-2 w-full sm:w-auto min-h-[44px]"
                  >
                    <RotateCcw className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                    <span>Submit Another</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => router.push('/')}
                    className="gap-2 w-full sm:w-auto min-h-[44px]"
                  >
                    <Home className="w-4 h-4" aria-hidden="true" />
                    <span>Return Home</span>
                  </Button>
                </div>
              </GlowCard>
            </motion.div>
          )}
        </AnimatePresence>

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
      </main>
    </div>
  );
}
