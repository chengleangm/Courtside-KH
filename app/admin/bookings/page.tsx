import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import BookingsManager from './BookingsManager';

export const dynamic = 'force-dynamic';
export default async function BookingsPage() {
  if (!(await isAdmin())) redirect('/admin/login');
  const [bookings, settings] = await Promise.all([store.getBookings(), store.getSettings()]);
  bookings.sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));
  return <BookingsManager initialBookings={bookings} settings={settings}/>;
}
