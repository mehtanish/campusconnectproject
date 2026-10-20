import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report Infrastructure Issue',
  description: 'Submit campus maintenance tickets, report classroom faults, or flag facility breakdowns with instant AI deduplication at PICT Pune.',
  alternates: {
    canonical: '/complaints/new',
  },
  openGraph: {
    title: 'Report Infrastructure Issue | CampusConnect — PICT',
    description: 'Submit campus maintenance tickets, report classroom faults, or flag facility breakdowns with instant AI deduplication at PICT Pune.',
  },
};

export default function NewComplaintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
