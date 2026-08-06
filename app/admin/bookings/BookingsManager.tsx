'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AdminPageShell from '@/components/AdminPageShell';
import { EditIcon, PlusIcon, SearchIcon, XIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';
import type { Booking, BookingStatus, PaymentMethod, PaymentStatus, Settings } from '@/lib/types';

function formatDuration(minutes: number, km: boolean) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (km) return `${h ? `${h} ម៉ោង` : ''}${h && m ? ' ' : ''}${m ? `${m} នាទី` : ''}`;
  if (!h) return `${m} min`;
  if (!m) return `${h} ${h === 1 ? 'hour' : 'hours'}`;
  return `${h}h ${m}m`;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number) {
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
}

function tomorrowKey() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function BookingsManager({ initialBookings, settings }: { initialBookings: Booking[]; settings: Settings }) {
  const { isKhmer, locale } = useLanguage();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState(initialBookings);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');
  const [editing, setEditing] = useState<Booking | null>(() => {
    const bookingId = searchParams.get('booking');
    return initialBookings.find((item) => item.id === bookingId) ?? null;
  });
  const [creating, setCreating] = useState(() => searchParams.get('new') === '1');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const activeCourts = settings.courts.filter((court) => court.active);
  const defaultCourt = activeCourts[0];

  const text = isKhmer ? {
    title: 'គ្រប់គ្រងការកក់', search: 'ស្វែងរកឈ្មោះ លេខទូរស័ព្ទ ឬលេខយោង', all: 'ស្ថានភាពទាំងអស់', no: 'រកមិនឃើញការកក់។', edit: 'កែសម្រួល', save: 'រក្សាទុក', cancel: 'បោះបង់', customer: 'អតិថិជន', booking: 'ការកក់', schedule: 'កាលវិភាគ', payment: 'ការបង់ប្រាក់', status: 'ស្ថានភាព', actions: 'សកម្មភាព', create: 'បង្កើតការកក់', createTitle: 'បង្កើតការកក់ដោយបុគ្គលិក'
  } : {
    title: 'Booking management', search: 'Search name, phone or reference', all: 'All statuses', no: 'No bookings found.', edit: 'Edit booking', save: 'Save changes', cancel: 'Cancel', customer: 'Customer', booking: 'Booking', schedule: 'Schedule', payment: 'Payment', status: 'Status', actions: 'Actions', create: 'New booking', createTitle: 'Create staff booking'
  };

  const visible = useMemo(() => bookings.filter((item) => {
    const match = `${item.reference} ${item.customerName} ${item.phone} ${item.email} ${item.courtName}`.toLowerCase().includes(query.toLowerCase());
    return match && (filter === 'all' || item.status === filter);
  }), [bookings, query, filter]);

  async function patch(id: string, payload: Record<string, unknown>) {
    const response = await fetch(`/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Unable to update booking.');
    setBookings((items) => items.map((item) => item.id === id ? body.booking : item));
    return body.booking as Booking;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await patch(editing.id, {
        ...data,
        durationMinutes: Number(data.durationMinutes),
        paidAmount: Number(data.paidAmount || 0),
      });
      setEditing(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update booking.');
    } finally {
      setSaving(false);
    }
  }

  async function createBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const court = settings.courts.find((item) => item.id === String(data.courtId));
    if (!court) {
      setError('Please select an active court.');
      setSaving(false);
      return;
    }

    const durationMinutes = Number(data.durationMinutes);
    const startTime = String(data.startTime);
    const startMinutes = timeToMinutes(startTime);
    const blockCount = durationMinutes / settings.slotMinutes;
    const endTime = minutesToTime(startMinutes + durationMinutes);
    const selectedSlotIds = Array.from({ length: blockCount }, (_, index) => `${court.id}-${minutesToTime(startMinutes + index * settings.slotMinutes)}`);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: court.service,
          courtId: court.id,
          date: String(data.date),
          startTime,
          endTime,
          durationMinutes,
          blockCount,
          selectedSlotIds,
          customerName: String(data.customerName),
          phone: String(data.phone),
          email: String(data.email),
          notes: String(data.notes || ''),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Unable to create booking.');
      setBookings((items) => [body.booking, ...items]);
      setCreating(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create booking.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminPageShell
      title={text.title}
      titleKhmer="គ្រប់គ្រងការកក់"
      actions={<button type="button" className="button button-small" onClick={() => { setCreating(true); setError(''); }}><PlusIcon size={16}/>{text.create}</button>}
    >
      <section className="admin-panel">
        <div className="admin-tools modern-admin-tools">
          <label className="admin-search admin-search-clean"><SearchIcon size={17}/><span className="sr-only">Search bookings</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={text.search}/></label>
          <select value={filter} onChange={(e) => setFilter(e.target.value as BookingStatus | 'all')}>
            <option value="all">{text.all}</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="table-wrap"><table className="admin-bookings-table"><thead><tr><th>{text.customer}</th><th>{text.booking}</th><th>{text.schedule}</th><th>{text.payment}</th><th>{text.status}</th><th>{text.actions}</th></tr></thead><tbody>
          {visible.length === 0 ? <tr><td colSpan={6} className="empty-cell">{text.no}</td></tr> : visible.map((booking) => <tr key={booking.id}>
            <td><strong>{booking.customerName}</strong><span>{booking.reference}</span><small>{booking.phone}</small></td>
            <td><strong>{booking.courtName}</strong><span>{formatDuration(booking.durationMinutes, isKhmer)}</span><small>{booking.blockCount ?? 1} {isKhmer ? 'ប្លុក' : 'block(s)'}</small></td>
            <td><strong>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(`${booking.date}T00:00:00`))}</strong><span>{booking.startTime}–{booking.endTime}</span></td>
            <td><strong>${(booking.paidAmount ?? 0).toFixed(2)} / ${booking.price.toFixed(2)}</strong><span>{booking.paymentStatus ?? 'unpaid'} · {booking.paymentMethod ?? '—'}</span></td>
            <td><select className={`status-select status-${booking.status}`} value={booking.status} onChange={(e) => patch(booking.id, { status: e.target.value }).catch((cause) => alert(cause.message))}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></td>
            <td><div className="booking-row-actions"><Link className="icon-text-button" href={`/admin/bookings/${booking.id}`}>{isKhmer ? 'មើល' : 'View'}</Link><button className="icon-text-button" type="button" onClick={() => { setEditing(booking); setError(''); }}><EditIcon size={15}/>{text.edit}</button></div></td>
          </tr>)}
        </tbody></table></div>
      </section>

      {creating && <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreating(false); }}><div className="admin-modal admin-modal-wide" role="dialog" aria-modal="true"><div className="admin-modal-header"><div><span className="eyebrow">{isKhmer ? 'ការកក់ពី Reception' : 'Reception booking'}</span><h2>{text.createTitle}</h2></div><button className="icon-only-button" type="button" onClick={() => setCreating(false)}><XIcon/></button></div>
        <form onSubmit={createBooking}><div className="form-grid two">
          <label>Full name<input name="customerName" defaultValue={searchParams.get('name') || ''} required/></label><label>Phone<input name="phone" defaultValue={searchParams.get('phone') || ''} required/></label><label>Email<input name="email" type="email" defaultValue={searchParams.get('email') || ''} required/></label>
          <label>Court<select name="courtId" defaultValue={defaultCourt?.id}>{activeCourts.map((court) => <option value={court.id} key={court.id}>{court.name} · {court.service}</option>)}</select></label>
          <label>Date<input name="date" type="date" defaultValue={tomorrowKey()} required/></label><label>Start time<input name="startTime" type="time" step={settings.slotMinutes * 60} defaultValue={defaultCourt?.openingTime ?? settings.openingTime} required/></label>
          <label>Duration<select name="durationMinutes" defaultValue={settings.allowedDurations[0]}>{settings.allowedDurations.map((duration) => <option key={duration} value={duration}>{formatDuration(duration, isKhmer)}</option>)}</select></label>
          <label className="form-span-two">Customer notes<textarea name="notes" rows={3}/></label>
        </div>{error && <p className="form-error">{error}</p>}<div className="admin-modal-actions"><button className="button button-secondary" type="button" onClick={() => setCreating(false)}>{text.cancel}</button><button className="button" disabled={saving || !defaultCourt}>{saving ? 'Saving…' : text.create}</button></div></form>
      </div></div>}

      {editing && <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}><div className="admin-modal admin-modal-wide" role="dialog" aria-modal="true"><div className="admin-modal-header"><div><span className="eyebrow">{editing.reference}</span><h2>{text.edit}</h2></div><button className="icon-only-button" type="button" onClick={() => setEditing(null)}><XIcon/></button></div>
        <form onSubmit={save}><div className="form-grid two">
          <label>Full name<input name="customerName" defaultValue={editing.customerName} required/></label><label>Phone<input name="phone" defaultValue={editing.phone} required/></label><label>Email<input name="email" type="email" defaultValue={editing.email} required/></label>
          <label>Court<select name="courtId" defaultValue={editing.courtId}>{activeCourts.map((court) => <option value={court.id} key={court.id}>{court.name}</option>)}</select></label>
          <label>Date<input name="date" type="date" defaultValue={editing.date} required/></label><label>Start time<input name="startTime" type="time" step={settings.slotMinutes * 60} defaultValue={editing.startTime} required/></label>
          <label>Duration<select name="durationMinutes" defaultValue={editing.durationMinutes}>{settings.allowedDurations.map((duration) => <option key={duration} value={duration}>{formatDuration(duration, isKhmer)}</option>)}</select></label>
          <label>Status<select name="status" defaultValue={editing.status}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>
          <label>Payment status<select name="paymentStatus" defaultValue={editing.paymentStatus ?? 'unpaid'}>{(['unpaid','partial','paid'] as PaymentStatus[]).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label>Payment method<select name="paymentMethod" defaultValue={editing.paymentMethod ?? 'cash'}>{(['cash','aba','card','other'] as PaymentMethod[]).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          <label>Paid amount<input name="paidAmount" type="number" min="0" step="0.5" defaultValue={editing.paidAmount ?? 0}/></label>
          <label className="form-span-two">Customer notes<textarea name="notes" rows={3} defaultValue={editing.notes}/></label><label className="form-span-two">Staff note<textarea name="staffNote" rows={3} defaultValue={editing.staffNote ?? ''}/></label>
        </div>{error && <p className="form-error">{error}</p>}<div className="admin-modal-actions"><button className="button button-secondary" type="button" onClick={() => setEditing(null)}>{text.cancel}</button><button className="button" disabled={saving}>{saving ? 'Saving…' : text.save}</button></div></form>
      </div></div>}
    </AdminPageShell>
  );
}
