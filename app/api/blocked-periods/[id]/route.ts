import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { store } from '@/lib/store';

export async function DELETE(_:NextRequest,{params}:{params:Promise<{id:string}>}){if(!(await isAdmin()))return NextResponse.json({error:'Unauthorized'},{status:401});const {id}=await params;const blocks=await store.getBlockedPeriods();const next=blocks.filter((item)=>item.id!==id);if(next.length===blocks.length)return NextResponse.json({error:'Blocked period not found'},{status:404});await store.saveBlockedPeriods(next);return NextResponse.json({success:true});}
