import { store } from '@/lib/store';
import { getZonedNow, minutesToTime, periodsOverlap, timeToMinutes } from '@/lib/time';
import type { ServiceType } from '@/lib/types';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const service = request.nextUrl.searchParams.get('service') as ServiceType;
  const date = request.nextUrl.searchParams.get('date') || '';
  if (!(['pickleball', 'tennis'] as string[]).includes(service) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: 'Invalid service or date.' }, { status: 400 });

  const [settings, bookings, blockedPeriods] = await Promise.all([store.getSettings(), store.getBookings(), store.getBlockedPeriods()]);
  const courts = settings.courts.filter((court) => court.active && court.service === service);
  const courtOpenings = courts.map((court) => timeToMinutes(court.openingTime || settings.openingTime));
  const courtClosings = courts.map((court) => timeToMinutes(court.closingTime || settings.closingTime));
  const openingMinutes = courtOpenings.length ? Math.min(...courtOpenings) : timeToMinutes(settings.openingTime);
  const closingMinutes = courtClosings.length ? Math.max(...courtClosings) : timeToMinutes(settings.closingTime);
  const timeLabels: string[] = [];
  const phnomPenhNow = getZonedNow();
  const slots: Array<{ courtId: string; courtName: string; startTime: string; endTime: string }> = [];

  for (let start = openingMinutes; start + settings.slotMinutes <= closingMinutes; start += settings.slotMinutes) timeLabels.push(minutesToTime(start));

  for (const court of courts) {
    const courtOpening = timeToMinutes(court.openingTime || settings.openingTime);
    const courtClosing = timeToMinutes(court.closingTime || settings.closingTime);
    for (const startTime of timeLabels) {
      const startMinutes = timeToMinutes(startTime);
      const endTime = minutesToTime(startMinutes + settings.slotMinutes);
      const isOutsideCourtHours = startMinutes < courtOpening || startMinutes + settings.slotMinutes > courtClosing;
      const isPast = date < phnomPenhNow.date || (date === phnomPenhNow.date && startMinutes < phnomPenhNow.minutes);
      const booked = bookings.some((booking) => booking.courtId === court.id && booking.date === date && booking.status !== 'cancelled' && periodsOverlap(startTime, endTime, booking.startTime, booking.endTime));
      const blocked = blockedPeriods.some((period) => period.courtId === court.id && period.date === date && periodsOverlap(startTime, endTime, period.startTime, period.endTime));
      if (!isOutsideCourtHours && !isPast && !booked && !blocked) slots.push({ courtId: court.id, courtName: court.name, startTime, endTime });
    }
  }

  const scheduleCourts = courts.map((court) => ({
    id: court.id, name: court.name, service: court.service, environment: court.environment, surface: court.surface, lighting: court.lighting,
    pricePerHour: court.pricePerHour, openingTime: court.openingTime || settings.openingTime, closingTime: court.closingTime || settings.closingTime, image: court.image,
  }));
  const filteredBookings = bookings.filter((booking) => booking.date === date && booking.status !== 'cancelled' && courts.some((court) => court.id === booking.courtId)).map((booking) => ({ courtId: booking.courtId, startTime: booking.startTime, endTime: booking.endTime }));
  const filteredBlockedPeriods = blockedPeriods.filter((period) => period.date === date && courts.some((court) => court.id === period.courtId)).map((period) => ({ courtId: period.courtId, startTime: period.startTime, endTime: period.endTime, label: period.reason }));

  return NextResponse.json({
    slots,
    allowedDurations: settings.allowedDurations,
    pricePerHour: service === 'pickleball' ? settings.pickleballPricePerHour : settings.tennisPricePerHour,
    currency: settings.currency,
    slotMinutes: settings.slotMinutes,
    courts: scheduleCourts,
    timeLabels,
    bookings: filteredBookings,
    blockedPeriods: filteredBlockedPeriods,
  });
}
