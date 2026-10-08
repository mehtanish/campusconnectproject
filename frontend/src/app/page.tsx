'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import {
  Flame,
  ArrowRight,
  Sparkles,
  Zap,
  Layers,
  Building2,
  CheckCircle2,
  Clock,
  CheckSquare,
  Shield,
  FileSearch,
} from 'lucide-react';
import TrueFocus from '@/components/ui/TrueFocus';
import { GlowCard } from '@/components/ui/GlowCard';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { CampusExplorer } from '@/components/ui/CampusExplorer';
import {
  LiveFeedAndTrack,
  FAQSection,
  CTABanner,
} from '@/components/ui/HomeSections';

import api from '@/lib/api';

import { CampusNoticeBoard } from '@/components/ui/CampusNoticeBoard';

const InteractiveBackground = dynamic(() => import('@/components/background/InteractiveBackground'), {
  ssr: false,
});



export default function Home() {
  const [stats, setStats] = React.useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    inProgressComplaints: 0,
    pendingComplaints: 0,
    deduplicationRate: 98.4,
    avgResponseHours: 4.2
  });

  React.useEffect(() => {
    api.get('/api/public/stats')
      .then((res) => {
        if (res.data) {
          setStats(res.data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch live public stats:', err);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-transparent relative z-10">
      <InteractiveBackground />
      <Navbar />

      <main className="flex-1 w-full flex flex-col items-center">
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 1. HERO SECTION                                           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 md:pt-10 md:pb-20 flex flex-col items-center justify-center relative">
          {/* Ambient Radial Blur Blobs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
          <div className="absolute bottom-1/3 left-1/3 w-[450px] h-[450px] bg-violet-600/10 blur-[130px] rounded-full pointer-events-none" />

          {/* Eye-Catching Top Live Intelligence Banner */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full mb-8 z-10"
          >
            <div className="relative group overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900/80 backdrop-blur-xl p-3 sm:p-4 shadow-xl shadow-cyan-500/10 hover:border-cyan-400/50 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-violet-500/15 to-emerald-500/15 opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400"></span>
                  </span>
                  <span className="font-mono text-cyan-300 font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                    PICT Campus Intelligence Node:
                  </span>
                  <span className="text-slate-200 font-medium hidden sm:inline">
                    Automated Issue Triaging & Smart Campus Management Operational
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px] text-slate-300">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-semibold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> AI Deduplication {stats.deduplicationRate ? stats.deduplicationRate.toFixed(1) : 98.4}%
                  </span>
                  <span className="hidden md:flex px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {stats.resolvedComplaints} Resolved
                  </span>
                  <Link href="/complaints/new" className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 group/link">
                    <span>Quick Report</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full z-10">
            {/* Left Hero Text Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-left space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono font-semibold backdrop-blur-md shadow-lg shadow-cyan-500/10">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} aria-hidden="true" />
                <span>PICT PUNE COMMAND CENTER</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.1] text-white">
                Pune Institute of Computer Technology <br />
                <span className="gradient-text-cyber inline-block pt-2">
                  <TrueFocus
                    sentence="Campus Connect"
                    manualMode={false}
                    blurAmount={5}
                    borderColor="#06b6d4"
                    glowColor="rgba(6, 182, 212, 0.6)"
                    animationDuration={0.5}
                    pauseBetweenAnimations={1}
                  />
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-sans">
                Next-generation infrastructure management & automated issue resolution platform for PICT students, faculty, and campus administrators.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link href="/complaints/new">
                  <Button size="lg" className="cyber-button-glow font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 px-8 py-3.5 text-base rounded-xl w-full sm:w-auto active:scale-[0.98] transition-transform">
                    Report an Issue <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Hero Column: Interactive Campus Notice Board */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full flex justify-center items-center my-auto"
            >
              <CampusNoticeBoard />
            </motion.div>
          </div>

          {/* Live Cyber Metrics Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full mt-16 z-10"
          >
            <StatCard
              title="Complaints Resolved"
              value={stats.resolvedComplaints ? stats.resolvedComplaints.toString() : '0'}
              icon={CheckCircle2}
              accentColor="emerald"
              trend={{ label: 'Live Data', isPositive: true }}
            />
            <StatCard
              title="Avg. Response Time"
              value={stats.avgResponseHours ? stats.avgResponseHours.toString() : '4.2'}
              valuePrefix="<"
              valueSuffix="Hours"
              icon={Clock}
              accentColor="cyan"
              trend={{ label: 'Live SLA', isPositive: true }}
            />
            <StatCard
              title="Deduplication Rate"
              value={stats.deduplicationRate ? stats.deduplicationRate.toFixed(1) : '98.4'}
              valueSuffix="%"
              icon={Zap}
              accentColor="violet"
              trend={{ label: 'Auto Triaged', isPositive: true }}
            />
            <StatCard
              title="Total Tracked Issues"
              value={stats.totalComplaints ? stats.totalComplaints.toString() : '0'}
              icon={Building2}
              accentColor="amber"
              trend={{ label: 'Live Tickets', isPositive: true }}
            />
          </motion.div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 2. HOW IT WORKS                                           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 border-t border-slate-900 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              How <span className="gradient-text-cyber">Campus Connect</span> Works
            </h2>
            <p className="text-sm text-slate-300 mt-3 max-w-lg mx-auto">
              From issue detection to admin verification, our automated pipeline ensures rapid resolution.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full text-left">
            {[
              {
                step: '01',
                title: 'Select & Locate',
                desc: 'Pick your building (A1, A2, Hostels, Mess) and subcategory. The system automatically scans for existing active issues.',
                icon: Building2,
              },
              {
                step: '02',
                title: 'Deduplicate & Upvote',
                desc: 'If a similar issue exists, add your upvote to escalate its priority score instantly without creating duplicate noise.',
                icon: Flame,
              },
              {
                step: '03',
                title: 'Resolve & Verify',
                desc: 'Admins update real-time progress. Receive instant toast notifications and track official item handovers via QR code.',
                icon: CheckSquare,
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <GlowCard key={idx} className="p-8 flex flex-col justify-between space-y-6 h-full">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-4xl font-extrabold text-cyan-400/40">
                      {step.step}
                    </span>
                    <div className="size-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 grid place-items-center">
                      <Icon className="w-6 h-6" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="mt-auto">
                    <h3 className="text-xl font-display font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{step.desc}</p>
                  </div>
                </GlowCard>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 3. INTERACTIVE CAMPUS EXPLORER                             */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 border-t border-slate-900 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono font-semibold mb-3">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>Interactive Campus Explorer</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              Explore Our <span className="gradient-text-cyber">Campus Facilities</span>
            </h2>
            <p className="text-sm text-slate-300 mt-3 max-w-lg mx-auto">
              Scroll, drag, or click to browse through PICT&apos;s infrastructure. Every floor and facility is mapped for complaint tracking.
            </p>
          </motion.div>

          <CampusExplorer />
        </section>


        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 4. FEATURES SECTION (REFINED INTELLIGENCE SUITE)           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 border-t border-slate-900 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono font-semibold mb-3">
              <Zap className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>INTELLIGENCE SUITE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              Core <span className="gradient-text-cyber">Platform Capabilities</span>
            </h2>
            <p className="text-sm text-slate-300 mt-3 max-w-lg mx-auto">
              Engineered for seamless reporting, high data accuracy, and transparent tracking.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full text-left">
            {[
              {
                icon: Layers,
                title: 'Cascading Selectors',
                desc: 'Select hierarchical category and location paths with smooth subcategory expansion.',
                preview: (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-xs font-mono text-cyan-300 flex items-center gap-1.5 overflow-hidden">
                    <span className="text-slate-400">Academic</span> &gt; <span className="text-slate-300">A1</span> &gt; <span className="text-cyan-400 font-bold">Floor 2</span>
                  </div>
                ),
              },
              {
                icon: Flame,
                title: 'Dynamic Upvote Priority',
                desc: 'Priority scores escalate dynamically as student upvotes accumulate.',
                preview: (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/20 text-xs font-mono flex items-center justify-between">
                    <span className="text-amber-400 font-bold">+24 Upvotes</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">Priority 8.5/10</span>
                  </div>
                ),
              },
              {
                icon: FileSearch,
                title: 'Duplicate Detection Engine',
                desc: 'Auto-detect active duplicate complaints at the same location to streamline resolution.',
                preview: (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-violet-500/20 text-xs font-mono text-violet-300 flex items-center justify-between">
                    <span>98% Similarity Match</span>
                    <span className="text-emerald-400 font-semibold">Merged</span>
                  </div>
                ),
              },
              {
                icon: Shield,
                title: 'Domain Role Triage',
                desc: 'Complaints automatically route to dedicated WiFi, Mess, Maintenance, or Academic admins.',
                preview: (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/20 text-xs font-mono flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">ADMIN_WIFI</span>
                    <span className="text-xs text-slate-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">Auto Routed</span>
                  </div>
                ),
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <GlowCard
                  key={idx}
                  className="p-6 text-left space-y-4 hover:border-cyan-500/50 transition-all duration-300 flex flex-col justify-between h-full"
                >
                  <div className="space-y-4">
                    <div className="size-11 shrink-0 grid place-items-center rounded-xl border bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-display font-bold text-white mb-1.5">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800/60">
                    {item.preview}
                  </div>
                </GlowCard>
              );
            })}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 5. LIVE ACTIVITY FEED + TRACK COMPLAINT BOX               */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 border-t border-slate-900 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-mono font-semibold mb-3">
              <Clock className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span>REAL-TIME TRACKING</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              Live Activity & <span className="gradient-text-cyber">Ticket Lookup</span>
            </h2>
            <p className="text-sm text-slate-300 mt-3 max-w-lg mx-auto">
              Monitor active complaint resolutions as they happen or track your specific ticket ID.
            </p>
          </motion.div>

          <LiveFeedAndTrack />
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 6. FAQ ACCORDION SECTION                                  */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 border-t border-slate-900 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-mono font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" aria-hidden="true" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              Got Questions? <span className="gradient-text-cyber">We Have Answers</span>
            </h2>
            <p className="text-sm text-slate-300 mt-3 max-w-lg mx-auto">
              Everything you need to know about complaint tracking, deduplication, and lost item verification.
            </p>
          </motion.div>

          <FAQSection />
        </section>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 7. FINAL CTA BANNER                                       */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 z-10">
          <CTABanner />
        </section>
      </main>
    </div>
  );
}
