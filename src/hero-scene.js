import {sunrisePose} from './hero-sunrise.js';
import {catchPose,CONTACT_REVEAL} from './hero-catch.js';
const $=s=>document.querySelector(s);
const contact=$('#held-contact'),status=$('#status'),stage=$('.mascot-stage'),scene=$('.scene');
const nodes=Object.fromEntries(['noticePose','pullPose','retrievePose','closePose','fishingBucket','fishingRock','fishingPool','tvNoise','tvTrackingBand','ghostLight','ghostActor','ghostLean','ghostGaze','eyes','closedEyes','rodGroup','fishingLine','bobber','catchToken','ripple1','ripple2','sunriseLandscape','farMountains','nearMountains','risingSun','sunRays','seymurActor','heroGlitch','morphContour','morphRod','morphDisplacement','morphNoise','seymurReveal'].map(id=>[id,$('#'+id)]));
const attr=(id,key,value)=>nodes[id].setAttribute(key,String(value));
const opacity=(id,value)=>attr(id,'opacity',value);
// Match equally spaced contour points, starting at the crown of each silhouette.
function sampleContour(path,map){
 const count=160,length=path.getTotalLength();
 const points=Array.from({length:count},(_,i)=>map(path.getPointAtLength(length*i/count)));
 const crown=points.reduce((best,p,i)=>p.y<points[best].y?i:best,0);
 return points.slice(crown).concat(points.slice(0,crown));
}
const ghostContour=sampleContour($('#ghostBody > path'),p=>{
 const x=177+p.x*.51,y=120+p.y*.51,a=7*Math.PI/180;
 return {x:237+(x-237)*Math.cos(a)-(y-242)*Math.sin(a),y:239+(x-237)*Math.sin(a)+(y-242)*Math.cos(a)};
});
const personContour=sampleContour($('#fullBodyOutline > path'),p=>({x:92+p.x*384/1448,y:28+p.y*288/1086}));
attr('morphRod','d',$('#fullBodyOutline > path:nth-child(2)').getAttribute('d'));
attr('morphRod','transform','translate(92 28) scale('+384/1448+')');
function drawMorph(p){
 const active=!reduced&&p.glitch>0;
 if(active){
  const points=ghostContour.map((a,i)=>{const b=personContour[i];return `${(a.x+(b.x-a.x)*p.morph).toFixed(2)} ${(a.y+(b.y-a.y)*p.morph).toFixed(2)}`});
  attr('morphContour','d','M'+points.join('L')+'Z');
  attr('morphRod','transform',`translate(${261+24*p.morph} ${224-49*p.morph}) scale(${.656+.344*p.morph} ${.385+.615*p.morph}) translate(-285 -175) translate(92 28) scale(${384/1448})`);
  attr('seymurReveal','clip-path','url(#morphClip)');
  attr('seymurActor','filter','url(#morphDistortion)');
  attr('ghostActor','filter','url(#morphDistortion)');
 }else{
  nodes.seymurReveal.removeAttribute('clip-path');
  nodes.seymurActor.removeAttribute('filter');
  nodes.ghostActor.removeAttribute('filter');
 }
 attr('morphDisplacement','scale',active?p.distortion:0);
 attr('morphNoise','baseFrequency',`${.025+p.morph*.009} ${.06+p.morph*.016}`);
}
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=motion.matches,now=0,lastTime=null,raf=0,visible=true,moment=null,nextSunrise=1500,portraitReady=false,artworkFailed=false,lastStaticFrame=-1,contactShown=false;
const artwork=['seymur-fishing-natural','seymur-catch-notice-v2','seymur-catch-pull-v2','seymur-catch-retrieve-v2','seymur-connect-close-v2','seymur-business-card-print'];

Promise.all(artwork.map(name=>{const image=new Image();image.src=`assets/${name}.png`;return image.decode()}))
 .then(()=>{portraitReady=true;if(reduced)showFinal()})
 .catch(()=>{artworkFailed=true;suspend();status.classList.remove('sr-only');status.innerHTML='<a href="mailto:smammadov494@gmail.com">smammadov494@gmail.com ↗</a>'});
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
function showContact(){
 if(contactShown)return;
 contactShown=true;contact.setAttribute('opacity','1');contact.setAttribute('pointer-events','auto');
 nodes.closePose.removeAttribute('aria-hidden');
 contact.querySelectorAll('a').forEach(a=>a.setAttribute('tabindex','0'));
 $('#contact-announcement').textContent='Contact details are on the card Seymur is holding: email, LinkedIn, and GitHub.';
}
function showFinal(){
 if(!portraitReady)return;
 moment={start:now-CONTACT_REVEAL,still:true};
 drawSunrise();drawContactCatch(CONTACT_REVEAL);showContact();
}
function startSunrise(){
 contactShown=false;
 moment={start:now,still:reduced};lastStaticFrame=-1;
 stage.dataset.scene='sunrise';
 if(reduced)showFinal();schedule();
}
function drawFishing(t){
 const dy=reduced?0:Math.sin(t/1000)*1.5,by=310+(reduced?0:Math.sin(t/420)*1.5);
 attr('ghostActor','transform',`translate(0 ${dy})`);attr('rodGroup','transform','');
 attr('fishingLine','d',`M379 ${172+dy} Q382 245 368 ${by}`);opacity('fishingLine',1);
 attr('bobber','transform',`translate(368 ${by})`);opacity('bobber',1);opacity('catchToken',0);
 nodes.eyes.querySelectorAll('ellipse').forEach(e=>e.setAttribute('ry',reduced?28:t%3800>3620?3:28));
}
// Generated acting poses take over once the TV-static transformation is complete.
function drawContactCatch(elapsed){
 if(elapsed<9000)return;
 const p=catchPose(moment.still?CONTACT_REVEAL:elapsed);
 opacity('seymurActor',p.original);
 ['notice','pull','retrieve','close'].forEach(id=>opacity(id+'Pose',p[id]));
 opacity('sunriseLandscape',p.landscape);opacity('fishingPool',p.landscape);opacity('fishingBucket',p.bucket);
 const wobble=p.phase==='land'?Math.sin((elapsed-14000)/75)*3*(1-smooth((elapsed-14000)/700)):0;
 attr('fishingBucket','transform',`translate(394 251) rotate(${wobble}) scale(1.2 1.6) translate(-150 -278)`);
 attr('closePose','transform',`translate(270 310) scale(${.38+.62*p.approach}) translate(-270 -310)`);
 opacity('catchToken',p.card);attr('catchToken','transform',`translate(${p.x} ${p.y}) rotate(${p.angle}) scale(${p.scale})`);
 attr('fishingLine','d',`M469 34 Q480 100 ${p.x} ${p.y-18*p.scale}`);
 opacity('fishingLine',p.attached?1:0);opacity('bobber',0);
 stage.dataset.scene=p.phase;
 const captions={notice:'Seymur notices a catch.',pull:'Seymur reels in the line.',flight:'The card arcs toward the bucket.',land:'The card lands in the bucket.',retrieve:'Seymur retrieves the card.',approach:'Seymur brings the card toward the viewer.',connect:'Seymur holds his business card.'};
 status.textContent=captions[p.phase];
 scene.setAttribute('aria-label',p.ready?'Seymur smiles close to the camera, holding his contact card toward you':captions[p.phase]);
 contact.setAttribute('opacity',String(smooth((p.approach-.6)/.4)));
 scene.setAttribute('viewBox',`${84*p.approach} 0 ${540-140*p.approach} 375`);
 stage.style.setProperty('--scene-height',`${410+140*p.approach}px`);
 if(p.ready){showContact();moment.still=true}
}
function drawSunrise(){const p=sunrisePose(Math.min(now-moment.start,9500),false);
 ['noticePose','pullPose','retrievePose','closePose'].forEach(id=>opacity(id,0));opacity('fishingPool',1);opacity('fishingBucket',1);attr('fishingBucket','transform','');opacity('sunriseLandscape',p.landscape);attr('farMountains','transform',`translate(0 ${(1-p.mountains)*190})`);attr('nearMountains','transform',`translate(0 ${(1-p.nearMountains)*140})`);attr('risingSun','transform',`translate(0 ${(1-p.sun)*195})`);opacity('sunRays',p.sun*.65);opacity('ghostActor',p.ghost);attr('ghostActor','transform',`translate(0 ${-p.look*3})`);attr('ghostLean','transform',`rotate(${p.look*7} 237 242)`);attr('ghostGaze','transform',`translate(${p.look*9} ${-p.look*13})`);opacity('eyes',1-p.eyes);opacity('closedEyes',p.eyes);opacity('ghostLight',p.eyes*.4);nodes.eyes.querySelectorAll('ellipse').forEach(e=>e.setAttribute('ry',28-p.look*7));opacity('rodGroup',1-p.look*.85);['fishingLine','bobber','catchToken'].forEach(id=>opacity(id,0));opacity('seymurActor',p.portrait);opacity('fishingRock',1-p.portrait);attr('fishingPool','transform',`translate(${p.portrait*80} 0)`);const floatY=311+(reduced?0:Math.sin(now/650)*1.2);attr('fishingLine','d',`M465 40Q475 190 448 ${floatY}`);opacity('fishingLine',p.portrait);attr('bobber','transform',`translate(448 ${floatY})`);opacity('bobber',p.portrait);attr('seymurActor','transform','');drawMorph(p);opacity('heroGlitch',p.glitch*.82);if(p.glitch>0&&p.staticFrame!==lastStaticFrame){attr('tvNoise','seed',71+p.staticFrame*13);lastStaticFrame=p.staticFrame}attr('tvTrackingBand','transform',`translate(0 ${p.trackingY})`);
 const phase=p.glitch>.05?'glitch':p.portrait>.7?'portrait':p.eyes>.8?'basking':'sunrise';stage.dataset.scene=phase;scene.setAttribute('aria-label',phase==='portrait'?'A full-body graphite illustration of Seymur seated on a rock fishing, looking toward the sunlight, drawn throughout in a consistent graphite style':'Astro looks up and closes his eyes as the sun rises behind the mountains');
}
function tick(t){raf=0;if(document.hidden||!visible){lastTime=null;return}now+=lastTime===null?0:Math.min(100,t-lastTime);lastTime=t;if(!moment&&!reduced&&!artworkFailed&&now>=nextSunrise)startSunrise();if(moment){if(!portraitReady&&now-moment.start>4800)moment.start=now-4800;drawSunrise();if(moment)drawContactCatch(moment.still?CONTACT_REVEAL:now-moment.start)}else drawFishing(now);for(let i=1;i<3;i++){const k=reduced?i*.28:(now/2200+i*.5)%1;attr('ripple'+i,'rx',20+k*48);attr('ripple'+i,'ry',4+k*10);opacity('ripple'+i,1-k)}schedule()}
function schedule(){if(!raf&&visible&&!document.hidden&&!moment?.still&&!artworkFailed)raf=requestAnimationFrame(tick)}
function suspend(){cancelAnimationFrame(raf);raf=0;lastTime=null}
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else suspend()},{threshold:0}).observe(stage);
document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();else schedule()});
motion.addEventListener('change',e=>{reduced=e.matches;if(reduced)showFinal();else schedule()});
schedule();
