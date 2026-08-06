'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminPageShell from '@/components/AdminPageShell';
import { CheckIcon, CreditCardIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';
import type { Booking, Court, PaymentMethod, PaymentStatus } from '@/lib/types';

export default function BookingDetail({ initialBooking, court }: { initialBooking: Booking; court?: Court }) {
  const { isKhmer, locale } = useLanguage();
  const [booking, setBooking] = useState(initialBooking);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function patch(payload: Record<string, unknown>) {
    setBusy(true);
    setMessage(isKhmer ? 'កំពុងរក្សាទុក…' : 'Saving…');
    const response = await fetch(`/api/bookings/${booking.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const body = await response.json().catch(() => ({}));
    setBusy(false);
    if (!response.ok) { setMessage(body.error || 'Unable to update booking.'); return; }
    setBooking(body.booking);
    setMessage(isKhmer ? 'បានធ្វើបច្ចុប្បន្នភាព។' : 'Booking updated.');
  }

  const remaining = Math.max(booking.price - (booking.paidAmount ?? 0), 0);
  return <AdminPageShell title={booking.reference} titleKhmer={booking.reference} eyebrow="Booking details" eyebrowKhmer="ព័ត៌មានការកក់" actions={<Link className="button button-secondary button-small" href="/admin/bookings">{isKhmer ? 'ត្រឡប់ទៅការកក់' : 'Back to bookings'}</Link>}>
    <section className="booking-detail-layout">
      <div className="booking-detail-main">
        <section className="admin-panel booking-detail-hero-card">
          <div><span className={`admin-status-pill status-${booking.status}`}>{booking.status}</span><h2>{booking.customerName}</h2><p>{booking.phone} · {booking.email}</p></div>
          <div className="booking-detail-time"><span>{new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(new Date(`${booking.date}T00:00:00`))}</span><strong>{booking.startTime}–{booking.endTime}</strong><small>{booking.durationMinutes} minutes · {booking.blockCount ?? 1} block(s)</small></div>
        </section>
        <section className="admin-panel booking-detail-court-card">
          {court?.image && <img src={court.image} alt={court.name}/>}<div><span className="eyebrow">{booking.service}</span><h2>{booking.courtName}</h2><p>{court?.description || (isKhmer ? 'ការកក់ទីលានអតិថិជន។' : 'Customer court reservation.')}</p><div className="court-preview-facts"><span>{court?.environment || '—'}</span><span>{court?.surface || '—'}</span><span>{court?.lighting ? 'Lighting' : 'No lighting'}</span><span>{court?.capacity || 4} players</span></div></div>
        </section>
        <section className="admin-panel"><div className="admin-section-title"><div><span className="eyebrow">{isKhmer ? 'កំណត់ចំណាំ' : 'Notes'}</span><h2>{isKhmer ? 'ព័ត៌មានពីអតិថិជន' : 'Customer and staff notes'}</h2></div></div><dl className="booking-note-list"><div><dt>{isKhmer ? 'អតិថិជន' : 'Customer note'}</dt><dd>{booking.notes || '—'}</dd></div><div><dt>{isKhmer ? 'ក្រុមការងារ' : 'Staff note'}</dt><dd>{booking.staffNote || '—'}</dd></div></dl></section>
      </div>
      <aside className="booking-detail-sidebar">
        <section className="admin-panel booking-payment-panel"><span className="eyebrow">{isKhmer ? 'ការបង់ប្រាក់' : 'Payment'}</span><h2>${booking.price.toFixed(2)}</h2><dl><div><dt>{isKhmer ? 'បានបង់' : 'Paid'}</dt><dd>${(booking.paidAmount ?? 0).toFixed(2)}</dd></div><div><dt>{isKhmer ? 'នៅសល់' : 'Remaining'}</dt><dd>${remaining.toFixed(2)}</dd></div><div><dt>{isKhmer ? 'វិធី' : 'Method'}</dt><dd>{booking.paymentMethod || '—'}</dd></div></dl><div className="booking-payment-controls"><select id="booking-detail-method" defaultValue={booking.paymentMethod || 'cash'}>{(['cash','aba','card','other'] as PaymentMethod[]).map((method) => <option key={method} value={method}>{method.toUpperCase()}</option>)}</select><input id="booking-detail-amount" type="number" min="0" step="0.5" defaultValue={remaining}/><button className="button button-full" disabled={busy} type="button" onClick={() => { const method = (document.getElementById('booking-detail-method') as HTMLSelectElement).value as PaymentMethod; const amount = Number((document.getElementById('booking-detail-amount') as HTMLInputElement).value || 0); const paidAmount = Math.min(booking.price, (booking.paidAmount ?? 0) + amount); const paymentStatus: PaymentStatus = paidAmount >= booking.price ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid'; patch({ paymentMethod: method, paidAmount, paymentStatus }); }}><CreditCardIcon size={17}/>{isKhmer ? 'កត់ត្រាការបង់ប្រាក់' : 'Record payment'}</button></div></section>
        <section className="admin-panel booking-operation-panel"><span className="eyebrow">{isKhmer ? 'ប្រតិបត្តិការ' : 'Operations'}</span>{!booking.checkedInAt ? <button className="button button-full" disabled={busy} onClick={() => patch({ checkedInAt: new Date().toISOString(), status: 'confirmed' })}><CheckIcon size={17}/>{isKhmer ? 'Check-in អតិថិជន' : 'Check in customer'}</button> : !booking.checkedOutAt ? <button className="button button-secondary button-full" disabled={busy} onClick={() => patch({ checkedOutAt: new Date().toISOString(), status: 'completed' })}>{isKhmer ? 'បញ្ចប់ និង Check-out' : 'Complete & check out'}</button> : <p className="pos-complete"><CheckIcon size={16}/>{isKhmer ? 'បានបញ្ចប់' : 'Completed'}</p>}<select value={booking.status} onChange={(event) => patch({ status: event.target.value })}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select><Link className="button button-secondary button-full" href={`/admin/bookings?booking=${booking.id}`}>{isKhmer ? 'កែប្រែព័ត៌មាន' : 'Edit booking data'}</Link></section>
        {message && <p className="form-status" role="status">{message}</p>}
      </aside>
    </section>
  </AdminPageShell>;
}
