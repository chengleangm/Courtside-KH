import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import CheckInPOS from './CheckInPOS';

export const dynamic='force-dynamic';
export default async function CheckInPage(){
  if(!(await isAdmin())) redirect('/admin/login');
  const bookings=await store.getBookings();
  return <CheckInPOS initialBookings={bookings}/>;
}
