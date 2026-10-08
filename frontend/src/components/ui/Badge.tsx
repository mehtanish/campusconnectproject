import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-1 rounded-full border transition-all duration-200 select-none',
  {
    variants: {
      status: {
        PENDING:
          'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-sm shadow-amber-500/10',
        APPROVED:
          'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-sm shadow-cyan-500/10',
        IN_PROGRESS:
          'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 shadow-sm shadow-cyan-500/10 animate-pulse',
        RESOLVED:
          'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/10',
        REJECTED:
          'bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-sm shadow-rose-500/10',
        AVAILABLE:
          'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 shadow-sm shadow-indigo-500/10',
        CLAIMED:
          'bg-slate-500/20 text-slate-300 border-slate-600/40',
        HIGH_PRIORITY:
          'bg-violet-500/15 text-violet-300 border-violet-500/40 shadow-sm shadow-violet-500/20',
      },
    },
    defaultVariants: {
      status: 'PENDING',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  showPulseDot?: boolean;
}

export function Badge({ className, status, showPulseDot = true, children, ...props }: BadgeProps) {
  const getPulseColor = (st?: string | null) => {
    switch (st) {
      case 'PENDING':
        return 'bg-amber-400';
      case 'APPROVED':
      case 'IN_PROGRESS':
        return 'bg-cyan-400';
      case 'RESOLVED':
        return 'bg-emerald-400';
      case 'REJECTED':
        return 'bg-rose-400';
      case 'HIGH_PRIORITY':
        return 'bg-violet-400';
      default:
        return 'bg-cyan-400';
    }
  };

  return (
    <span className={cn(badgeVariants({ status, className }))} {...props}>
      {showPulseDot && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              getPulseColor(status)
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              getPulseColor(status)
            )}
          />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}
