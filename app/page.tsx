'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRightIcon, CalendarIcon, CheckIcon, ClockIcon, CourtIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';

const images = {
  hero: 'https://images.unsplash.com/photo-1762423570127-c36ff11b883f?auto=format&fit=crop&fm=jpg&q=80&w=1600',
  pickleball: 'https://images.unsplash.com/photo-1753901821774-22a88913130f?auto=format&fit=crop&fm=jpg&q=80&w=1200',
  tennis: 'https://images.pexels.com/photos/1784798/pexels-photo-1784798.jpeg?auto=compress&cs=tinysrgb&w=1400',
  coaching: 'https://images.pexels.com/photos/35214649/pexels-photo-35214649.jpeg?auto=compress&cs=tinysrgb&w=1400',
};

export default function Home() {
  const { isKhmer } = useLanguage();
  const t = isKhmer ? {
    eyebrow:'ភ្នំពេញ · ទីលានរបស់អ្នក ពេលវេលារបស់អ្នក', titleA:'លេងកាន់តែងាយ។', titleB:'កក់កាន់តែលឿន។', lead:'កក់ទីលាន Pickleball និង Tennis តាមពេលទំនេរផ្ទាល់។ មកដល់ទីតាំង Check-in ហើយបង់ប្រាក់តាម POS។', book:'កក់ទីលានឥឡូវនេះ', courts:'មើលទីលាន', available:'ទីលានសកម្ម', booking:'ការកក់ផ្ទាល់', payment:'បង់នៅទីតាំង', facilities:'ទីលានសម្រាប់គ្រប់ការលេង', facilitiesCopy:'ជ្រើសរើសទីលាន ស្វែងរកម៉ោងទំនេរ និងកក់រយៈពេលដែលសមនឹងអ្នក។', how:'របៀបកក់', howTitle:'ពីទូរស័ព្ទទៅទីលានក្នុង 4 ជំហាន', cta:'ត្រៀមលេងហើយឬនៅ?', ctaTitle:'ជ្រើសរើសថ្ងៃ ទីលាន និងម៉ោងរបស់អ្នក។'
  } : {
    eyebrow:'Phnom Penh · Your court, your time', titleA:'Play made simple.', titleB:'Booking made fast.', lead:'Book pickleball and tennis courts from live availability. Arrive, check in at the venue and complete payment through the reception POS.', book:'Book a court now', courts:'Explore courts', available:'Active courts', booking:'Live booking', payment:'Venue payment', facilities:'A court for every kind of play', facilitiesCopy:'Choose a court, see real availability and reserve the amount of time that works for you.', how:'How it works', howTitle:'From your phone to the court in four steps', cta:'Ready to play?', ctaTitle:'Choose your date, court and time.'
  };

  return <><Header/><main>
    <section className="home-hero">
      <div className="container home-hero-grid">
        <div className="home-hero-copy"><span className="eyebrow">{t.eyebrow}</span><h1>{t.titleA}<br/><em>{t.titleB}</em></h1><p>{t.lead}</p><div className="hero-actions"><Link className="button" href="/book">{t.book}<ArrowRightIcon size={17}/></Link><Link className="button button-secondary" href="/courts">{t.courts}</Link></div><div className="home-trust-row"><span><CheckIcon size={15}/>{isKhmer?'មិនបង់ប្រាក់អនឡាញជាមុន':'No online prepayment'}</span><span><CheckIcon size={15}/>{isKhmer?'ការពារការកក់ជាន់គ្នា':'No double booking'}</span></div></div>
        <div className="home-hero-media"><img src={images.hero} alt="Pickleball player on a modern court"/><div className="hero-media-overlay"><span>{isKhmer?'ពេលទំនេរបន្ទាប់':'Next available'}</span><strong>{isKhmer?'ថ្ងៃនេះ · 5:30 ល្ងាច':'Today · 5:30 PM'}</strong><small>Pickleball Court 2</small></div><div className="hero-score-card"><strong>4.9</strong><span>{isKhmer?'បទពិសោធន៍ងាយស្រួល':'Easy booking experience'}</span></div></div>
      </div>
      <div className="container home-metrics"><article><CourtIcon/><div><strong>5</strong><span>{t.available}</span></div></article><article><CalendarIcon/><div><strong>Live</strong><span>{t.booking}</span></div></article><article><ClockIcon/><div><strong>30–240</strong><span>{isKhmer?'នាទីក្នុងមួយកក់':'Minutes per booking'}</span></div></article><article><CheckIcon/><div><strong>POS</strong><span>{t.payment}</span></div></article></div>
    </section>

    <section className="section home-courts-section" id="facilities"><div className="container"><div className="section-heading"><div><span className="eyebrow">{isKhmer?'ទីលាន និងសេវាកម្ម':'Courts & services'}</span><h2>{t.facilities}</h2></div><p>{t.facilitiesCopy}</p></div><div className="home-service-grid">
      <article className="image-service-card"><img src={images.pickleball} alt="Pickleball paddle and ball on court"/><div><span>01 · {isKhmer?'លឿន និងសប្បាយ':'Fast & social'}</span><h3>Pickleball</h3><p>{isKhmer?'ទីលាន Indoor និង Outdoor សម្រាប់ហាត់ប្រាណ មិត្តភាព និងក្រុម។':'Indoor and outdoor courts for practice, friendly games and group sessions.'}</p><Link href="/book">{isKhmer?'កក់ Pickleball':'Book pickleball'} <ArrowRightIcon size={16}/></Link></div></article>
      <article className="image-service-card"><img src={images.tennis} alt="Aerial view of tennis courts"/><div><span>02 · {isKhmer?'ផ្តោត និងសកម្ម':'Focused & active'}</span><h3>Tennis</h3><p>{isKhmer?'ជ្រើសរើសផ្ទៃទីលាន ម៉ោង និងរយៈពេលតាមប្រតិទិនផ្ទាល់។':'Choose your court surface, time and duration from the live timetable.'}</p><Link href="/book">{isKhmer?'កក់ Tennis':'Book tennis'} <ArrowRightIcon size={16}/></Link></div></article>
      <article className="image-service-card"><img src={images.coaching} alt="Tennis coaching lesson on an outdoor court"/><div><span>03 · {isKhmer?'រៀន និងអភិវឌ្ឍ':'Learn & improve'}</span><h3>{isKhmer?'គ្រូបង្វឹក':'Coaching'}</h3><p>{isKhmer?'ស្នើសុំថ្នាក់ឯកជន ឬក្រុម ហើយក្រុមការងារនឹងបញ្ជាក់ពេលវេលា។':'Request private or group coaching and let the team confirm the best time.'}</p><Link href="/classes">{isKhmer?'ស្នើសុំគ្រូបង្វឹក':'Request coaching'} <ArrowRightIcon size={16}/></Link></div></article>
    </div></div></section>

    <section className="section booking-experience" id="how-it-works"><div className="container"><div className="section-heading light"><div><span className="eyebrow">{t.how}</span><h2>{t.howTitle}</h2></div><p>{isKhmer?'ប្រព័ន្ធតែមួយភ្ជាប់អតិថិជន ប្រតិទិន អ្នកគ្រប់គ្រង និង POS នៅទីតាំង។':'One connected system links customers, the live calendar, admin operations and venue check-in.'}</p></div><div className="experience-steps">
      {[['01',isKhmer?'ជ្រើសកីឡា និងថ្ងៃ':'Choose sport & date',isKhmer?'មើលប្រតិទិន និងជ្រើសថ្ងៃដែលអាចកក់បាន។':'Use the calendar to pick an available day.'],['02',isKhmer?'ជ្រើសទីលាន និងម៉ោង':'Select court & time',isKhmer?'ជ្រើសប្លុកម៉ោងជាប់គ្នា ហើយមើលតម្លៃសរុប។':'Select consecutive time blocks and see the total instantly.'],['03',isKhmer?'ទទួលការបញ្ជាក់':'Receive confirmation',isKhmer?'ទទួលលេខយោង និងស្ថានភាពការកក់។':'Receive a reference and booking status.'],['04',isKhmer?'Check-in និងបង់ប្រាក់':'Check in & pay',isKhmer?'មកដល់ Reception Check-in និងបង់ប្រាក់តាម POS។':'Arrive at reception, check in and pay through the POS.']].map(([n,h,p])=><article key={n}><span>{n}</span><h3>{h}</h3><p>{p}</p></article>)}
    </div></div></section>

    <section className="section home-gallery"><div className="container"><div className="gallery-main"><img src={images.tennis} alt="Courtside tennis court design reference"/></div><div className="gallery-copy"><span className="eyebrow">{isKhmer?'រចនាឡើងសម្រាប់ការលេង':'Designed around play'}</span><h2>{isKhmer?'ទីលានដែលងាយរក ងាយកក់ និងងាយគ្រប់គ្រង។':'Courts that are easy to discover, book and operate.'}</h2><p>{isKhmer?'ព័ត៌មានទីលាន រូបភាព ផ្ទៃ ភ្លើង ម៉ោងបើក និងតម្លៃ អាចកែបានពីផ្ទាំងអ្នកគ្រប់គ្រង។':'Court photos, surfaces, lighting, operating hours and prices are all editable from the admin system.'}</p><Link className="text-link" href="/courts">{t.courts} →</Link></div></div></section>

    <section className="section cta-section"><div className="container cta-box cta-box-modern"><div><span className="eyebrow">{t.cta}</span><h2>{t.ctaTitle}</h2></div><Link href="/book" className="button button-dark">{t.book}<ArrowRightIcon size={17}/></Link></div></section>
  </main><Footer/></>;
}
