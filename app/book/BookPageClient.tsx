'use client';

import BookingForm from '@/components/BookingForm';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useLanguage } from '@/components/LanguageProvider';

type BookPageClientProps = {
  requestedCourtId?: string;
};

export default function BookPageClient({
  requestedCourtId,
}: BookPageClientProps) {
  const { isKhmer } = useLanguage();

  return (
    <>
      <Header />

      <main className="page-main">
        <section className="page-hero compact">
          <div className="container">
            <span className="eyebrow">
              {isKhmer ? 'ពេលទំនេរផ្ទាល់' : 'Live availability'}
            </span>

            <h1>{isKhmer ? 'កក់ទីលាន' : 'Book a court'}</h1>

            <p>
              {isKhmer
                ? 'ជ្រើសកីឡា ថ្ងៃ និងម៉ោងទំនេរនៅទីលានដែលអ្នកចង់បាន។'
                : 'Choose a sport, date, duration and one of the available courts below.'}
            </p>
          </div>
        </section>

        <section className="section booking-section">
          <div className="container">
            <BookingForm requestedCourtId={requestedCourtId} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
