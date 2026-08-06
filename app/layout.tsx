import type { Metadata } from 'next';
import { LanguageProvider } from '@/components/LanguageProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Courtside KH | Court Booking',
  description: 'Book pickleball and tennis courts, classes and coaching with Courtside KH.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
