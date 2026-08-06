'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmationContent from '@/components/ConfirmationContent';
import type { Booking } from '@/lib/types';

export default function ConfirmationPageClient({
  bookingId,
  initialBooking,
}: {
  bookingId: string;
  initialBooking: Booking | null;
}) {
  const [booking, setBooking] = useState<Booking | null>(initialBooking);
  const [checkedStorage, setCheckedStorage] = useState(Boolean(initialBooking));

  useEffect(() => {
    if (booking) return;

    const timer = window.setTimeout(() => {
      try {
        const saved = window.sessionStorage.getItem(`courtside-booking-${bookingId}`);
        if (saved) setBooking(JSON.parse(saved) as Booking);
      } catch {
        // Show the recovery state below when browser storage is unavailable.
      } finally {
        setCheckedStorage(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [booking, bookingId]);

  if (!checkedStorage) {
    return <div className="confirmation-card"><p>Loading booking confirmation…</p></div>;
  }

  if (!booking) {
    return (
      <div className="confirmation-card">
        <span className="eyebrow">Booking confirmation</span>
        <h1>We could not reload this ticket.</h1>
        <p>The booking data is no longer available in this browser session. Please contact reception or make a new booking.</p>
        <div className="confirmation-actions">
          <Link className="button button-secondary" href="/">Back home</Link>
          <Link className="button" href="/book">Book a court</Link>
        </div>
      </div>
    );
  }

  return <ConfirmationContent booking={booking} />;
}
