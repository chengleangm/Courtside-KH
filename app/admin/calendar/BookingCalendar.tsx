'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminPageShell from '@/components/AdminPageShell';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';
import type { BlockedPeriod, Booking, Settings } from '@/lib/types';

function key(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function parse(value: string) { const [y,m,d]=value.split('-').map(Number); return new Date(y,m-1,d); }

export default function BookingCalendar({ bookings, blocks, settings }: { bookings: Booking[]; blocks: BlockedPeriod[]; settings: Settings }) {
  const { isKhmer, locale } = useLanguage();
  const firstDate = bookings.find((booking) => booking.status !== 'cancelled')?.date ?? key(new Date());
  const [selectedDate, setSelectedDate] = useState(firstDate);
  const [month, setMonth] = useState(() => { const d = parse(firstDate); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [blockItems, setBlockItems] = useState(blocks);
  const firstCourt = settings.courts.find((court) => court.active) ?? settings.courts[0];
  const [blockCourtId, setBlockCourtId] = useState(firstCourt?.id ?? '');
  const [blockStart, setBlockStart] = useState(firstCourt?.openingTime ?? settings.openingTime);
  const [blockEnd, setBlockEnd] = useState(firstCourt?.closingTime ?? settings.closingTime);
  const [blockReason, setBlockReason] = useState('Maintenance');
  const [blockMessage, setBlockMessage] = useState('');
  const [savingBlock, setSavingBlock] = useState(false);

  const days = useMemo(() => {
    const y=month.getFullYear(),m=month.getMonth();
    const first=new Date(y,m,1);
    const start=new Date(y,m,1-first.getDay());
    return Array.from({length:42},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return {date:d,key:key(d),outside:d.getMonth()!==m};});
  }, [month]);
  const counts = useMemo(() => { const map=new Map<string,number>(); bookings.filter((booking)=>booking.status!=='cancelled').forEach((booking)=>map.set(booking.date,(map.get(booking.date)??0)+1)); return map; }, [bookings]);
  const blockCounts = useMemo(() => { const map=new Map<string,number>(); blockItems.forEach((block)=>map.set(block.date,(map.get(block.date)??0)+1)); return map; }, [blockItems]);
  const selectedBookings = bookings.filter((booking)=>booking.date===selectedDate).sort((a,b)=>a.startTime.localeCompare(b.startTime));
  const selectedBlocks = blockItems.filter((block)=>block.date===selectedDate).sort((a,b)=>a.startTime.localeCompare(b.startTime));
  const today=key(new Date());

  function selectDay(dayKey: string) {
    setSelectedDate(dayKey);
    setBlockMessage('');
  }

  async function createBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingBlock(true);
    setBlockMessage(isKhmer ? 'កំពុងរក្សាទុក…' : 'Saving…');
    try {
      const response = await fetch('/api/blocked-periods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courtId: blockCourtId, date: selectedDate, startTime: blockStart, endTime: blockEnd, reason: blockReason }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Unable to block court time.');
      setBlockItems((items) => [...items, body.block]);
      setBlockMessage(isKhmer ? 'បានបិទម៉ោងក្នុងប្រតិទិន។' : 'Court time blocked on the calendar.');
    } catch (error) {
      setBlockMessage(error instanceof Error ? error.message : 'Unable to block court time.');
    } finally {
      setSavingBlock(false);
    }
  }

  async function deleteBlock(id: string) {
    if (!confirm(isKhmer ? 'លុបម៉ោងបិទនេះ?' : 'Delete this blocked period?')) return;
    const response = await fetch(`/api/blocked-periods/${id}`, { method: 'DELETE' });
    if (response.ok) setBlockItems((items) => items.filter((item) => item.id !== id));
  }

  return <AdminPageShell title="Booking calendar" titleKhmer="ប្រតិទិនការកក់" actions={<Link className="button button-small button-secondary" href="/admin/blocks">{isKhmer ? 'គ្រប់គ្រងម៉ោងបិទទាំងអស់' : 'Manage all blocked times'}</Link>}>
    <section className="admin-calendar-layout admin-calendar-layout-modern">
      <section className="admin-panel admin-calendar-panel">
        <div className="admin-calendar-toolbar"><button type="button" aria-label="Previous month" onClick={()=>setMonth((d)=>new Date(d.getFullYear(),d.getMonth()-1,1))}><ChevronLeftIcon/></button><strong>{new Intl.DateTimeFormat(locale,{month:'long',year:'numeric'}).format(month)}</strong><button type="button" aria-label="Next month" onClick={()=>setMonth((d)=>new Date(d.getFullYear(),d.getMonth()+1,1))}><ChevronRightIcon/></button></div>
        <div className="admin-calendar-weekdays">{(isKhmer?['អា','ច','អ','ពុ','ព្រ','សុ','ស']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat']).map((day)=><span key={day}>{day}</span>)}</div>
        <div className="admin-calendar-grid">{days.map((day)=>{const bookingCount=counts.get(day.key)??0;const blocked=blockCounts.get(day.key)??0;return <button key={day.key} type="button" className={['admin-calendar-day',day.outside?'outside':'',day.key===selectedDate?'selected':'',day.key===today?'today':''].filter(Boolean).join(' ')} onClick={()=>selectDay(day.key)}><span>{day.date.getDate()}</span><div className="calendar-day-badges">{bookingCount>0&&<strong>{bookingCount}</strong>}{blocked>0&&<em>{blocked}</em>}</div></button>;})}</div>
        <div className="calendar-legend"><span><i className="legend-booking"/>{isKhmer?'ការកក់':'Bookings'}</span><span><i className="legend-block"/>{isKhmer?'បិទម៉ោង':'Blocked'}</span></div>
      </section>

      <section className="admin-panel selected-day-panel">
        <div className="selected-day-heading"><div><span className="eyebrow">{isKhmer?'ថ្ងៃដែលបានជ្រើស':'Selected day'}</span><h2>{new Intl.DateTimeFormat(locale,{dateStyle:'full'}).format(parse(selectedDate))}</h2></div><span className="calendar-booking-count">{selectedBookings.length}</span></div>
        <h3 className="day-section-heading">{isKhmer?'ការកក់':'Bookings'}</h3>
        {selectedBookings.length===0?<div className="empty-state">{isKhmer?'មិនមានការកក់ទេ។':'No bookings for this day.'}</div>:<div className="day-booking-list">{selectedBookings.map((booking)=><article key={booking.id}><div className="day-booking-time"><strong>{booking.startTime}</strong><span>{booking.endTime}</span></div><div><strong>{booking.courtName}</strong><span>{booking.customerName} · {booking.phone}</span><small>{booking.status} · ${booking.price.toFixed(2)}</small></div><Link className="icon-text-button" href={`/admin/bookings/${booking.id}`}>{isKhmer ? 'មើល' : 'View'}</Link></article>)}</div>}

        <div className="calendar-block-heading"><div><h3 className="day-section-heading">{isKhmer?'ម៉ោងបានបិទ':'Blocked periods'}</h3><p>{isKhmer?'បិទទីលានពីម៉ោងមួយទៅម៉ោងមួយដោយផ្ទាល់ពីថ្ងៃនេះ។':'Block a court from one time to another directly on this date.'}</p></div><PlusIcon size={20}/></div>
        <form className="calendar-quick-block" onSubmit={createBlock}>
          <label className="calendar-block-court">{isKhmer?'ទីលាន':'Court'}<select value={blockCourtId} onChange={(event)=>{const id=event.target.value;setBlockCourtId(id);const court=settings.courts.find((item)=>item.id===id);setBlockStart(court?.openingTime??settings.openingTime);setBlockEnd(court?.closingTime??settings.closingTime);}}>{settings.courts.map((court)=><option key={court.id} value={court.id}>{court.name}{court.active?'':' (inactive)'}</option>)}</select></label>
          <label>{isKhmer?'ចាប់ពី':'From'}<input type="time" step={settings.slotMinutes*60} value={blockStart} onChange={(event)=>setBlockStart(event.target.value)} required/></label>
          <label>{isKhmer?'ដល់':'To'}<input type="time" step={settings.slotMinutes*60} value={blockEnd} onChange={(event)=>setBlockEnd(event.target.value)} required/></label>
          <label className="calendar-block-reason">{isKhmer?'មូលហេតុ':'Reason'}<input value={blockReason} onChange={(event)=>setBlockReason(event.target.value)} placeholder="Maintenance" required/></label>
          <button className="button button-small calendar-block-submit" disabled={savingBlock || !blockCourtId}>{savingBlock ? (isKhmer?'កំពុងរក្សាទុក…':'Saving…') : (isKhmer?'បិទម៉ោង':'Block time')}</button>
        </form>
        {blockMessage && <p className="form-status" role="status">{blockMessage}</p>}
        {selectedBlocks.length===0?<p className="muted-copy">{isKhmer?'មិនមានម៉ោងបិទទេ។':'No court blocks for this day.'}</p>:<div className="blocked-day-list">{selectedBlocks.map((block)=>{const court=settings.courts.find((item)=>item.id===block.courtId);return <article key={block.id}><div><strong>{block.startTime}–{block.endTime}</strong><span>{court?.name ?? block.courtId}</span><small>{block.reason}</small></div><button type="button" className="icon-only-button danger" onClick={()=>deleteBlock(block.id)} aria-label="Delete blocked time"><TrashIcon size={16}/></button></article>;})}</div>}
      </section>
    </section>
  </AdminPageShell>;
}
