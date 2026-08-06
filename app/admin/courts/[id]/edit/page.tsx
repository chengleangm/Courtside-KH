import { notFound, redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import CourtAdminForm from '@/components/CourtAdminForm';

export const dynamic = 'force-dynamic';
export default async function EditCourtPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect('/admin/login');
  const { id } = await params;
  const settings = await store.getSettings();
  const court = settings.courts.find((item) => item.id === id);
  if (!court) notFound();
  return <CourtAdminForm settings={settings} initialCourt={court}/>;
}
