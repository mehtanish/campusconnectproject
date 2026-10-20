import { redirect } from 'next/navigation';

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/complaints?id=${encodeURIComponent(resolvedParams.id)}`);
}
