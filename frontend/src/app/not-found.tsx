'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { GlowCard } from '@/components/ui/GlowCard';
import {
  FileQuestion,
  Home,
  ArrowLeft,
  PlusCircle,
  LayoutDashboard,
  ThumbsUp,
  Search,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' | 'false' }>;
  badge?: string;
}

const QUICK_LINKS: QuickLink[] = [
  {
    title: 'Report an Issue',
    description: 'Submit campus maintenance tickets with automated deduplication',
    href: '/complaints/new',
    icon: PlusCircle,
    badge: 'Popular',
  },
  {
    title: 'Student Portal',
    description: 'View active complaints, live timelines, and status updates',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Upvoted Leaderboard',
    description: 'Track community prioritized issues across PICT departments',
    href: '/complaints/upvoted',
    icon: ThumbsUp,
  },
  {
    title: 'PICT Legal & Terms',
    description: 'Review campus governance notices and data privacy policy',
    href: '/legal',
    icon: ShieldAlert,
  },
];

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLinks = QUICK_LINKS.filter(
    (link) =>
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 cyber-grid-bg text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center">
        {/* Ambient Glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none"
          aria-hidden="true"
        />

        {/* 404 Cyber Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-mono font-semibold mb-6 shadow-lg shadow-rose-500/10">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
          </span>
          <span>HTTP 404 // NODE SIGNAL DISCONNECTED</span>
        </div>

        {/* Big Glitch 404 Header */}
        <div className="relative mb-4">
          <div
            className="text-7xl sm:text-9xl font-display font-black tracking-tight text-slate-800/60 select-none absolute inset-0 -top-2 blur-sm"
            aria-hidden="true"
          >
            404
          </div>
          <h1 className="relative text-7xl sm:text-9xl font-display font-black tracking-tight gradient-text-cyber">
            404
          </h1>
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-2">
          Page Not Found on Campus Network
        </h2>
        <p className="text-sm text-slate-400 max-w-md font-sans leading-relaxed mb-8">
          The requested infrastructure pathway or resource does not exist, has been relocated, or is temporarily offline for maintenance.
        </p>

        {/* In-page Route Search Bar */}
        <div className="w-full max-w-md mb-8">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search destination (e.g. report issue, dashboard)..."
              aria-label="Search destination"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/80 text-xs text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 backdrop-blur-md"
            />
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <Button
            variant="secondary"
            size="md"
            onClick={() => router.back()}
            className="gap-2 text-xs min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Go Back Previous Page</span>
          </Button>

          <Link href="/">
            <Button
              variant="cyber"
              size="md"
              className="gap-2 text-xs min-h-[44px]"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Return to Campus Home</span>
            </Button>
          </Link>

          <Link href="/complaints/new">
            <Button
              variant="outline"
              size="md"
              className="gap-2 text-xs min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>Report an Issue</span>
            </Button>
          </Link>
        </div>

        {/* Quick Recommended Destinations Grid */}
        <div className="w-full">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-left">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <FileQuestion className="w-3.5 h-3.5" aria-hidden="true" />
              Recommended Campus Destinations
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {filteredLinks.length} available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href} className="group block focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-2xl">
                  <GlowCard className="p-4 h-full border-slate-800 group-hover:border-cyan-500/40 transition-all duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </div>
                      {link.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <div className="text-sm font-display font-bold text-white group-hover:text-cyan-300 flex items-center gap-1.5 transition-colors">
                        <span>{link.title}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" aria-hidden="true" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {link.description}
                      </p>
                    </div>
                  </GlowCard>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
