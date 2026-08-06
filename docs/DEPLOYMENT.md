# Deployment Guide

## Demo deployment

The project runs locally with file-based JSON storage. A traditional Node.js server with persistent disk can also run it using:

```bash
npm run build
npm run start
```

## Recommended production architecture

- Frontend and API: Vercel or another Node.js host
- Database: managed PostgreSQL
- Notifications: Telegram Bot API
- Domain and SSL: connect the Courtside KH domain to the selected host

Do not deploy the JSON storage version to a serverless platform for a real public booking launch. Serverless filesystems are not suitable as a permanent booking database.

## Environment checklist

- `ADMIN_PASSWORD`
- `AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_TELEGRAM_USERNAME`
- `NEXT_PUBLIC_PHONE`
- `NEXT_PUBLIC_ADDRESS`
- `TELEGRAM_BOT_TOKEN` (optional)
- `TELEGRAM_CHAT_ID` (optional)
