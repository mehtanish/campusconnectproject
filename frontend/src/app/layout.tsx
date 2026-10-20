import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import { Providers } from './providers';
import { Footer } from '@/components/layout/Footer';
import { StickyMobileCta } from '@/components/layout/StickyMobileCta';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://campusconnectproject-nu.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'CampusConnect — PICT Infrastructure & Issue Tracker',
    template: '%s | CampusConnect — PICT',
  },
  description: 'Next-generation campus infrastructure management and automated issue resolution platform for PICT students, faculty, and administrators.',
  keywords: [
    'CampusConnect',
    'Campus Connect',
    'PICT Pune',
    'Pune Institute of Computer Technology',
    'Campus Infrastructure',
    'Issue Tracker',
    'Student Portal',
    'Smart Campus Management',
    'AI Issue Deduplication',
  ],
  authors: [{ name: 'PICT CampusConnect Team' }],
  creator: 'PICT Campus Intelligence',
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    title: 'CampusConnect — PICT Infrastructure & Issue Tracker',
    description: 'Next-generation campus infrastructure management and automated issue resolution platform for PICT students, faculty, and administrators.',
    siteName: 'CampusConnect',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CampusConnect — PICT Infrastructure & Issue Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CampusConnect — PICT Infrastructure & Issue Tracker',
    description: 'Next-generation campus infrastructure management and automated issue resolution platform for PICT students, faculty, and administrators.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CampusConnect',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    description: 'Next-generation campus infrastructure management and automated issue resolution platform for PICT Pune.',
    url: baseUrl,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Pune Institute of Computer Technology',
      url: 'https://pict.edu',
    },
  };

  return (
    <html
      lang="en"
      className={`dark ${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className="min-h-screen flex flex-col font-sans bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200"
        suppressHydrationWarning
      >
        <Providers>
          <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0" suppressHydrationWarning>
            {children}
          </div>
          <StickyMobileCta />
          <Footer />
        </Providers>
        {Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID) && <Analytics />}
      </body>
    </html>
  );
}
