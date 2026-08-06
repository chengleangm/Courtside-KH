import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ConfirmationPageClient from '@/components/ConfirmationPageClient';
import { store } from '@/lib/store';

export const dynamic = 'force-dynamic';

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let booking = null;

  try {
    booking = (await store.getBookings()).find((item) => item.id === id) ?? null;
  } catch (error) {
    console.error('Unable to read confirmation booking from the server store.', error);
  }

  return (
    <>
      <Header />
      <main className="page-main confirmation-page">
        <div className="container narrow">
          <ConfirmationPageClient bookingId={id} initialBooking={booking} />
        </div>
      </main>
      <Footer />
    </>
  );
}
