import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import AdminOverview from './AdminOverview';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await isAdmin())) redirect('/admin/login');
  const [bookings, settings, blocks] = await Promise.all([store.getBookings(), store.getSettings(), store.getBlockedPeriods()]);
  bookings.sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));
  return <AdminOverview bookings={bookings} settings={settings} blocks={blocks} />;
}
