'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRightIcon, CheckIcon, ClockIcon, CourtIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';
import type { Settings } from '@/lib/types';

export default function CourtsShowcase({ settings }: { settings: Settings }) {
  const { isKhmer } = useLanguage();
  const courts = settings.courts.filter((court) => court.active);
  return <><Header/><main>
    <section className="page-hero courts-page-hero"><div className="container"><span className="eyebrow">{isKhmer ? 'ទីលាន COURTSIDE KH' : 'COURTSIDE KH facilities'}</span><h1>{isKhmer ? 'ស្វែងរកទីលានដែលសមនឹងការលេងរបស់អ្នក។' : 'Find the court that fits your game.'}</h1><p>{isKhmer ? 'មើលរូបភាព Gallery ផ្ទៃទីលាន ភ្លើង ចំនួនអ្នកលេង ម៉ោងបើក និងតម្លៃ មុនពេលកក់។' : 'Review the photo gallery, surface, lighting, player capacity, opening hours and price before booking.'}</p></div></section>

    <section className="section courts-catalogue-section"><div className="container">
      <div className="court-catalogue-toolbar"><div><span className="eyebrow">{isKhmer ? 'ទីលានសកម្ម' : 'Bookable courts'}</span><h2>{courts.length} {isKhmer ? 'ទីលានអាចកក់បាន' : 'courts ready to book'}</h2></div><Link className="button" href="/book">{isKhmer ? 'មើលម៉ោងទំនេរ' : 'See live availability'}<ArrowRightIcon size={16}/></Link></div>
      <div className="court-gallery-grid court-gallery-grid-detailed">{courts.map((court) => <article key={court.id}>
        <Link className="court-card-media" href={`/courts/${court.id}`}><img src={court.image || '/court-placeholder.svg'} alt={court.name}/><span>{court.service}</span>{court.featured && <em>{isKhmer ? 'ណែនាំ' : 'Featured'}</em>}</Link>
        <div>
          <h2>{court.name}</h2>
          <p>{court.description || (isKhmer ? 'ទីលានស្អាតសម្រាប់ការលេង និងហាត់ប្រាណ។' : 'A well-prepared court for games, practice and coaching.')}</p>
          <div className="court-card-facts"><span><CourtIcon size={15}/>{court.environment || 'outdoor'} · {court.surface || '—'}</span><span><ClockIcon size={15}/>{court.openingTime || settings.openingTime}–{court.closingTime || settings.closingTime}</span><span><CheckIcon size={15}/>{court.lighting ? (isKhmer ? 'មានភ្លើង' : 'Lighting') : (isKhmer ? 'គ្មានភ្លើង' : 'No lighting')}</span><span><CheckIcon size={15}/>{court.capacity || 4} {isKhmer ? 'អ្នកលេង' : 'players'}</span></div>
          <footer><strong>${(court.pricePerHour ?? (court.service === 'pickleball' ? settings.pickleballPricePerHour : settings.tennisPricePerHour)).toFixed(2)} / {isKhmer ? 'ម៉ោង' : 'hour'}</strong><div><Link className="text-link" href={`/courts/${court.id}`}>{isKhmer ? 'ព័ត៌មានលម្អិត' : 'Court details'}</Link><Link className="button button-small" href={`/book?court=${court.id}`}>{isKhmer ? 'កក់' : 'Book'}</Link></div></footer>
        </div>
      </article>)}</div>
    </div></section>
  </main><Footer/></>;
}
