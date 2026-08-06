'use client';

import { useMemo, useState } from 'react';
import AdminPageShell from '@/components/AdminPageShell';
import { SearchIcon, TrashIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';
import type { Enquiry, EnquiryStatus } from '@/lib/types';

const statuses: EnquiryStatus[] = ['new', 'contacted', 'scheduled', 'closed'];

export default function EnquiriesView({ enquiries: initial }: { enquiries: Enquiry[] }) {
  const { isKhmer, locale } = useLanguage();
  const [enquiries, setEnquiries] = useState(initial);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<EnquiryStatus | 'all'>('all');
  const [message, setMessage] = useState('');

  const visible = useMemo(() => enquiries.filter((item) => {
    const matches = `${item.customerName} ${item.phone} ${item.email} ${item.service}`.toLowerCase().includes(query.toLowerCase());
    return matches && (status === 'all' || (item.status || 'new') === status);
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [enquiries, query, status]);

  async function patch(item: Enquiry, payload: Record<string, unknown>) {
    setMessage('');
    const response = await fetch(`/api/enquiries/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setMessage(body.error || 'Unable to update the enquiry.'); return; }
    setEnquiries((items) => items.map((value) => value.id === item.id ? body.enquiry : value));
    setMessage(isKhmer ? 'បានធ្វើបច្ចុប្បន្នភាពសំណើ។' : 'Enquiry updated.');
  }

  async function remove(item: Enquiry) {
    if (!confirm(isKhmer ? `លុបសំណើរបស់ ${item.customerName}?` : `Delete ${item.customerName}'s enquiry?`)) return;
    const response = await fetch(`/api/enquiries/${item.id}`, { method: 'DELETE' });
    if (response.ok) setEnquiries((items) => items.filter((value) => value.id !== item.id));
  }

  return <AdminPageShell title="Classes & coaching enquiries" titleKhmer="សំណើថ្នាក់ និងគ្រូបង្វឹក" actions={<a className="button button-small" href="/classes" target="_blank">{isKhmer ? 'បើកទម្រង់អតិថិជន' : 'Open customer form'}</a>}>
    <section className="admin-panel enquiry-tools-panel">
      <label className="admin-search admin-search-clean"><SearchIcon size={17}/><span className="sr-only">Search enquiries</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={isKhmer ? 'ស្វែងរកអតិថិជន ទូរស័ព្ទ ឬអ៊ីមែល' : 'Search customer, phone or email'}/></label>
      <select value={status} onChange={(event) => setStatus(event.target.value as EnquiryStatus | 'all')}><option value="all">{isKhmer ? 'ស្ថានភាពទាំងអស់' : 'All statuses'}</option>{statuses.map((value) => <option value={value} key={value}>{value}</option>)}</select>
      <div className="enquiry-count"><strong>{visible.length}</strong><span>{isKhmer ? 'សំណើ' : 'enquiries'}</span></div>
    </section>
    {message && <p className="form-status" role="status">{message}</p>}
    <section className="enquiry-admin-grid">{visible.length === 0 ? <div className="admin-panel empty-state enquiry-empty-state"><h2>{isKhmer ? 'មិនទាន់មានសំណើដែលត្រូវគ្នា' : 'No matching enquiries'}</h2><p>{isKhmer ? 'សំណើថ្មីពីទំព័រ Classes & Coaching នឹងបង្ហាញនៅទីនេះ។' : 'New customer requests from the Classes & Coaching page will appear here.'}</p></div> : visible.map((item) => <article className="admin-panel enquiry-admin-card enquiry-admin-card-functional" key={item.id}>
      <header><div><span className="eyebrow">{item.service}</span><h2>{item.customerName}</h2><p>{item.phone} · {item.email}</p></div><select className={`status-select status-${item.status || 'new'}`} value={item.status || 'new'} onChange={(event) => patch(item, { status: event.target.value })}>{statuses.map((value) => <option value={value} key={value}>{value}</option>)}</select></header>
      <dl><div><dt>{isKhmer ? 'ថ្ងៃដែលចង់បាន' : 'Preferred date'}</dt><dd>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(`${item.preferredDate}T00:00:00`))}</dd></div><div><dt>{isKhmer ? 'ម៉ោង' : 'Time'}</dt><dd>{item.preferredTime}</dd></div><div><dt>{isKhmer ? 'ចំនួនអ្នក' : 'Group size'}</dt><dd>{item.people} {isKhmer ? 'នាក់' : 'people'}</dd></div><div><dt>{isKhmer ? 'បានបង្កើត' : 'Received'}</dt><dd>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(item.createdAt))}</dd></div></dl>
      <div className="enquiry-customer-note"><strong>{isKhmer ? 'សារអតិថិជន' : 'Customer message'}</strong><p>{item.notes || (isKhmer ? 'គ្មានកំណត់ចំណាំ' : 'No notes')}</p></div>
      <div className="enquiry-admin-fields"><label>{isKhmer ? 'គ្រូបង្វឹក/បុគ្គលិក' : 'Assigned coach/staff'}<input defaultValue={item.assignedCoach || ''} onBlur={(event) => patch(item, { assignedCoach: event.target.value })} placeholder={isKhmer ? 'ឈ្មោះបុគ្គលិក' : 'Staff name'}/></label><label>{isKhmer ? 'កំណត់ចំណាំក្រុមការងារ' : 'Staff note'}<textarea rows={3} defaultValue={item.staffNote || ''} onBlur={(event) => patch(item, { staffNote: event.target.value })} placeholder={isKhmer ? 'ការតាមដាន តម្លៃ ឬព័ត៌មានបន្ថែម' : 'Follow-up, price or scheduling note'}/></label></div>
      <footer><a className="button button-secondary" href={`tel:${item.phone}`}>{isKhmer ? 'ហៅអតិថិជន' : 'Call customer'}</a><a className="button button-secondary" href={`mailto:${item.email}`}>{isKhmer ? 'ផ្ញើអ៊ីមែល' : 'Send email'}</a><a className="button" href={`/admin/bookings?new=1&name=${encodeURIComponent(item.customerName)}&phone=${encodeURIComponent(item.phone)}&email=${encodeURIComponent(item.email)}`}>{isKhmer ? 'បង្កើតការកក់' : 'Create booking'}</a><button className="icon-only-button danger" type="button" onClick={() => remove(item)} aria-label="Delete enquiry"><TrashIcon size={16}/></button></footer>
    </article>)}</section>
  </AdminPageShell>;
}
