import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import { timeToMinutes } from '@/lib/time';
import type { Court, ServiceType } from '@/lib/types';

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || '').split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function normalizeCourt(body: Record<string, unknown>, id: string): Court | null {
  const service = String(body.service) as ServiceType;
  const openingTime = String(body.openingTime || '07:00');
  const closingTime = String(body.closingTime || '22:00');
  const name = String(body.name || '').trim();
  const pricePerHour = Number(body.pricePerHour);
  const capacity = Number(body.capacity);
  if (!name || !['pickleball', 'tennis'].includes(service) || timeToMinutes(openingTime) >= timeToMinutes(closingTime) || !Number.isFinite(pricePerHour) || pricePerHour < 0 || !Number.isInteger(capacity) || capacity < 1) return null;
  return {
    id,
    name,
    service,
    active: body.active !== false,
    environment: body.environment === 'indoor' ? 'indoor' : 'outdoor',
    surface: String(body.surface || '').trim(),
    lighting: body.lighting !== false,
    pricePerHour,
    openingTime,
    closingTime,
    image: String(body.image || '').trim(),
    gallery: normalizeList(body.gallery),
    description: String(body.description || '').trim(),
    capacity,
    amenities: normalizeList(body.amenities),
    rules: normalizeList(body.rules),
    locationLabel: String(body.locationLabel || '').trim(),
    featured: body.featured === true,
  };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const court = (await store.getSettings()).courts.find((item) => item.id === id);
  return court ? NextResponse.json({ court }) : NextResponse.json({ error: 'Court not found.' }, { status: 404 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const settings = await store.getSettings();
  const index = settings.courts.findIndex((item) => item.id === id);
  if (index < 0) return NextResponse.json({ error: 'Court not found.' }, { status: 404 });
  const court = normalizeCourt(await request.json(), id);
  if (!court) return NextResponse.json({ error: 'Please check the court name, sport, hours, price and capacity.' }, { status: 400 });
  settings.courts[index] = court;
  await store.saveSettings(settings);
  return NextResponse.json({ court });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const [settings, bookings] = await Promise.all([store.getSettings(), store.getBookings()]);
  if (bookings.some((booking) => booking.courtId === id)) return NextResponse.json({ error: 'This court has booking history. Deactivate it instead of deleting it.' }, { status: 409 });
  const next = settings.courts.filter((item) => item.id !== id);
  if (next.length === settings.courts.length) return NextResponse.json({ error: 'Court not found.' }, { status: 404 });
  settings.courts = next;
  await store.saveSettings(settings);
  return NextResponse.json({ success: true });
}
