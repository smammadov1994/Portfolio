/** A cancellable, frame-timed reveal. Reserves final text height to prevent layout jumps. */
export function createTypewriter(element, {reduced=false, announce=()=>{}, clock=()=>performance.now(), raf=requestAnimationFrame, caf=cancelAnimationFrame}={}){
 let job=0,frame=0,current=null,busy=false;
 function complete(token){
  if(!current||token!==job)return;
  const task=current;busy=false;task.copy.textContent=task.text;task.accessible.textContent=task.text;
  element.classList.remove('is-thinking','is-typing');element.setAttribute('aria-busy','false');
  current=null;announce(task.text);task.done?.();
 }
 function write(text,{thinkingMs=600,onComplete}={}){
  job++;caf(frame);const token=job;busy=true;
  element.classList.remove('is-thinking','is-typing');
  element.classList.add('type-reveal');element.setAttribute('aria-busy','true');
  const reserve=document.createElement('span');reserve.className='type-reserve';reserve.setAttribute('aria-hidden','true');reserve.textContent=text;
  const copy=document.createElement('span');copy.className='type-copy';copy.setAttribute('aria-hidden','true');
  const dots=document.createElement('span');dots.className='thinking-dots';dots.setAttribute('aria-hidden','true');
  for(let i=0;i<3;i++)dots.append(document.createElement('i'));
  const accessible=document.createElement('span');accessible.className='sr-only';
  element.replaceChildren(reserve,copy,dots,accessible);
  const chars=Array.from(text),due=[];let total=0;
  for(const char of chars){total+=/[.!?]/.test(char)?145:/[,;:]/.test(char)?65:char===' '?15:21;due.push(total)}
  const start=clock()+(reduced?0:thinkingMs);
  current={text,copy,accessible,done:onComplete};element.classList.add('is-thinking');
  if(reduced){complete(token);return}
  let shown=0;
  function tick(now){
   if(token!==job||!current)return;
   if(now>=start){
    element.classList.remove('is-thinking');element.classList.add('is-typing');
    while(shown<chars.length&&due[shown]<=now-start)shown++;
    copy.textContent=chars.slice(0,shown).join('');
    if(shown===chars.length){complete(token);return}
   }
   frame=raf(tick);
  }
  frame=raf(tick);
 }
 return {write,finish(){caf(frame);complete(job)},cancel(){job++;caf(frame);current=null;busy=false;element.classList.remove('is-thinking','is-typing');element.setAttribute('aria-busy','false')},get busy(){return busy}};
}
