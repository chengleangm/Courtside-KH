# Courtside KH — Option 1 Implementation Scope

## Customer website

- Homepage with facility overview and calls to action
- Responsive mobile, tablet and desktop layouts
- Pickleball and tennis booking page
- Classes and coaching enquiry page
- Confirmation page with reference number
- Manual payment message

## Booking rules

- A court is available only when the selected period does not overlap an active booking or blocked period.
- Cancelled bookings release their court and time.
- Available durations are configured in `data/settings.json`.
- Opening and closing hours are configurable through the admin settings page.
- Prices are calculated from the service hourly price and selected duration.

## Team dashboard

- Password-protected access
- Summary cards for total bookings, today, pending and booked value
- Search and status filtering
- Confirm, complete or cancel a booking
- View class and coaching enquiries
- Edit court names, active courts, operating hours and hourly prices

## Recommended production completion work

- Replace JSON storage with PostgreSQL
- Add transactional booking constraint in the database
- Add customer email/SMS confirmations if requested
- Add blocked-period and private-event user interface
- Add rescheduling form and audit history
- Configure domain, SSL, analytics and backups
- Complete client content, logo, photos and final colours
- User acceptance testing and administrator training
