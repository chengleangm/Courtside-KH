import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getZonedNow, minutesToTime, periodsOverlap, timeToMinutes } from '@/lib/time';
import { notifyNewBooking } from '@/lib/notifications';
import { isAdmin } from '@/lib/auth';
import type { Booking, ServiceType } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ bookings: await store.getBookings() });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const service = body.service as ServiceType;
  const durationMinutes = Number(body.durationMinutes);
  const required = [
    body.date,
    body.courtId,
    body.startTime,
    body.customerName,
    body.phone,
    body.email,
  ];

  if (
    !(['pickleball', 'tennis'] as string[]).includes(service) ||
    required.some((value) => !String(value || '').trim()) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(String(body.date))
  ) {
    return NextResponse.json(
      { error: 'Please complete all required booking fields.' },
      { status: 400 },
    );
  }

  const [settings, blockedPeriods] = await Promise.all([
    store.getSettings(),
    store.getBlockedPeriods(),
  ]);
  const court = settings.courts.find(
    (item) => item.id === body.courtId && item.active && item.service === service,
  );

  if (!court || !settings.allowedDurations.includes(durationMinutes)) {
    return NextResponse.json({ error: 'Invalid court or booking duration.' }, { status: 400 });
  }

  const startMinutes = timeToMinutes(String(body.startTime));
  const openingTime = court.openingTime || settings.openingTime;
  const closingTime = court.closingTime || settings.closingTime;
  const openingMinutes = timeToMinutes(openingTime);
  const closingMinutes = timeToMinutes(closingTime);
  const endMinutes = startMinutes + durationMinutes;
  const endTime = minutesToTime(endMinutes);
  const phnomPenhNow = getZonedNow();

  if (
    !Number.isFinite(startMinutes) ||
    String(body.date) < phnomPenhNow.date ||
    (String(body.date) === phnomPenhNow.date && startMinutes < phnomPenhNow.minutes) ||
    durationMinutes <= 0 ||
    durationMinutes % settings.slotMinutes !== 0 ||
    startMinutes < openingMinutes ||
    endMinutes > closingMinutes ||
    (startMinutes - openingMinutes) % settings.slotMinutes !== 0
  ) {
    return NextResponse.json(
      { error: 'The selected time is outside operating hours or does not align with the schedule.' },
      { status: 400 },
    );
  }

  if (body.endTime && String(body.endTime) !== endTime) {
    return NextResponse.json({ error: 'The selected end time is invalid.' }, { status: 400 });
  }

  const blockCount = durationMinutes / settings.slotMinutes;
  const expectedSlotIds = Array.from({ length: blockCount }, (_, index) => {
    const blockStart = minutesToTime(startMinutes + index * settings.slotMinutes);
    return `${court.id}-${blockStart}`;
  });
  const submittedSlotIds = Array.isArray(body.selectedSlotIds)
    ? body.selectedSlotIds.map(String)
    : [];

  if (
    submittedSlotIds.length !== expectedSlotIds.length ||
    expectedSlotIds.some((slotId, index) => submittedSlotIds[index] !== slotId) ||
    (body.blockCount !== undefined && Number(body.blockCount) !== blockCount)
  ) {
    return NextResponse.json(
      { error: 'The selected time blocks are incomplete or not consecutive.' },
      { status: 400 },
    );
  }

  const blockedMatch = blockedPeriods.some(
    (period) =>
      period.courtId === court.id &&
      period.date === body.date &&
      periodsOverlap(body.startTime, endTime, period.startTime, period.endTime),
  );
  if (blockedMatch) {
    return NextResponse.json(
      { error: 'That court is blocked during part of the selected time.' },
      { status: 409 },
    );
  }

  const result = await store.withBookingLock(async () => {
    const bookings = await store.getBookings();
    const duplicate = bookings.some(
      (booking) =>
        booking.courtId === court.id &&
        booking.date === body.date &&
        booking.status !== 'cancelled' &&
        periodsOverlap(body.startTime, endTime, booking.startTime, booking.endTime),
    );

    if (duplicate) return null;

    const hourlyPrice =
      court.pricePerHour ??
      (service === 'pickleball'
        ? settings.pickleballPricePerHour
        : settings.tennisPricePerHour);
    const price = Number(((hourlyPrice * durationMinutes) / 60).toFixed(2));
    const now = new Date().toISOString();
    const booking: Booking = {
      id: randomUUID(),
      reference: `CS-${Date.now().toString().slice(-6)}`,
      service,
      courtId: court.id,
      courtName: court.name,
      date: String(body.date),
      startTime: String(body.startTime),
      durationMinutes,
      endTime,
      price,
      selectedSlotIds: expectedSlotIds,
      blockCount,
      customerName: String(body.customerName).trim(),
      phone: String(body.phone).trim(),
      email: String(body.email).trim(),
      notes: String(body.notes || '').trim(),
      status: 'pending',
      paymentStatus: 'unpaid',
      paidAmount: 0,
      createdAt: now,
      updatedAt: now,
    };

    bookings.push(booking);
    await store.saveBookings(bookings);
    return booking;
  });

  if (!result) {
    return NextResponse.json(
      { error: 'That court and time were just booked. Please select another available time.' },
      { status: 409 },
    );
  }

  notifyNewBooking(result).catch(console.error);
  return NextResponse.json({ booking: result }, { status: 201 });
}
