import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Footer } from '@/components/layout/Footer';

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

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Campus Connect — PICT Infrastructure & Issue Tracker',
    template: '%s | Campus Connect',
  },
  description: 'Next-generation campus infrastructure management and automated issue resolution platform for PICT students, faculty, and administrators.',
  keywords: [
    'Campus Connect',
    'PICT Pune',
    'Pune Institute of Computer Technology',
    'Campus Infrastructure',
    'Issue Tracker',
    'Student Portal',
    'Smart Campus Management',
  ],
  authors: [{ name: 'PICT Campus Connect Team' }],
  creator: 'PICT Campus Intelligence',
  metadataBase: new URL('https://campusconnect.pict.edu'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://campusconnect.pict.edu',
    title: 'Campus Connect — PICT Infrastructure & Issue Tracker',
    description: 'Next-generation campus infrastructure management and automated issue resolution platform for PICT students, faculty, and administrators.',
    siteName: 'Campus Connect',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Campus Connect — PICT Infrastructure & Issue Tracker',
    description: 'Next-generation campus infrastructure management and automated issue resolution platform for PICT students, faculty, and administrators.',
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
    name: 'Campus Connect',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    description: 'Next-generation campus infrastructure management and automated issue resolution platform for PICT Pune.',
    url: 'https://campusconnect.pict.edu',
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Pune Institute of Computer Technology',
      url: 'https://pict.edu',
    },
  };

  return (
    <html
      lang="en"
      className={`dark ${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}
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
          <div className="flex-1 flex flex-col min-h-screen" suppressHydrationWarning>
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
