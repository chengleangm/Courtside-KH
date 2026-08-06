document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#booking-form');
  if (!form) return;

  const serviceButtons = [...document.querySelectorAll('[data-service]')];
  const slotsEl = document.querySelector('#slots');
  const errorEl = document.querySelector('#booking-error');
  const submit = document.querySelector('#booking-submit');
  const calendarGrid = document.querySelector('#calendar-grid');
  const calendarMonth = document.querySelector('#calendar-month');
  const selectedDateLabel = document.querySelector('#selected-date-label');
  const availabilityDate = document.querySelector('#availability-date');
  const previousMonth = document.querySelector('#calendar-previous');
  const nextMonth = document.querySelector('#calendar-next');
  const todayButton = document.querySelector('#calendar-today');

  const dateKey = (value) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateKey = (value) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const longDate = (value) =>
    new Intl.DateTimeFormat(CS.language()==='km'?'km-KH':'en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(parseDateKey(value));

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if(CS.language()==='km') return `${hours?`${hours} ម៉ោង`:''}${hours&&remainder?' ':''}${remainder?`${remainder} នាទី`:''}`;
    if (!hours) return `${remainder} minutes`;
    if (!remainder) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainder} minutes`;
  };

  const today = dateKey(new Date());
  let selectedDate = today;
  const firstDate = parseDateKey(today);
  let visibleMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
  let service = 'pickleball';
  let selectedRange = null;
  let selectionMessage = '';

  function rateForCourt(court, settings) {
    if (Number.isFinite(Number(court.pricePerHour))) return Number(court.pricePerHour);
    return service === 'pickleball' ? settings.pickleballPrice : settings.tennisPrice;
  }

  function blockId(courtId, startTime) {
    return `${courtId}-${startTime}`;
  }

  function renderCalendar() {
    calendarMonth.textContent = new Intl.DateTimeFormat(CS.language()==='km'?'km-KH':'en-GB', {
      month: 'long',
      year: 'numeric'
    }).format(visibleMonth);

    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const gridStart = new Date(year, month, 1 - firstOfMonth.getDay());
    const buttons = [];

    for (let index = 0; index < 42; index += 1) {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      const key = dateKey(day);
      const outside = day.getMonth() !== month;
      const past = key < today;
      const isSelected = key === selectedDate;
      const isToday = key === today;
      const classes = ['calendar-day'];
      if (outside) classes.push('outside');
      if (isSelected) classes.push('selected');
      if (isToday) classes.push('today');

      buttons.push(`
        <button
          type="button"
          class="${classes.join(' ')}"
          data-calendar-date="${key}"
          aria-label="${longDate(key)}"
          aria-pressed="${isSelected}"
          ${past ? 'disabled' : ''}
        >
          <span>${day.getDate()}</span>
          ${isToday ? `<small>${CS.language()==='km'?'ថ្ងៃនេះ':'Today'}</small>` : ''}
        </button>
      `);
    }

    calendarGrid.innerHTML = buttons.join('');
    calendarGrid.querySelectorAll('[data-calendar-date]').forEach((button) => {
      button.addEventListener('click', () => selectDate(button.dataset.calendarDate));
    });
  }

  function selectDate(nextDate) {
    if (!nextDate || nextDate < today) return;
    selectedDate = nextDate;
    selectedRange = null;
    selectionMessage = '';
    const chosen = parseDateKey(nextDate);
    visibleMonth = new Date(chosen.getFullYear(), chosen.getMonth(), 1);
    renderCalendar();
    renderSchedule();
  }

  function allBlocks(settings, courts) {
    const bookings = CS.bookings();
    const now = new Date();
    const blocks = [];

    for (
      let start = CS.min(settings.openingTime);
      start + settings.slotMinutes <= CS.min(settings.closingTime);
      start += settings.slotMinutes
    ) {
      const startTime = CS.time(start);
      const endTime = CS.time(start + settings.slotMinutes);

      courts.forEach((court) => {
        const booked = bookings.some(
          (booking) =>
            booking.courtId === court.id &&
            booking.date === selectedDate &&
            booking.status !== 'cancelled' &&
            CS.overlap(startTime, endTime, booking.startTime, booking.endTime)
        );
        const isPastToday =
          selectedDate === today && start < now.getHours() * 60 + now.getMinutes();
        const rate = rateForCourt(court, settings);
        blocks.push({
          id: blockId(court.id, startTime),
          courtId: court.id,
          courtName: court.name,
          startTime,
          endTime,
          price: Number((rate * settings.slotMinutes / 60).toFixed(2)),
          status: booked ? 'booked' : isPastToday ? 'unavailable' : 'available'
        });
      });
    }
    return blocks;
  }

  function rebuildRange(slots, court) {
    const sorted = [...slots].sort((a, b) => CS.min(a.startTime) - CS.min(b.startTime));
    return {
      courtId: court.id,
      courtName: court.name,
      selectedSlots: sorted,
      selectedSlotIds: sorted.map((slot) => slot.id),
      startTime: sorted[0].startTime,
      endTime: sorted[sorted.length - 1].endTime,
      blockCount: sorted.length,
      durationMinutes: sorted.reduce(
        (total, slot) => total + (CS.min(slot.endTime) - CS.min(slot.startTime)),
        0
      ),
      totalPrice: Number(sorted.reduce((sum, slot) => sum + slot.price, 0).toFixed(2))
    };
  }

  function handleBlockClick(court, block) {
    if (block.status !== 'available' && !selectedRange?.selectedSlotIds.includes(block.id)) return;
    selectionMessage = '';

    if (!selectedRange || selectedRange.courtId !== court.id) {
      const movedFromAnotherCourt = Boolean(selectedRange && selectedRange.courtId !== court.id);
      selectedRange = rebuildRange([block], court);
      if (movedFromAnotherCourt) selectionMessage = `Selection moved to ${court.name}.`;
      renderSchedule();
      return;
    }

    const selectedIndex = selectedRange.selectedSlotIds.indexOf(block.id);
    if (selectedIndex !== -1) {
      if (selectedRange.blockCount === 1) {
        selectedRange = null;
      } else if (selectedIndex === 0) {
        selectedRange = rebuildRange(selectedRange.selectedSlots.slice(1), court);
      } else if (selectedIndex === selectedRange.blockCount - 1) {
        selectedRange = rebuildRange(selectedRange.selectedSlots.slice(0, -1), court);
      } else {
        selectionMessage = 'You can only remove the first or last selected time.';
      }
      renderSchedule();
      return;
    }

    const next = CS.min(block.startTime) === CS.min(selectedRange.endTime);
    const previous = CS.min(block.endTime) === CS.min(selectedRange.startTime);
    if (next || previous) {
      selectedRange = rebuildRange([...selectedRange.selectedSlots, block], court);
    } else {
      selectionMessage = 'Please select the next consecutive available time.';
    }
    renderSchedule();
  }

  function renderSummary() {
    const settings = CS.settings();
    const formattedDate = longDate(selectedDate);
    const allowed = selectedRange && settings.durations.includes(selectedRange.durationMinutes);

    document.querySelector('#sum-service').textContent =
      service === 'pickleball' ? 'Pickleball' : 'Tennis';
    document.querySelector('#sum-date').textContent = formattedDate;
    document.querySelector('#sum-court').textContent = selectedRange?.courtName || (CS.language()==='km'?'ជ្រើសទីលាន':'Select a court');
    document.querySelector('#sum-time').textContent = selectedRange
      ? `${selectedRange.startTime}–${selectedRange.endTime}`
      : (CS.language()==='km'?'ជ្រើសម៉ោង':'Select a time');
    document.querySelector('#sum-blocks').textContent = selectedRange
      ? `${selectedRange.blockCount} ${CS.language()==='km'?'ប្លុក':selectedRange.blockCount === 1 ? 'block' : 'blocks'}`
      : '—';
    document.querySelector('#sum-duration').textContent = selectedRange
      ? formatDuration(selectedRange.durationMinutes)
      : '—';
    document.querySelector('#sum-total').textContent = selectedRange
      ? CS.money(selectedRange.totalPrice)
      : CS.money(0);
    selectedDateLabel.textContent = formattedDate;
    availabilityDate.textContent = `${CS.language()==='km'?'ពេលទំនេរសម្រាប់':'Availability for'} ${formattedDate}`;
    submit.disabled = !allowed;
  }

  function renderSchedule() {
    const settings = CS.settings();
    const courts = settings.courts.filter((court) => court.active && court.service === service);
    const blocks = allBlocks(settings, courts);
    const byId = new Map(blocks.map((block) => [block.id, block]));
    const times = [];
    for (
      let start = CS.min(settings.openingTime);
      start + settings.slotMinutes <= CS.min(settings.closingTime);
      start += settings.slotMinutes
    ) times.push(CS.time(start));

    const columns = `var(--time-column-width) repeat(${courts.length}, var(--court-column-width))`;
    const allowedText = settings.durations.map(formatDuration).join(', ');
    const selectedIds = new Set(selectedRange?.selectedSlotIds || []);

    slotsEl.innerHTML = `
      <section class="schedule-section">
        <div class="schedule-toolbar">
          <div>
            <p class="schedule-date">${CS.language()==='km'?'ជ្រើសប្លុកម៉ោងជាប់គ្នានៅទីលានតែមួយ។':'Select consecutive blocks on one court.'}</p>
            <p class="schedule-duration-help">${CS.language()==='km'?'រយៈពេលអាចកក់':'Available booking durations'}: ${allowedText}.</p>
            <p class="mobile-swipe-hint">${CS.language()==='km'?'អូសទៅឆ្វេង ឬស្តាំ ដើម្បីមើលទីលានផ្សេងទៀត។':'Swipe horizontally to view more courts.'}</p>
          </div>
          ${selectedRange ? `<button type="button" class="schedule-clear-button" id="clear-selection">${CS.language()==='km'?'លុបការជ្រើសរើស':'Clear selection'}</button>` : ''}
        </div>
        <div class="schedule-scroll-wrapper">
          <div class="schedule-scroll">
            <div class="schedule-header-row" style="grid-template-columns:${columns}">
              <div class="schedule-time-label schedule-header-label">${CS.language()==='km'?'ម៉ោង':'Time'}</div>
              ${courts.map((court) => `
                <div class="schedule-court-header">
                  <strong>${court.name}</strong>
                  <div class="schedule-court-meta">
                    ${court.environment ? `<span>${court.environment}</span>` : ''}
                    ${court.surface ? `<span>${court.surface}</span>` : ''}
                    ${court.lighting === false ? '<span>No lighting</span>' : court.lighting ? '<span>Lighting</span>' : ''}
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="schedule-grid" style="grid-template-columns:${columns}">
              ${times.map((time) => `
                <div class="schedule-time-label">${time}</div>
                ${courts.map((court) => {
                  const block = byId.get(blockId(court.id, time));
                  if (!block) return '<button type="button" class="schedule-cell schedule-cell-unavailable" disabled>Unavailable</button>';
                  const isSelected = selectedIds.has(block.id);
                  const index = selectedRange?.selectedSlotIds.indexOf(block.id) ?? -1;
                  const position = isSelected
                    ? selectedRange.blockCount === 1 ? 'schedule-cell-selected-only'
                    : index === 0 ? 'schedule-cell-selected-first'
                    : index === selectedRange.blockCount - 1 ? 'schedule-cell-selected-last'
                    : 'schedule-cell-selected-middle'
                    : '';
                  const stateClass = isSelected ? 'schedule-cell-selected' : `schedule-cell-${block.status}`;
                  const label = isSelected
                    ? `${block.startTime}–${block.endTime}`
                    : block.status === 'available' ? CS.money(block.price)
                    : block.status === 'booked' ? (CS.language()==='km'?'បានកក់':'Booked') : (CS.language()==='km'?'មិនទំនេរ':'Unavailable');
                  return `
                    <button
                      type="button"
                      class="schedule-cell ${stateClass} ${position}"
                      data-block-id="${block.id}"
                      aria-pressed="${isSelected}"
                      ${block.status !== 'available' && !isSelected ? 'disabled' : ''}
                    >
                      <span class="schedule-cell-main">${label}</span>
                      ${isSelected ? `<small>${CS.language()==='km'?'បានជ្រើស':'Selected'} · ${CS.money(block.price)}</small>` : block.status === 'available' ? `<small>${CS.language()==='km'?'ទំនេរ':'Available'}</small>` : ''}
                    </button>
                  `;
                }).join('')}
              `).join('')}
            </div>
          </div>
        </div>
        ${selectionMessage ? `<div class="schedule-selection-error">${selectionMessage}</div>` : ''}
        <div class="schedule-selection-summary ${selectedRange ? 'has-selection' : ''}">
          ${selectedRange ? `
            <div class="schedule-selection-heading">
              <div><span class="schedule-selection-label">${CS.language()==='km'?'ការជ្រើសរើសរបស់អ្នក':'Your selection'}</span><strong>${selectedRange.courtName}</strong></div>
              <span class="schedule-block-count">${selectedRange.blockCount} ${CS.language()==='km'?'ប្លុក':selectedRange.blockCount === 1 ? 'block' : 'blocks'}</span>
            </div>
            <div class="schedule-selection-details">
              <div><span>${CS.language()==='km'?'ម៉ោង':'Time'}</span><strong>${selectedRange.startTime}–${selectedRange.endTime}</strong></div>
              <div><span>${CS.language()==='km'?'រយៈពេល':'Duration'}</span><strong>${formatDuration(selectedRange.durationMinutes)}</strong></div>
              <div><span>${CS.language()==='km'?'សរុប':'Total'}</span><strong>${CS.money(selectedRange.totalPrice)}</strong></div>
            </div>
            ${settings.durations.includes(selectedRange.durationMinutes) ? '' : '<p class="schedule-duration-warning">Keep selecting consecutive blocks to reach an available booking duration.</p>'}
          ` : '<div class="schedule-selection-empty">Select an available time to start your booking.</div>'}
        </div>
      </section>
    `;

    slotsEl.querySelectorAll('[data-block-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const block = byId.get(button.dataset.blockId);
        const court = courts.find((item) => item.id === block?.courtId);
        if (block && court) handleBlockClick(court, block);
      });
    });
    slotsEl.querySelector('#clear-selection')?.addEventListener('click', () => {
      selectedRange = null;
      selectionMessage = '';
      renderSchedule();
    });

    renderSummary();
  }

  previousMonth.addEventListener('click', () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    renderCalendar();
  });
  nextMonth.addEventListener('click', () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderCalendar();
  });
  todayButton.addEventListener('click', () => selectDate(today));

  serviceButtons.forEach((button) => {
    button.addEventListener('click', () => {
      service = button.dataset.service;
      selectedRange = null;
      selectionMessage = '';
      serviceButtons.forEach((item) => item.classList.toggle('active', item === button));
      renderSchedule();
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const settings = CS.settings();
    if (!selectedRange || !settings.durations.includes(selectedRange.durationMinutes)) return;

    const data = new FormData(form);
    const bookings = CS.bookings();
    const stillBusy = bookings.some(
      (booking) =>
        booking.courtId === selectedRange.courtId &&
        booking.date === selectedDate &&
        booking.status !== 'cancelled' &&
        CS.overlap(selectedRange.startTime, selectedRange.endTime, booking.startTime, booking.endTime)
    );

    if (stillBusy) {
      errorEl.textContent = 'That time was just booked. Please select another available time.';
      selectedRange = null;
      renderSchedule();
      return;
    }

    const booking = {
      id: CS.uid(),
      reference: CS.ref(),
      service,
      courtId: selectedRange.courtId,
      courtName: selectedRange.courtName,
      date: selectedDate,
      startTime: selectedRange.startTime,
      endTime: selectedRange.endTime,
      durationMinutes: selectedRange.durationMinutes,
      blockCount: selectedRange.blockCount,
      selectedSlotIds: selectedRange.selectedSlotIds,
      price: selectedRange.totalPrice,
      customerName: String(data.get('customerName')).trim(),
      phone: String(data.get('phone')).trim(),
      email: String(data.get('email')).trim(),
      notes: String(data.get('notes') || '').trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    bookings.push(booking);
    CS.write(CS.KEYS.bookings, bookings);
    sessionStorage.setItem('courtside_last_booking', booking.id);
    window.location.assign(`confirmation.html?id=${encodeURIComponent(booking.id)}`);
  });

  document.addEventListener('courtside:language',()=>{renderCalendar();renderSchedule();CS.applyLanguage();});
  renderCalendar();
  renderSchedule();
});
