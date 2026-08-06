'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminPageShell from '@/components/AdminPageShell';
import { useLanguage } from '@/components/LanguageProvider';
import type { Court, ServiceType, Settings } from '@/lib/types';

const PICKLEBALL_IMAGE = 'https://images.unsplash.com/photo-1753901821774-22a88913130f?auto=format&fit=crop&fm=jpg&q=80&w=1400';
const TENNIS_IMAGE = 'https://images.pexels.com/photos/1784798/pexels-photo-1784798.jpeg?auto=compress&cs=tinysrgb&w=1400';

function blankCourt(service: ServiceType, settings: Settings): Court {
  return {
    id: '',
    name: service === 'pickleball' ? 'New Pickleball Court' : 'New Tennis Court',
    service,
    active: true,
    environment: 'outdoor',
    surface: service === 'pickleball' ? 'Acrylic' : 'Hard',
    lighting: true,
    pricePerHour: service === 'pickleball' ? settings.pickleballPricePerHour : settings.tennisPricePerHour,
    openingTime: settings.openingTime,
    closingTime: settings.closingTime,
    capacity: service === 'pickleball' ? 4 : 2,
    image: service === 'pickleball' ? PICKLEBALL_IMAGE : TENNIS_IMAGE,
    gallery: [],
    description: '',
    amenities: ['Changing area', 'Drinking water', 'Equipment rental'],
    rules: ['Arrive 10 minutes before the booking', 'Use non-marking sports shoes'],
    locationLabel: 'Courtside KH, Phnom Penh',
    featured: false,
  };
}

export default function CourtAdminForm({ settings, initialCourt, defaultService = 'pickleball' }: { settings: Settings; initialCourt?: Court; defaultService?: ServiceType }) {
  const { isKhmer } = useLanguage();
  const router = useRouter();
  const [court, setCourt] = useState<Court>(initialCourt || blankCourt(defaultService, settings));
  const [galleryText, setGalleryText] = useState((initialCourt?.gallery || []).join('\n'));
  const [amenitiesText, setAmenitiesText] = useState((initialCourt?.amenities || []).join('\n'));
  const [rulesText, setRulesText] = useState((initialCourt?.rules || []).join('\n'));
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const isEditing = Boolean(initialCourt);
  const previewImages = useMemo(() => [court.image, ...galleryText.split(/\r?\n/).map((item) => item.trim())].filter(Boolean).slice(0, 4), [court.image, galleryText]);

  function update(patch: Partial<Court>) { setCourt((value) => ({ ...value, ...patch })); }

  function uploadImage(file?: File, gallery = false) {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 1_500_000) {
      setMessage(isKhmer ? 'រូបភាពត្រូវតែជា JPG, PNG ឬ WebP និងតូចជាង 1.5MB។' : 'Use a JPG, PNG or WebP image smaller than 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      if (gallery) setGalleryText((value) => [value, reader.result].filter(Boolean).join('\n'));
      else update({ image: reader.result });
      setMessage(isKhmer ? 'បានបន្ថែមរូបភាព។' : 'Image added to the preview.');
    };
    reader.readAsDataURL(file);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(isKhmer ? 'កំពុងរក្សាទុក…' : 'Saving court…');
    const payload = {
      ...court,
      gallery: galleryText,
      amenities: amenitiesText,
      rules: rulesText,
    };
    const response = await fetch(isEditing ? `/api/courts/${initialCourt!.id}` : '/api/courts', {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setMessage(body.error || 'Unable to save the court.');
      return;
    }
    router.push('/admin/courts');
    router.refresh();
  }

  return (
    <AdminPageShell
      title={isEditing ? 'Edit court' : 'Add a court'}
      titleKhmer={isEditing ? 'កែប្រែទីលាន' : 'បន្ថែមទីលាន'}
      eyebrow="Court details"
      eyebrowKhmer="ព័ត៌មានលម្អិតទីលាន"
      actions={<Link className="button button-secondary button-small" href="/admin/courts">{isKhmer ? 'ត្រឡប់ទៅបញ្ជី' : 'Back to courts'}</Link>}
    >
      <form className="court-detail-form" onSubmit={submit}>
        <section className="admin-panel court-form-preview-panel">
          <div className="court-form-preview-grid">
            {previewImages.length ? previewImages.map((src, index) => <img key={`${src}-${index}`} src={src} alt={`${court.name} preview ${index + 1}`}/>) : <div className="court-image-empty">{isKhmer ? 'បន្ថែមរូបភាពទីលាន' : 'Add court photos'}</div>}
          </div>
          <div className="court-preview-copy">
            <span className="eyebrow">{court.service}</span>
            <h2>{court.name || (isKhmer ? 'ឈ្មោះទីលាន' : 'Court name')}</h2>
            <p>{court.description || (isKhmer ? 'ការពិពណ៌នានឹងបង្ហាញនៅទីនេះ។' : 'The customer-facing description will appear here.')}</p>
            <div className="court-preview-facts"><span>{court.environment}</span><span>{court.surface || 'Surface'}</span><span>{court.lighting ? 'Lighting' : 'No lighting'}</span><span>{court.capacity || 0} players</span><span>${(court.pricePerHour || 0).toFixed(2)}/hour</span></div>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-section-title"><div><span className="eyebrow">{isKhmer ? 'មូលដ្ឋាន' : 'Basics'}</span><h2>{isKhmer ? 'ឈ្មោះ ប្រភេទ និងស្ថានភាព' : 'Name, sport and booking status'}</h2></div></div>
          <div className="form-grid three">
            <label>{isKhmer ? 'ឈ្មោះទីលាន' : 'Court name'}<input value={court.name} onChange={(event) => update({ name: event.target.value })} required/></label>
            <label>{isKhmer ? 'ប្រភេទកីឡា' : 'Sport'}<select value={court.service} onChange={(event) => update({ service: event.target.value as ServiceType })}><option value="pickleball">Pickleball</option><option value="tennis">Tennis</option></select></label>
            <label>{isKhmer ? 'បរិយាកាស' : 'Environment'}<select value={court.environment || 'outdoor'} onChange={(event) => update({ environment: event.target.value as 'indoor' | 'outdoor' })}><option value="indoor">Indoor</option><option value="outdoor">Outdoor</option></select></label>
            <label>{isKhmer ? 'ផ្ទៃទីលាន' : 'Surface'}<input value={court.surface || ''} onChange={(event) => update({ surface: event.target.value })} required/></label>
            <label>{isKhmer ? 'ចំនួនអ្នកលេង' : 'Player capacity'}<input type="number" min="1" value={court.capacity || 1} onChange={(event) => update({ capacity: Number(event.target.value) })} required/></label>
            <label>{isKhmer ? 'ទីតាំងបង្ហាញ' : 'Location label'}<input value={court.locationLabel || ''} onChange={(event) => update({ locationLabel: event.target.value })}/></label>
          </div>
          <div className="court-toggle-row court-toggle-row-large">
            <label className="switch-label"><input type="checkbox" checked={court.active} onChange={(event) => update({ active: event.target.checked })}/>{isKhmer ? 'អាចកក់ដោយអតិថិជន' : 'Active for customer booking'}</label>
            <label className="switch-label"><input type="checkbox" checked={court.lighting !== false} onChange={(event) => update({ lighting: event.target.checked })}/>{isKhmer ? 'មានភ្លើង' : 'Lighting available'}</label>
            <label className="switch-label"><input type="checkbox" checked={court.featured === true} onChange={(event) => update({ featured: event.target.checked })}/>{isKhmer ? 'បង្ហាញលើទំព័រដើម' : 'Featured on website'}</label>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-section-title"><div><span className="eyebrow">{isKhmer ? 'ការកក់' : 'Booking'}</span><h2>{isKhmer ? 'តម្លៃ និងម៉ោងបើក' : 'Price and individual operating hours'}</h2></div></div>
          <div className="form-grid three">
            <label>{isKhmer ? 'តម្លៃក្នុងមួយម៉ោង' : 'Price per hour'}<input type="number" min="0" step="0.5" value={court.pricePerHour ?? 0} onChange={(event) => update({ pricePerHour: Number(event.target.value) })} required/></label>
            <label>{isKhmer ? 'ម៉ោងបើក' : 'Opening time'}<input type="time" value={court.openingTime || settings.openingTime} onChange={(event) => update({ openingTime: event.target.value })} required/></label>
            <label>{isKhmer ? 'ម៉ោងបិទ' : 'Closing time'}<input type="time" value={court.closingTime || settings.closingTime} onChange={(event) => update({ closingTime: event.target.value })} required/></label>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-section-title"><div><span className="eyebrow">{isKhmer ? 'រូបភាព' : 'Media'}</span><h2>{isKhmer ? 'រូបភាពមេ និង Gallery' : 'Main photo and gallery'}</h2><p>{isKhmer ? 'ប្រើ URL ឬ Upload រូបភាពដើម្បីឲ្យអតិថិជនពិនិត្យទីលានមុនកក់។' : 'Use image URLs or uploads so customers can review the court before booking.'}</p></div></div>
          <div className="form-grid two">
            <label className="form-span-two">{isKhmer ? 'URL រូបភាពមេ' : 'Main image URL'}<input value={court.image || ''} onChange={(event) => update({ image: event.target.value })} placeholder="https://..."/></label>
            <label>{isKhmer ? 'Upload រូបភាពមេ' : 'Upload main image'}<input type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files?.[0])}/></label>
            <label>{isKhmer ? 'បន្ថែមរូបភាពទៅ Gallery' : 'Add gallery image'}<input type="file" accept="image/*" onChange={(event) => uploadImage(event.target.files?.[0], true)}/></label>
            <label className="form-span-two">{isKhmer ? 'Gallery URLs — មួយក្នុងមួយបន្ទាត់' : 'Gallery image URLs — one per line'}<textarea rows={5} value={galleryText} onChange={(event) => setGalleryText(event.target.value)} placeholder="https://...\nhttps://..."/></label>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-section-title"><div><span className="eyebrow">{isKhmer ? 'ព័ត៌មានអតិថិជន' : 'Customer details'}</span><h2>{isKhmer ? 'ការពិពណ៌នា សេវាកម្ម និងច្បាប់' : 'Description, amenities and court rules'}</h2></div></div>
          <div className="form-grid two">
            <label className="form-span-two">{isKhmer ? 'ការពិពណ៌នា' : 'Court description'}<textarea rows={5} value={court.description || ''} onChange={(event) => update({ description: event.target.value })}/></label>
            <label>{isKhmer ? 'សេវាកម្ម — មួយក្នុងមួយបន្ទាត់' : 'Amenities — one per line'}<textarea rows={7} value={amenitiesText} onChange={(event) => setAmenitiesText(event.target.value)}/></label>
            <label>{isKhmer ? 'ច្បាប់ទីលាន — មួយក្នុងមួយបន្ទាត់' : 'Court rules — one per line'}<textarea rows={7} value={rulesText} onChange={(event) => setRulesText(event.target.value)}/></label>
          </div>
        </section>

        <div className="settings-actions settings-actions-sticky">
          <span role="status" aria-live="polite">{message}</span>
          <div><Link className="button button-secondary" href="/admin/courts">{isKhmer ? 'បោះបង់' : 'Cancel'}</Link><button className="button" disabled={saving}>{saving ? (isKhmer ? 'កំពុងរក្សាទុក…' : 'Saving…') : (isEditing ? (isKhmer ? 'រក្សាទុកការកែប្រែ' : 'Save changes') : (isKhmer ? 'បង្កើតទីលាន' : 'Create court'))}</button></div>
        </div>
      </form>
    </AdminPageShell>
  );
}
