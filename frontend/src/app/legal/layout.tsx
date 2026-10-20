import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Governance & Privacy Notice',
  description: 'Official legal notice, terms of service, acceptable use policies, and privacy principles governing CampusConnect at PICT.',
  alternates: {
    canonical: '/legal',
  },
  openGraph: {
    title: 'Terms of Governance & Privacy Notice | CampusConnect — PICT',
    description: 'Official legal notice, terms of service, acceptable use policies, and privacy principles governing CampusConnect at PICT.',
  },
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
