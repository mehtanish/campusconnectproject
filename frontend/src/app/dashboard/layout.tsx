import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Portal Dashboard',
  description: 'Track your filed complaints, view official admin resolution notes, and monitor campus infrastructure progress in real time.',
  alternates: {
    canonical: '/dashboard',
  },
  openGraph: {
    title: 'Student Portal Dashboard | CampusConnect — PICT',
    description: 'Track your filed complaints, view official admin resolution notes, and monitor campus infrastructure progress in real time.',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
