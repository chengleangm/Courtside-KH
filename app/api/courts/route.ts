import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import { timeToMinutes } from '@/lib/time';
import type { Court, ServiceType } from '@/lib/types';

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || '').split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function normalizeCourt(body: Record<string, unknown>, fallbackId?: string): Court | null {
  const service = String(body.service) as ServiceType;
  const openingTime = String(body.openingTime || '07:00');
  const closingTime = String(body.closingTime || '22:00');
  const name = String(body.name || '').trim();
  if (!name || !['pickleball', 'tennis'].includes(service) || timeToMinutes(openingTime) >= timeToMinutes(closingTime)) return null;
  const pricePerHour = Number(body.pricePerHour);
  const capacity = Number(body.capacity);
  if (!Number.isFinite(pricePerHour) || pricePerHour < 0 || !Number.isInteger(capacity) || capacity < 1) return null;
  return {
    id: fallbackId || String(body.id || `${service === 'pickleball' ? 'pb' : 'tn'}-${randomUUID().slice(0, 8)}`),
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

export async function GET() {
  return NextResponse.json({ courts: (await store.getSettings()).courts });
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const court = normalizeCourt(body);
  if (!court) return NextResponse.json({ error: 'Please check the court name, sport, hours, price and capacity.' }, { status: 400 });
  const settings = await store.getSettings();
  if (settings.courts.some((item) => item.id === court.id)) return NextResponse.json({ error: 'A court with this ID already exists.' }, { status: 409 });
  settings.courts.push(court);
  await store.saveSettings(settings);
  return NextResponse.json({ court }, { status: 201 });
}
