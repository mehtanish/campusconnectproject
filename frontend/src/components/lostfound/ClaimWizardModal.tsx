'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { LostFoundResponse, ClaimResponse } from '@/types';

interface ClaimWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LostFoundResponse | null;
  onClaimSubmitted?: () => void;
}

export function ClaimWizardModal({
  isOpen,
  onClose,
  item,
  onClaimSubmitted,
}: ClaimWizardModalProps) {
  const [step, setStep] = useState<number>(1);
  const [proofDescription, setProofDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedClaim, setSubmittedClaim] = useState<ClaimResponse | null>(null);

  if (!isOpen || !item) return null;

  const handleNext = () => {
    if (step === 1 && !proofDescription.trim()) {
      toast.error('Please provide verification details/answers');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmitClaim = async () => {
    try {
      setIsSubmitting(true);
      const res = await api.post<ClaimResponse>('/api/lost-found/claim', {
        itemId: item.id,
        proofDescription,
      });

      setSubmittedClaim(res.data);
      setStep(3); // Step 3: Result & QR Code
      toast.success('Claim submitted successfully!');
      onClaimSubmitted?.();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg glass-card overflow-hidden border border-[var(--border-color)] bg-[var(--bg-card)] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Claim Verification Wizard
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-6 py-3 bg-[var(--bg-secondary)]/50 border-b border-[var(--border-color)] text-xs font-semibold text-[var(--text-muted)]">
          <span className={step >= 1 ? 'text-indigo-400' : ''}>1. Verification Quiz</span>
          <span>→</span>
          <span className={step >= 2 ? 'text-indigo-400' : ''}>2. Confirmation</span>
          <span>→</span>
          <span className={step >= 3 ? 'text-indigo-400' : ''}>3. Status & QR</span>
        </div>

        {/* Content Area with Horizontal Slide Animation */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                    Item: {item.title}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Provide unique identifying features or details that prove ownership.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    Proof Description / Verification Quiz Answers:
                  </label>
                  <textarea
                    rows={4}
                    value={proofDescription}
                    onChange={(e) => setProofDescription(e.target.value)}
                    placeholder="e.g. Describe wallpaper, serial number, scratches, contents inside, or specific markings..."
                    className="w-full text-xs p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="space-y-4"
              >
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Confirm Submission Details
                </h4>

                <div className="p-4 bg-[var(--bg-secondary)] rounded-xl space-y-2 border border-[var(--border-color)] text-xs">
                  <div>
                    <span className="text-[var(--text-muted)] font-medium">Item: </span>
                    <span className="text-[var(--text-primary)] font-semibold">{item.title}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] font-medium">Location: </span>
                    <span className="text-[var(--text-primary)]">{item.foundLocation}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] font-medium">Your Proof: </span>
                    <p className="text-[var(--text-secondary)] italic mt-1">{proofDescription}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={handleSubmitClaim}
                    className="flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Claim'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-5 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">
                    Claim Under Review!
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Your claim proof has been submitted to the Lost & Found officer for verification.
                  </p>
                </div>

                {submittedClaim?.claimCode ? (
                  <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-2xl space-y-3">
                    <span className="text-xs font-semibold text-indigo-300">
                      Your 6-Digit Claim QR Code
                    </span>
                    <div className="bg-white p-3 rounded-xl inline-block">
                      <QRCodeSVG value={submittedClaim.claimCode} size={140} />
                    </div>
                    <div className="font-mono font-bold text-lg text-indigo-400 tracking-widest">
                      {submittedClaim.claimCode}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-muted)]">
                    Once approved by admin, your unique 6-digit claim code and QR code will render on your dashboard for item retrieval handover.
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full text-xs font-semibold py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                >
                  Done
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
