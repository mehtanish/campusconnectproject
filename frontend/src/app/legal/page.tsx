'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function LegalPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-left space-y-12">
        {/* Document Header */}
        <header className="border-b border-slate-800 pb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400">
            <span>OFFICIAL LEGAL NOTICE & DOCUMENTATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            Terms, Governance & Legal Information
          </h1>
          <p className="text-sm text-slate-400 font-mono">
            Last Updated: September 2026 • Version 1.0 • Campus Connect
          </p>
        </header>

        {/* Section 1: About This Project */}
        <section id="about" className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-white border-l-2 border-cyan-500 pl-3">
            1. About This Project
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-3">
            <p>
              Campus Connect is an independent, student-built initiative created to streamline campus infrastructure issue tracking and complaint deduplication.
            </p>
            <p className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs leading-relaxed">
              <strong>Notice of Independence:</strong> Campus Connect is an independent student project for campus utility. It is not an official college platform and is not officially endorsed by, operated by, or affiliated with Pune Institute of Computer Technology (PICT) or any educational institution unless/until such affiliation is explicitly confirmed in writing.
            </p>
          </div>
        </section>

        {/* Section 2: Terms of Use */}
        <section id="terms" className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-white border-l-2 border-cyan-500 pl-3">
            2. Terms of Use & Code of Conduct
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-3">
            <p>
              By accessing or submitting information through Campus Connect, you agree to adhere to the following acceptable use guidelines:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs text-slate-300 pl-2">
              <li><strong>Authentic Submissions:</strong> You must only report genuine infrastructure flaws and maintenance requests.</li>
              <li><strong>Prohibited Behavior:</strong> Submitting spam, fake issue tickets, abusive language, or misleading photographs is strictly prohibited.</li>
              <li><strong>Account Suspension:</strong> Campus Connect administrators reserve the right to restrict or terminate access for any account found submitting false information or attempting to abuse platform resources.</li>
            </ul>
          </div>
        </section>

        {/* Section 4: Data & Privacy */}
        <section id="privacy" className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-white border-l-2 border-cyan-500 pl-3">
            4. Data & Privacy Policy
          </h2>
          <div className="text-sm text-slate-300 leading-relaxed space-y-3">
            <p>
              We respect user privacy and operate under strict data minimization principles:
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs text-slate-300 pl-2">
              <li><strong>Information Collected:</strong> Basic user account details (name, student/staff ID, email address), reported complaint descriptions, location data, and uploaded photographs.</li>
              <li><strong>Usage of Data:</strong> Data is exclusively used to route complaints to appropriate campus maintenance domains, identify duplicate issues, and verify lost item ownership.</li>
              <li><strong>No Third-Party Sharing:</strong> Your personal information is never sold, leased, or shared with third-party marketers or external advertising networks.</li>
            </ul>
          </div>
        </section>

        {/* Section 5: Copyright Notice */}
        <section id="copyright" className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-white border-l-2 border-cyan-500 pl-3">
            5. Intellectual Property & Copyright Notice
          </h2>
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed space-y-2">
            <p className="font-bold text-white">
              © 2026 Campus Connect. All rights reserved.
            </p>
            <p>
              This source code, design and content are the intellectual property of Campus Connect and may not be copied, redistributed or reused without written permission.
            </p>
          </div>
        </section>

        {/* Section 6: Legal Contact */}
        <section id="contact" className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-xl font-display font-semibold text-white border-l-2 border-cyan-500 pl-3">
            6. Legal & Privacy Inquiries
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            For questions regarding these terms, privacy inquiries, or IP permission requests, please contact our legal desk placeholder:
          </p>
          {/* legal@campusconnect.local */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
            <span>Contact Email (Placeholder):</span>
            <span className="text-cyan-400 font-bold">legal@campusconnect.local</span>
          </div>
        </section>

        <div className="pt-6 text-xs text-slate-500 border-t border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="text-cyan-400 hover:underline font-mono">
            ← Return to Campus Connect Home
          </Link>
          <span className="font-mono">Document ID: LEG-2026-09</span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
