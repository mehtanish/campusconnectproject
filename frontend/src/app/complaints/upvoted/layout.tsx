import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Priority Feed',
  description: 'Track community upvoted issues, view department resolution progress, and monitor maintenance escalations across PICT campus.',
  alternates: {
    canonical: '/complaints/upvoted',
  },
  openGraph: {
    title: 'Community Priority Feed | CampusConnect — PICT',
    description: 'Track community upvoted issues, view department resolution progress, and monitor maintenance escalations across PICT campus.',
  },
};

export default function UpvotedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
