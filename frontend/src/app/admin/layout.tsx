import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Command Center & Analytics',
  description: 'PICT campus authority priority triage queues, domain-filtered ticket analytics, and Excel maintenance reporting dashboard.',
  alternates: {
    canonical: '/admin',
  },
  openGraph: {
    title: 'Admin Command Center & Analytics | CampusConnect — PICT',
    description: 'PICT campus authority priority triage queues, domain-filtered ticket analytics, and Excel maintenance reporting dashboard.',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
