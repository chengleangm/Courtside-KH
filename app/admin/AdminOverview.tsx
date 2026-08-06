'use client';

import Link from 'next/link';
import AdminPageShell from '@/components/AdminPageShell';
import { BlockIcon, CalendarIcon, CheckInIcon, CourtIcon, ListIcon, MoneyIcon, UsersIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';
import type { BlockedPeriod, Booking, Settings } from '@/lib/types';

function dateKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

export default function AdminOverview({ bookings, settings, blocks }: { bookings: Booking[]; settings: Settings; blocks: BlockedPeriod[] }) {
  const { isKhmer, locale } = useLanguage();
  const today = dateKey(new Date());
  const todayBookings = bookings.filter((item) => item.date === today && item.status !== 'cancelled').sort((a, b) => a.startTime.localeCompare(b.startTime));
  const active = bookings.filter((item) => item.status !== 'cancelled');
  const paid = active.reduce((sum, item) => sum + (item.paidAmount ?? (item.paymentStatus === 'paid' ? item.price : 0)), 0);
  const pending = bookings.filter((item) => item.status === 'pending').length;
  const checkIns = bookings.filter((item) => item.checkedInAt).length;
  const occupancy = settings.courts.filter((court) => court.active).map((court) => {
    const courtBookings = active.filter((booking) => booking.courtId === court.id).length;
    const max = Math.max(...settings.courts.map((item) => active.filter((booking) => booking.courtId === item.id).length), 1);
    return { court, count: courtBookings, percent: Math.round((courtBookings / max) * 100) };
  });

  return (
    <AdminPageShell title="Operations overview" titleKhmer="ទិដ្ឋភាពទូទៅនៃប្រតិបត្តិការ">
      <section className="admin-kpi-grid">
        <article><span>{isKhmer ? 'ការកក់សរុប' : 'Total bookings'}</span><strong>{bookings.length}</strong><small>{pending} {isKhmer ? 'កំពុងរង់ចាំ' : 'pending review'}</small></article>
        <article><span>{isKhmer ? 'ការកក់ថ្ងៃនេះ' : "Today's bookings"}</span><strong>{todayBookings.length}</strong><small>{checkIns} {isKhmer ? 'បានចុះឈ្មោះចូល' : 'total check-ins'}</small></article>
        <article><span>{isKhmer ? 'ប្រាក់បានទទួល' : 'Collected payments'}</span><strong>${paid.toFixed(2)}</strong><small>{isKhmer ? 'តាម POS និងការកក់' : 'from POS and bookings'}</small></article>
        <article><span>{isKhmer ? 'ម៉ោងបានបិទ' : 'Blocked periods'}</span><strong>{blocks.length}</strong><small>{settings.courts.filter((court) => court.active).length} {isKhmer ? 'ទីលានសកម្ម' : 'active courts'}</small></article>
      </section>

      <section className="admin-overview-grid">
        <article className="admin-panel">
          <div className="admin-section-title"><div><span className="eyebrow">{isKhmer ? 'ថ្ងៃនេះ' : 'Today'}</span><h2>{isKhmer ? 'កាលវិភាគទីលាន' : 'Court schedule'}</h2></div><Link href="/admin/calendar">{isKhmer ? 'មើលប្រតិទិន' : 'Open calendar'} →</Link></div>
          {todayBookings.length === 0 ? <div className="empty-state">{isKhmer ? 'មិនមានការកក់ថ្ងៃនេះទេ។' : 'No bookings today.'}</div> : <div className="overview-timeline">{todayBookings.map((booking) => <div key={booking.id}><time>{booking.startTime}</time><span className="timeline-line"/><div><strong>{booking.courtName}</strong><span>{booking.customerName} · {booking.phone}</span><small>{booking.startTime}–{booking.endTime} · ${booking.price.toFixed(2)}</small></div><span className={`admin-status-pill status-${booking.status}`}>{booking.checkedInAt ? (isKhmer ? 'បានចូល' : 'Checked in') : booking.status}</span></div>)}</div>}
        </article>

        <article className="admin-panel">
          <div className="admin-section-title"><div><span className="eyebrow">{isKhmer ? 'ការប្រើប្រាស់' : 'Utilisation'}</span><h2>{isKhmer ? 'ការកក់តាមទីលាន' : 'Bookings by court'}</h2></div></div>
          <div className="court-utilisation-list">{occupancy.map(({ court, count, percent }) => <div key={court.id}><div><strong>{court.name}</strong><span>{count} {isKhmer ? 'ការកក់' : 'bookings'}</span></div><div className="utilisation-track"><span style={{ width: `${percent}%` }}/></div></div>)}</div>
        </article>
      </section>

      <section className="admin-quick-grid">
        <Link href="/admin/bookings"><ListIcon/><strong>{isKhmer ? 'គ្រប់គ្រងការកក់' : 'Manage bookings'}</strong><span>{isKhmer ? 'កែប្រែ បញ្ជាក់ ឬបោះបង់' : 'Edit, confirm or cancel'}</span></Link>
        <Link href="/admin/check-in"><CheckInIcon/><strong>{isKhmer ? 'Check-in POS' : 'Check-in POS'}</strong><span>{isKhmer ? 'មកដល់ បង់ប្រាក់ និងចេញ' : 'Arrival, payment and checkout'}</span></Link>
        <Link href="/admin/blocks"><BlockIcon/><strong>{isKhmer ? 'បិទម៉ោង' : 'Block court time'}</strong><span>{isKhmer ? 'ថែទាំ ព្រឹត្តិការណ៍ និងឯកជន' : 'Maintenance, events and private use'}</span></Link>
        <Link href="/admin/courts"><CourtIcon/><strong>{isKhmer ? 'គ្រប់គ្រងទីលាន' : 'Manage courts'}</strong><span>{isKhmer ? 'បញ្ជី ទំព័រកែប្រែ រូបភាព និងតម្លៃ' : 'List, edit pages, images and pricing'}</span></Link>
        <Link href="/admin/calendar"><CalendarIcon/><strong>{isKhmer ? 'ប្រតិទិន' : 'Booking calendar'}</strong><span>{isKhmer ? 'មើលការកក់ប្រចាំខែ' : 'See monthly booking load'}</span></Link>
        <Link href="/admin/customers"><UsersIcon/><strong>{isKhmer ? 'អតិថិជន' : 'Customers'}</strong><span>{isKhmer ? 'ប្រវត្តិកក់ និងតម្លៃសរុប' : 'Booking history and lifetime value'}</span></Link><Link href="/admin/reports"><MoneyIcon/><strong>{isKhmer ? 'របាយការណ៍' : 'Reports'}</strong><span>{isKhmer ? 'ប្រាក់ចំណូល ការប្រើប្រាស់ និង CSV' : 'Revenue, utilisation and CSV'}</span></Link>
      </section>

      <section className="admin-panel recent-bookings-panel">
        <div className="admin-section-title"><div><span className="eyebrow">{isKhmer ? 'ថ្មីៗ' : 'Recent'}</span><h2>{isKhmer ? 'ការកក់ថ្មីៗ' : 'Latest bookings'}</h2></div><Link href="/admin/bookings">{isKhmer ? 'មើលទាំងអស់' : 'View all'} →</Link></div>
        <div className="compact-booking-list">{bookings.slice(0, 6).map((booking) => <article key={booking.id}><div><strong>{booking.reference}</strong><span>{booking.customerName}</span></div><div><strong>{booking.courtName}</strong><span>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(`${booking.date}T00:00:00`))} · {booking.startTime}</span></div><div><strong>${booking.price.toFixed(2)}</strong><span>{booking.paymentStatus ?? 'unpaid'}</span></div></article>)}</div>
      </section>
    </AdminPageShell>
  );
}
