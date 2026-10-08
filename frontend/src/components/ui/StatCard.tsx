'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlowCard } from './GlowCard';

export interface StatCardProps {
  title: string;
  value: string | number;
  valuePrefix?: string;
  valueSuffix?: string;
  subtitle?: string;
  icon: React.ReactNode | React.ComponentType<{ className?: string }>;
  accentColor?: 'cyan' | 'emerald' | 'violet' | 'amber';
  glowColor?: string;
  trend?: {
    value?: string;
    label?: string;
    isPositive?: boolean;
  };
  className?: string;
}

const ACCENT_STYLES = {
  cyan: {
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
    glow: 'rgba(6, 182, 212, 0.15)',
    trend: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
  },
  emerald: {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    glow: 'rgba(16, 185, 129, 0.15)',
    trend: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  },
  violet: {
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.2)]',
    glow: 'rgba(139, 92, 246, 0.15)',
    trend: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
  },
  amber: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
    glow: 'rgba(245, 158, 11, 0.15)',
    trend: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  },
};

export function StatCard({
  title,
  value,
  valuePrefix,
  valueSuffix,
  subtitle,
  icon,
  accentColor = 'cyan',
  glowColor,
  trend,
  className,
}: StatCardProps) {
  const accent = ACCENT_STYLES[accentColor];
  const activeGlow = glowColor || accent.glow;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return React.cloneElement(icon as React.ReactElement<{ 'aria-hidden'?: boolean }>, {
        'aria-hidden': true,
      });
    }
    const IconComponent = icon as React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
    return <IconComponent className="w-5 h-5" aria-hidden={true} />;
  };

  const trendText = trend?.label || trend?.value;

  return (
    <GlowCard
      glowColor={activeGlow}
      className={cn(
        'p-6 h-full flex flex-col justify-between gap-4 border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 shadow-xl',
        className
      )}
    >
      {/* Top Row: Fixed Square Icon Badge & Optional Trend Chip */}
      <div className="flex items-center justify-between w-full">
        <div
          className={cn(
            'size-11 shrink-0 grid place-items-center rounded-xl border self-start',
            accent.badge
          )}
        >
          {renderIcon()}
        </div>

        {trendText && (
          <span
            className={cn(
              'inline-flex items-center text-xs font-mono font-medium px-2.5 py-1 rounded-full border shadow-sm',
              accent.trend
            )}
          >
            {trend.isPositive !== undefined && (trend.isPositive ? '↑ ' : '↓ ')}
            {trendText}
          </span>
        )}
      </div>

      {/* Main Content: Tabular Value & Muted Label */}
      <div className="space-y-1 text-left">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="font-mono text-3xl md:text-4xl font-semibold tabular-nums text-white tracking-tight flex items-baseline flex-wrap gap-1"
        >
          {valuePrefix && (
            <span className="text-xl md:text-2xl font-normal text-slate-400 font-sans">{valuePrefix}</span>
          )}
          <span>{value}</span>
          {valueSuffix && (
            <span className="text-base md:text-lg font-normal text-slate-400 font-sans ml-0.5">
              {valueSuffix}
            </span>
          )}
        </motion.div>

        <p className="text-sm text-slate-400 font-sans leading-snug">{title}</p>
        {subtitle && <p className="text-xs text-slate-500 font-sans pt-0.5">{subtitle}</p>}
      </div>
    </GlowCard>
  );
}
