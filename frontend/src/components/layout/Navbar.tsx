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
        { href: '/complaints/upvoted', label: 'Upvoted Leaderboard', icon: ThumbsUp },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/15 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Live Pulse */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 group-hover:scale-105 transition-all duration-300 border border-cyan-300/30">
              <Activity className="w-5 h-5 text-cyan-200 animate-pulse" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display font-extrabold text-base tracking-tight gradient-text-cyber">
                Campus Connect
              </span>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest leading-none">
                PICT Command Center
              </span>
            </div>
          </Link>

          {/* Live Status Pulse Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-emerald-500/30 font-mono text-[11px] text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 ${
                    isActive
                      ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
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
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
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
                className="p-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/15 transition-all shadow-lg cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Student Portal
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="cyber" size="sm">
                  Admin Portal
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Drawer Toggle */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-900/80"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-cyan-500/20 bg-slate-950/95 backdrop-blur-2xl overflow-hidden px-4 py-4 space-y-3"
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
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
