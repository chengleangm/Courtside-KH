'use client';

import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';
import CourtScheduleGrid, {
  type BlockedPeriodItem,
  type BookingPeriod,
  type CourtSchedule,
  type ScheduleSlotData,
  type SelectedBookingRange,
} from '@/components/CourtScheduleGrid';
import { minutesToTime, periodsOverlap, timeToMinutes } from '@/lib/time';
import type { Booking, ServiceType } from '@/lib/types';
import { readJsonResponse } from '@/lib/safe-response';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type BookingFormProps = {
  requestedCourtId?: string;
};

interface Slot {
  startTime: string;
  endTime: string;
  courtId: string;
  courtName: string;
}

interface AvailabilityResponse {
  slots: Slot[];
  allowedDurations: number[];
  pricePerHour: number;
  slotMinutes: number;
  currency: string;
  courts: CourtSchedule[];
  timeLabels: string[];
  bookings: BookingPeriod[];
  blockedPeriods: BlockedPeriodItem[];
}

function dateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatSelectedDate(value: string, locale = 'en-GB') {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parseDateKey(value));
}

type SelectedSlotItem = {
  id: string;
  courtId: string;
  courtName: string;
  startTime: string;
  endTime: string;
  price: number;
};

type SelectedBookingRangeData = SelectedBookingRange;

function formatDuration(minutes: number, km = false) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (km) {
    if (hours === 0) return `${remainingMinutes} នាទី`;
    if (remainingMinutes === 0) return `${hours} ម៉ោង`;
    return `${hours} ម៉ោង ${remainingMinutes} នាទី`;
  }
  if (hours === 0) return `${remainingMinutes} minutes`;
  if (remainingMinutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} minutes`;
}

function calculateBookingRange(selectedSlots: SelectedSlotItem[]) {
  const sortedSlots = [...selectedSlots].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

  const totalPrice = Number(sortedSlots.reduce((sum, slot) => sum + slot.price, 0).toFixed(2));
  const durationMinutes = sortedSlots.reduce(
    (total, slot) => total + (timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime)),
    0,
  );

  return {
    selectedSlots: sortedSlots,
    selectedSlotIds: sortedSlots.map((slot) => slot.id),
    startTime: sortedSlots[0].startTime,
    endTime: sortedSlots[sortedSlots.length - 1].endTime,
    blockCount: sortedSlots.length,
    durationMinutes,
    totalPrice,
  };
}

function selectInitialSlot(
  court: CourtSchedule,
  slot: SelectedSlotItem,
  date: string,
): SelectedBookingRangeData {
  return {
    courtId: court.id,
    courtName: court.name,
    date,
    ...calculateBookingRange([slot]),
  };
}

function extendSelectionForward(range: SelectedBookingRangeData, slot: SelectedSlotItem) {
  return {
    ...range,
    ...calculateBookingRange([...range.selectedSlots, slot]),
  };
}

function extendSelectionBackward(range: SelectedBookingRangeData, slot: SelectedSlotItem) {
  return {
    ...range,
    ...calculateBookingRange([slot, ...range.selectedSlots]),
  };
}

function removeFirstSelectedSlot(range: SelectedBookingRangeData) {
  if (range.selectedSlots.length <= 1) return null;
  return {
    ...range,
    ...calculateBookingRange(range.selectedSlots.slice(1)),
  };
}

function removeLastSelectedSlot(range: SelectedBookingRangeData) {
  if (range.selectedSlots.length <= 1) return null;
  return {
    ...range,
    ...calculateBookingRange(range.selectedSlots.slice(0, -1)),
  };
}

function isNextConsecutiveSlot(range: SelectedBookingRangeData, slot: SelectedSlotItem) {
  return (
    range.courtId === slot.courtId && timeToMinutes(slot.startTime) === timeToMinutes(range.endTime)
  );
}

function isPreviousConsecutiveSlot(range: SelectedBookingRangeData, slot: SelectedSlotItem) {
  return (
    range.courtId === slot.courtId && timeToMinutes(slot.endTime) === timeToMinutes(range.startTime)
  );
}

const today = dateKey(new Date());

export default function BookingForm({ requestedCourtId }: BookingFormProps) {
  const router = useRouter();
  const { isKhmer, locale } = useLanguage();
  const [service, setService] = useState<ServiceType>('pickleball');
  const [date, setDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const current = parseDateKey(today);
    return new Date(current.getFullYear(), current.getMonth(), 1);
  });
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [selectedRange, setSelectedRange] = useState<SelectedBookingRange | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [selectionNotice, setSelectionNotice] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');


  useEffect(() => {
    if (!requestedCourtId) return;

    let active = true;

    fetch('/api/settings')
      .then(async (response) => {
        const body = await readJsonResponse<{ error?: string; courts?: Array<{ id: string; name?: string; service: ServiceType }> }>(
          response,
          'Unable to load court settings.',
        );

        if (!response.ok) {
          throw new Error(body.error || 'Unable to load court settings.');
        }

        return body;
      })
      .then((settings) => {
        const court = settings.courts?.find(
          (item: { id: string; name?: string; service: ServiceType }) =>
            item.id === requestedCourtId,
        );

        if (active && court) {
          setService(court.service);
          setSelectionNotice(
            isKhmer
              ? `កំពុងបង្ហាញម៉ោងសម្រាប់ ${court.name || requestedCourtId}`
              : `Showing availability for ${court.name || requestedCourtId}`,
          );
        }
      })
      .catch((requestError: unknown) => {
        console.error('Unable to load requested court:', requestError);
      });

    return () => {
      active = false;
    };
  }, [requestedCourtId, isKhmer]);

  useEffect(() => {
    let active = true;

    const availabilityParams = new URLSearchParams({
      service,
      date,
    });

    fetch(`/api/availability?${availabilityParams.toString()}`)
      .then(async (response) => {
        const body = await readJsonResponse<AvailabilityResponse & { error?: string }>(
          response,
          'Unable to load availability.',
        );

        if (!response.ok) {
          throw new Error(body.error || 'Unable to load availability.');
        }

        if (active) {
          setAvailability(body);
        }
      })
      .catch((requestError: unknown) => {
        if (!active) return;

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load availability',
        );
      })
      .finally(() => {
        if (active) {
          setLoadingSlots(false);
        }
      });

    return () => {
      active = false;
    };
  }, [service, date]);

  const timeSlots = useMemo(
    () =>
      availability
        ? availability.timeLabels.map((startTime) => ({
            startTime,
            endTime: minutesToTime(timeToMinutes(startTime) + availability.slotMinutes),
          }))
        : [],
    [availability],
  );

  const scheduleItems = useMemo(() => {
    if (!availability) return [] as ScheduleSlotData[];

    const availableStarts = new Set(
      availability.slots.map((item) => `${item.courtId}|${item.startTime}`),
    );

    return availability.timeLabels.flatMap((startTime) => {
      const endTime = minutesToTime(timeToMinutes(startTime) + availability.slotMinutes);

      return availability.courts.map((court) => {
        const id = `${court.id}-${startTime}`;
        const isAvailable = availableStarts.has(`${court.id}|${startTime}`);
        const blockedItem = availability.blockedPeriods.find(
          (item) =>
            item.courtId === court.id &&
            periodsOverlap(startTime, endTime, item.startTime, item.endTime),
        );
        const isBooked = availability.bookings.some(
          (item) =>
            item.courtId === court.id &&
            periodsOverlap(startTime, endTime, item.startTime, item.endTime),
        );

        const status: ScheduleSlotData['status'] = isBooked
          ? 'booked'
          : blockedItem
            ? 'blocked'
            : isAvailable
              ? 'available'
              : 'unavailable';

        const label =
          status === 'booked'
            ? 'Booked'
            : status === 'blocked'
              ? (blockedItem?.label ?? 'Blocked')
              : status === 'available'
                ? 'Available'
                : 'Unavailable';

        return {
          id,
          courtId: court.id,
          courtName: court.name,
          startTime,
          endTime,
          price: Number(
            (((court.pricePerHour ?? availability.pricePerHour) * availability.slotMinutes) / 60).toFixed(2),
          ),
          status,
          label,
        } as ScheduleSlotData;
      });
    });
  }, [availability]);

  const prepareAvailabilityChange = () => {
    setLoadingSlots(true);
    setAvailability(null);
    setSelectedRange(null);
    setSelectionError(null);
    setSelectionNotice(null);
    setError('');
  };

  const changeService = (nextService: ServiceType) => {
    if (nextService === service) return;
    prepareAvailabilityChange();
    setService(nextService);
  };

  const clearSelection = () => {
    setSelectedRange(null);
    setSelectionError(null);
    setSelectionNotice(null);
  };

  const handleSlotClick = (court: CourtSchedule, slotData: ScheduleSlotData) => {
    if (slotData.status !== 'available' && !selectedRange?.selectedSlotIds.includes(slotData.id)) {
      return;
    }

    setSelectionError(null);
    setSelectionNotice(null);

    const slotItem: SelectedSlotItem = {
      id: slotData.id,
      courtId: court.id,
      courtName: court.name,
      startTime: slotData.startTime,
      endTime: slotData.endTime,
      price: slotData.price,
    };

    if (!selectedRange) {
      setSelectedRange(selectInitialSlot(court, slotItem, date));
      return;
    }

    if (selectedRange.courtId !== court.id) {
      setSelectedRange(selectInitialSlot(court, slotItem, date));
      setSelectionNotice(isKhmer ? `ការជ្រើសរើសរបស់អ្នកត្រូវបានប្ដូរទៅ ${court.name}។` : `Your selection was moved to ${court.name}.`);
      return;
    }

    const selectedIndex = selectedRange.selectedSlotIds.indexOf(slotItem.id);
    const isSelected = selectedIndex !== -1;

    if (isSelected) {
      if (selectedRange.selectedSlotIds.length === 1) {
        clearSelection();
        return;
      }
      if (selectedIndex === 0) {
        const nextRange = removeFirstSelectedSlot(selectedRange);
        if (!nextRange) {
          clearSelection();
          return;
        }
        setSelectedRange(nextRange);
        return;
      }
      if (selectedIndex === selectedRange.selectedSlotIds.length - 1) {
        const nextRange = removeLastSelectedSlot(selectedRange);
        if (!nextRange) {
          clearSelection();
          return;
        }
        setSelectedRange(nextRange);
        return;
      }
      setSelectionError(isKhmer ? 'អ្នកអាចដកបានតែម៉ោងដំបូង ឬចុងក្រោយប៉ុណ្ណោះ។' : 'You can only remove the first or last selected time.');
      return;
    }

    if (isNextConsecutiveSlot(selectedRange, slotItem)) {
      setSelectedRange(extendSelectionForward(selectedRange, slotItem));
      return;
    }

    if (isPreviousConsecutiveSlot(selectedRange, slotItem)) {
      setSelectedRange(extendSelectionBackward(selectedRange, slotItem));
      return;
    }

    setSelectionError(isKhmer ? 'សូមជ្រើសម៉ោងទំនេរដែលជាប់គ្នាបន្ទាប់។' : 'Please select the next consecutive available time.');
  };

  const selectedDurationMinutes = selectedRange?.durationMinutes ?? 0;
  const durationIsAllowed = availability
    ? availability.allowedDurations.includes(selectedDurationMinutes)
    : false;

  const formatMoney = (value: number) =>
    availability?.currency === 'USD'
      ? `$${value.toFixed(2)}`
      : `${value.toFixed(2)} ${availability?.currency ?? ''}`.trim();

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      return {
        date: day,
        key: dateKey(day),
        outsideMonth: day.getMonth() !== month,
      };
    });
  }, [visibleMonth]);

  function changeMonth(amount: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  function selectDate(nextDate: string) {
    if (nextDate < today) return;
    if (nextDate !== date) {
      prepareAvailabilityChange();
      setDate(nextDate);
    }
    const selected = parseDateKey(nextDate);
    setVisibleMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }

  function returnToToday() {
    selectDate(today);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRange) {
      setError(isKhmer ? 'សូមជ្រើសទីលាន និងម៉ោងទំនេរ។' : 'Please select an available court and time.');
      return;
    }
    if (!availability?.allowedDurations.includes(selectedRange.durationMinutes)) {
      setError(isKhmer ? 'សូមជ្រើសរយៈពេលកក់ដែលបានអនុញ្ញាត។' : 'Please select one of the available booking durations before continuing.');
      return;
    }

    const selectedDuration = selectedRange.durationMinutes;
    setSubmitting(true);
    setError('');
    const formData = new FormData(event.currentTarget);
    const payload = {
      service,
      date,
      durationMinutes: selectedDuration,
      courtId: selectedRange.courtId,
      startTime: selectedRange.startTime,
      endTime: selectedRange.endTime,
      selectedSlotIds: selectedRange.selectedSlotIds,
      blockCount: selectedRange.blockCount,
      totalPrice: selectedRange.totalPrice,
      customerName: formData.get('customerName'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      notes: formData.get('notes'),
    };

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await readJsonResponse<{ booking?: Booking; error?: string }>(
        response,
        'Booking could not be submitted.',
      );
      if (!response.ok || !body.booking) {
        throw new Error(body.error || 'Booking could not be submitted.');
      }

      try {
        window.sessionStorage.setItem(
          `courtside-booking-${body.booking.id}`,
          JSON.stringify(body.booking),
        );
      } catch {
        // The confirmation page can still try the server store when storage is unavailable.
      }

      router.push(`/confirmation/${encodeURIComponent(body.booking.id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  return (
    <form className="booking-layout" onSubmit={submit}>
      <div className="booking-main">
        <section className="form-card">
          <span className="step-label">{isKhmer ? 'ជំហាន 1' : 'Step 1'}</span>
          <h2>{isKhmer ? 'ជ្រើសរើសកីឡា' : 'Choose your game'}</h2>
          <div className="service-toggle">
            <button
              type="button"
              className={service === 'pickleball' ? 'active' : ''}
              onClick={() => changeService('pickleball')}
            >
              Pickleball
            </button>
            <button
              type="button"
              className={service === 'tennis' ? 'active' : ''}
              onClick={() => changeService('tennis')}
            >
              Tennis
            </button>
          </div>
        </section>

        <section className="form-card">
          <span className="step-label">{isKhmer ? 'ជំហាន 2' : 'Step 2'}</span>
          <div className="calendar-heading">
            <div>
              <h2>{isKhmer ? 'ជ្រើសរើសថ្ងៃ' : 'Select a date'}</h2>
              <p>{isKhmer ? 'ជ្រើសថ្ងៃដែលអាចកក់បានពីប្រតិទិន។' : 'Choose an available day from the calendar.'}</p>
            </div>
            <button type="button" className="calendar-today" onClick={returnToToday}>
              {isKhmer ? 'ថ្ងៃនេះ' : 'Today'}
            </button>
          </div>

          <div className="booking-calendar" aria-label="Booking date calendar">
            <div className="calendar-toolbar">
              <button
                type="button"
                className="calendar-nav"
                aria-label={isKhmer ? 'ខែមុន' : 'Previous month'}
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeftIcon size={18} />
              </button>
              <strong>
                {new Intl.DateTimeFormat(locale, {
                  month: 'long',
                  year: 'numeric',
                }).format(visibleMonth)}
              </strong>
              <button
                type="button"
                className="calendar-nav"
                aria-label={isKhmer ? 'ខែបន្ទាប់' : 'Next month'}
                onClick={() => changeMonth(1)}
              >
                <ChevronRightIcon size={18} />
              </button>
            </div>

            <div className="calendar-weekdays" aria-hidden="true">
              {(isKhmer ? ['អា', 'ច', 'អ', 'ពុ', 'ព្រ', 'សុ', 'ស'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="calendar-grid">
              {calendarDays.map((item) => {
                const isPast = item.key < today;
                const isSelected = item.key === date;
                const isToday = item.key === today;
                const classNames = [
                  'calendar-day',
                  item.outsideMonth ? 'outside' : '',
                  isSelected ? 'selected' : '',
                  isToday ? 'today' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <button
                    type="button"
                    key={item.key}
                    className={classNames}
                    disabled={isPast}
                    aria-pressed={isSelected}
                    aria-label={formatSelectedDate(item.key, locale)}
                    onClick={() => selectDate(item.key)}
                  >
                    <span>{item.date.getDate()}</span>
                    {isToday && <small>{isKhmer ? 'ថ្ងៃនេះ' : 'Today'}</small>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="date-selection-bar">
            <div className="selected-date-copy">
              <span><CalendarIcon size={14} /> {isKhmer ? 'ថ្ងៃដែលបានជ្រើស' : 'Selected date'}</span>
              <strong>{formatSelectedDate(date, locale)}</strong>
            </div>
          </div>
        </section>

        <section className="form-card">
          <span className="step-label">{isKhmer ? 'ជំហាន 3' : 'Step 3'}</span>
          <h2>{isKhmer ? 'ជ្រើសទីលាន និងម៉ោង' : 'Select a court and time'}</h2>
          <p className="section-helper">{isKhmer ? 'ពេលទំនេរសម្រាប់' : 'Availability for'} {formatSelectedDate(date, locale)}</p>
          {loadingSlots ? (
            <div className="empty-state">{isKhmer ? 'កំពុងពិនិត្យពេលទំនេរ…' : 'Checking live availability…'}</div>
          ) : !availability || availability.courts.length === 0 ? (
            <div className="empty-state">{isKhmer ? 'មិនមានទីលានសម្រាប់កីឡានេះទេ។' : 'No available courts are configured for this sport.'}</div>
          ) : timeSlots.length === 0 ? (
            <div className="empty-state">{isKhmer ? 'មិនមានតារាងពេលវេលាសម្រាប់ថ្ងៃនេះទេ។' : 'No timetable is configured for this date.'}</div>
          ) : (
            <CourtScheduleGrid
              courts={availability.courts}
              timeSlots={timeSlots}
              scheduleItems={scheduleItems}
              selectedRange={selectedRange}
              formattedDate={formatSelectedDate(date, locale)}
              selectionError={selectionError}
              selectionNotice={selectionNotice}
              allowedDurations={availability.allowedDurations}
              currency={availability.currency}
              onSlotClick={handleSlotClick}
              onClearSelection={clearSelection}
            />
          )}
        </section>

        <section className="form-card">
          <span className="step-label">{isKhmer ? 'ជំហាន 4' : 'Step 4'}</span>
          <h2>{isKhmer ? 'ព័ត៌មានរបស់អ្នក' : 'Your details'}</h2>
          <div className="form-grid two">
            <label>
              {isKhmer ? 'ឈ្មោះពេញ' : 'Full name'}
              <input
                name="customerName"
                placeholder={isKhmer ? 'ឈ្មោះរបស់អ្នក' : 'Your name'}
                required
                suppressHydrationWarning
              />
            </label>
            <label>
              {isKhmer ? 'លេខទូរស័ព្ទ' : 'Phone number'}
              <input
                name="phone"
                type="tel"
                placeholder="+855..."
                required
                suppressHydrationWarning
              />
            </label>
            <label>
              {isKhmer ? 'អ៊ីមែល' : 'Email address'}
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                suppressHydrationWarning
              />
            </label>
            <label>
              {isKhmer ? 'កំណត់ចំណាំ' : 'Special notes'}
              <input name="notes" placeholder={isKhmer ? 'មិនចាំបាច់' : 'Optional'} suppressHydrationWarning />
            </label>
          </div>
        </section>
      </div>

      <aside className="booking-summary">
        <span className="eyebrow">{isKhmer ? 'សង្ខេបការកក់' : 'Booking summary'}</span>
        <h2>{service === 'pickleball' ? 'Pickleball' : 'Tennis'} {isKhmer ? 'ទីលាន' : 'court'}</h2>
        <dl>
          <div>
            <dt>{isKhmer ? 'ថ្ងៃ' : 'Date'}</dt>
            <dd>{formatSelectedDate(date, locale)}</dd>
          </div>
          <div>
            <dt>{isKhmer ? 'ទីលាន' : 'Court'}</dt>
            <dd>{selectedRange?.courtName ?? (isKhmer ? 'ជ្រើសទីលាន' : 'Select a court')}</dd>
          </div>
          <div>
            <dt>{isKhmer ? 'ម៉ោង' : 'Time'}</dt>
            <dd>
              {selectedRange
                ? `${selectedRange.startTime}–${selectedRange.endTime}`
                : (isKhmer ? 'ជ្រើសម៉ោង' : 'Select a time')}
            </dd>
          </div>
          <div>
            <dt>{isKhmer ? 'ប្លុក' : 'Blocks'}</dt>
            <dd>
              {selectedRange
                ? `${selectedRange.blockCount} ${
                    isKhmer ? 'ប្លុក' : selectedRange.blockCount === 1 ? 'block' : 'blocks'
                  }`
                : '—'}
            </dd>
          </div>
          <div>
            <dt>{isKhmer ? 'រយៈពេល' : 'Duration'}</dt>
            <dd>{selectedRange ? formatDuration(selectedRange.durationMinutes, isKhmer) : '—'}</dd>
          </div>
          <div className="summary-total">
            <dt>{isKhmer ? 'សរុប' : 'Total'}</dt>
            <dd>{selectedRange ? formatMoney(selectedRange.totalPrice) : formatMoney(0)}</dd>
          </div>
        </dl>
        <p className="payment-note">
          {isKhmer ? 'មិនបង់ប្រាក់អនឡាញ។ បង់នៅទីតាំង ឬតាមការណែនាំរបស់ក្រុមការងារ។' : 'No online payment. Pay at the venue or follow the team’s instructions.'}
        </p>
        {error && <p className="form-error">{error}</p>}
        <button
          className="button button-full"
          disabled={submitting || !selectedRange || !durationIsAllowed}
        >
          {submitting ? (isKhmer ? 'កំពុងផ្ញើ…' : 'Submitting…') : (isKhmer ? 'បញ្ជាក់ការកក់' : 'Confirm booking')}
        </button>
      </aside>
    </form>
  );
}
