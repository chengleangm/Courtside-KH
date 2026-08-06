# Courtside KH — Complete Booking & Venue Operations System

## Customer-facing pages

### Homepage
- Responsive hero, service cards, four-step booking explanation and gallery
- Two-column service layout on mobile, with the final card spanning the row
- Compact 2×2 “How it works” layout on mobile
- Responsive footer with Facebook, Instagram and Telegram links
- Working mobile hamburger menu
- English/Khmer switch remains visible outside the hamburger menu

### Courts
- Dynamic court list generated from admin-managed settings
- Separate court-detail page for every court
- Gallery, environment, surface, lighting, capacity, price and opening hours
- Amenities, court rules and customer-facing description
- Direct “Book this court” action that preselects the correct sport/court context

### Booking
- Monthly date calendar
- Pickleball and tennis selection
- Live availability timetable
- Sticky time sidebar and horizontally scrollable court columns on mobile
- Consecutive multi-block time selection
- Live block count, duration, end time and total-price calculation
- Booking and blocked-period conflict prevention
- Customer details, notes, confirmation and booking reference

### Classes and coaching
- Customer enquiry form
- Requested service, date, time, group size and notes
- Admin status workflow, assigned coach and staff notes

## Multipage administration system

### Overview — `/admin`
- Daily operational summary
- Upcoming bookings and payments
- Court utilisation and blocked periods
- Quick links to core workflows

### Bookings — `/admin/bookings`
- Search and filter bookings
- Manual/reception booking creation
- Edit customer details
- Reschedule court, date, time and duration
- Confirm, complete or cancel
- Record payment status, method and amount
- Open a dedicated booking-detail page

### Booking detail — `/admin/bookings/[id]`
- Full customer and booking information
- Court image and court details
- Payment record and balance
- Check-in/check-out timestamps
- Status changes and edit shortcut

### Calendar — `/admin/calendar`
- Monthly customer-booking calendar
- Booking and blocked-time counters on each date
- Responsive selected-day booking list
- Quick block form for court, from time, to time and reason
- Existing blocked periods list and deletion
- Conflict validation against customer bookings and other blocks

### Check-in POS — `/admin/check-in`
- Search customer, phone or booking reference
- View daily arrivals
- Check customers in
- Record Cash, ABA, Card or other payment
- Track partial and full payments
- Complete the session and check customers out

### Blocked times — `/admin/blocks`
- Maintenance, private event, tournament, camp, staff-use and weather blocks
- Exact court, date, start time and end time
- Conflict protection
- Delete blocked periods

### Courts — `/admin/courts`
- Clean responsive list instead of all edit forms on one page
- Court image, service, status, environment, surface, lighting, capacity, price and hours
- Activate/deactivate booking
- Edit, delete or add a court

### Add/edit court
- Separate add and edit pages
- Court name, ID, sport, environment and surface
- Price, capacity and individual operating hours
- Main image upload or URL
- Multiple gallery URLs
- Amenities and customer rules
- Description, lighting, featured state and booking-active state
- Save and return to the court list

### Booking rules — `/admin/settings`
- Default venue opening and closing hours
- 30- or 60-minute schedule blocks
- Allowed booking durations
- Default pickleball and tennis hourly prices
- Links back to court-specific configuration

### Customers — `/admin/customers`
- Aggregated customer list
- Booking count, total value and latest activity
- Search customer records

### Enquiries — `/admin/enquiries`
- Search and status filters
- New, contacted, scheduled, completed and closed states
- Assigned coach and staff notes
- Call, email and create-booking actions
- Delete enquiries

### Reports — `/admin/reports`
- Date filters
- Revenue and booking totals
- Court utilisation
- Booking-status mix
- CSV export

## Validation and protection

- Admin-session protection for administration routes
- Server-side booking conflict checks
- Server-side blocked-period conflict checks
- Court-specific operating-hour validation
- Server-calculated booking duration and price
- No reliance on client totals for final validation
- JSON demo storage included; production database recommended


## Digital booking ticket

- Mobile-responsive confirmation page.
- Branded PNG ticket export with customer, court, schedule, blocks, amount, status and check-in instructions.
- Native mobile share/save support with browser download fallback.
- English and Khmer ticket rendering.
