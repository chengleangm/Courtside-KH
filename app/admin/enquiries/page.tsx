import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import EnquiriesView from './EnquiriesView';

export const dynamic='force-dynamic';
export default async function EnquiriesPage(){if(!(await isAdmin()))redirect('/admin/login');const enquiries=await store.getEnquiries();enquiries.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));return <EnquiriesView enquiries={enquiries}/>;}
