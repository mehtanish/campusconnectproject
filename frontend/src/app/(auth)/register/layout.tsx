import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Account Registration',
  description: 'Create an official PICT student account to report infrastructure issues, upvote peer complaints, and access campus services.',
  alternates: {
    canonical: '/register',
  },
  openGraph: {
    title: 'Student Account Registration | CampusConnect — PICT',
    description: 'Create an official PICT student account to report infrastructure issues, upvote peer complaints, and access campus services.',
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
