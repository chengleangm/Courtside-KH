import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import BlockedTimeManager from './BlockedTimeManager';

export const dynamic='force-dynamic';
export default async function BlocksPage(){if(!(await isAdmin()))redirect('/admin/login');const [initialBlocks,settings]=await Promise.all([store.getBlockedPeriods(),store.getSettings()]);return <BlockedTimeManager initialBlocks={initialBlocks} settings={settings}/>;}
