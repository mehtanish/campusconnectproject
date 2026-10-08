'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 text-left pt-12 pb-10 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Project Disclaimer */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="font-display font-bold text-lg text-white tracking-tight">
                Campus Connect
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An independent student initiative for PICT campus complaint reporting and infrastructure tracking.
            </p>
            <p className="text-[11px] text-slate-500 italic leading-snug">
              Note: This is an independent student project and is not an official college platform.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Student Dashboard</Link></li>
              <li><Link href="/complaints/new" className="hover:text-cyan-400 transition-colors">Report Campus Issue</Link></li>
              <li><Link href="/complaints/upvoted" className="hover:text-cyan-400 transition-colors">Upvoted Issues Leaderboard</Link></li>
            </ul>
          </div>

          {/* Column 3: Administration */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">Administration</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/admin/login" className="hover:text-cyan-400 transition-colors">Admin Portal Login</Link></li>
              <li><Link href="/admin" className="hover:text-cyan-400 transition-colors">Domain Priority Queue</Link></li>
            </ul>
          </div>

          {/* Column 4: Legal & Contact */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">Legal & Contact</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/legal" className="hover:text-cyan-400 transition-colors font-medium text-slate-300">Terms & Conditions / Legal</Link></li>
              <li><Link href="/legal#privacy" className="hover:text-cyan-400 transition-colors">Privacy & Data Policy</Link></li>
            </ul>
            {/* legal@campusconnect.local */}
            <p className="text-[11px] text-slate-500 pt-1 font-mono">
              Inquiries: <span className="text-slate-400">legal@campusconnect.local</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <p>© 2026 Campus Connect.</p>
          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/legal" className="hover:text-cyan-400 transition-colors">Terms of Use</Link>
            <Link href="/legal#privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
            <Link href="/legal#copyright" className="hover:text-cyan-400 transition-colors">Copyright Notice</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
