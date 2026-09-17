'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '@/lib/api';
import { toast } from 'sonner';

interface UpvoteButtonProps {
  complaintId: string;
  initialCount: number;
  initialHasUpvoted?: boolean;
  onUpvoteSuccess?: (newCount: number, highPriority: boolean) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
}

export function UpvoteButton({
  complaintId,
  initialCount,
  initialHasUpvoted = false,
  onUpvoteSuccess,
}: UpvoteButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasUpvoted || isLoading) return;

    // Trigger "+1" particle animation
    const rect = e.currentTarget.getBoundingClientRect();
    const newParticle = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setParticles((prev) => [...prev, newParticle]);

    // Optimistic UI Update
    const nextCount = count + 1;
    setCount(nextCount);
    setHasUpvoted(true);

    try {
      setIsLoading(true);
      const res = await api.post<{ upvoteCount: number; priorityScore: number; highPriority: boolean }>(
        `/api/complaints/${complaintId}/upvote`
      );

      const updatedCount = res.data.upvoteCount;
      const highPriority = res.data.highPriority;

      setCount(updatedCount);

      // Fire confetti ONLY on the exact transition into high priority (count hits 15 for the first time).
      // Do NOT trigger on subsequent renders where highPriority is already true.
      if (updatedCount === 15) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#4f46e5', '#7c3aed', '#10b981', '#f59e0b'],
        });
        toast.success('🔥 High Priority Escalation Triggered!');
      } else {
        toast.success('Upvoted successfully!');
      }

      onUpvoteSuccess?.(updatedCount, highPriority);
    } catch (err: any) {
      // Rollback on error
      setCount(count);
      setHasUpvoted(false);
      toast.error(err.response?.data?.error || 'Failed to upvote');
    } finally {
      setIsLoading(false);
      // Clean particle
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 800);
    }
  };

  const isHighPriority = count >= 15;

  return (
    <div className="relative inline-block">
      {/* Floating +1 Particles */}
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute font-bold text-indigo-400 pointer-events-none particle-float text-sm z-50"
          style={{ left: particle.x, top: particle.y - 10 }}
        >
          +1
        </span>
      ))}

      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={handleUpvote}
        disabled={hasUpvoted || isLoading}
        className={`relative group flex flex-col items-center justify-center min-w-[54px] px-3 py-2 rounded-xl border transition-all duration-300 ${
          hasUpvoted
            ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400 cursor-default'
            : isHighPriority
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 shadow-lg shadow-amber-500/10'
            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-indigo-500/50 hover:text-indigo-400'
        }`}
      >
        <div className="flex items-center gap-1">
          {isHighPriority ? (
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          ) : (
            <ChevronUp
              className={`w-4 h-4 transition-transform group-hover:-translate-y-0.5 ${
                hasUpvoted ? 'text-indigo-400 font-bold' : ''
              }`}
            />
          )}
        </div>

        {/* Counter flip effect */}
        <div className="h-5 overflow-hidden flex items-center justify-center font-bold text-sm">
          <AnimatePresence mode="wait">
            <motion.span
              key={count}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {count}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  );
}
