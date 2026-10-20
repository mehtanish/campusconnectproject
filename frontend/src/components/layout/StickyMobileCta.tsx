'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function StickyMobileCta() {
  const pathname = usePathname();

  // Hide on forms and auth pages to avoid overlapping keyboards or wizard controls
  if (
    !pathname ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/admin/login') ||
    pathname === '/complaints/new'
  ) {
    return null;
  }

  let ctaText = 'Report an Issue';
  let ctaHref = '/complaints/new';
  let Icon = PlusCircle;

  if (pathname === '/admin') {
    ctaText = 'View Priority Queue';
    ctaHref = '/admin#queue';
    Icon = Shield;
  } else if (pathname === '/complaints/upvoted') {
    ctaText = 'File New Complaint';
    ctaHref = '/complaints/new';
    Icon = PlusCircle;
  } else if (pathname === '/legal') {
    ctaText = 'Return to Report Issue';
    ctaHref = '/complaints/new';
    Icon = ArrowRight;
  }

  return (
    <aside
      aria-label="Mobile quick action bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/92 backdrop-blur-xl border-t border-cyan-500/20 px-4 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_25px_rgba(0,0,0,0.5)] transition-all duration-300"
    >
      <div className="max-w-md mx-auto flex items-center gap-3">
        <Link href={ctaHref} className="flex-1">
          <Button
            variant="cyber"
            size="lg"
            className="w-full h-12 text-sm font-bold gap-2 shadow-lg shadow-cyan-500/25 active:scale-[0.98]"
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{ctaText}</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
