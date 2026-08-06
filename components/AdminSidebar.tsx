'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LanguageIcon, ListIcon, LogOutIcon, XIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';

const items = [
  { href: '/admin', en: 'Overview', km: 'ទិដ្ឋភាពទូទៅ' },
  { href: '/admin/bookings', en: 'Bookings', km: 'ការកក់' },
  { href: '/admin/calendar', en: 'Calendar', km: 'ប្រតិទិន' },
  { href: '/admin/check-in', en: 'Check-in POS', km: 'Check-in POS' },
  { href: '/admin/blocks', en: 'Blocked times', km: 'បិទម៉ោង' },
  { href: '/admin/courts', en: 'Courts', km: 'ទីលាន' },
  { href: '/admin/settings', en: 'Booking rules', km: 'ច្បាប់កក់' },
  { href: '/admin/customers', en: 'Customers', km: 'អតិថិជន' },
  { href: '/admin/enquiries', en: 'Enquiries', km: 'សំណើ' },
  { href: '/admin/reports', en: 'Reports', km: 'របាយការណ៍' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isKhmer, toggleLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className={`admin-sidebar admin-sidebar-full ${open ? 'menu-open' : ''}`}>
      <div className="admin-sidebar-top">
        <Link href="/admin" className="brand admin-brand" aria-label="Courtside KH admin home">
          <span className="brand-mark">C</span>
          <span><strong>COURTSIDE</strong><small>KH · ADMIN</small></span>
        </Link>
        <button className="admin-mobile-menu" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={isKhmer ? 'បើកម៉ឺនុយអ្នកគ្រប់គ្រង' : 'Toggle admin menu'}>{open ? <XIcon/> : <ListIcon/>}</button>
      </div>

      <nav aria-label={isKhmer ? 'ម៉ឺនុយអ្នកគ្រប់គ្រង' : 'Admin navigation'}>
        {items.map((item) => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} className={active ? 'active' : ''} onClick={() => setOpen(false)}>{isKhmer ? item.km : item.en}</Link>;
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <Link href="/" target="_blank">{isKhmer ? 'បើកគេហទំព័រ' : 'Open website'}</Link>
        <button type="button" onClick={toggleLanguage}><LanguageIcon size={17}/><span>{isKhmer ? 'English' : 'ភាសាខ្មែរ'}</span></button>
        <button type="button" onClick={logout}><LogOutIcon size={17}/><span>{isKhmer ? 'ចាកចេញ' : 'Sign out'}</span></button>
      </div>
    </aside>
  );
}
