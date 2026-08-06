'use client';

import { useMemo, useState } from 'react';
import AdminPageShell from '@/components/AdminPageShell';
import { useLanguage } from '@/components/LanguageProvider';
import type { Booking, Settings } from '@/lib/types';

function downloadCsv(bookings: Booking[]) {
  const headers = ['Reference','Customer','Phone','Email','Court','Date','Start','End','Duration minutes','Status','Payment status','Paid amount','Total'];
  const rows = bookings.map((item) => [item.reference,item.customerName,item.phone,item.email,item.courtName,item.date,item.startTime,item.endTime,item.durationMinutes,item.status,item.paymentStatus || 'unpaid',item.paidAmount || 0,item.price]);
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `courtside-bookings-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ReportsView({ bookings, settings }: { bookings: Booking[]; settings: Settings }) {
  const { isKhmer } = useLanguage();
  const [from, setFrom] = useState('2026-08-01');
  const [to, setTo] = useState('2026-08-31');
  const visible = useMemo(() => bookings.filter((item) => item.date >= from && item.date <= to), [bookings, from, to]);
  const active = visible.filter((item) => item.status !== 'cancelled');
  const revenue = active.reduce((sum, item) => sum + (item.paidAmount ?? 0), 0);
  const outstanding = active.reduce((sum, item) => sum + Math.max(item.price - (item.paidAmount ?? 0), 0), 0);
  const hours = active.reduce((sum, item) => sum + item.durationMinutes / 60, 0);
  const byCourt = settings.courts.map((court) => ({ court, count: active.filter((item) => item.courtId === court.id).length, revenue: active.filter((item) => item.courtId === court.id).reduce((sum, item) => sum + (item.paidAmount ?? 0), 0) })).sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...byCourt.map((item) => item.count), 1);

  return <AdminPageShell title="Reports" titleKhmer="របាយការណ៍" eyebrow="Performance" eyebrowKhmer="លទ្ធផលប្រតិបត្តិការ" actions={<button className="button button-small" type="button" onClick={() => downloadCsv(visible)}>{isKhmer ? 'ទាញយក CSV' : 'Export CSV'}</button>}>
    <section className="admin-panel report-filter-panel"><label>{isKhmer ? 'ចាប់ពីថ្ងៃ' : 'From'}<input type="date" value={from} onChange={(event) => setFrom(event.target.value)}/></label><label>{isKhmer ? 'ដល់ថ្ងៃ' : 'To'}<input type="date" value={to} onChange={(event) => setTo(event.target.value)}/></label><div><strong>{visible.length}</strong><span>{isKhmer ? 'កំណត់ត្រា' : 'records'}</span></div></section>
    <section className="admin-kpi-grid report-kpi-grid"><article><span>{isKhmer ? 'ការកក់សកម្ម' : 'Active bookings'}</span><strong>{active.length}</strong><small>{visible.filter((item) => item.status === 'cancelled').length} {isKhmer ? 'បានបោះបង់' : 'cancelled'}</small></article><article><span>{isKhmer ? 'ម៉ោងកក់' : 'Booked hours'}</span><strong>{hours.toFixed(1)}</strong><small>{isKhmer ? 'ម៉ោងសរុប' : 'total court hours'}</small></article><article><span>{isKhmer ? 'ប្រាក់ទទួល' : 'Collected'}</span><strong>${revenue.toFixed(2)}</strong><small>{isKhmer ? 'ការបង់បានកត់ត្រា' : 'recorded payments'}</small></article><article><span>{isKhmer ? 'នៅសល់' : 'Outstanding'}</span><strong>${outstanding.toFixed(2)}</strong><small>{isKhmer ? 'មិនទាន់ប្រមូល' : 'remaining to collect'}</small></article></section>
    <section className="admin-overview-grid">
      <article className="admin-panel"><div className="admin-section-title"><div><span className="eyebrow">{isKhmer ? 'ទីលាន' : 'Courts'}</span><h2>{isKhmer ? 'ការប្រើប្រាស់ទីលាន' : 'Court utilisation'}</h2></div></div><div className="court-utilisation-list">{byCourt.map(({ court, count, revenue: courtRevenue }) => <div key={court.id}><div><strong>{court.name}</strong><span>{count} {isKhmer ? 'ការកក់' : 'bookings'} · ${courtRevenue.toFixed(2)}</span></div><div className="utilisation-track"><span style={{ width: `${Math.round((count / maxCount) * 100)}%` }}/></div></div>)}</div></article>
      <article className="admin-panel"><div className="admin-section-title"><div><span className="eyebrow">{isKhmer ? 'ស្ថានភាព' : 'Status'}</span><h2>{isKhmer ? 'ការកក់តាមស្ថានភាព' : 'Booking status mix'}</h2></div></div><div className="status-report-list">{(['pending','confirmed','completed','cancelled'] as const).map((status) => { const count = visible.filter((item) => item.status === status).length; return <div key={status}><span>{status}</span><strong>{count}</strong></div>; })}</div></article>
    </section>
  </AdminPageShell>;
}
