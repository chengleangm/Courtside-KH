'use client';

import { useMemo, useState } from 'react';
import AdminPageShell from '@/components/AdminPageShell';
import { CheckIcon, CreditCardIcon, SearchIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';
import type { Booking, PaymentMethod, PaymentStatus } from '@/lib/types';

function dateKey(value: Date) { return `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`; }

export default function CheckInPOS({ initialBookings }: { initialBookings: Booking[] }) {
  const { isKhmer } = useLanguage();
  const [bookings, setBookings] = useState(initialBookings);
  const [query, setQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [busy, setBusy] = useState<string | null>(null);

  const visible = useMemo(() => bookings.filter((booking) => booking.date === selectedDate && booking.status !== 'cancelled' && `${booking.reference} ${booking.customerName} ${booking.phone} ${booking.courtName}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>a.startTime.localeCompare(b.startTime)), [bookings, query, selectedDate]);

  async function patch(booking: Booking, payload: Record<string, unknown>) {
    setBusy(booking.id);
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Unable to update booking.');
      setBookings((items) => items.map((item) => item.id === booking.id ? body.booking : item));
    } catch (error) { alert(error instanceof Error ? error.message : 'Unable to update booking.'); }
    finally { setBusy(null); }
  }

  return <AdminPageShell title="Check-in & venue POS" titleKhmer="ចុះឈ្មោះចូល និង POS នៅទីតាំង">
    <section className="pos-toolbar admin-panel">
      <label><span>{isKhmer?'ថ្ងៃ':'Date'}</span><input type="date" value={selectedDate} onChange={(e)=>setSelectedDate(e.target.value)}/></label>
      <label className="admin-search admin-search-clean"><SearchIcon size={17}/><span className="sr-only">Search check-in bookings</span><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={isKhmer?'ស្វែងរកអតិថិជន ឬលេខយោង':'Search customer, phone or reference'}/></label>
    </section>

    <section className="pos-summary-grid">
      <article><span>{isKhmer?'ការមកដល់':'Arrivals'}</span><strong>{visible.length}</strong></article>
      <article><span>{isKhmer?'បាន Check-in':'Checked in'}</span><strong>{visible.filter((item)=>item.checkedInAt).length}</strong></article>
      <article><span>{isKhmer?'បានបង់ប្រាក់':'Paid'}</span><strong>{visible.filter((item)=>item.paymentStatus==='paid').length}</strong></article>
      <article><span>{isKhmer?'ប្រាក់ថ្ងៃនេះ':'Daily total'}</span><strong>${visible.reduce((sum,item)=>sum+(item.paidAmount??0),0).toFixed(2)}</strong></article>
    </section>

    <section className="pos-booking-grid">
      {visible.length===0?<div className="admin-panel empty-state">{isKhmer?'មិនមានការកក់សម្រាប់ថ្ងៃនេះទេ។':'No bookings for this date.'}</div>:visible.map((booking)=>{
        const paidAmount=booking.paidAmount??0;
        const remaining=Math.max(booking.price-paidAmount,0);
        return <article className={`pos-card ${booking.checkedInAt?'checked-in':''}`} key={booking.id}>
          <header><div><span className="eyebrow">{booking.reference}</span><h2>{booking.customerName}</h2><p>{booking.phone}</p></div><div className="pos-time"><strong>{booking.startTime}</strong><span>{booking.endTime}</span></div></header>
          <div className="pos-booking-details"><div><span>{isKhmer?'ទីលាន':'Court'}</span><strong>{booking.courtName}</strong></div><div><span>{isKhmer?'តម្លៃ':'Total'}</span><strong>${booking.price.toFixed(2)}</strong></div><div><span>{isKhmer?'នៅសល់':'Remaining'}</span><strong>${remaining.toFixed(2)}</strong></div><div><span>{isKhmer?'ស្ថានភាព':'Status'}</span><strong>{booking.checkedInAt?(isKhmer?'បានមកដល់':'Arrived'):(isKhmer?'មិនទាន់មក':'Expected')}</strong></div></div>

          <div className="pos-payment-row">
            <label>{isKhmer?'វិធីបង់':'Method'}<select id={`method-${booking.id}`} defaultValue={booking.paymentMethod??'cash'}>{(['cash','aba','card','other'] as PaymentMethod[]).map((method)=><option value={method} key={method}>{method.toUpperCase()}</option>)}</select></label>
            <label>{isKhmer?'ចំនួនទឹកប្រាក់':'Amount'}<input id={`amount-${booking.id}`} type="number" min="0" step="0.5" defaultValue={remaining||booking.price}/></label>
          </div>

          <footer>
            {!booking.checkedInAt?<button disabled={busy===booking.id} className="button" type="button" onClick={()=>patch(booking,{checkedInAt:new Date().toISOString(),status:'confirmed'})}><CheckIcon size={17}/>{isKhmer?'Check-in អតិថិជន':'Check in customer'}</button>:!booking.checkedOutAt?<button disabled={busy===booking.id} className="button button-secondary" type="button" onClick={()=>patch(booking,{checkedOutAt:new Date().toISOString(),status:'completed'})}>{isKhmer?'បញ្ចប់ និង Check-out':'Complete & check out'}</button>:<span className="pos-complete"><CheckIcon size={16}/>{isKhmer?'បានបញ្ចប់':'Completed'}</span>}
            <button disabled={busy===booking.id} className="button button-dark" type="button" onClick={()=>{
              const method=(document.getElementById(`method-${booking.id}`) as HTMLSelectElement).value as PaymentMethod;
              const amount=Number((document.getElementById(`amount-${booking.id}`) as HTMLInputElement).value||0);
              const nextPaid=Math.min(booking.price,paidAmount+amount);
              const paymentStatus:PaymentStatus=nextPaid>=booking.price?'paid':nextPaid>0?'partial':'unpaid';
              patch(booking,{paymentMethod:method,paidAmount:nextPaid,paymentStatus});
            }}><CreditCardIcon size={17}/>{isKhmer?'កត់ត្រាការបង់ប្រាក់':'Record payment'}</button>
          </footer>
        </article>;
      })}
    </section>
  </AdminPageShell>;
}
