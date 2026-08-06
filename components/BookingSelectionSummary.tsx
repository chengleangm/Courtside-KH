import type { SelectedBookingRange } from '@/components/CourtScheduleGrid';

interface BookingSelectionSummaryProps {
  selectedRange: SelectedBookingRange | null;
  service: string;
  currency: string;
}

function formatMoney(value: number, currency: string) {
  return currency === 'USD' ? `$${value.toFixed(2)}` : `${value.toFixed(2)} ${currency}`;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (!hours) return `${remainder} minutes`;
  if (!remainder) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainder} minutes`;
}

export default function BookingSelectionSummary({
  selectedRange,
  service,
  currency,
}: BookingSelectionSummaryProps) {
  if (!selectedRange) {
    return (
      <div className="selection-summary-empty">
        <p>Select a court and consecutive time blocks to see the full booking details.</p>
      </div>
    );
  }

  return (
    <div className="selection-summary-card">
      <div className="selection-summary-row">
        <span>Sport</span>
        <strong>{service === 'pickleball' ? 'Pickleball' : 'Tennis'}</strong>
      </div>
      <div className="selection-summary-row">
        <span>Court</span>
        <strong>{selectedRange.courtName}</strong>
      </div>
      <div className="selection-summary-row">
        <span>Time</span>
        <strong>
          {selectedRange.startTime}–{selectedRange.endTime}
        </strong>
      </div>
      <div className="selection-summary-row">
        <span>Blocks</span>
        <strong>
          {selectedRange.blockCount} {selectedRange.blockCount === 1 ? 'block' : 'blocks'}
        </strong>
      </div>
      <div className="selection-summary-row">
        <span>Duration</span>
        <strong>{formatDuration(selectedRange.durationMinutes)}</strong>
      </div>
      <div className="selection-summary-row summary-total">
        <span>Total</span>
        <strong>{formatMoney(selectedRange.totalPrice, currency)}</strong>
      </div>
    </div>
  );
}
