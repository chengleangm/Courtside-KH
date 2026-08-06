import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import type { EnquiryStatus } from '@/lib/types';

const statuses: EnquiryStatus[] = ['new', 'contacted', 'scheduled', 'closed'];

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const enquiries = await store.getEnquiries();
  const index = enquiries.findIndex((item) => item.id === id);
  if (index < 0) return NextResponse.json({ error: 'Enquiry not found.' }, { status: 404 });
  if (body.status !== undefined && !statuses.includes(body.status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  enquiries[index] = {
    ...enquiries[index],
    status: body.status ?? enquiries[index].status ?? 'new',
    assignedCoach: body.assignedCoach !== undefined ? String(body.assignedCoach).trim() : enquiries[index].assignedCoach,
    staffNote: body.staffNote !== undefined ? String(body.staffNote).trim() : enquiries[index].staffNote,
    updatedAt: new Date().toISOString(),
  };
  await store.saveEnquiries(enquiries);
  return NextResponse.json({ enquiry: enquiries[index] });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const enquiries = await store.getEnquiries();
  const next = enquiries.filter((item) => item.id !== id);
  if (next.length === enquiries.length) return NextResponse.json({ error: 'Enquiry not found.' }, { status: 404 });
  await store.saveEnquiries(next);
  return NextResponse.json({ success: true });
}
