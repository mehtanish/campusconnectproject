import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-slate-800/60 border border-slate-700/30 backdrop-blur-md',
        className
      )}
      {...props}
    />
  );
}
