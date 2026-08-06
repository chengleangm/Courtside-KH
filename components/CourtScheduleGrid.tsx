'use client';

import { CheckIcon, ClockIcon, XIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';
import type { ServiceType } from '@/lib/types';
import { Fragment, useMemo } from 'react';

export interface CourtSchedule {
  id: string;
  name: string;
  service: ServiceType;
  environment?: 'indoor' | 'outdoor';
  surface?: string;
  lighting?: boolean;
  pricePerHour?: number;
  openingTime?: string;
  closingTime?: string;
  image?: string;
}
export interface BookingPeriod { courtId: string; startTime: string; endTime: string; }
export interface BlockedPeriodItem { courtId: string; startTime: string; endTime: string; label: string; }
export interface ScheduleSlotData {
  id: string; courtId: string; courtName: string; startTime: string; endTime: string; price: number;
  status: 'available' | 'booked' | 'blocked' | 'unavailable'; label: string;
}
export interface SelectedSlotItem { id: string; courtId: string; courtName: string; startTime: string; endTime: string; price: number; }
export interface SelectedBookingRange {
  courtId: string; courtName: string; date: string; selectedSlots: SelectedSlotItem[]; selectedSlotIds: string[];
  startTime: string; endTime: string; blockCount: number; durationMinutes: number; totalPrice: number;
}
interface Props {
  courts: CourtSchedule[]; timeSlots: { startTime: string; endTime: string }[]; scheduleItems: ScheduleSlotData[];
  selectedRange: SelectedBookingRange | null; formattedDate: string; selectionError?: string | null;
  selectionNotice?: string | null; allowedDurations: number[]; currency: string;
  onSlotClick: (court: CourtSchedule, slot: ScheduleSlotData) => void; onClearSelection: () => void;
}

function formatMoney(value: number, currency: string) { return currency === 'USD' ? `$${value.toFixed(2)}` : `${value.toFixed(2)} ${currency}`; }
function formatDuration(minutes: number, km: boolean) {
  const hours = Math.floor(minutes / 60); const remaining = minutes % 60;
  if (km) {
    if (!hours) return `${remaining} នាទី`;
    if (!remaining) return `${hours} ម៉ោង`;
    return `${hours} ម៉ោង ${remaining} នាទី`;
  }
  if (!hours) return `${remaining} minutes`;
  if (!remaining) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remaining} minutes`;
}

export default function CourtScheduleGrid({ courts, timeSlots, scheduleItems, selectedRange, formattedDate, selectionError, selectionNotice, allowedDurations, currency, onSlotClick, onClearSelection }: Props) {
  const { isKhmer } = useLanguage();
  const byId = useMemo(() => new Map(scheduleItems.map((item) => [item.id, item])), [scheduleItems]);
  const selectedIds = useMemo(() => new Set(selectedRange?.selectedSlotIds ?? []), [selectedRange]);
  const gridTemplateColumns = `var(--time-column-width) repeat(${courts.length}, var(--court-column-width))`;
  const durationIsAllowed = selectedRange ? allowedDurations.includes(selectedRange.durationMinutes) : false;
  const statusLabel = (item: ScheduleSlotData) => {
    if (!isKhmer) return item.label;
    if (item.status === 'booked') return 'បានកក់';
    if (item.status === 'unavailable') return 'មិនទំនេរ';
    if (item.status === 'available') return 'ទំនេរ';
    return item.label === 'Blocked' ? 'បានបិទ' : item.label;
  };

  return (
    <section className="schedule-section" aria-label={isKhmer ? 'តារាងពេលទំនេររបស់ទីលាន' : 'Court availability timetable'}>
      <div className="schedule-toolbar">
        <div>
          <p className="schedule-date"><ClockIcon size={15} />{isKhmer ? `ពេលទំនេរសម្រាប់ ${formattedDate}` : `Availability for ${formattedDate}`}</p>
          <p className="schedule-duration-help">
            {isKhmer ? 'ជ្រើសប្លុកម៉ោងជាប់គ្នានៅទីលានតែមួយ។ រយៈពេលអាចកក់៖ ' : 'Select consecutive blocks on one court. Available booking durations: '}
            {allowedDurations.map((v) => formatDuration(v, isKhmer)).join(', ')}.
          </p>
          <p className="mobile-swipe-hint">{isKhmer ? 'អូសទៅឆ្វេង ឬស្តាំ ដើម្បីមើលទីលានផ្សេងទៀត។' : 'Swipe horizontally to view more courts.'}</p>
        </div>
        {selectedRange && <button type="button" className="schedule-clear-button" onClick={onClearSelection}><XIcon size={16} />{isKhmer ? 'លុបការជ្រើសរើស' : 'Clear selection'}</button>}
      </div>

      <div className="schedule-scroll-wrapper">
        <div className="schedule-scroll" role="grid" aria-label={formattedDate}>
          <div className="schedule-header-row" style={{ gridTemplateColumns }} role="row">
            <div className="schedule-time-label schedule-header-label" role="columnheader">{isKhmer ? 'ម៉ោង' : 'Time'}</div>
            {courts.map((court) => <div key={court.id} className="schedule-court-header" role="columnheader">{court.image && <img className="schedule-court-thumb" src={court.image} alt="" />}<strong>{court.name}</strong><div className="schedule-court-meta">{court.environment && <span>{isKhmer ? (court.environment === 'indoor' ? 'ក្នុងអគារ' : 'ក្រៅអគារ') : court.environment}</span>}{court.surface && <span>{court.surface}</span>}{court.lighting !== undefined && <span>{isKhmer ? (court.lighting ? 'មានភ្លើង' : 'គ្មានភ្លើង') : (court.lighting ? 'Lighting' : 'No lighting')}</span>}</div></div>)}
          </div>
          <div className="schedule-grid" style={{ gridTemplateColumns }}>
            {timeSlots.map((timeSlot) => <Fragment key={timeSlot.startTime}>
              <div className="schedule-time-label" role="rowheader">{timeSlot.startTime}</div>
              {courts.map((court) => {
                const id = `${court.id}-${timeSlot.startTime}`; const item = byId.get(id);
                if (!item) return <button key={id} type="button" className="schedule-cell schedule-cell-unavailable" disabled><span className="schedule-cell-main">{isKhmer ? 'មិនទំនេរ' : 'Unavailable'}</span></button>;
                const isSelected = selectedIds.has(item.id); const index = selectedRange?.selectedSlotIds.indexOf(item.id) ?? -1; const count = selectedRange?.selectedSlotIds.length ?? 0;
                const position = isSelected ? (count === 1 ? 'schedule-cell-selected-only' : index === 0 ? 'schedule-cell-selected-first' : index === count - 1 ? 'schedule-cell-selected-last' : 'schedule-cell-selected-middle') : '';
                const cls = ['schedule-cell', `schedule-cell-${item.status}`, isSelected ? 'schedule-cell-selected' : '', position].filter(Boolean).join(' ');
                const label = statusLabel(item);
                return <button key={item.id} type="button" className={cls} disabled={item.status !== 'available' && !isSelected} aria-pressed={isSelected} aria-label={`${court.name} ${item.startTime}-${item.endTime}`} onClick={() => onSlotClick(court, item)}>
                  {isSelected && <span className="schedule-selected-icon" aria-hidden="true"><CheckIcon size={14} /></span>}
                  <span className="schedule-cell-main">{isSelected ? `${item.startTime}–${item.endTime}` : item.status === 'available' ? formatMoney(item.price, currency) : label}</span>
                  {isSelected ? <small>{isKhmer ? 'បានជ្រើស' : 'Selected'} · {formatMoney(item.price, currency)}</small> : item.status === 'available' ? <small>{isKhmer ? 'ទំនេរ' : 'Available'}</small> : null}
                </button>;
              })}
            </Fragment>)}
          </div>
        </div>
      </div>

      {selectionError && <div className="schedule-selection-error" role="alert" aria-live="polite">{selectionError}</div>}
      {selectionNotice && <div className="schedule-selection-notice" role="status" aria-live="polite">{selectionNotice}</div>}
      <div className={`schedule-selection-summary ${selectedRange ? 'has-selection' : ''}`}>
        {selectedRange ? <div><div className="schedule-selection-heading"><div><span className="schedule-selection-label">{isKhmer ? 'ការជ្រើសរើសរបស់អ្នក' : 'Your selection'}</span><strong>{selectedRange.courtName}</strong></div><span className="schedule-block-count">{selectedRange.blockCount} {isKhmer ? 'ប្លុក' : selectedRange.blockCount === 1 ? 'block' : 'blocks'}</span></div>
          <div className="schedule-selection-details"><div><span>{isKhmer ? 'ថ្ងៃ' : 'Date'}</span><strong>{formattedDate}</strong></div><div><span>{isKhmer ? 'ម៉ោង' : 'Time'}</span><strong>{selectedRange.startTime}–{selectedRange.endTime}</strong></div><div><span>{isKhmer ? 'រយៈពេល' : 'Duration'}</span><strong>{formatDuration(selectedRange.durationMinutes, isKhmer)}</strong></div><div><span>{isKhmer ? 'សរុប' : 'Total'}</span><strong>{formatMoney(selectedRange.totalPrice, currency)}</strong></div></div>
          {!durationIsAllowed && <p className="schedule-duration-warning" role="status">{isKhmer ? 'សូមបន្តជ្រើសប្លុកម៉ោងជាប់គ្នារហូតដល់ត្រូវនឹងរយៈពេលអាចកក់។' : 'Keep selecting a consecutive block until the duration matches an available booking length.'}</p>}
        </div> : <div className="schedule-selection-empty">{isKhmer ? 'ជ្រើសម៉ោងទំនេរមួយ ដើម្បីចាប់ផ្តើមការកក់។' : 'Select an available time to start your booking.'}</div>}
      </div>
    </section>
  );
}
