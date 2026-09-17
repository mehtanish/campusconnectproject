'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, PlusCircle, Search, LayoutDashboard, LogOut, Shield, ThumbsUp } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navLinks = isAdmin
    ? [{ href: '/admin', label: 'Admin Priority Hub', icon: Shield }]
    : [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/complaints/new', label: 'File Complaint', icon: PlusCircle },
        { href: '/complaints/upvoted', label: 'Upvoted History', icon: ThumbsUp },
        { href: '/lost-found', label: 'Lost & Found', icon: Search },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-color)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-base tracking-tight gradient-text">
              Campus Connect
            </span>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest leading-none">
              PICT Pune
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 ${
                    isActive
                      ? 'text-indigo-400 bg-indigo-500/15 border border-indigo-500/30 shadow-inner'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="nav-active-glow"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-indigo-500 via-cyan-400 to-purple-500 rounded-full"
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
              <div className="flex items-center gap-2.5 bg-slate-900/80 border border-indigo-500/30 px-3.5 py-1.5 rounded-xl shadow-lg">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-[var(--text-primary)] leading-tight">
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
                className="p-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors shadow-lg"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-xs font-semibold px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-color)] transition-all"
              >
                Student Portal
              </Link>
              <Link
                href="/admin/login"
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all"
              >
                Admin Staff Portal
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

