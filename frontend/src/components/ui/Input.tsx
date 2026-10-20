import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
  errorId?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, errorId, id, ...props }, ref) => {
    const computedErrorId = errorId || (id ? `${id}-error` : undefined);

    return (
      <div className="w-full">
        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none" aria-hidden="true">
              {icon}
            </div>
          )}
          <input
            id={id}
            type={type}
            aria-invalid={error ? true : props['aria-invalid']}
            aria-describedby={error && computedErrorId ? computedErrorId : props['aria-describedby']}
            className={cn(
              'flex h-11 w-full rounded-xl border bg-slate-900/60 px-4 text-sm text-slate-100 placeholder:text-slate-500 backdrop-blur-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
              error
                ? 'border-rose-500/80 focus-visible:border-rose-400 focus-visible:ring-rose-500/20 text-white'
                : 'border-slate-700/80 focus-visible:border-cyan-400/80 focus-visible:ring-cyan-500/20',
              icon && 'pl-10',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p
            id={computedErrorId}
            role="alert"
            className="mt-1.5 text-xs text-rose-400 font-mono flex items-center gap-1.5 animate-fadeIn"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
