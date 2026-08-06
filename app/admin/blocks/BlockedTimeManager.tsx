'use client';

import { FormEvent, useMemo, useState } from 'react';
import AdminPageShell from '@/components/AdminPageShell';
import { PlusIcon, TrashIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';
import type { BlockedPeriod, Settings } from '@/lib/types';

function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}

export default function BlockedTimeManager({ initialBlocks, settings }: { initialBlocks: BlockedPeriod[]; settings: Settings }) {
  const { isKhmer, locale } = useLanguage();
  const [blocks,setBlocks]=useState(initialBlocks);
  const [date,setDate]=useState(todayKey());
  const [courtId,setCourtId]=useState(settings.courts.find((court)=>court.active)?.id??'');
  const [startTime,setStartTime]=useState(settings.openingTime);
  const [endTime,setEndTime]=useState(settings.closingTime);
  const [reasonPreset,setReasonPreset]=useState('Maintenance');
  const [customReason,setCustomReason]=useState('');
  const [message,setMessage]=useState('');
  const [filterDate,setFilterDate]=useState('');

  const visible=useMemo(()=>blocks.filter((block)=>!filterDate||block.date===filterDate).sort((a,b)=>`${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`)),[blocks,filterDate]);

  async function create(event:FormEvent){event.preventDefault();const reason=reasonPreset==='Custom'?customReason.trim():reasonPreset;if(!reason){setMessage(isKhmer?'សូមបញ្ចូលមូលហេតុ។':'Please enter a reason.');return;}setMessage('Saving…');const response=await fetch('/api/blocked-periods',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({courtId,date,startTime,endTime,reason})});const body=await response.json();if(response.ok){setBlocks((items)=>[...items,body.block]);setMessage(isKhmer?'បានបិទម៉ោងដោយជោគជ័យ។':'Court time blocked successfully.');}else setMessage(body.error||'Unable to block court time.');}
  async function remove(id:string){if(!confirm(isKhmer?'លុបម៉ោងបិទនេះ?':'Delete this blocked period?'))return;const response=await fetch(`/api/blocked-periods/${id}`,{method:'DELETE'});if(response.ok)setBlocks((items)=>items.filter((item)=>item.id!==id));}

  return <AdminPageShell title="Blocked court times" titleKhmer="បិទម៉ោងទីលាន">
    <section className="admin-split-layout">
      <form className="admin-panel block-form" onSubmit={create}>
        <div className="admin-section-title"><div><span className="eyebrow">{isKhmer?'កាលវិភាគទីលាន':'Court schedule'}</span><h2>{isKhmer?'បន្ថែមម៉ោងបិទ':'Add blocked period'}</h2></div><PlusIcon/></div>
        <p>{isKhmer?'ប្រើសម្រាប់ការថែទាំ ព្រឹត្តិការណ៍ ការកក់ឯកជន ឬម៉ោងដែលមិនអាចកក់បាន។':'Use this for maintenance, tournaments, private events or any time that customers cannot book.'}</p>
        <label>{isKhmer?'ទីលាន':'Court'}<select value={courtId} onChange={(e)=>{const next=e.target.value;setCourtId(next);const court=settings.courts.find((item)=>item.id===next);setStartTime(court?.openingTime||settings.openingTime);setEndTime(court?.closingTime||settings.closingTime);}}>{settings.courts.map((court)=><option key={court.id} value={court.id}>{court.name}{court.active?'':' (inactive)'}</option>)}</select></label>
        <label>{isKhmer?'ថ្ងៃ':'Date'}<input type="date" value={date} onChange={(e)=>setDate(e.target.value)} required/></label>
        <div className="form-grid two"><label>{isKhmer?'ចាប់ពីម៉ោង':'From'}<input type="time" value={startTime} step={settings.slotMinutes*60} onChange={(e)=>setStartTime(e.target.value)} required/></label><label>{isKhmer?'ដល់ម៉ោង':'To'}<input type="time" value={endTime} step={settings.slotMinutes*60} onChange={(e)=>setEndTime(e.target.value)} required/></label></div>
        <label>{isKhmer?'មូលហេតុ':'Reason'}<select value={reasonPreset} onChange={(e)=>setReasonPreset(e.target.value)}><option>Maintenance</option><option>Private Event</option><option>Tournament</option><option>Tennis Camp</option><option>Staff Use</option><option>Weather Closure</option><option>Custom</option></select></label>
        {reasonPreset==='Custom'&&<label>{isKhmer?'មូលហេតុផ្ទាល់ខ្លួន':'Custom label'}<input value={customReason} onChange={(e)=>setCustomReason(e.target.value)} placeholder="e.g. Company tournament" required/></label>}
        <button className="button" type="submit">{isKhmer?'បិទម៉ោងនេះ':'Block this time'}</button><span className="form-status" role="status">{message}</span>
      </form>

      <section className="admin-panel">
        <div className="admin-section-title"><div><span className="eyebrow">{isKhmer?'ម៉ោងមិនអាចកក់':'Unavailable periods'}</span><h2>{isKhmer?'បញ្ជីម៉ោងបានបិទ':'Blocked-time list'}</h2></div><label className="compact-date-filter"><span>{isKhmer?'តម្រងថ្ងៃ':'Filter date'}</span><input type="date" value={filterDate} onChange={(e)=>setFilterDate(e.target.value)}/></label></div>
        {visible.length===0?<div className="empty-state">{isKhmer?'មិនមានម៉ោងបិទទេ។':'No blocked periods found.'}</div>:<div className="block-list">{visible.map((block)=>{const court=settings.courts.find((item)=>item.id===block.courtId);return <article key={block.id}><div className="block-date"><strong>{new Intl.DateTimeFormat(locale,{month:'short',day:'numeric'}).format(new Date(`${block.date}T00:00:00`))}</strong><span>{block.startTime}–{block.endTime}</span></div><div><strong>{court?.name??block.courtId}</strong><span>{block.reason}</span></div><button type="button" className="icon-only-button danger" onClick={()=>remove(block.id)} aria-label="Delete"><TrashIcon size={17}/></button></article>;})}</div>}
      </section>
    </section>
  </AdminPageShell>;
}
