import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import CourtAdminForm from '@/components/CourtAdminForm';
import type { ServiceType } from '@/lib/types';

export const dynamic = 'force-dynamic';
export default async function NewCourtPage({ searchParams }: { searchParams: Promise<{ sport?: string }> }) {
  if (!(await isAdmin())) redirect('/admin/login');
  const params = await searchParams;
  const service: ServiceType = params.sport === 'tennis' ? 'tennis' : 'pickleball';
  return <CourtAdminForm settings={await store.getSettings()} defaultService={service}/>;
}
