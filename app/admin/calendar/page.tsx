import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import BookingCalendar from './BookingCalendar';

export const dynamic='force-dynamic';
export default async function CalendarPage(){
  if(!(await isAdmin())) redirect('/admin/login');
  const [bookings,blocks,settings]=await Promise.all([store.getBookings(),store.getBlockedPeriods(),store.getSettings()]);
  bookings.sort((a,b)=>`${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));
  return <BookingCalendar bookings={bookings} blocks={blocks} settings={settings}/>;
}
