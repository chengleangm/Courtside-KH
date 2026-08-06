import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import CourtsList from './CourtsList';

export const dynamic = 'force-dynamic';
export default async function CourtsAdminPage() {
  if (!(await isAdmin())) redirect('/admin/login');
  const settings = await store.getSettings();
  return <CourtsList initialCourts={settings.courts}/>;
}
