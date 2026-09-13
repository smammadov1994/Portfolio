import {buildKnowledge,retrieve} from './knowledge.mjs';
import {createTypewriter} from './typewriter.mjs';
const $=s=>document.querySelector(s);
let knowledge=[],active='',paused=false,settleTimer,observer;
const chapters=[...document.querySelectorAll('[data-chapter]')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastNarration=0;
const announce=text=>{$('#astro-announcement').textContent=text};
const speech=createTypewriter($('#astro-speech'),{reduced,announce});
const answer=createTypewriter($('#astro-answer'),{reduced,announce});
function narrate(id,force=false){
 const item=knowledge.find(k=>k.id===id);
 if(!item||(!force&&(paused||active===id||speech.busy)))return;
 active=id;lastNarration=Date.now();
 const index=chapters.findIndex(c=>c.dataset.chapter===id);
 $('#chapter-label').textContent=String(index+1).padStart(2,'0')+' / '+item.title;
 document.querySelectorAll('.astro-steps button').forEach(b=>{b.classList.toggle('active',b.dataset.chapter===id);b.setAttribute('aria-current',b.dataset.chapter===id?'step':'false')});
 speech.write(item.story,{thinkingMs:550,onComplete(){lastNarration=Date.now();scheduleChapter()}});
}
function chooseChapter(){
 const anchor=innerHeight*(innerWidth<600?.55:.45);let best=chapters[0];
 for(const el of chapters){if(el.getBoundingClientRect().top<=anchor)best=el}
 return best.dataset.chapter;
}
function scheduleChapter(){
 clearTimeout(settleTimer);if(paused||speech.busy)return;
 const rail=$('.astro-rail').getBoundingClientRect();if(rail.top>innerHeight-80||rail.bottom<80)return;
 settleTimer=setTimeout(()=>narrate(chooseChapter()),Math.max(800,4200-(Date.now()-lastNarration)));
}
function setPaused(next){
 paused=next;clearTimeout(settleTimer);
 if(paused)speech.finish();
 $('#pause-guide').textContent=paused?'Resume':'Pause';
 $('#astro-toggle').setAttribute('aria-pressed',String(paused));
 $('#astro-toggle').setAttribute('aria-label',paused?'Resume Astro’s scroll narration':'Pause Astro’s scroll narration');
 $('#guide-state').textContent=paused?'Take your time. I’ll wait here.':'I’ll follow your scroll.';
 if(!paused)narrate(chooseChapter(),true);
}
$('#pause-guide').onclick=()=>setPaused(!paused);$('#astro-toggle').onclick=()=>setPaused(!paused);
$('#ask-astro').onclick=()=>{
 const hidden=!$('#astro-questions').hidden;
 $('#astro-questions').hidden=hidden;$('#ask-astro').setAttribute('aria-expanded',String(!hidden));
 if(!hidden){setPaused(true);$('#question').focus()}else answer.finish();
};
function ask(q){
 $('#answer-source').textContent='';
 const result=knowledge.length?retrieve(q,knowledge):{answer:'I couldn’t load Seymur’s profile. Please refresh and try again.',source:null};
 answer.write(result.answer,{thinkingMs:650,onComplete(){
  $('#answer-source').textContent=result.source?'From Seymur’s profile · '+result.source:'';
 }});
}
$('#ask-form').onsubmit=e=>{e.preventDefault();ask($('#question').value)};
document.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>{$('#question').value=b.dataset.question;ask(b.dataset.question)});
try{
 const results=await Promise.all([fetch('data/profile.json'),fetch('data/projects.json')]);
 if(results.some(r=>!r.ok))throw new Error('Profile unavailable');
 const [profile,projects]=await Promise.all(results.map(r=>r.json()));knowledge=buildKnowledge(profile,projects);
 const steps=$('.astro-steps');
 chapters.forEach((c,i)=>{
  const b=document.createElement('button');b.dataset.chapter=c.dataset.chapter;
  b.title=knowledge.find(k=>k.id===c.dataset.chapter).title;
  b.setAttribute('aria-label','Chapter '+(i+1)+': '+b.title);
  b.onclick=()=>{c.scrollIntoView({behavior:reduced?'instant':'smooth'});narrate(c.dataset.chapter,true)};
  steps.append(b)
 });
 observer=new IntersectionObserver(scheduleChapter,{threshold:[0,.2,.5,.8]});chapters.forEach(c=>observer.observe(c));
 addEventListener('scroll',scheduleChapter,{passive:true});scheduleChapter();
}catch(e){
 speech.write('I couldn’t load my notes just now. You can still explore Seymur’s story below.',{thinkingMs:0});
 $('#guide-state').textContent='Refresh to try again.'
}
