'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import AdminPageShell from '@/components/AdminPageShell';
import { SearchIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';
import type { Booking } from '@/lib/types';

type CustomerRow = {
  key: string;
  name: string;
  phone: string;
  email: string;
  bookings: Booking[];
  total: number;
  paid: number;
  lastDate: string;
};

export default function CustomersView({ bookings }: { bookings: Booking[] }) {
  const { isKhmer, locale } = useLanguage();
  const [query, setQuery] = useState('');
  const customers = useMemo(() => {
    const map = new Map<string, CustomerRow>();
    bookings.filter((item) => item.status !== 'cancelled').forEach((booking) => {
      const key = booking.email.toLowerCase() || booking.phone.replace(/\s/g, '');
      const row = map.get(key) || { key, name: booking.customerName, phone: booking.phone, email: booking.email, bookings: [], total: 0, paid: 0, lastDate: booking.date };
      row.bookings.push(booking);
      row.total += booking.price;
      row.paid += booking.paidAmount ?? 0;
      if (booking.date > row.lastDate) row.lastDate = booking.date;
      map.set(key, row);
    });
    return [...map.values()].sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  }, [bookings]);
  const visible = customers.filter((item) => `${item.name} ${item.phone} ${item.email}`.toLowerCase().includes(query.toLowerCase()));

  return <AdminPageShell title="Customers" titleKhmer="អតិថិជន" eyebrow="Customer directory" eyebrowKhmer="បញ្ជីអតិថិជន">
    <section className="admin-panel customer-tools-panel">
      <label className="admin-search admin-search-clean"><SearchIcon size={17}/><span className="sr-only">Search customers</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isKhmer ? 'ស្វែងរកឈ្មោះ ទូរស័ព្ទ ឬអ៊ីមែល' : 'Search name, phone or email'}/></label>
      <div className="customer-count-copy"><strong>{visible.length}</strong><span>{isKhmer ? 'អតិថិជន' : 'customers'}</span></div>
    </section>
    <section className="customer-directory-grid">
      {visible.map((customer) => <article className="admin-panel customer-directory-card" key={customer.key}>
        <header><div className="customer-avatar">{customer.name.slice(0, 1).toUpperCase()}</div><div><h2>{customer.name}</h2><p>{customer.phone}</p><small>{customer.email}</small></div></header>
        <dl><div><dt>{isKhmer ? 'ការកក់' : 'Bookings'}</dt><dd>{customer.bookings.length}</dd></div><div><dt>{isKhmer ? 'តម្លៃសរុប' : 'Lifetime value'}</dt><dd>${customer.total.toFixed(2)}</dd></div><div><dt>{isKhmer ? 'បានបង់' : 'Paid'}</dt><dd>${customer.paid.toFixed(2)}</dd></div><div><dt>{isKhmer ? 'កក់ចុងក្រោយ' : 'Last booking'}</dt><dd>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(`${customer.lastDate}T00:00:00`))}</dd></div></dl>
        <div className="customer-booking-preview">{customer.bookings.sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`)).slice(0, 3).map((booking) => <Link href={`/admin/bookings/${booking.id}`} key={booking.id}><span>{booking.date} · {booking.startTime}</span><strong>{booking.courtName}</strong></Link>)}</div>
      </article>)}
      {visible.length === 0 && <div className="admin-panel empty-state">{isKhmer ? 'រកមិនឃើញអតិថិជន។' : 'No customers found.'}</div>}
    </section>
  </AdminPageShell>;
}
