'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminPageShell from '@/components/AdminPageShell';
import { PlusIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';
import type { Court } from '@/lib/types';

export default function CourtsList({ initialCourts }: { initialCourts: Court[] }) {
  const { isKhmer } = useLanguage();
  const [courts, setCourts] = useState(initialCourts);
  const [message, setMessage] = useState('');

  async function toggleActive(court: Court) {
    setMessage('');
    const response = await fetch(`/api/courts/${court.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...court, active: !court.active }),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error || 'Unable to update the court.');
      return;
    }
    setCourts((items) => items.map((item) => item.id === court.id ? body.court : item));
  }

  async function removeCourt(court: Court) {
    if (!confirm(isKhmer ? `លុប ${court.name}?` : `Delete ${court.name}?`)) return;
    const response = await fetch(`/api/courts/${court.id}`, { method: 'DELETE' });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(body.error || 'Unable to delete the court.');
      return;
    }
    setCourts((items) => items.filter((item) => item.id !== court.id));
  }

  return (
    <AdminPageShell
      title="Courts"
      titleKhmer="ទីលាន"
      eyebrow="Bookable inventory"
      eyebrowKhmer="បញ្ជីទីលានដែលអាចកក់"
      actions={<Link className="button button-small" href="/admin/courts/new"><PlusIcon size={16}/>{isKhmer ? 'បន្ថែមទីលាន' : 'Add court'}</Link>}
    >
      <section className="admin-panel court-list-intro">
        <div>
          <h2>{isKhmer ? 'គ្រប់គ្រងទីលានទាំងអស់ពីបញ្ជីមួយ' : 'Manage every court from one clean list'}</h2>
          <p>{isKhmer ? 'ចុចកែប្រែដើម្បីបើកទំព័រព័ត៌មានពេញលេញ រូបភាព តម្លៃ ម៉ោង និងច្បាប់។' : 'Open a dedicated edit page for complete details, gallery, price, hours, amenities and rules.'}</p>
        </div>
        <Link className="button button-secondary button-small" href="/admin/settings">{isKhmer ? 'ច្បាប់កក់' : 'Booking rules'}</Link>
      </section>

      {message && <p className="form-status" role="status">{message}</p>}

      <section className="admin-court-list">
        {courts.map((court) => (
          <article className="admin-court-row" key={court.id}>
            <img src={court.image || '/court-placeholder.svg'} alt={court.name}/>
            <div className="admin-court-main">
              <div className="admin-court-title-row">
                <div>
                  <span className="eyebrow">{court.service}</span>
                  <h2>{court.name}</h2>
                </div>
                <span className={`court-availability-badge ${court.active ? 'active' : 'inactive'}`}>{court.active ? (isKhmer ? 'អាចកក់' : 'Bookable') : (isKhmer ? 'បិទ' : 'Inactive')}</span>
              </div>
              <div className="admin-court-facts">
                <span>{court.environment || 'outdoor'}</span>
                <span>{court.surface || '—'}</span>
                <span>{court.lighting ? (isKhmer ? 'មានភ្លើង' : 'Lighting') : (isKhmer ? 'គ្មានភ្លើង' : 'No lighting')}</span>
                <span>{court.capacity || 4} {isKhmer ? 'នាក់' : 'players'}</span>
                <span>${(court.pricePerHour ?? 0).toFixed(2)} / {isKhmer ? 'ម៉ោង' : 'hour'}</span>
                <span>{court.openingTime || '07:00'}–{court.closingTime || '22:00'}</span>
              </div>
              <p>{court.description || (isKhmer ? 'មិនទាន់មានការពិពណ៌នា។' : 'No description added yet.')}</p>
            </div>
            <div className="admin-court-actions">
              <Link className="button button-small" href={`/admin/courts/${court.id}/edit`}>{isKhmer ? 'កែប្រែ' : 'Edit details'}</Link>
              <button className="button button-secondary button-small" type="button" onClick={() => toggleActive(court)}>{court.active ? (isKhmer ? 'បិទការកក់' : 'Deactivate') : (isKhmer ? 'បើកការកក់' : 'Activate')}</button>
              <button className="text-danger-button" type="button" onClick={() => removeCourt(court)}>{isKhmer ? 'លុប' : 'Delete'}</button>
            </div>
          </article>
        ))}
      </section>
    </AdminPageShell>
  );
}
