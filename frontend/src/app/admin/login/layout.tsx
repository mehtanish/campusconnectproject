import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff & Administrator Portal',
  description: 'Secure authentication gateway for PICT campus authority members, facility managers, and domain administrators.',
  alternates: {
    canonical: '/admin/login',
  },
  openGraph: {
    title: 'Staff & Administrator Portal | CampusConnect — PICT',
    description: 'Secure authentication gateway for PICT campus authority members, facility managers, and domain administrators.',
  },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
