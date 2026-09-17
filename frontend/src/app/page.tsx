'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, ShieldCheck, Flame, Search, ArrowRight, Sparkles, Zap, Layers, Shield,
  Building2, BookOpen, Wifi, UtensilsCrossed, Home as HomeIcon, ShieldAlert, Monitor, GraduationCap,
} from 'lucide-react';
import OptionWheel from '@/components/ui/OptionWheel';
import TrueFocus from '@/components/ui/TrueFocus';

import dynamic from 'next/dynamic';

const FluidGlass = dynamic(() => import('@/components/ui/FluidGlass'), {
  ssr: false,
  loading: () => (
    <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight leading-tight">
      Pune Institute of Computer Technology <br />
      <span className="gradient-text">Campus Connect</span>
    </h1>
  ),
});

const CAMPUS_FACILITIES = [
  { name: 'A1 Building', icon: Building2, floors: 5, desc: 'Five-floor academic block with classrooms, labs, gents & ladies washrooms, corridor lighting, and WiFi access points on every floor.' },
  { name: 'A2 Building', icon: Building2, floors: 4, desc: 'Four-floor academic block housing advanced computer labs, seminar halls, and faculty offices with full WiFi coverage.' },
  { name: 'A3 Building', icon: Building2, floors: 5, desc: 'Five-floor block with state-of-the-art research labs, project rooms, and presentation halls.' },
  { name: 'F1 Building', icon: Monitor, floors: 3, desc: 'Three-floor facility with specialized engineering workshops, maker spaces, and technical labs.' },
  { name: 'Central Library', icon: BookOpen, floors: 1, desc: 'Massive reading hall and book repository with thousands of titles across CS, IT, Electronics, and more.' },
  { name: 'Digital Library', icon: Wifi, floors: 1, desc: 'High-speed WiFi zone with 100+ workstations, e-journals access, and digital resource terminals.' },
  { name: 'Campus Canteen', icon: UtensilsCrossed, floors: 1, desc: 'Multi-cuisine food court offering snacks, beverages, and full meals with strict hygiene standards.' },
  { name: 'Student Mess', icon: UtensilsCrossed, floors: 4, desc: 'Four-floor regular mess facility with dedicated kitchen hygiene, serving counters, and timing management.' },
  { name: 'Boys Hostel', icon: HomeIcon, floors: 5, desc: '77 rooms across 5 floors with dispensary, common washrooms, water purifiers, and in-room WiFi routers.' },
  { name: 'Girls Hostel', icon: HomeIcon, floors: 7, desc: 'Seven-floor hostel with 280+ rooms, floor-wise washrooms, WiFi routers, and 24/7 security monitoring.' },
  { name: 'Main Gate Security', icon: ShieldAlert, floors: 0, desc: 'Campus entry checkpoint with visitor management, vehicle logging, and emergency response coordination.' },
  { name: 'Hostel Security', icon: ShieldAlert, floors: 0, desc: 'Dedicated hostel security desk with night patrol, biometric access, and emergency hotline.' },
];

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [selectedFacility, setSelectedFacility] = useState(0);

  const currentFacility = CAMPUS_FACILITIES[selectedFacility];
  const FacilityIcon = currentFacility?.icon || Building2;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center justify-center relative">
        {/* Kinetic Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="space-y-8 max-w-4xl z-10"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-cyan-400 text-xs font-semibold backdrop-blur-md shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Official PICT Pune Student & Admin Platform</span>
          </div>

          {/* Hero Title with TrueFocus Animation */}
          <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tight leading-tight py-2">
            Pune Institute of Computer Technology <br />
            <span className="gradient-text inline-block pt-2">
              <TrueFocus 
                sentence="Campus Connect"
                manualMode={false}
                blurAmount={5}
                borderColor="#22d3ee"
                glowColor="rgba(34, 211, 238, 0.6)"
                animationDuration={0.6}
                pauseBetweenAnimations={1.2}
              />
            </span>
          </h1>

          {/* FluidGlass Glass Refraction Lens Overlay (Temporarily Commented Out)
          <div className="absolute inset-0 z-20 w-full h-full pointer-events-auto">
            <FluidGlass
              mode="lens"
              lensProps={{
                scale: 0.3,
                ior: 1.25,
                thickness: 6,
                chromaticAberration: 0.15,
                anisotropy: 0.05
              }}
              titleText1="Pune Institute of Computer Technology"
              titleText2="Campus Connect"
            />
          </div>
          */}

          <p className="text-base sm:text-xl text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            Report infrastructure issues across PICT hostels, labs, mess & IT network, upvote priority concerns, auto-detect duplicate complaints, and securely resolve lost & found items.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {isAuthenticated ? (
              isAdmin ? (
                <Link
                  href="/admin"
                  className="btn-kinetic flex items-center gap-2.5 px-8 py-4 text-sm font-bold shadow-2xl"
                >
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <span>Open Admin Priority Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="btn-kinetic flex items-center gap-2.5 px-8 py-4 text-sm font-bold shadow-2xl"
                >
                  <span>Go to Student Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="btn-kinetic flex items-center gap-2.5 px-8 py-4 text-sm font-bold shadow-2xl"
                >
                  <span>Student Portal Login</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/admin/login"
                  className="flex items-center gap-2.5 px-7 py-4 rounded-2xl border border-indigo-500/30 bg-slate-900/80 font-bold text-sm text-cyan-400 hover:border-indigo-500 hover:bg-slate-900 transition-all backdrop-blur-md shadow-xl"
                >
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>Admin Staff Login</span>
                </Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* Explore Our Campus — OptionWheel Interactive Section      */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full mt-28 z-10"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-semibold mb-4">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Interactive Campus Explorer</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-primary)]">
              Explore Our <span className="gradient-text">Campus</span>
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-lg mx-auto">
              Scroll, drag, or click to browse through PICT's infrastructure. Every building and facility is mapped for complaint tracking.
            </p>
          </div>

          <div className="relative w-full flex items-stretch rounded-3xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)]/40 backdrop-blur-xl shadow-2xl shadow-indigo-500/5" style={{ minHeight: '420px' }}>
            {/* Left: OptionWheel */}
            <div className="w-1/2 relative">
              <OptionWheel
                items={CAMPUS_FACILITIES.map(f => f.name)}
                defaultSelected={0}
                textColor="#6b7280"
                activeColor="#22d3ee"
                side="left"
                fontSize={1.6}
                spacing={1.5}
                curve={0.8}
                tilt={5}
                blur={1.5}
                fade={0.3}
                smoothing={180}
                inset={40}
                loop
                draggable
                onChange={(index: number) => setSelectedFacility(index)}
              />
            </div>

            {/* Right: Facility Detail Card */}
            <div className="w-1/2 flex items-center justify-center p-8 relative">
              {/* Glow behind card */}
              <div className="absolute inset-0 bg-gradient-to-l from-indigo-600/10 via-transparent to-transparent pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedFacility}
                  initial={{ opacity: 0, x: 30, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -20, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 max-w-md space-y-5"
                >
                  {/* Icon + Title */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                      <FacilityIcon className="w-7 h-7 text-cyan-400" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">
                        {currentFacility.name}
                      </h3>
                      {currentFacility.floors > 0 && (
                        <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                          {currentFacility.floors} {currentFacility.floors === 1 ? 'Floor' : 'Floors'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {currentFacility.desc}
                  </p>

                  {/* Mini Stats */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Mapped for Complaints</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-lg font-semibold">
                      <Wifi className="w-3.5 h-3.5" />
                      <span>WiFi Tracked</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.section>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-24 z-10">
          {[
            {
              icon: Layers,
              title: 'Cascading Selectors',
              desc: 'Select hierarchical category and location paths with smooth subcategory expansion.',
            },
            {
              icon: Flame,
              title: 'Dynamic Upvote Priority',
              desc: 'Priority scores escalate dynamically as student upvotes accumulate.',
            },
            {
              icon: Zap,
              title: 'Duplicate Detection',
              desc: 'Auto-detect active duplicate complaints at the same location to streamline resolution.',
            },
            {
              icon: ShieldCheck,
              title: 'QR Lost & Found Claims',
              desc: 'Secure 6-digit claim codes and QR verification for official item handover.',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-card p-7 text-left space-y-4 hover:border-indigo-500/50 hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-cyan-400 flex items-center justify-center shadow-inner">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
