import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/store";
import { notifyNewEnquiry } from "@/lib/notifications";
import type { Enquiry } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const required = [body.service, body.preferredDate, body.preferredTime, body.people, body.customerName, body.phone, body.email];
  if (required.some((v) => !String(v || "").trim())) return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  const enquiry: Enquiry = { id: randomUUID(), service: body.service === "coaching" ? "coaching" : "class", preferredDate: body.preferredDate, preferredTime: body.preferredTime, people: Number(body.people), customerName: String(body.customerName).trim(), phone: String(body.phone).trim(), email: String(body.email).trim(), notes: String(body.notes || "").trim(), status: 'new', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const enquiries = await store.getEnquiries(); enquiries.push(enquiry); await store.saveEnquiries(enquiries); notifyNewEnquiry(enquiry).catch(console.error);
  return NextResponse.json({ enquiry }, { status: 201 });
}
