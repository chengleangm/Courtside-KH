'use client';

import type { ReactNode } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { useLanguage } from '@/components/LanguageProvider';

export default function AdminPageShell({
  title,
  titleKhmer,
  eyebrow = 'Operations',
  eyebrowKhmer = 'ប្រតិបត្តិការ',
  actions,
  children,
}: {
  title: string;
  titleKhmer?: string;
  eyebrow?: string;
  eyebrowKhmer?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { isKhmer, locale } = useLanguage();
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-content admin-content-full">
        <header className="admin-page-header">
          <div>
            <span className="eyebrow">{isKhmer ? eyebrowKhmer : eyebrow}</span>
            <h1>{isKhmer && titleKhmer ? titleKhmer : title}</h1>
            <p>{new Intl.DateTimeFormat(locale, { dateStyle: 'full' }).format(new Date())}</p>
          </div>
          {actions && <div className="admin-page-actions">{actions}</div>}
        </header>
        {children}
      </main>
    </div>
  );
}
