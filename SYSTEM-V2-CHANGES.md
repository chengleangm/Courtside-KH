# Courtside KH V2 — Changes Applied

## Admin design fixes

- Rebuilt the sidebar as a clean text-only navigation with larger white labels.
- Removed rounded navigation bubbles while preserving a clear active state.
- Added responsive mobile admin menu behaviour.
- Corrected search fields so icons and text remain aligned without overflow.
- Rebuilt the selected-day calendar panel and quick block form for mobile, tablet and desktop.

## Court-management flow

The old single page containing every court form was replaced by:

1. A responsive court list at `/admin/courts`
2. A dedicated add page at `/admin/courts/new`
3. A dedicated edit page at `/admin/courts/[id]/edit`
4. Return to the list after a successful save

Each court supports images, gallery, service, environment, surface, price, capacity, individual hours, lighting, amenities, rules, featured state and booking availability.

## Additional operations pages

- Customer records and booking value
- Booking-detail pages
- Reporting and CSV export
- Actionable enquiries workflow
- More complete quick links from the overview

## Customer design fixes

- Responsive homepage hero and sections
- Two-column mobile service cards
- Compact four-step 2×2 mobile layout
- Responsive gallery and footer
- Social-media icons and links
- Working hamburger navigation
- Language switch kept outside the hamburger menu
- Dedicated court-detail pages with booking actions

## Technical checks

- TypeScript: passed
- ESLint: passed with no errors; image optimisation recommendations remain as warnings
- JSON validation: passed
- CSS brace validation: passed
- Static-demo JavaScript syntax: passed
- Required route checks: passed
- Production build: blocked only by the packaging workspace being unable to download the Linux-specific Next.js SWC binary

## Confirmation ticket update

- Rebuilt the confirmation layout for 320px–430px mobile screens.
- Added the customer name to the booking confirmation details.
- Added a digital ticket panel with **Save ticket image**.
- Generates a branded PNG ticket entirely in the browser with the booking reference, customer, court, date, time, duration, blocks, price, status and check-in instructions.
- Uses the mobile share sheet when supported and a PNG download fallback everywhere else.
- Supports both English and Khmer ticket text.
- Updated the zero-install static demo with the same ticket export flow.
