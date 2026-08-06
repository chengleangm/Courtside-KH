import { notFound } from 'next/navigation';
import { store } from '@/lib/store';
import CourtDetail from './CourtDetail';

export const dynamic = 'force-dynamic';
export default async function CourtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const settings = await store.getSettings();
  const court = settings.courts.find((item) => item.id === id && item.active);
  if (!court) notFound();
  return <CourtDetail court={court} settings={settings}/>;
}
