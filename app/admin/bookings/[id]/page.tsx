import { notFound, redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import BookingDetail from './BookingDetail';

export const dynamic = 'force-dynamic';
export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect('/admin/login');
  const { id } = await params;
  const [bookings, settings] = await Promise.all([store.getBookings(), store.getSettings()]);
  const booking = bookings.find((item) => item.id === id);
  if (!booking) notFound();
  return <BookingDetail initialBooking={booking} court={settings.courts.find((item) => item.id === booking.courtId)}/>;
}
