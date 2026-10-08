'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'relative isolate overflow-hidden inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        cyber:
          'bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 border border-cyan-400/30 font-semibold cyber-button-glow',
        primary:
          'bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 shadow-md shadow-cyan-500/20 hover:shadow-cyan-400/30 cyber-button-glow',
        secondary:
          'bg-slate-800/80 text-slate-200 border border-slate-700/60 hover:bg-slate-700/80 hover:border-slate-600 hover:text-white',
        outline:
          'border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/60 hover:text-cyan-200',
        ghost:
          'text-slate-300 hover:bg-slate-800/60 hover:text-white',
        danger:
          'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 hover:border-rose-500/50',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-10 px-4 text-sm rounded-xl',
        lg: 'h-12 px-6 text-base rounded-xl font-semibold',
        icon: 'h-10 w-10 p-0 rounded-xl justify-center',
      },
    },
    defaultVariants: {
      variant: 'cyber',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, isLoading, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Hover glow overlay filling exact bounds inset-0 */}
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-white/0 hover:bg-white/10 transition-colors z-0" />

        <span className="relative z-10 inline-flex items-center justify-center gap-2 w-full h-full">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Processing...</span>
            </span>
          ) : (
            children
          )}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
