import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Portal Sign In',
  description: 'Log in to your PICT student account to submit maintenance tickets, upvote campus repairs, and track ticket status.',
  alternates: {
    canonical: '/login',
  },
  openGraph: {
    title: 'Student Portal Sign In | CampusConnect — PICT',
    description: 'Log in to your PICT student account to submit maintenance tickets, upvote campus repairs, and track ticket status.',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
