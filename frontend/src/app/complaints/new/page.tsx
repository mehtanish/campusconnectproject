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
  AlertCircle,
  Check,
  ChevronRight,
  ChevronLeft,
  QrCode,
  CheckCircle2,
  Building2,
  MapPin,
  Flame,
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
  const { user, isAuthenticated, isAdmin, isLoading: isAuthLoading } = useAuth();

  // Wizard Step State (1: Location/Category, 2: Details, 3: Review, 4: Success Ticket)
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [locationPath, setLocationPath] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [issueTag, setIssueTag] = useState<string>('');

  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [isLoadingIssueTypes, setIsLoadingIssueTypes] = useState<boolean>(true);

  const [isCheckingDedup, setIsCheckingDedup] = useState<boolean>(false);
  const [duplicateMatch, setDuplicateMatch] = useState<ComplaintResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Submitted ticket result state
  const [createdComplaint, setCreatedComplaint] = useState<ComplaintResponse | null>(null);

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

  // Deduplication trigger
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

  const handleSubmit = async () => {
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
        title,
        description,
        categoryId: selectedCategory.id,
        locationPath,
        issueTag,
      });

      setCreatedComplaint(res.data);
      setCurrentStep(4); // Advance to ticket success screen

      // Trigger Confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success('Complaint registered successfully! Ticket generated.');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      const errMsg = errorObj.response?.data?.error || 'Failed to submit complaint';
      toast.error(errMsg, { duration: 6000 });
      if (locationPath) {
        await triggerDedupCheck(locationPath);
        setIsModalOpen(true);
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
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
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
            <Sparkles className="w-3.5 h-3.5" />
            <span>PARAMETERIZED DEDUPLICATION ENGINE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
            File a <span className="gradient-text-cyber">Campus Issue Complaint</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Follow the 3-step wizard to register your complaint.
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
                    {currentStep > s.number ? <Check className="w-4 h-4 text-emerald-400" /> : s.number}
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
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    Step 1: Select Campus Location Path
                  </h2>
                  {isCheckingDedup && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Checking deduplication...
                    </div>
                  )}
                </div>

                <CascadingCategorySelector onSelectCategory={handleCategorySelect} />
              </Card>

              <div className="flex justify-end gap-3">
                <Button
                  variant="cyber"
                  disabled={!selectedCategory || !!duplicateMatch}
                  onClick={() => setCurrentStep(2)}
                  className="gap-2"
                >
                  <span>Continue to Issue Details</span>
                  <ChevronRight className="w-4 h-4" />
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
                  <Tag className="w-4 h-4 text-cyan-400" />
                  Step 2: Define Issue & Details
                </h2>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-slate-300">
                    Category Issue Type
                  </label>
                  {isLoadingIssueTypes ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      Loading controlled vocabulary...
                    </div>
                  ) : (
                    <Select
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
                  <label className="text-xs font-mono font-semibold text-slate-300">
                    Complaint Title / Headline
                  </label>
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. WiFi Access Point down on Floor 2 of A2 Building"
                    icon={<FileText className="w-4 h-4" />}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono font-semibold text-slate-300">
                    Detailed Description
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide full context regarding the infrastructure issue..."
                    className="w-full text-xs p-3.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder:text-slate-500 backdrop-blur-md focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </Card>

              <div className="flex justify-between gap-3">
                <Button variant="secondary" onClick={() => setCurrentStep(1)} className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Location</span>
                </Button>
                <Button
                  variant="cyber"
                  disabled={!title.trim() || !description.trim()}
                  onClick={() => setCurrentStep(3)}
                  className="gap-2"
                >
                  <span>Review & Confirm</span>
                  <ChevronRight className="w-4 h-4" />
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
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  Step 3: Review Complaint Package
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Location Path</span>
                    <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{locationPath}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Issue Type</span>
                    <div className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-violet-400 shrink-0" />
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
                <Button variant="secondary" onClick={() => setCurrentStep(2)} className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Edit Details</span>
                </Button>
                <Button
                  variant="cyber"
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Official Complaint</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUCCESS TICKET SCREEN */}
          {currentStep === 4 && createdComplaint && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <GlowCard className="p-8 space-y-6 text-center border-cyan-500/40 bg-slate-950/90 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h2 className="text-2xl font-display font-extrabold text-white">
                    Complaint Ticket Issued
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Official record created in PICT resolution registry.
                  </p>
                </div>

                {/* Cyberpunk Ticket Details Card */}
                <div className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/30 text-left space-y-4 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 px-3 py-1 bg-cyan-500/20 border-b border-l border-cyan-500/30 rounded-bl-xl font-mono text-[10px] text-cyan-300">
                    OFFICIAL TICKET
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Complaint ID</span>
                    <div className="font-mono text-base font-bold text-cyan-300">
                      #{createdComplaint.id}
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
                    <div className="p-2 bg-white rounded-xl shadow-lg">
                      <QRCodeSVG value={`http://localhost:3000/complaints/${createdComplaint.id}`} size={64} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <Button variant="cyber" onClick={() => router.push('/dashboard')}>
                    Go to Student Dashboard
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
