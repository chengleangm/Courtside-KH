# Fixes Applied

- Replaced stale `slot` summary references with the multi-block `selectedRange` state.
- Fixed missing `Fragment` and duration formatter TypeScript errors.
- Rebuilt the court timetable as one connected grid.
- Made header and body use the exact same responsive column template.
- Added a sticky, opaque time sidebar that reserves real width and does not cover Court 1.
- Added horizontal court scrolling inside the timetable only.
- Added consecutive multi-block selection, removal from either end, block counting, duration and total calculations.
- Added allowed-duration feedback and disabled confirmation until a valid duration is selected.
- Added per-court pricing support and server-side price recalculation.
- Added server validation for consecutive slot IDs, block count, operating hours, past times, blocked periods and overlapping bookings.
- Added an in-process booking lock for the included JSON demo store.
- Improved the monthly calendar, booking cards, header, hero and summary responsiveness for 320–430px screens.
- Added embedded SVG interface icons without remote loading.
- Expanded admin settings for block size, allowed durations, court details and optional court pricing.
- Updated the confirmation page, admin display, README and zero-install static demo.
