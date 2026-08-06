'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClassEnquiryForm from '@/components/ClassEnquiryForm';
import { useLanguage } from '@/components/LanguageProvider';

export default function ClassesPage() {
  const { isKhmer } = useLanguage();
  return <><Header /><main className="page-main"><section className="page-hero"><div className="container page-hero-grid"><div><span className="eyebrow">{isKhmer ? 'ថ្នាក់ និងគ្រូបង្វឹក' : 'Classes & coaching'}</span><h1>{isKhmer ? 'អភិវឌ្ឍជំនាញរបស់អ្នក។' : 'Build your game.'}</h1><p>{isKhmer ? 'ប្រាប់យើងអំពីថ្ងៃ ម៉ោង និងចំនួនអ្នកចូលរួម។ ក្រុម Courtside KH នឹងបញ្ជាក់ពេលទំនេរ និងបន្តតាម Telegram។' : 'Tell us your preferred date, time and group size. The Courtside KH team will confirm availability and continue with you through Telegram.'}</p></div><div className="coach-visual"><div className="coach-circle">CS</div><span>{isKhmer ? 'គ្រូបង្វឹកឯកជន' : 'Private coaching'}</span><strong>{isKhmer ? 'សម្រាប់គ្រប់កម្រិត' : 'For every level'}</strong></div></div></section><section className="section"><div className="container narrow"><div className="section-heading"><div><span className="eyebrow">{isKhmer ? 'ផ្ញើសំណើ' : 'Send an enquiry'}</span><h2>{isKhmer ? 'វគ្គដែលអ្នកចង់បាន' : 'Your preferred session'}</h2></div><p>{isKhmer ? 'នេះជាសំណើ មិនមែនជាការកក់បានបញ្ជាក់ភ្លាមៗទេ។ ក្រុមការងារនឹងទាក់ទងអ្នក។' : 'This is an enquiry, not an automatic confirmed booking. Our team will contact you.'}</p></div><ClassEnquiryForm /></div></section></main><Footer /></>;
}
