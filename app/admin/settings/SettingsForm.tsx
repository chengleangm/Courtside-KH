'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import AdminPageShell from '@/components/AdminPageShell';
import { useLanguage } from '@/components/LanguageProvider';
import type { Settings } from '@/lib/types';

export default function SettingsForm({ initial }: { initial: Settings }) {
  const { isKhmer } = useLanguage();
  const [settings, setSettings] = useState(initial);
  const [durationText, setDurationText] = useState(initial.allowedDurations.join(', '));
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const allowedDurations = [...new Set(durationText.split(',').map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0 && value % settings.slotMinutes === 0))].sort((a, b) => a - b);
    if (!allowedDurations.length) {
      setMessage(isKhmer ? `បញ្ចូលរយៈពេលដែលចែកដាច់ដោយ ${settings.slotMinutes} នាទី។` : `Enter at least one duration that is a multiple of ${settings.slotMinutes} minutes.`);
      return;
    }
    setSaving(true);
    setMessage(isKhmer ? 'កំពុងរក្សាទុក…' : 'Saving booking rules…');
    const response = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, allowedDurations }),
    });
    const body = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setMessage(body.error || 'Could not save booking rules.');
      return;
    }
    setSettings(body.settings);
    setDurationText(body.settings.allowedDurations.join(', '));
    setMessage(isKhmer ? 'បានរក្សាទុកច្បាប់កក់។' : 'Booking rules saved successfully.');
  }

  return (
    <AdminPageShell
      title="Booking rules"
      titleKhmer="ច្បាប់កក់"
      eyebrow="System configuration"
      eyebrowKhmer="ការកំណត់ប្រព័ន្ធ"
      actions={<Link className="button button-secondary button-small" href="/admin/courts">{isKhmer ? 'គ្រប់គ្រងទីលាន' : 'Manage courts'}</Link>}
    >
      <form className="settings-form settings-form-admin booking-rules-form" onSubmit={submit}>
        <section className="admin-panel rules-intro-panel">
          <div>
            <span className="eyebrow">{isKhmer ? 'សំខាន់' : 'Important'}</span>
            <h2>{isKhmer ? 'ការកំណត់ទាំងនេះគ្រប់គ្រងកាលវិភាគកក់ទាំងមូល' : 'These settings control the complete customer timetable'}</h2>
            <p>{isKhmer ? 'ម៉ោងទីលាននីមួយៗ និងតម្លៃជាក់លាក់ត្រូវកំណត់នៅទំព័រ Courts។' : 'Individual court hours, photos, prices and details are managed from the Courts page.'}</p>
          </div>
          <Link className="button button-small" href="/admin/courts">{isKhmer ? 'បើកបញ្ជីទីលាន' : 'Open court list'}</Link>
        </section>

        <section className="admin-panel">
          <div className="admin-section-title"><div><span className="eyebrow">{isKhmer ? 'ម៉ោងទីតាំង' : 'Venue hours'}</span><h2>{isKhmer ? 'ម៉ោងបើក និងបិទលំនាំដើម' : 'Default opening and closing times'}</h2><p>{isKhmer ? 'ទីលានអាចកំណត់ម៉ោងខុសពីនេះនៅទំព័រកែប្រែទីលាន។' : 'A court can override these hours from its own edit page.'}</p></div></div>
          <div className="form-grid two">
            <label>{isKhmer ? 'ម៉ោងបើកលំនាំដើម' : 'Default opening time'}<input type="time" value={settings.openingTime} onChange={(event) => setSettings({ ...settings, openingTime: event.target.value })} required/></label>
            <label>{isKhmer ? 'ម៉ោងបិទលំនាំដើម' : 'Default closing time'}<input type="time" value={settings.closingTime} onChange={(event) => setSettings({ ...settings, closingTime: event.target.value })} required/></label>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-section-title"><div><span className="eyebrow">{isKhmer ? 'កាលវិភាគ' : 'Timetable'}</span><h2>{isKhmer ? 'ទំហំប្លុក និងរយៈពេលដែលអាចកក់' : 'Time-block size and allowed booking durations'}</h2></div></div>
          <div className="form-grid two">
            <label>{isKhmer ? 'ទំហំប្លុកកាលវិភាគ' : 'Schedule block size'}<select value={settings.slotMinutes} onChange={(event) => setSettings({ ...settings, slotMinutes: Number(event.target.value) })}><option value={30}>30 minutes</option><option value={60}>60 minutes</option></select></label>
            <label>{isKhmer ? 'រយៈពេលអនុញ្ញាត (នាទី)' : 'Allowed durations (minutes)'}<input value={durationText} onChange={(event) => setDurationText(event.target.value)} placeholder="60, 120, 180, 240"/><small>{isKhmer ? 'ប្រើសញ្ញាក្បៀសដើម្បីបំបែក។' : 'Separate each duration with a comma.'}</small></label>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-section-title"><div><span className="eyebrow">{isKhmer ? 'តម្លៃលំនាំដើម' : 'Default pricing'}</span><h2>{isKhmer ? 'តម្លៃក្នុងមួយម៉ោងតាមប្រភេទកីឡា' : 'Hourly price by sport'}</h2><p>{isKhmer ? 'ទីលាននីមួយៗអាចមានតម្លៃផ្ទាល់ខ្លួន។' : 'Individual courts can override these prices.'}</p></div></div>
          <div className="form-grid two">
            <label>{isKhmer ? 'Pickleball / ម៉ោង' : 'Pickleball per hour'}<input type="number" min="0" step="0.5" value={settings.pickleballPricePerHour} onChange={(event) => setSettings({ ...settings, pickleballPricePerHour: Number(event.target.value) })}/></label>
            <label>{isKhmer ? 'Tennis / ម៉ោង' : 'Tennis per hour'}<input type="number" min="0" step="0.5" value={settings.tennisPricePerHour} onChange={(event) => setSettings({ ...settings, tennisPricePerHour: Number(event.target.value) })}/></label>
          </div>
        </section>

        <section className="admin-panel booking-rule-summary">
          <div><span>{isKhmer ? 'ទីលានសរុប' : 'Total courts'}</span><strong>{settings.courts.length}</strong></div>
          <div><span>{isKhmer ? 'ទីលានសកម្ម' : 'Bookable courts'}</span><strong>{settings.courts.filter((court) => court.active).length}</strong></div>
          <div><span>{isKhmer ? 'ប្លុក' : 'Slot size'}</span><strong>{settings.slotMinutes} min</strong></div>
          <div><span>{isKhmer ? 'រយៈពេល' : 'Durations'}</span><strong>{durationText.split(',').filter((value) => value.trim()).length}</strong></div>
        </section>

        <div className="settings-actions settings-actions-sticky">
          <span role="status" aria-live="polite">{message}</span>
          <button className="button" disabled={saving}>{saving ? (isKhmer ? 'កំពុងរក្សាទុក…' : 'Saving…') : (isKhmer ? 'រក្សាទុកច្បាប់កក់' : 'Save booking rules')}</button>
        </div>
      </form>
    </AdminPageShell>
  );
}
