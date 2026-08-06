import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';
import { periodsOverlap, timeToMinutes } from '@/lib/time';
import type { BlockedPeriod } from '@/lib/types';

export const dynamic='force-dynamic';
export async function GET(){if(!(await isAdmin()))return NextResponse.json({error:'Unauthorized'},{status:401});return NextResponse.json({blocks:await store.getBlockedPeriods()});}
export async function POST(request:NextRequest){
  if(!(await isAdmin()))return NextResponse.json({error:'Unauthorized'},{status:401});
  const body=await request.json();const [settings,bookings,blocks]=await Promise.all([store.getSettings(),store.getBookings(),store.getBlockedPeriods()]);
  const court=settings.courts.find((item)=>item.id===String(body.courtId));const date=String(body.date||'');const startTime=String(body.startTime||'');const endTime=String(body.endTime||'');const reason=String(body.reason||'Blocked').trim();
  const startMinutes=timeToMinutes(startTime);const endMinutes=timeToMinutes(endTime);
  const openingMinutes=timeToMinutes(court?.openingTime||settings.openingTime);const closingMinutes=timeToMinutes(court?.closingTime||settings.closingTime);
  const invalidRange=!Number.isFinite(startMinutes)||!Number.isFinite(endMinutes)||startMinutes>=endMinutes||startMinutes<openingMinutes||endMinutes>closingMinutes||(startMinutes-openingMinutes)%settings.slotMinutes!==0||(endMinutes-openingMinutes)%settings.slotMinutes!==0;
  if(!court||!/^\d{4}-\d{2}-\d{2}$/.test(date)||invalidRange||!reason)return NextResponse.json({error:'Invalid court, date or time range. Use the court operating hours and schedule interval.'},{status:400});
  const bookingConflict=bookings.some((booking)=>booking.courtId===court.id&&booking.date===date&&booking.status!=='cancelled'&&periodsOverlap(startTime,endTime,booking.startTime,booking.endTime));
  if(bookingConflict)return NextResponse.json({error:'A customer booking already exists during this period.'},{status:409});
  const overlap=blocks.some((block)=>block.courtId===court.id&&block.date===date&&periodsOverlap(startTime,endTime,block.startTime,block.endTime));
  if(overlap)return NextResponse.json({error:'This court already has a blocked period during that time.'},{status:409});
  const block:BlockedPeriod={id:randomUUID(),courtId:court.id,date,startTime,endTime,reason,createdAt:new Date().toISOString()};blocks.push(block);await store.saveBlockedPeriods(blocks);return NextResponse.json({block},{status:201});
}
