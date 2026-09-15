import {sunrisePose} from './hero-sunrise.js';
import {catchPose,CONTACT_REVEAL} from './hero-catch.js';
const $=s=>document.querySelector(s);
const fish=$('#fish'),contact=$('#contact-card'),status=$('#status'),trigger=$('#sunrise-trigger'),stage=$('.mascot-stage'),note=$('.scene-note'),scene=$('.scene');
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
let reduced=motion.matches,now=0,lastTime=null,raf=0,visible=true,moment=null,nextSunrise=3000,portraitReady=false,lastStaticFrame=-1,contactShown=false;
const artwork=['seymur-fishing-natural','seymur-catch-notice-v2','seymur-catch-pull-v2','seymur-catch-retrieve-v2','seymur-connect-close-v2'];
trigger.disabled=true;
Promise.all(artwork.map(name=>{const image=new Image();image.src=`assets/${name}.png`;return image.decode()}))
 .then(()=>{portraitReady=true;trigger.disabled=false;if(reduced)showFinal()})
 .catch(()=>{trigger.hidden=true;showContact()});
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
function showContact(){
 if(contactShown)return;
 contactShown=true;contact.hidden=false;
 if(!reduced)contact.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:350,easing:'ease-out'});
 $('#contact-announcement').textContent='Let’s connect. Email, LinkedIn, and GitHub links are ready below.';
}
function showFinal(){
 if(!portraitReady){showContact();return}
 moment={start:now-CONTACT_REVEAL,still:true};
 drawSunrise();drawContactCatch(CONTACT_REVEAL);showContact();
}
function startSunrise(){
 if(!portraitReady)return;
 contactShown=false;contact.hidden=true;
 moment={start:now,still:reduced};lastStaticFrame=-1;
 stage.dataset.scene='sunrise';trigger.setAttribute('aria-pressed','true');trigger.textContent='skip to contact ↗';
 note.innerHTML='a little sunlight.<br>a familiar face.';
 fish.setAttribute('aria-label','Watch Seymur reel in his contact card. Click to show it now.');
 if(reduced)showFinal();schedule();
}
function finishSunrise(){
 drawMorph({glitch:0,morph:0});moment=null;nextSunrise=Infinity;
 delete stage.dataset.scene;trigger.setAttribute('aria-pressed','false');trigger.textContent=reduced?'show portrait ↗':'replay the story ↗';
 note.innerHTML='a little hello,<br>reeled in for you.';status.textContent='let’s make something.';
 fish.setAttribute('aria-label','Replay the sunshine and contact card story');
 scene.setAttribute('aria-label','Astro fishing beside a pool');
 ['noticePose','pullPose','retrievePose','closePose','sunriseLandscape','seymurActor','heroGlitch','closedEyes','ghostLight','catchToken'].forEach(id=>opacity(id,0));
 opacity('fishingBucket',1);attr('fishingBucket','transform','');opacity('fishingRock',1);attr('fishingPool','transform','');opacity('ghostActor',1);opacity('eyes',1);opacity('rodGroup',1);attr('ghostLean','transform','');attr('ghostGaze','transform','');
}
function revealOrReplay(){
 if(moment&&stage.dataset.scene!=='connect')showFinal();
 else{finishSunrise();startSunrise()}
}
trigger.onclick=revealOrReplay;fish.onclick=revealOrReplay;
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
 const captions={notice:'wait… there’s something there.',pull:'oh, I’ve got something…',flight:'straight into the bucket.',land:'got it.',retrieve:'one second…',approach:'this is for you.',connect:'let’s connect.'};
 status.textContent=captions[p.phase];
 note.innerHTML=p.phase==='notice'||p.phase==='pull'?'something on<br>the line…':p.phase==='retrieve'?'a little something<br>for you.':p.phase==='connect'?'there you are.':'a good catch.';
 scene.setAttribute('aria-label',p.ready?'Seymur smiles close to the camera, holding his contact card toward you':captions[p.phase]);
 if(p.ready){showContact();moment.still=true;trigger.textContent='replay the story ↗';trigger.setAttribute('aria-pressed','false');fish.setAttribute('aria-label','Replay the illustrated fishing story')}
}
function drawSunrise(){const p=sunrisePose(Math.min(now-moment.start,9500),false);if(p.done){finishSunrise();drawFishing(now);return}
 ['noticePose','pullPose','retrievePose','closePose'].forEach(id=>opacity(id,0));opacity('fishingPool',1);opacity('fishingBucket',1);attr('fishingBucket','transform','');opacity('sunriseLandscape',p.landscape);attr('farMountains','transform',`translate(0 ${(1-p.mountains)*190})`);attr('nearMountains','transform',`translate(0 ${(1-p.mountains)*140})`);attr('risingSun','transform',`translate(0 ${(1-p.sun)*195})`);opacity('sunRays',p.sun*.65);opacity('ghostActor',p.ghost);attr('ghostActor','transform',`translate(0 ${-p.look*3})`);attr('ghostLean','transform',`rotate(${p.look*7} 237 242)`);attr('ghostGaze','transform',`translate(${p.look*9} ${-p.look*13})`);opacity('eyes',1-p.eyes);opacity('closedEyes',p.eyes);opacity('ghostLight',p.eyes*.4);nodes.eyes.querySelectorAll('ellipse').forEach(e=>e.setAttribute('ry',28-p.look*7));opacity('rodGroup',1-p.look*.85);['fishingLine','bobber','catchToken'].forEach(id=>opacity(id,0));opacity('seymurActor',p.portrait);opacity('fishingRock',1-p.portrait);attr('fishingPool','transform',`translate(${p.portrait*80} 0)`);const floatY=311+(reduced?0:Math.sin(now/650)*1.2);attr('fishingLine','d',`M465 40Q475 190 448 ${floatY}`);opacity('fishingLine',p.portrait);attr('bobber','transform',`translate(448 ${floatY})`);opacity('bobber',p.portrait);attr('seymurActor','transform','');drawMorph(p);opacity('heroGlitch',p.glitch*.82);if(p.glitch>0&&p.staticFrame!==lastStaticFrame){attr('tvNoise','seed',71+p.staticFrame*13);lastStaticFrame=p.staticFrame}attr('tvTrackingBand','transform',`translate(0 ${p.trackingY})`);
 const phase=p.glitch>.05?'glitch':p.portrait>.7?'portrait':p.eyes>.8?'basking':'sunrise';stage.dataset.scene=phase;status.textContent=phase==='glitch'?(p.returning?'a little ghost again…':'becoming me…'):phase==='portrait'?'a little more me.':phase==='basking'?'taking in the sunshine…':'a change of scenery…';scene.setAttribute('aria-label',phase==='portrait'?'A full-body graphite illustration of Seymur seated on a rock fishing, looking toward the sunlight, drawn throughout in a consistent graphite style':'Astro looks up and closes his eyes as the sun rises behind the mountains');
}
function tick(t){raf=0;if(document.hidden||!visible){lastTime=null;return}now+=lastTime===null?0:Math.min(100,t-lastTime);lastTime=t;if(!moment&&!reduced&&portraitReady&&now>=nextSunrise)startSunrise();if(moment){drawSunrise();if(moment)drawContactCatch(moment.still?CONTACT_REVEAL:now-moment.start)}else drawFishing(now);for(let i=1;i<3;i++){const k=reduced?i*.28:(now/2200+i*.5)%1;attr('ripple'+i,'rx',20+k*48);attr('ripple'+i,'ry',4+k*10);opacity('ripple'+i,1-k)}schedule()}
function schedule(){if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(tick)}
function suspend(){cancelAnimationFrame(raf);raf=0;lastTime=null}
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else suspend()},{threshold:0}).observe(stage);
document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();else schedule()});
motion.addEventListener('change',e=>{reduced=e.matches;if(reduced)showFinal();else if(!moment)trigger.textContent='a little sunshine ↗'});
if(reduced){trigger.textContent='show contact portrait ↗';showContact()}schedule();
