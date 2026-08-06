document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
  const menu=document.querySelector('[data-menu]'); const nav=document.querySelector('[data-nav]');
  menu?.addEventListener('click',()=>nav?.classList.toggle('open'));
});
