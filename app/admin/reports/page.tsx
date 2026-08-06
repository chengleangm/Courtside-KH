import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import ReportsView from './ReportsView';

export const dynamic = 'force-dynamic';
export default async function ReportsPage() {
  if (!(await isAdmin())) redirect('/admin/login');
  const [bookings, settings] = await Promise.all([store.getBookings(), store.getSettings()]);
  return <ReportsView bookings={bookings} settings={settings}/>;
}
