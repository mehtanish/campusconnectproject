'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  Shield,
  ThumbsUp,
  Menu,
  X,
  Radio,
  FileText,
  Home,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  const navLinks = isAdmin
    ? [{ href: '/admin', label: 'Admin Priority Hub', icon: Shield }]
    : [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/complaints/new', label: 'File Complaint', icon: PlusCircle },
        { href: '/complaints/upvoted', label: 'Upvoted Feed', icon: ThumbsUp },
      ];

  const publicLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/complaints/new', label: 'Report Issue', icon: PlusCircle },
    { href: '/legal', label: 'Legal & Terms', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/15 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo & Live Pulse */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-xl">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 group-hover:scale-105 transition-all duration-300 border border-cyan-300/30 shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-200 animate-pulse" aria-hidden="true" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-extrabold text-sm sm:text-base tracking-tight gradient-text-cyber whitespace-nowrap">
                CampusConnect
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400 uppercase tracking-wider leading-none hidden sm:inline">
                PICT Command Center
              </span>
            </div>
          </Link>

          {/* Live Status Pulse Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-emerald-500/30 font-mono text-[11px] text-emerald-400">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" aria-hidden="true" />
            <span>SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        {isAuthenticated && (
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 ${
                    isActive
                      ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} aria-hidden="true" />
                  <span>{link.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="nav-active-glow"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-cyan-400 via-violet-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Auth Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2.5 bg-slate-900/90 border border-cyan-500/30 px-3 py-1.5 rounded-xl shadow-lg">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 text-white flex items-center justify-center text-xs font-bold font-mono shadow">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-slate-100 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[9px] text-cyan-400 font-mono tracking-wider">
                    {user.role}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                aria-label="Logout"
                className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/15 transition-all shadow-lg cursor-pointer flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="min-h-[44px] text-xs px-2.5 sm:px-4">
                  Student Portal
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="cyber" size="sm" className="min-h-[44px] text-xs px-2.5 sm:px-4 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Admin Portal</span>
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Drawer Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 min-h-[44px] min-w-[44px] rounded-xl border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-900/80 flex items-center justify-center cursor-pointer"
            aria-label="Toggle navigation drawer"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            aria-label="Mobile Navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-cyan-500/20 bg-slate-950/98 backdrop-blur-2xl overflow-hidden px-4 py-4 space-y-3"
          >
            {user && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 flex items-center justify-center font-bold font-mono">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-100">{user.name}</div>
                  <div className="text-xs text-cyan-400 font-mono">{user.role}</div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {(isAuthenticated ? navLinks : publicLinks).map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {!isAuthenticated && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <Link
                    href="/admin/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 min-h-[44px] rounded-xl text-sm font-medium text-violet-300 bg-violet-500/10 border border-violet-500/20"
                  >
                    <Shield className="w-4 h-4 text-violet-400" aria-hidden="true" />
                    <span>Admin & Staff Portal</span>
                  </Link>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
