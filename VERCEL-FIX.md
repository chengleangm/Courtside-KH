# Vercel JSON response fix

This version fixes the browser error `Unexpected end of JSON input` by:

- safely parsing API responses as text before JSON parsing;
- showing a useful error when an API returns an empty or HTML response;
- bundling the JSON demo data in Vercel server functions;
- using an in-memory fallback on Vercel instead of writing to the read-only deployment filesystem;
- storing a newly created booking in browser session storage so the confirmation ticket still opens across serverless functions;
- safely passing the optional court query parameter into the booking form.

## Production data note

The Vercel in-memory store is suitable for a functional demo, but it is not permanent. Connect PostgreSQL, Supabase, Neon or another persistent database before accepting real customer bookings.
