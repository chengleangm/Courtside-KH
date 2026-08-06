import type { Booking, Enquiry } from "@/lib/types";

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.info("[Telegram notification skipped — credentials not configured]", text);
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  if (!response.ok) {
    console.error("Telegram notification failed", await response.text());
  }
}

export async function notifyNewBooking(booking: Booking) {
  await sendTelegram([
    "🎾 <b>New Courtside KH booking</b>",
    `Reference: <b>${booking.reference}</b>`,
    `Customer: ${booking.customerName}`,
    `Phone: ${booking.phone}`,
    `Service: ${booking.service === "pickleball" ? "Pickleball" : "Tennis"}`,
    `Court: ${booking.courtName}`,
    `Date: ${booking.date}`,
    `Time: ${booking.startTime}–${booking.endTime}`,
    `Price: $${booking.price.toFixed(2)}`,
    booking.notes ? `Notes: ${booking.notes}` : "",
  ].filter(Boolean).join("\n"));
}

export async function notifyNewEnquiry(enquiry: Enquiry) {
  await sendTelegram([
    "🏅 <b>New class/coaching enquiry</b>",
    `Customer: ${enquiry.customerName}`,
    `Phone: ${enquiry.phone}`,
    `Type: ${enquiry.service}`,
    `Preferred: ${enquiry.preferredDate} at ${enquiry.preferredTime}`,
    `People: ${enquiry.people}`,
    enquiry.notes ? `Notes: ${enquiry.notes}` : "",
  ].filter(Boolean).join("\n"));
}
