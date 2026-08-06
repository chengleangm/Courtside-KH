'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckIcon, DownloadIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';
import type { Booking } from '@/lib/types';

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function durationText(minutes: number, km: boolean) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (km) {
    return `${hours ? `${hours} ម៉ោង` : ''}${hours && remainingMinutes ? ' ' : ''}${remainingMinutes ? `${remainingMinutes} នាទី` : ''}`;
  }
  if (!hours) return `${remainingMinutes} minutes`;
  if (!remainingMinutes) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} minutes`;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.lineTo(x + width - safeRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  context.lineTo(x + width, y + height - safeRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  context.lineTo(x + safeRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  context.lineTo(x, y + safeRadius);
  context.quadraticCurveTo(x, y, x + safeRadius, y);
  context.closePath();
}

function wrapCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines: string[] = [];
  let line = words[0];
  for (let index = 1; index < words.length; index += 1) {
    const candidate = `${line} ${words[index]}`;
    if (context.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      lines.push(line);
      line = words[index];
    }
  }
  lines.push(line);
  return lines;
}

function drawField(
  context: CanvasRenderingContext2D,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  fontFamily: string,
) {
  context.fillStyle = '#66736f';
  context.font = `700 21px ${fontFamily}`;
  context.fillText(label.toUpperCase(), x, y);
  context.fillStyle = '#10231f';
  context.font = `700 31px ${fontFamily}`;
  const lines = wrapCanvasText(context, value, width);
  lines.slice(0, 2).forEach((line, index) => context.fillText(line, x, y + 43 + index * 36));
}

async function createTicketImage(
  booking: Booking,
  options: {
    isKhmer: boolean;
    formattedDate: string;
    status: string;
  },
) {
  const { isKhmer, formattedDate, status } = options;
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1600;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not supported in this browser.');

  await document.fonts?.ready;
  const fontFamily = isKhmer
    ? '"Noto Sans Khmer", "Khmer OS System", Arial, sans-serif'
    : 'Arial, Helvetica, sans-serif';

  context.fillStyle = '#f5f3ea';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.save();
  context.shadowColor = 'rgba(16, 35, 31, 0.14)';
  context.shadowBlur = 38;
  context.shadowOffsetY = 18;
  roundedRect(context, 60, 55, 960, 1490, 42);
  context.fillStyle = '#ffffff';
  context.fill();
  context.restore();

  roundedRect(context, 60, 55, 960, 350, 42);
  context.fillStyle = '#173e34';
  context.fill();

  context.beginPath();
  context.arc(145, 145, 48, 0, Math.PI * 2);
  context.fillStyle = '#d7ff47';
  context.fill();
  context.strokeStyle = '#10231f';
  context.lineWidth = 4;
  context.stroke();
  context.fillStyle = '#173e34';
  context.font = `900 43px ${fontFamily}`;
  context.textAlign = 'center';
  context.fillText('C', 145, 160);
  context.textAlign = 'left';

  context.fillStyle = '#ffffff';
  context.font = `800 30px ${fontFamily}`;
  context.fillText('COURTSIDE KH', 220, 132);
  context.fillStyle = '#b9cbc5';
  context.font = `700 20px ${fontFamily}`;
  context.fillText(isKhmer ? 'សំបុត្រកក់ទីលាន' : 'COURT BOOKING TICKET', 220, 170);

  context.fillStyle = '#b9cbc5';
  context.font = `700 19px ${fontFamily}`;
  context.fillText(isKhmer ? 'លេខយោងការកក់' : 'BOOKING REFERENCE', 110, 255);
  context.fillStyle = '#ffffff';
  context.font = `900 54px ${fontFamily}`;
  context.fillText(booking.reference, 110, 320);

  roundedRect(context, 795, 245, 165, 58, 29);
  context.fillStyle = '#d7ff47';
  context.fill();
  context.fillStyle = '#173e34';
  context.font = `800 19px ${fontFamily}`;
  context.textAlign = 'center';
  context.fillText(status.toUpperCase(), 877, 281);
  context.textAlign = 'left';

  context.fillStyle = '#10231f';
  context.font = `900 39px ${fontFamily}`;
  context.fillText(isKhmer ? 'ព័ត៌មានការកក់' : 'Booking details', 105, 475);

  roundedRect(context, 95, 520, 890, 190, 26);
  context.fillStyle = '#f3f6f4';
  context.fill();
  drawField(context, isKhmer ? 'អតិថិជន' : 'Customer', booking.customerName, 130, 570, 360, fontFamily);
  drawField(context, isKhmer ? 'ទូរស័ព្ទ' : 'Phone', booking.phone, 565, 570, 350, fontFamily);

  context.strokeStyle = '#dfe5df';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(540, 545);
  context.lineTo(540, 682);
  context.stroke();

  const leftX = 110;
  const rightX = 565;
  const fieldWidth = 380;
  drawField(context, isKhmer ? 'ទីលាន' : 'Court', booking.courtName, leftX, 790, fieldWidth, fontFamily);
  drawField(context, isKhmer ? 'កីឡា' : 'Sport', booking.service === 'pickleball' ? 'Pickleball' : 'Tennis', rightX, 790, fieldWidth, fontFamily);
  drawField(context, isKhmer ? 'ថ្ងៃ' : 'Date', formattedDate, leftX, 920, fieldWidth, fontFamily);
  drawField(context, isKhmer ? 'ម៉ោង' : 'Time', `${booking.startTime} – ${booking.endTime}`, rightX, 920, fieldWidth, fontFamily);
  drawField(context, isKhmer ? 'រយៈពេល' : 'Duration', durationText(booking.durationMinutes, isKhmer), leftX, 1050, fieldWidth, fontFamily);
  const resolvedBlockCount = booking.blockCount ?? Math.max(1, Math.round(booking.durationMinutes / 60));
  drawField(
    context,
    isKhmer ? 'ប្លុកបានជ្រើស' : 'Selected blocks',
    `${resolvedBlockCount} ${isKhmer ? 'ប្លុក' : resolvedBlockCount === 1 ? 'block' : 'blocks'}`,
    rightX,
    1050,
    fieldWidth,
    fontFamily,
  );

  roundedRect(context, 95, 1175, 890, 135, 26);
  context.fillStyle = '#173e34';
  context.fill();
  context.fillStyle = '#b9cbc5';
  context.font = `700 21px ${fontFamily}`;
  context.fillText(isKhmer ? 'តម្លៃត្រូវបង់នៅទីតាំង' : 'AMOUNT DUE AT VENUE', 135, 1228);
  context.fillStyle = '#d7ff47';
  context.font = `900 54px ${fontFamily}`;
  context.textAlign = 'right';
  context.fillText(`$${booking.price.toFixed(2)}`, 945, 1265);
  context.textAlign = 'left';

  roundedRect(context, 95, 1340, 890, 120, 24);
  context.fillStyle = '#eef5f1';
  context.fill();
  context.fillStyle = '#173e34';
  context.font = `800 23px ${fontFamily}`;
  context.fillText(isKhmer ? 'ពេលមកដល់ទីតាំង' : 'WHEN YOU ARRIVE', 130, 1385);
  context.fillStyle = '#52645e';
  context.font = `500 21px ${fontFamily}`;
  const instruction = isKhmer
    ? 'បង្ហាញលេខយោងនេះនៅ Reception ដើម្បី Check-in និងបង់ប្រាក់តាម POS។'
    : 'Show this ticket at reception to check in and complete venue payment through the POS.';
  wrapCanvasText(context, instruction, 800).slice(0, 2).forEach((line, index) => {
    context.fillText(line, 130, 1425 + index * 28);
  });

  context.fillStyle = '#66736f';
  context.font = `600 18px ${fontFamily}`;
  context.textAlign = 'center';
  context.fillText(
    isKhmer ? 'មិនទាន់មានការបង់ប្រាក់អនឡាញទេ។' : 'No online payment has been collected.',
    540,
    1512,
  );
  context.textAlign = 'left';

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Unable to create the ticket image.'));
    }, 'image/png', 1);
  });
}

export default function ConfirmationContent({ booking }: { booking: Booking }) {
  const { isKhmer, locale } = useLanguage();
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const status = isKhmer
    ? ({ pending: 'រង់ចាំ', confirmed: 'បានបញ្ជាក់', completed: 'បានបញ្ចប់', cancelled: 'បានបោះបង់' }[booking.status])
    : booking.status;
  const formattedDate = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(parseDate(booking.date));

  async function saveTicketImage() {
    setExporting(true);
    setExportMessage('');
    try {
      const blob = await createTicketImage(booking, { isKhmer, formattedDate, status });
      const fileName = `courtside-kh-${booking.reference}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });
      const canShareFile = typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

      if (canShareFile) {
        await navigator.share({
          files: [file],
          title: `Courtside KH ${booking.reference}`,
          text: isKhmer ? 'សំបុត្រកក់ទីលាន Courtside KH' : 'My Courtside KH booking ticket',
        });
        setExportMessage(isKhmer ? 'សំបុត្ររួចរាល់សម្រាប់រក្សាទុក។' : 'Your ticket is ready to save or share.');
      } else {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
        setExportMessage(isKhmer ? 'បានទាញយកសំបុត្រជារូបភាព។' : 'Ticket image downloaded.');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setExportMessage(isKhmer ? 'មិនអាចបង្កើតរូបភាពសំបុត្របានទេ។ សូមព្យាយាមម្តងទៀត។' : 'The ticket image could not be created. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="confirmation-card">
      <span className="success-icon" aria-hidden="true"><CheckIcon size={30} /></span>
      <span className="eyebrow">{isKhmer ? 'បានទទួលការកក់' : 'Booking received'}</span>
      <h1>{isKhmer ? 'ជួបគ្នានៅទីលាន។' : 'See you on court.'}</h1>
      <p>{isKhmer ? 'ការកក់របស់អ្នកត្រូវបានផ្ញើ។ សូមរក្សាលេខយោងខាងក្រោម ហើយរង់ចាំការបញ្ជាក់ពីក្រុម Courtside KH។' : 'Your booking has been submitted. Keep the reference below and wait for the Courtside KH team’s confirmation.'}</p>

      <div className="reference-box">
        <span>{isKhmer ? 'លេខយោងការកក់' : 'Booking reference'}</span>
        <strong>{booking.reference}</strong>
      </div>

      <dl className="confirmation-details">
        <div><dt>{isKhmer ? 'អតិថិជន' : 'Customer'}</dt><dd>{booking.customerName}</dd></div>
        <div><dt>{isKhmer ? 'កីឡា' : 'Sport'}</dt><dd>{booking.service === 'pickleball' ? 'Pickleball' : 'Tennis'}</dd></div>
        <div><dt>{isKhmer ? 'ទីលាន' : 'Court'}</dt><dd>{booking.courtName}</dd></div>
        <div><dt>{isKhmer ? 'ថ្ងៃ' : 'Date'}</dt><dd>{formattedDate}</dd></div>
        <div><dt>{isKhmer ? 'ម៉ោង' : 'Time'}</dt><dd>{booking.startTime} – {booking.endTime}</dd></div>
        {booking.blockCount && <div><dt>{isKhmer ? 'ប្លុកបានជ្រើស' : 'Selected blocks'}</dt><dd>{booking.blockCount} {isKhmer ? 'ប្លុក' : booking.blockCount === 1 ? 'block' : 'blocks'}</dd></div>}
        <div><dt>{isKhmer ? 'រយៈពេល' : 'Duration'}</dt><dd>{durationText(booking.durationMinutes, isKhmer)}</dd></div>
        <div><dt>{isKhmer ? 'តម្លៃត្រូវបង់នៅទីតាំង' : 'Amount due at venue'}</dt><dd>${booking.price.toFixed(2)}</dd></div>
        <div><dt>{isKhmer ? 'ស្ថានភាព' : 'Status'}</dt><dd><span className={`status status-${booking.status}`}>{status}</span></dd></div>
      </dl>

      <div className="checkin-instruction">
        <strong>{isKhmer ? 'ពេលមកដល់ទីតាំង' : 'When you arrive'}</strong>
        <p>{isKhmer ? 'សូមបង្ហាញលេខយោងនេះនៅ Reception ដើម្បី Check-in។ ក្រុមការងារនឹងកត់ត្រាការបង់ប្រាក់តាម POS មុនពេលអ្នកចូលទីលាន។' : 'Show this reference at reception to check in. The team will record your venue payment through the POS before you enter the court.'}</p>
      </div>

      <section className="ticket-export-panel" aria-labelledby="ticket-export-title">
        <div>
          <span className="eyebrow">{isKhmer ? 'សំបុត្រឌីជីថល' : 'Digital ticket'}</span>
          <strong id="ticket-export-title">{isKhmer ? 'រក្សាទុកសំបុត្រជារូបភាព' : 'Save your ticket as an image'}</strong>
          <p>{isKhmer ? 'រក្សាទុកក្នុងទូរស័ព្ទ ហើយបង្ហាញនៅ Reception ពេល Check-in។' : 'Keep it on your phone and show it at reception when you check in.'}</p>
        </div>
        <button type="button" className="button button-dark ticket-download-button" onClick={saveTicketImage} disabled={exporting}>
          <DownloadIcon size={18} />
          {exporting
            ? (isKhmer ? 'កំពុងបង្កើត…' : 'Creating image…')
            : (isKhmer ? 'រក្សាទុករូបភាព' : 'Save ticket image')}
        </button>
      </section>
      <p className="ticket-export-status" role="status" aria-live="polite">{exportMessage}</p>

      <p className="payment-note">{isKhmer ? 'មិនទាន់មានការបង់ប្រាក់អនឡាញទេ។' : 'No online payment has been collected.'}</p>
      <div className="confirmation-actions">
        <Link href="/" className="button button-secondary">{isKhmer ? 'ត្រឡប់ទៅទំព័រដើម' : 'Back home'}</Link>
        <Link href="/book" className="button">{isKhmer ? 'កក់ទីលានផ្សេងទៀត' : 'Book another court'}</Link>
      </div>
    </div>
  );
}
