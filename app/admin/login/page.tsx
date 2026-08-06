'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LanguageIcon } from '@/components/Icons';
import { useLanguage } from '@/components/LanguageProvider';

export default function AdminLogin() {
  const router = useRouter(); const { isKhmer, toggleLanguage } = useLanguage(); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(''); const password=new FormData(event.currentTarget).get('password'); const response=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})}); if(response.ok){router.push('/admin');router.refresh();}else{const body=await response.json();setError(body.error||(isKhmer?'ពាក្យសម្ងាត់មិនត្រឹមត្រូវ':'Invalid password'));setLoading(false);} }
  return <main className="admin-login"><div className="login-card"><div className="login-top-row"><Link href="/" className="brand"><span className="brand-mark">C</span><span><strong>COURTSIDE</strong><small>KH · TEAM</small></span></Link><button type="button" className="language-toggle" onClick={toggleLanguage}><LanguageIcon size={16} /><span>{isKhmer?'EN':'ខ្មែរ'}</span></button></div><span className="eyebrow">{isKhmer?'ផ្ទាំងគ្រប់គ្រងឯកជន':'Private dashboard'}</span><h1>{isKhmer?'ចូលសម្រាប់ក្រុមការងារ':'Team sign in'}</h1><p>{isKhmer?'គ្រប់គ្រងការកក់ ការបញ្ជាក់ កាលវិភាគ និងការកំណត់ទីលាន។':'Manage bookings, confirmations, schedules and court settings.'}</p><form onSubmit={submit}><label>{isKhmer?'ពាក្យសម្ងាត់':'Password'}<input name="password" type="password" autoComplete="current-password" required autoFocus /></label>{error&&<p className="form-error">{error}</p>}<button className="button button-full" disabled={loading}>{loading?(isKhmer?'កំពុងចូល…':'Signing in…'):(isKhmer?'ចូល':'Sign in')}</button></form><Link className="back-link" href="/">← {isKhmer?'ត្រឡប់ទៅគេហទំព័រ':'Return to website'}</Link></div></main>;
}
