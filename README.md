# Courtside KH — Complete Court Booking & Check-in POS System

A responsive bilingual booking platform for pickleball, tennis, coaching enquiries and venue operations. The project is built with Next.js, React and TypeScript.

## Customer website

- Responsive English/Khmer website
- Mobile navigation with the language switch kept outside the hamburger menu
- Court gallery and dedicated court-detail pages
- Court images, amenities, rules, opening hours, capacity and pricing
- Monthly date calendar and live court timetable
- Consecutive multi-block time selection
- Automatic start/end time, duration and total-price calculation
- Duplicate-booking and blocked-period prevention
- Classes and coaching enquiry form
- Booking confirmation and venue check-in instructions
- Downloadable bilingual PNG booking ticket for mobile check-in

## Administration system

- `/admin` — operations overview
- `/admin/bookings` — booking list, manual booking, editing and rescheduling
- `/admin/bookings/[id]` — full booking and payment details
- `/admin/calendar` — monthly calendar, selected-day bookings and quick time blocking
- `/admin/check-in` — reception check-in, payment and checkout POS
- `/admin/blocks` — complete blocked-time manager
- `/admin/courts` — responsive court inventory list
- `/admin/courts/new` — add a court
- `/admin/courts/[id]/edit` — edit details, gallery, rules, amenities, hours and price
- `/admin/settings` — global booking rules and default prices
- `/admin/customers` — customer history and value summary
- `/admin/enquiries` — coaching/class enquiry workflow
- `/admin/reports` — date filters, utilisation, status totals and CSV export

## Run locally

```bash
npm install
npm run dev
```

Open:

- Customer website: `http://localhost:3000`
- Courts: `http://localhost:3000/courts`
- Booking: `http://localhost:3000/book`
- Admin login: `http://localhost:3000/admin/login`

Demo password:

```text
admin123
```

## Environment

Copy `.env.example` to `.env.local` and change the admin password before deployment.

```env
ADMIN_PASSWORD=replace-with-a-strong-password
```

Optional Telegram and public contact values can also be configured there.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

TypeScript and ESLint error checks passed in the packaging workspace. The production build requires the matching platform-specific Next.js SWC package, which should install normally with `npm install` on the deployment computer.

## Demo storage

The package stores demonstration records in JSON files under `data/`. Before a public, high-volume launch, replace the store layer with PostgreSQL, MySQL, Supabase or another transactional database.

## Images

The demonstration uses remote court image URLs from public stock-image providers. Admin users can replace a court image, add gallery URLs, or upload an image from the court edit page. A built-in SVG placeholder is included for missing images.

See `SYSTEM-V2-CHANGES.md` and `FULL-SYSTEM-FEATURES.md` for more details.
