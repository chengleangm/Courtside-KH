'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRightIcon, CheckIcon, ClockIcon, CourtIcon, MapPinIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';
import type { Court, Settings } from '@/lib/types';

export default function CourtDetail({ court, settings }: { court: Court; settings: Settings }) {
  const { isKhmer } = useLanguage();
  const gallery = [court.image, ...(court.gallery || [])].filter(Boolean) as string[];
  const price = court.pricePerHour ?? (court.service === 'pickleball' ? settings.pickleballPricePerHour : settings.tennisPricePerHour);
  return <><Header/><main>
    <section className="court-detail-hero"><div className="container court-detail-hero-grid"><div><span className="eyebrow">{court.service} · {court.environment || 'outdoor'}</span><h1>{court.name}</h1><p>{court.description || (isKhmer ? 'ទីលានទំនើបសម្រាប់ហាត់ប្រាណ ការប្រកួតមិត្តភាព និងថ្នាក់បង្វឹក។' : 'A modern court for training, friendly games and coaching sessions.')}</p><div className="court-detail-actions"><Link className="button" href={`/book?court=${court.id}`}>{isKhmer ? 'កក់ទីលាននេះ' : 'Book this court'}<ArrowRightIcon size={16}/></Link><Link className="button button-secondary" href="/courts">{isKhmer ? 'ទីលានទាំងអស់' : 'All courts'}</Link></div></div><div className="court-detail-price"><span>{isKhmer ? 'ចាប់ពី' : 'From'}</span><strong>${price.toFixed(2)}</strong><small>{isKhmer ? 'ក្នុងមួយម៉ោង' : 'per hour'}</small></div></div></section>

    <section className="section court-detail-gallery-section"><div className="container court-detail-gallery">{gallery.length ? gallery.slice(0, 5).map((src, index) => <img key={`${src}-${index}`} src={src} alt={`${court.name} view ${index + 1}`}/>) : <div className="court-detail-no-photo">{isKhmer ? 'មិនទាន់មានរូបភាព' : 'No court photos yet'}</div>}</div></section>

    <section className="section court-detail-info"><div className="container court-detail-info-grid">
      <div className="court-detail-main-copy"><span className="eyebrow">{isKhmer ? 'ព័ត៌មានទីលាន' : 'Court information'}</span><h2>{isKhmer ? 'អ្វីដែលអ្នកត្រូវដឹងមុនកក់' : 'Everything to know before you book'}</h2><div className="court-detail-facts"><article><CourtIcon/><span>{isKhmer ? 'ផ្ទៃ និងបរិយាកាស' : 'Surface & environment'}</span><strong>{court.surface || '—'} · {court.environment || 'outdoor'}</strong></article><article><ClockIcon/><span>{isKhmer ? 'ម៉ោងបើក' : 'Operating hours'}</span><strong>{court.openingTime || settings.openingTime}–{court.closingTime || settings.closingTime}</strong></article><article><CheckIcon/><span>{isKhmer ? 'ចំនួនអ្នកលេង' : 'Player capacity'}</span><strong>{court.capacity || 4} {isKhmer ? 'នាក់' : 'players'}</strong></article><article><MapPinIcon/><span>{isKhmer ? 'ទីតាំង' : 'Location'}</span><strong>{court.locationLabel || 'Courtside KH, Phnom Penh'}</strong></article></div></div>
      <aside className="court-detail-side-card"><h3>{isKhmer ? 'សេវាកម្ម' : 'Amenities'}</h3><ul>{(court.amenities?.length ? court.amenities : ['Changing area', 'Drinking water', 'Equipment rental']).map((item) => <li key={item}><CheckIcon size={15}/>{item}</li>)}</ul><h3>{isKhmer ? 'ច្បាប់ទីលាន' : 'Court rules'}</h3><ol>{(court.rules?.length ? court.rules : ['Arrive 10 minutes before the booking', 'Use suitable sports shoes']).map((item) => <li key={item}>{item}</li>)}</ol><Link className="button button-full" href={`/book?court=${court.id}`}>{isKhmer ? 'មើលម៉ោងទំនេរ' : 'View available times'}</Link></aside>
    </div></section>
  </main><Footer/></>;
}
