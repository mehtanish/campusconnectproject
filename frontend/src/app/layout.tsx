import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Campus Connect — PICT (Pune Institute of Computer Technology)',
  description: 'Official Issue Resolution & Community Engagement Platform for Pune Institute of Computer Technology (PICT). Powered by real-time tracking and smart deduplication.',
  keywords: ['PICT', 'Pune Institute of Computer Technology', 'campus connect', 'complaints', 'lost and found'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
