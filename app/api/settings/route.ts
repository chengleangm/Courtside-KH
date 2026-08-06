import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import { timeToMinutes } from '@/lib/time';
import type { Settings } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() { return NextResponse.json(await store.getSettings()); }

export async function PATCH(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await request.json()) as Settings;
  const validDurations = Array.isArray(body.allowedDurations) && body.allowedDurations.length > 0 && body.allowedDurations.every((duration) => Number.isInteger(duration) && duration > 0 && Number.isInteger(body.slotMinutes) && duration % body.slotMinutes === 0);
  const ids = new Set<string>();
  const validCourts = Array.isArray(body.courts) && body.courts.length > 0 && body.courts.every((court) => {
    const opening = court.openingTime || body.openingTime;
    const closing = court.closingTime || body.closingTime;
    const unique = Boolean(court.id && !ids.has(court.id));
    if (court.id) ids.add(court.id);
    return unique && court.name?.trim() && ['pickleball', 'tennis'].includes(court.service) && timeToMinutes(opening) < timeToMinutes(closing) && (court.pricePerHour === undefined || court.pricePerHour >= 0) && (court.capacity === undefined || court.capacity > 0);
  });

  if (!body.openingTime || !body.closingTime || timeToMinutes(body.openingTime) >= timeToMinutes(body.closingTime) || ![30, 60].includes(body.slotMinutes) || !validDurations || !validCourts || body.pickleballPricePerHour < 0 || body.tennisPricePerHour < 0) return NextResponse.json({ error: 'Invalid settings. Check court names, hours, prices and durations.' }, { status: 400 });

  const normalized: Settings = {
    ...body,
    allowedDurations: [...new Set(body.allowedDurations)].sort((a, b) => a - b),
    courts: body.courts.map((court) => ({
      ...court,
      name: court.name.trim(),
      surface: court.surface?.trim(),
      description: court.description?.trim(),
      image: court.image?.trim(),
      openingTime: court.openingTime || body.openingTime,
      closingTime: court.closingTime || body.closingTime,
    })),
  };
  await store.saveSettings(normalized);
  return NextResponse.json({ settings: normalized });
}
