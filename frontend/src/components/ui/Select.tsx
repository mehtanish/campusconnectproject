import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, icon, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        <select
          className={cn(
            'flex h-11 w-full appearance-none rounded-xl border border-slate-700/80 bg-slate-900/60 px-4 text-sm text-slate-100 backdrop-blur-md transition-all duration-200 focus-visible:border-cyan-400/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50 pr-10 cursor-pointer',
            icon && 'pl-10',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = 'Select';
