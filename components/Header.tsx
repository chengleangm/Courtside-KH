'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LanguageIcon, ListIcon, XIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';

export default function Header() {
  const { isKhmer, toggleLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Courtside KH home">
          <span className="brand-mark">C</span>
          <span><strong>COURTSIDE</strong><small>KH</small></span>
        </Link>

        <nav className={`main-nav ${open ? 'open' : ''}`} aria-label={isKhmer ? 'ម៉ឺនុយមេ' : 'Main navigation'}>
          <Link href="/courts" onClick={() => setOpen(false)}>{isKhmer ? 'ទីលាន' : 'Courts'}</Link>
          <Link href="/#how-it-works" onClick={() => setOpen(false)}>{isKhmer ? 'របៀបកក់' : 'How it works'}</Link>
          <Link href="/classes" onClick={() => setOpen(false)}>{isKhmer ? 'ថ្នាក់ និងគ្រូបង្វឹក' : 'Classes & Coaching'}</Link>
          <Link href="/book" className="mobile-nav-book button button-small" onClick={() => setOpen(false)}>{isKhmer ? 'កក់ទីលាន' : 'Book a court'}</Link>
        </nav>

        <div className="header-controls">
          <button type="button" className="language-toggle language-toggle-visible" onClick={toggleLanguage} aria-label={isKhmer ? 'Switch to English' : 'ប្ដូរទៅភាសាខ្មែរ'}><LanguageIcon size={16}/><span>{isKhmer ? 'EN' : 'ខ្មែរ'}</span></button>
          <Link href="/book" className="button button-small desktop-book-button">{isKhmer ? 'កក់ទីលាន' : 'Book a court'}</Link>
          <button className="mobile-menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={isKhmer ? 'បើកម៉ឺនុយ' : 'Toggle navigation'}>{open ? <XIcon/> : <ListIcon/>}</button>
        </div>
      </div>
      {open && <button className="mobile-menu-backdrop" aria-label={isKhmer ? 'បិទម៉ឺនុយ' : 'Close menu'} onClick={() => setOpen(false)}/>}
    </header>
  );
}
