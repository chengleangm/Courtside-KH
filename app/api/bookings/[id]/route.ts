import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import { getZonedNow, minutesToTime, periodsOverlap, timeToMinutes } from '@/lib/time';
import type { BookingStatus, PaymentMethod, PaymentStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';
const allowedStatuses: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];
const allowedPaymentStatuses: PaymentStatus[] = ['unpaid', 'partial', 'paid'];
const allowedPaymentMethods: PaymentMethod[] = ['cash', 'aba', 'card', 'other'];

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = (await store.getBookings()).find((item) => item.id === id);
  return booking ? NextResponse.json({ booking }) : NextResponse.json({ error: 'Booking not found' }, { status: 404 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  if (body.status !== undefined && !allowedStatuses.includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  if (body.paymentStatus !== undefined && !allowedPaymentStatuses.includes(body.paymentStatus)) return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
  if (body.paymentMethod !== undefined && !allowedPaymentMethods.includes(body.paymentMethod)) return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });

  const result = await store.withBookingLock(async () => {
    const [bookings, settings, blockedPeriods] = await Promise.all([store.getBookings(), store.getSettings(), store.getBlockedPeriods()]);
    const index = bookings.findIndex((item) => item.id === id);
    if (index === -1) return { error: 'Booking not found', status: 404 } as const;
    const current = bookings[index];
    const hasScheduleEdit = ['courtId', 'date', 'startTime', 'durationMinutes'].some((key) => body[key] !== undefined);

    const applyAdminFields = (booking: typeof current) => {
      const paidAmount = body.paidAmount !== undefined ? Number(body.paidAmount) : booking.paidAmount;
      if (paidAmount !== undefined && (!Number.isFinite(paidAmount) || paidAmount < 0 || paidAmount > booking.price)) return null;
      return {
        ...booking,
        status: body.status ?? booking.status,
        customerName: body.customerName !== undefined ? String(body.customerName).trim() : booking.customerName,
        phone: body.phone !== undefined ? String(body.phone).trim() : booking.phone,
        email: body.email !== undefined ? String(body.email).trim() : booking.email,
        notes: body.notes !== undefined ? String(body.notes).trim() : booking.notes,
        staffNote: body.staffNote !== undefined ? String(body.staffNote).trim() : booking.staffNote,
        checkedInAt: body.checkedInAt !== undefined ? (body.checkedInAt ? String(body.checkedInAt) : undefined) : booking.checkedInAt,
        checkedOutAt: body.checkedOutAt !== undefined ? (body.checkedOutAt ? String(body.checkedOutAt) : undefined) : booking.checkedOutAt,
        paymentStatus: body.paymentStatus ?? booking.paymentStatus ?? 'unpaid',
        paymentMethod: body.paymentMethod ?? booking.paymentMethod,
        paidAmount: paidAmount ?? booking.paidAmount ?? 0,
        updatedAt: new Date().toISOString(),
      };
    };

    if (!hasScheduleEdit) {
      const updated = applyAdminFields(current);
      if (!updated) return { error: 'Invalid paid amount.', status: 400 } as const;
      if (!updated.customerName || !updated.phone || !updated.email) return { error: 'Customer name, phone and email are required.', status: 400 } as const;
      bookings[index] = updated;
      await store.saveBookings(bookings);
      return { booking: bookings[index] } as const;
    }

    const courtId = String(body.courtId ?? current.courtId);
    const date = String(body.date ?? current.date);
    const startTime = String(body.startTime ?? current.startTime);
    const durationMinutes = Number(body.durationMinutes ?? current.durationMinutes);
    const court = settings.courts.find((item) => item.id === courtId && item.active);
    if (!court || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !settings.allowedDurations.includes(durationMinutes)) return { error: 'Invalid court, date or booking duration.', status: 400 } as const;

    const openingTime = court.openingTime || settings.openingTime;
    const closingTime = court.closingTime || settings.closingTime;
    const startMinutes = timeToMinutes(startTime);
    const openingMinutes = timeToMinutes(openingTime);
    const closingMinutes = timeToMinutes(closingTime);
    const endMinutes = startMinutes + durationMinutes;
    const endTime = minutesToTime(endMinutes);
    const now = getZonedNow();
    if (!Number.isFinite(startMinutes) || date < now.date || (date === now.date && startMinutes < now.minutes) || durationMinutes <= 0 || durationMinutes % settings.slotMinutes !== 0 || startMinutes < openingMinutes || endMinutes > closingMinutes || (startMinutes - openingMinutes) % settings.slotMinutes !== 0) return { error: 'The selected time is outside operating hours or is in the past.', status: 400 } as const;

    const blocked = blockedPeriods.some((period) => period.courtId === court.id && period.date === date && periodsOverlap(startTime, endTime, period.startTime, period.endTime));
    if (blocked) return { error: 'That court is blocked during the selected time.', status: 409 } as const;
    const duplicate = bookings.some((booking) => booking.id !== id && booking.courtId === court.id && booking.date === date && booking.status !== 'cancelled' && periodsOverlap(startTime, endTime, booking.startTime, booking.endTime));
    if (duplicate) return { error: 'Another booking already uses that court and time.', status: 409 } as const;

    const blockCount = durationMinutes / settings.slotMinutes;
    const selectedSlotIds = Array.from({ length: blockCount }, (_, slotIndex) => `${court.id}-${minutesToTime(startMinutes + slotIndex * settings.slotMinutes)}`);
    const hourlyPrice = court.pricePerHour ?? (court.service === 'pickleball' ? settings.pickleballPricePerHour : settings.tennisPricePerHour);
    const price = Number(((hourlyPrice * durationMinutes) / 60).toFixed(2));
    const scheduled = { ...current, service: court.service, courtId: court.id, courtName: court.name, date, startTime, endTime, durationMinutes, blockCount, selectedSlotIds, price };
    const updated = applyAdminFields(scheduled);
    if (!updated) return { error: 'Invalid paid amount.', status: 400 } as const;
    if (!updated.customerName || !updated.phone || !updated.email) return { error: 'Customer name, phone and email are required.', status: 400 } as const;
    bookings[index] = updated;
    await store.saveBookings(bookings);
    return { booking: bookings[index] } as const;
  });

  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ booking: result.booking });
}
