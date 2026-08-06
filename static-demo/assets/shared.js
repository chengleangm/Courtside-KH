const CS = (() => {
  const KEYS = {
    bookings: 'courtside_bookings_v2', enquiries: 'courtside_enquiries_v2', settings: 'courtside_settings_v2', auth: 'courtside_admin_auth_v2', language: 'courtside_language_v1'
  };
  const defaultSettings = {
    openingTime: '07:00', closingTime: '22:00', slotMinutes: 60,
    durations: [60, 120, 180, 240], pickleballPrice: 12, tennisPrice: 15, telegram: 'courtsidekh',
    courts: [
      {id:'pb-1',name:'Pickleball Court 1',service:'pickleball',active:true,environment:'indoor',surface:'Synthetic',lighting:true},
      {id:'pb-2',name:'Pickleball Court 2',service:'pickleball',active:true,environment:'outdoor',surface:'Acrylic',lighting:true},
      {id:'pb-3',name:'Pickleball Court 3',service:'pickleball',active:true,environment:'indoor',surface:'Synthetic',lighting:false},
      {id:'tn-1',name:'Tennis Court 1',service:'tennis',active:true,environment:'outdoor',surface:'Clay',lighting:true},
      {id:'tn-2',name:'Tennis Court 2',service:'tennis',active:true,environment:'outdoor',surface:'Hard',lighting:true}
    ]
  };
  const demoBookings = [
    {id:'demo-001',reference:'CS-100101',service:'pickleball',courtId:'pb-1',courtName:'Pickleball Court 1',date:'2026-08-07',startTime:'08:00',endTime:'10:00',durationMinutes:120,blockCount:2,price:24,customerName:'Sokha Chan',phone:'+855 12 345 678',email:'sokha@example.com',notes:'Friendly doubles game',status:'confirmed',createdAt:'2026-08-05T03:00:00Z',updatedAt:'2026-08-05T03:00:00Z'},
    {id:'demo-002',reference:'CS-100102',service:'tennis',courtId:'tn-1',courtName:'Tennis Court 1',date:'2026-08-07',startTime:'16:00',endTime:'17:00',durationMinutes:60,blockCount:1,price:15,customerName:'Dara Lim',phone:'+855 96 222 333',email:'dara@example.com',notes:'Need two rackets',status:'pending',createdAt:'2026-08-05T05:00:00Z',updatedAt:'2026-08-05T05:00:00Z'},
    {id:'demo-003',reference:'CS-100103',service:'pickleball',courtId:'pb-2',courtName:'Pickleball Court 2',date:'2026-08-08',startTime:'10:00',endTime:'13:00',durationMinutes:180,blockCount:3,price:36,customerName:'Maly Srey',phone:'+855 77 888 111',email:'maly@example.com',notes:'Birthday group',status:'confirmed',createdAt:'2026-08-05T07:00:00Z',updatedAt:'2026-08-05T07:00:00Z'},
    {id:'demo-004',reference:'CS-100104',service:'pickleball',courtId:'pb-3',courtName:'Pickleball Court 3',date:'2026-08-10',startTime:'18:00',endTime:'20:00',durationMinutes:120,blockCount:2,price:24,customerName:'Chenda Mean',phone:'+855 10 500 600',email:'chenda@example.com',notes:'After-work game',status:'pending',createdAt:'2026-08-06T02:00:00Z',updatedAt:'2026-08-06T02:00:00Z'},
    {id:'demo-005',reference:'CS-100105',service:'tennis',courtId:'tn-2',courtName:'Tennis Court 2',date:'2026-08-12',startTime:'07:00',endTime:'08:00',durationMinutes:60,blockCount:1,price:15,customerName:'Rathana Keo',phone:'+855 88 432 100',email:'rathana@example.com',notes:'Morning practice',status:'confirmed',createdAt:'2026-08-06T03:30:00Z',updatedAt:'2026-08-06T03:30:00Z'},
    {id:'demo-006',reference:'CS-100106',service:'pickleball',courtId:'pb-1',courtName:'Pickleball Court 1',date:'2026-08-12',startTime:'14:00',endTime:'18:00',durationMinutes:240,blockCount:4,price:48,customerName:'Vanna Kim',phone:'+855 15 777 221',email:'vanna@example.com',notes:'Company tournament practice',status:'pending',createdAt:'2026-08-06T04:00:00Z',updatedAt:'2026-08-06T04:00:00Z'},
    {id:'demo-007',reference:'CS-100107',service:'tennis',courtId:'tn-1',courtName:'Tennis Court 1',date:'2026-08-14',startTime:'17:00',endTime:'19:00',durationMinutes:120,blockCount:2,price:30,customerName:'Sophea Long',phone:'+855 92 120 909',email:'sophea@example.com',notes:'Two players',status:'confirmed',createdAt:'2026-08-06T06:00:00Z',updatedAt:'2026-08-06T06:00:00Z'}
  ];
  const translations = {
    'Facilities':'ទីលាន','How it works':'របៀបប្រើ','Classes & Coaching':'ថ្នាក់ និងគ្រូបង្វឹក','Book a court':'កក់ទីលាន','Live availability':'ពេលទំនេរផ្ទាល់','Choose your game':'ជ្រើសរើសកីឡា','Select a date':'ជ្រើសរើសថ្ងៃ','Today':'ថ្ងៃនេះ','Selected date':'ថ្ងៃដែលបានជ្រើស','Select a court and time':'ជ្រើសទីលាន និងម៉ោង','Your details':'ព័ត៌មានរបស់អ្នក','Full name':'ឈ្មោះពេញ','Phone number':'លេខទូរស័ព្ទ','Email address':'អ៊ីមែល','Special notes':'កំណត់ចំណាំ','Booking summary':'សង្ខេបការកក់','Date':'ថ្ងៃ','Court':'ទីលាន','Time':'ម៉ោង','Blocks':'ប្លុក','Duration':'រយៈពេល','Total':'សរុប','Confirm booking':'បញ្ជាក់ការកក់','Booking list':'បញ្ជីការកក់','Booking calendar':'ប្រតិទិនការកក់','Class enquiries':'សំណើថ្នាក់','Court settings':'ការកំណត់ទីលាន','Sign out':'ចាកចេញ','Booking dashboard':'ផ្ទាំងគ្រប់គ្រងការកក់','Customer booking calendar':'ប្រតិទិនអតិថិជន','Total bookings':'ការកក់សរុប','Pending review':'រង់ចាំពិនិត្យ','Booked value':'តម្លៃបានកក់','Edit':'កែសម្រួល','Save changes':'រក្សាទុកការកែប្រែ','Cancel':'បោះបង់','No bookings found.':'រកមិនឃើញការកក់។'
  };
  function read(key, fallback){ try { const v=localStorage.getItem(key); return v?JSON.parse(v):fallback; } catch { return fallback; } }
  function write(key,value){ localStorage.setItem(key,JSON.stringify(value)); }
  function settings(){ const s=read(KEYS.settings,null); if(!s){write(KEYS.settings,defaultSettings);return structuredClone(defaultSettings);} return s; }
  function bookings(){return read(KEYS.bookings,[])}
  function enquiries(){return read(KEYS.enquiries,[])}
  function min(t){const [h,m]=t.split(':').map(Number);return h*60+m}
  function time(total){return `${String(Math.floor(total/60)).padStart(2,'0')}:${String(total%60).padStart(2,'0')}`}
  function overlap(aStart,aEnd,bStart,bEnd){return min(aStart)<min(bEnd)&&min(bStart)<min(aEnd)}
  function ref(){return `CS-${String(Date.now()).slice(-6)}`}
  function money(v){return `$${Number(v).toFixed(2)}`}
  function language(){return localStorage.getItem(KEYS.language)==='km'?'km':'en'}
  function niceDate(value){return new Intl.DateTimeFormat(language()==='km'?'km-KH':'en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(new Date(`${value}T00:00:00`))}
  function niceTime(value){const d=new Date();const [h,m]=value.split(':').map(Number);d.setHours(h,m,0,0);return new Intl.DateTimeFormat(language()==='km'?'km-KH':'en-US',{hour:'numeric',minute:'2-digit'}).format(d)}
  function uid(){return crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`}
  function applyLanguage(root=document){
    const km=language()==='km'; document.documentElement.lang=km?'km':'en';
    root.querySelectorAll('[data-en][data-km]').forEach(el=>{el.textContent=km?el.dataset.km:el.dataset.en});
    root.querySelectorAll('[data-placeholder-en][data-placeholder-km]').forEach(el=>{el.placeholder=km?el.dataset.placeholderKm:el.dataset.placeholderEn});
    root.querySelectorAll('[data-lang-toggle]').forEach(btn=>{btn.innerHTML=`🌐 <span>${km?'EN':'ខ្មែរ'}</span>`;btn.setAttribute('aria-label',km?'Switch to English':'ប្ដូរទៅភាសាខ្មែរ')});
    root.querySelectorAll('*').forEach(el=>{if(el.children.length===0&&!['SCRIPT','STYLE','OPTION'].includes(el.tagName)){const text=el.textContent.trim();if(!el.dataset.originalText&&translations[text])el.dataset.originalText=text;const original=el.dataset.originalText;if(original&&translations[original])el.textContent=km?translations[original]:original;}});
  }
  function toggleLanguage(){localStorage.setItem(KEYS.language,language()==='en'?'km':'en');applyLanguage();document.dispatchEvent(new CustomEvent('courtside:language'));}
  function seed(){settings();if(!localStorage.getItem(KEYS.bookings))write(KEYS.bookings,demoBookings);if(!localStorage.getItem(KEYS.enquiries))write(KEYS.enquiries,[]);if(!localStorage.getItem(KEYS.language))localStorage.setItem(KEYS.language,'en')}
  seed();
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('.main-nav').forEach(nav=>{if(!nav.querySelector('[data-lang-toggle]')){const btn=document.createElement('button');btn.type='button';btn.className='language-toggle';btn.dataset.langToggle='';const primary=nav.querySelector('.button');nav.insertBefore(btn,primary||null);}});
    document.querySelectorAll('[data-lang-toggle]').forEach(btn=>btn.addEventListener('click',toggleLanguage));applyLanguage();
  });
  return {KEYS,read,write,settings,bookings,enquiries,min,time,overlap,ref,money,niceDate,niceTime,uid,language,applyLanguage,toggleLanguage};
})();
