'use client';

import { FormEvent, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';

export default function ClassEnquiryForm() {
  const { isKhmer } = useLanguage();
  const [submitted, setSubmitted] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const telegram = process.env.NEXT_PUBLIC_TELEGRAM_USERNAME || 'courtsidekh';
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(''); const data = Object.fromEntries(new FormData(event.currentTarget)); try { const response = await fetch('/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,people:Number(data.people)})}); const body=await response.json(); if(!response.ok) throw new Error(body.error || 'Unable to submit enquiry'); setSubmitted(true); } catch(err) { setError(err instanceof Error ? err.message : (isKhmer ? 'មិនអាចផ្ញើសំណើបាន' : 'Unable to submit enquiry')); } finally { setLoading(false); } }
  if (submitted) return <div className="success-panel"><span className="success-icon">✓</span><h2>{isKhmer ? 'បានទទួលសំណើ' : 'Enquiry received'}</h2><p>{isKhmer ? 'ក្រុម Courtside KH នឹងពិនិត្យពេលវេលារបស់អ្នក។ បន្តតាម Telegram ដើម្បីទាក់ទងលឿន។' : 'The Courtside KH team will review your preferred time. Continue on Telegram for faster coordination.'}</p><a className="button" href={`https://t.me/${telegram}`} target="_blank" rel="noreferrer">{isKhmer ? 'បន្តក្នុង Telegram' : 'Continue in Telegram'}</a></div>;
  return <form className="form-card enquiry-form" onSubmit={submit}><div className="form-grid two">
    <label>{isKhmer ? 'សេវាកម្ម' : 'Service'}<select name="service" required><option value="class">{isKhmer ? 'ថ្នាក់ជាក្រុម' : 'Group class'}</option><option value="coaching">{isKhmer ? 'គ្រូបង្វឹកឯកជន' : 'Private coaching'}</option></select></label>
    <label>{isKhmer ? 'ចំនួនអ្នក' : 'Number of people'}<input type="number" name="people" min="1" max="30" defaultValue="1" required /></label>
    <label>{isKhmer ? 'ថ្ងៃដែលចង់បាន' : 'Preferred date'}<input type="date" name="preferredDate" min={new Date().toISOString().slice(0,10)} required /></label>
    <label>{isKhmer ? 'ម៉ោងដែលចង់បាន' : 'Preferred time'}<input type="time" name="preferredTime" required /></label>
    <label>{isKhmer ? 'ឈ្មោះពេញ' : 'Full name'}<input name="customerName" required /></label>
    <label>{isKhmer ? 'លេខទូរស័ព្ទ' : 'Phone number'}<input name="phone" type="tel" required /></label>
    <label>{isKhmer ? 'អ៊ីមែល' : 'Email address'}<input name="email" type="email" required /></label>
    <label>{isKhmer ? 'កំណត់ចំណាំ' : 'Notes'}<input name="notes" placeholder={isKhmer ? 'កម្រិត គោលដៅ ឬសំណួរ' : 'Level, goals or questions'} /></label>
  </div>{error && <p className="form-error">{error}</p>}<button className="button button-full" disabled={loading}>{loading ? (isKhmer ? 'កំពុងផ្ញើ…' : 'Sending…') : (isKhmer ? 'ផ្ញើសំណើ' : 'Submit enquiry')}</button></form>;
}
