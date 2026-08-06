'use client';

import Link from 'next/link';
import { FacebookIcon, InstagramIcon, MapPinIcon, PhoneIcon, TelegramIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';

export default function Footer() {
  const { isKhmer } = useLanguage();
  const phone = process.env.NEXT_PUBLIC_PHONE || '+855 00 000 000';
  const address = process.env.NEXT_PUBLIC_ADDRESS || (isKhmer ? 'ភ្នំពេញ កម្ពុជា' : 'Phnom Penh, Cambodia');
  return (
    <footer className="site-footer site-footer-modern">
      <div className="container footer-grid">
        <div className="footer-about">
          <div className="brand footer-brand"><span className="brand-mark">C</span><span><strong>COURTSIDE</strong><small>KH</small></span></div>
          <p>{isKhmer ? 'កក់ទីលាន Pickleball និង Tennis ពិនិត្យម៉ោងទំនេរ ហើយ Check-in នៅ Reception។' : 'Book pickleball and tennis courts, see live availability and check in at reception.'}</p>
          <div className="footer-socials">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><FacebookIcon/></a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon/></a>
            <a href="https://t.me" target="_blank" rel="noreferrer" aria-label="Telegram"><TelegramIcon/></a>
          </div>
        </div>
        <div className="footer-links">
          <strong>{isKhmer ? 'មើលបន្ថែម' : 'Explore'}</strong>
          <Link href="/courts">{isKhmer ? 'ទីលានទាំងអស់' : 'All courts'}</Link>
          <Link href="/book">{isKhmer ? 'កក់ទីលាន' : 'Book a court'}</Link>
          <Link href="/classes">{isKhmer ? 'ថ្នាក់ និងគ្រូបង្វឹក' : 'Classes & coaching'}</Link>
          <Link href="/#how-it-works">{isKhmer ? 'របៀបដំណើរការ' : 'How it works'}</Link>
        </div>
        <div className="footer-links">
          <strong>{isKhmer ? 'ប្រតិបត្តិការ' : 'Operations'}</strong>
          <Link href="/admin/login">{isKhmer ? 'ចូលសម្រាប់ក្រុមការងារ' : 'Team login'}</Link>
          <span>{isKhmer ? 'បង់ប្រាក់នៅទីតាំង' : 'Payment at venue'}</span>
          <span>{isKhmer ? 'Check-in តាម POS' : 'Reception POS check-in'}</span>
          <span>{isKhmer ? 'ការពារការកក់ជាន់គ្នា' : 'Double-booking protection'}</span>
        </div>
        <div className="footer-contact">
          <strong>{isKhmer ? 'ទំនាក់ទំនង' : 'Contact'}</strong>
          <a href={`tel:${phone.replace(/\s/g, '')}`}><PhoneIcon size={17}/><span>{phone}</span></a>
          <p><MapPinIcon size={17}/><span>{address}</span></p>
          <Link className="footer-book-link" href="/book">{isKhmer ? 'កក់ឥឡូវនេះ →' : 'Book now →'}</Link>
        </div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} Courtside KH.</span><span>{isKhmer ? 'រក្សាសិទ្ធិគ្រប់យ៉ាង។' : 'All rights reserved.'}</span></div>
    </footer>
  );
}
