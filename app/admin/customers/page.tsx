import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import CustomersView from './CustomersView';

export const dynamic = 'force-dynamic';
export default async function CustomersPage() {
  if (!(await isAdmin())) redirect('/admin/login');
  return <CustomersView bookings={await store.getBookings()}/>;
}
