import { store } from '@/lib/store';
import CourtsShowcase from './CourtsShowcase';

export const dynamic = 'force-dynamic';
export default async function CourtsPage() {
  return <CourtsShowcase settings={await store.getSettings()}/>;
}
