import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Player} from '@remotion/player';

export const FPS = 30;
export const DURATION = 900;
export const chapters = [
  {name:'Discover', title:'Every adventure starts with a URL.', copy:'Point Weaszel at a website. Our curious little scout steps inside.'},
  {name:'Observe', title:'One scout. Different ways of seeing.', copy:'Read the page, its accessibility tree, and its forms. Collect evidence of what each control can do.'},
  {name:'Build tools', title:'Give every useful action a name.', copy:'Turn observed controls into tools with clear inputs, backed by a plan the local browser can follow.'},
  {name:'Inspect', title:'A little less mystery. A lot more Swagger.', copy:'Open the generated API reference. Inspect the endpoints and their inputs before trying them locally.'},
  {name:'Call', title:'Now an agent knows what to ask for.', copy:'An agent calls a tool. The local adapter checks the inputs, operates the page, and returns what it observes.'},
];
const clamp = (x,min=0,max=1)=>Math.min(max,Math.max(min,x));
const ease = x => 1-Math.pow(1-clamp(x),3);
const PAPER = '#eeedeb';

// All acting follows one continuous timeline. A run is used only for the entrance.
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const between=(f,a,b)=>smooth((f-a)/(b-a));
const lerp=(a,b,t)=>a+(b-a)*t;
// Crop in source pixels, keeping a fixed scale instead of stretching wider poses.
// The sniffing nose and landing tail cross grid lines; the last cell contains
// the previous pose's tail. These bounds include each complete actor only.
const ACTING_SHEET={width:1774,height:887,cell:443.5};
const ACTING_CROPS=[
 [0,0,443.5,443.5],[443.5,0,443.5,443.5],
 [887,0,490,443.5],[1357,0,417,443.5],
 [0,443.5,443.5,443.5],[443.5,443.5,443.5,443.5],
 [887,443.5,461,443.5],[1355,443.5,419,443.5],
];
const cardTop=compact=>compact?230:225;
// Contact points measured on the sheet: landing feet and seated haunch.
const LANDING_CONTACT=.72,PERCH_CONTACT=.56;
const perchedY=(compact,size)=>cardTop(compact)+size*(.84-PERCH_CONTACT);
const landedY=(compact,size)=>cardTop(compact)+size*(.84-LANDING_CONTACT);
export function actorAt(frame,compact=false){
 const floor=compact?790:590,home=compact?215:230,investigate=compact?270:300;
 let actor={x:home,y:floor,size:compact?245:320,pose:0,rotation:0,sx:1,sy:1,run:false};
 if(frame<72){const t=between(frame,0,72);actor.x=lerp(-130,home,t);actor.run=true;actor.y=floor-Math.sin(frame*.58)*3;}
 else if(frame<96){const t=between(frame,72,96);actor.pose=0;actor.x=home+Math.sin(t*Math.PI)*14;actor.sx=1+.07*Math.sin(t*Math.PI);actor.sy=1-.05*Math.sin(t*Math.PI);}
 else if(frame<180){actor.pose=frame<126?0:1;actor.rotation=Math.sin(between(frame,128,155)*Math.PI)*-4;actor.x=lerp(home,investigate,between(frame,155,180));}
 else if(frame<245){actor.pose=2;actor.x=investigate;actor.y=floor+Math.sin(between(frame,225,245)*Math.PI)*6;}
 else if(frame<330){actor.pose=3;actor.x=compact?investigate:investigate+60;actor.y=floor-8*Math.sin(between(frame,250,275)*Math.PI);}
 else if(frame<370){actor.pose=1;actor.x=investigate;}
 else if(frame<470){actor.pose=3;actor.x=compact?investigate:investigate+60;actor.rotation=-3*Math.sin(between(frame,390,425)*Math.PI);actor.y=floor-6*Math.sin(between(frame,390,425)*Math.PI);}
 else if(frame<510){actor.pose=0;actor.x=investigate;}
 else if(frame<578){actor.pose=4;actor.x=lerp(investigate,compact?380:650,between(frame,510,570));actor.size=lerp(compact?245:320,compact?230:260,between(frame,510,560));const anticipation=Math.sin(between(frame,550,578)*Math.PI);actor.sy=1-.1*anticipation;actor.sx=1+.06*anticipation;actor.y=floor+20*between(frame,510,550)+9*anticipation;}
 else if(frame<654){const t=clamp((frame-578)/76),endX=compact?615:1010;actor.pose=5;actor.x=lerp(compact?380:650,endX,t);actor.y=lerp(floor+20,landedY(compact,compact?210:235),t)-Math.sin(t*Math.PI)*115;actor.size=lerp(compact?230:260,compact?210:235,t);actor.rotation=lerp(-14,8,t);}
 else if(frame<680){const t=between(frame,654,680);actor.pose=6;actor.x=compact?615:1010;actor.size=compact?210:235;actor.y=landedY(compact,actor.size);actor.sy=1-.1*Math.sin(t*Math.PI);actor.sx=1+.04*Math.sin(t*Math.PI);}
 else{actor.pose=7;actor.x=compact?615:1010;actor.size=compact?210:235;actor.y=perchedY(compact,actor.size);actor.rotation=frame<720?-2*Math.sin(between(frame,680,720)*Math.PI):0;}
 return actor;
}
function Actor({frame,compact}){
 const a=actorAt(frame,compact),cell=a.run?Math.floor(frame/3)%8:a.pose;
 const airborne=frame>=578&&frame<654,landed=frame>=654;
 const scale=a.size/ACTING_SHEET.cell;
 const crop=a.run?[cell%4*ACTING_SHEET.cell,Math.floor(cell/4)*ACTING_SHEET.cell,ACTING_SHEET.cell,ACTING_SHEET.cell]:ACTING_CROPS[cell];
 const insetX=(crop[0]-cell%4*ACTING_SHEET.cell)*scale;
 const origin=a.pose===7&&!a.run?`${a.size*.61-insetX}px ${a.size*PERCH_CONTACT}px`:a.pose===6&&!a.run?`${a.size*.5-insetX}px ${a.size*LANDING_CONTACT}px`:`${a.size*.5-insetX}px ${a.size*.70}px`;
 return <AbsoluteFill data-actor-layer={landed?'perched':airborne?'behind-card-jump':'behind-card'} style={{zIndex:landed?5:airborne?4:1,pointerEvents:'none',mixBlendMode:a.run?'normal':'multiply',clipPath:airborne?`inset(0 0 calc(100% - ${cardTop(compact)}px) 0)`:undefined}}><div data-weasel-actor="true" data-pose={a.run?'run':a.pose} style={{position:'absolute',left:a.x-a.size/2+insetX,top:a.y-a.size*.84,width:crop[2]*scale,height:crop[3]*scale,backgroundImage:`url(/assets/${a.run?'weasel-run.png':'weasel-acting.png'})`,backgroundSize:`${ACTING_SHEET.width*scale}px ${ACTING_SHEET.height*scale}px`,backgroundPosition:`${-crop[0]*scale}px ${-crop[1]*scale}px`,backgroundRepeat:'no-repeat',transform:`rotate(${a.rotation}deg) scale(${a.sx},${a.sy})`,transformOrigin:origin}}/></AbsoluteFill>;
}
function Window({children,left,top,width,scene,frame}){
 return <div style={{position:'absolute',left,top,width,border:'1.5px solid #999a96',borderRadius:14,background:'#f8f7f3',zIndex:3,boxShadow:'7px 12px 0 #393c3608',overflow:'hidden',transform:`translateY(${frame<72?(1-between(frame,0,72))*10:0}px)`}}><div style={{height:42,borderBottom:'1px solid #cdcec7',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',fontSize:19,color:'#74766e'}}><span style={{fontSize:12,letterSpacing:5}}>● ● ●</span><span>{['a new place','a closer look','a useful tool','the open reference','your move'][scene]}</span></div><div style={{padding:24}}>{children}</div></div>;
}
export function WeaselFilm({compact=false}){
 const frame=useCurrentFrame(),{width:w}=useVideoConfig();
 const scene=Math.min(4,Math.floor(frame/180)),t=frame%180;
 const left=compact?70:475,width=compact?620:625,top=compact?230:225;
 const contentOpacity=scene===0?1:clamp(t/12);
 const title={fontSize:compact?38:40,lineHeight:1.1,margin:'0 0 20px',fontWeight:500};
 const mono={font:'18px/1.8 monospace',color:'#595e54'};
 const beat=frame<72?'here he comes…':frame<180?'oh. hello, you.':frame<245?'what have we got here?':frame<370?'there’s the useful bit.':frame<470?'one little tap…':frame<545?'a tool, just like that.':frame<578?'ready…':frame<654?'and… leap!':frame<720?'stuck the landing.':'I’ll keep an eye on things.';
 return <AbsoluteFill style={{background:PAPER,color:'#3c4139',fontFamily:"'Caveat','Segoe Print',cursive",lineHeight:1.2,overflow:'hidden'}}>
  <Img src="/assets/weasel-world.png" style={{position:'absolute',width:'115%',height:'100%',objectFit:'cover',left:-between(frame,0,654)*w*.06,top:80,opacity:.18,mixBlendMode:'multiply'}}/>
  <div style={{position:'absolute',top:24,left:32,right:32,fontSize:compact?24:22,display:'flex',justifyContent:'space-between',color:'#6b7164'}}><span>Weaszel / a little field trip</span><span>0{scene+1} / 05</span></div>
  <div style={{position:'absolute',left:compact?50:80,top:compact?95:120,fontSize:compact?42:46,transform:'rotate(-4deg)',maxWidth:compact?520:360,lineHeight:1.15}}>{beat}</div>
  <Window left={left} top={top} width={width} scene={scene} frame={frame}>
   <div style={{opacity:contentOpacity}}>
    {scene===0&&<><div style={{border:'1px solid #abb1a1',padding:'12px 18px',borderRadius:8,fontSize:30,marginBottom:22}}>↗ youtube.com</div><h3 style={title}>A page of possibilities.</h3><p style={{fontSize:27,margin:0,color:'#717568'}}>Let’s find something useful.</p></>}
    {scene===1&&<><h3 style={title}>Follow the evidence.</h3><div style={{border:`${frame>=245?2:1}px solid #828e77`,background:frame>=245?'#e8ecdf':'transparent',padding:'10px 18px',borderRadius:7,fontSize:29,transform:`scale(${1+Math.sin(clamp((frame-250)/35)*Math.PI)*.025})`}}>Search videos <span style={{float:'right'}}>↵</span></div><div style={{...mono,marginTop:18,opacity:clamp((t-40)/20)}}>role: searchbox<br/>input: query<br/>action: press Enter</div><div style={{fontSize:25,marginTop:14,color:'#78806d'}}>Page + accessibility + form controls</div></>}
    {scene===2&&<><h3 style={title}>A clear little contract.</h3><div style={{...mono,borderLeft:'2px solid #89947d',padding:'8px 20px',background:'#e9ede280'}}>{['tool: submit_search','input: { query: string }','plan: fill → press Enter'].map((line,i)=><div key={line} style={{opacity:clamp((frame-387-i*14)/15),transform:`translateX(${(1-between(frame,387+i*14,410+i*14))*12}px)`}}>{line}</div>)}</div><p style={{fontSize:26,margin:'18px 0 0',opacity:clamp((t-85)/20)}}>A name. Its inputs. The evidence.</p></>}
    {scene===3&&<><h3 style={title}>Nothing hidden away.</h3>{['GET / read the page','POST / submit the search','POST / click a control'].map((line,i)=><div key={line} style={{fontSize:27,borderTop:'1px solid #ced3c4',padding:'12px 0',opacity:clamp((t-i*15)/20)}}>{line}<span style={{float:'right'}}>↗</span></div>)}<div style={{fontSize:23,color:'#748067',marginTop:12}}>OpenAPI / Swagger · inspect the inputs</div></>}
    {scene===4&&<><h3 style={title}>{compact?<>“Find videos about<br/>MCP accessibility.”</>:"Your turn, agent."}</h3><div style={{font:'17px/1.6 monospace',padding:16,border:'1px solid #abb39e',borderRadius:7}}>{compact?<>submit_search({'{'}<br/>&nbsp;query: "MCP accessibility"<br/>{'}'})</>:'submit_search({query: "MCP accessibility"})'}</div><div style={{fontSize:26,marginTop:18,opacity:clamp((t-40)/24)}}>↳ Return the observed page.</div></>}
   </div>
  </Window>
  <Actor frame={frame} compact={compact}/>
  <div style={{position:'absolute',left:32,right:32,bottom:22,display:'flex',justifyContent:'space-between',fontSize:compact?22:20,color:'#78806e'}}><span>{scene===4?'live actions use the local adapter':'one curious scout, one continuous adventure'}</span><span>illustrated walkthrough</span></div>
 </AbsoluteFill>;
}

function App(){
 const player=useRef(null), section=useRef(null), raf=useRef(0), frameRef=useRef(0), playingRef=useRef(false), visibleRef=useRef(false);
 const [frame,setFrame]=useState(0),[playing,setPlaying]=useState(false),[compact,setCompact]=useState(()=>matchMedia('(max-width: 650px)').matches),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),[staticMode,setStaticMode]=useState(false),[manualScroll,setManualScroll]=useState(false);
 const staticView=reduced||staticMode;
 const inputProps=useMemo(()=>({compact}),[compact]);
 const active=Math.min(4,Math.floor(frame/180));
 const seek=useCallback((next)=>{const n=Math.round(clamp(next,0,DURATION-1));player.current?.seekTo(n);frameRef.current=n;setFrame(n);},[]);
 const pause=useCallback(()=>{player.current?.pause();playingRef.current=false;setPlaying(false);},[]);
 useEffect(()=>{
  const size=matchMedia('(max-width: 650px)'),motion=matchMedia('(prefers-reduced-motion: reduce)');
  const resize=()=>setCompact(size.matches),preference=()=>setReduced(motion.matches);
  size.addEventListener('change',resize);motion.addEventListener('change',preference);
  return()=>{size.removeEventListener('change',resize);motion.removeEventListener('change',preference);};
 },[]);
 useEffect(()=>{
  const el=player.current;if(!el)return;
  const update=e=>{frameRef.current=e.detail.frame;setFrame(e.detail.frame);};
  const ended=()=>{playingRef.current=false;setPlaying(false);setManualScroll(true);};
  el.addEventListener('frameupdate',update);el.addEventListener('ended',ended);
  return()=>{el.removeEventListener('frameupdate',update);el.removeEventListener('ended',ended);};
 },[staticView,compact]);
 useEffect(()=>{
  if(staticView)return;
  const observer=new IntersectionObserver(([entry])=>{visibleRef.current=entry.isIntersecting;if(!entry.isIntersecting)pause();else onScroll();},{threshold:0});
  observer.observe(section.current);
  const onScroll=()=>{
   if(raf.current)return;
   raf.current=requestAnimationFrame(()=>{raf.current=0;if(!visibleRef.current||playingRef.current||matchMedia('(max-height: 620px) and (min-width: 651px)').matches)return;
    const el=section.current, rect=el.getBoundingClientRect(),distance=el.offsetHeight-innerHeight;
    seek(clamp(-rect.top/Math.max(1,distance))*(DURATION-1));setManualScroll(false);
   });
  };
  const hide=()=>{if(document.hidden)pause();};
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);document.addEventListener('visibilitychange',hide);onScroll();
  return()=>{observer.disconnect();removeEventListener('scroll',onScroll);removeEventListener('resize',onScroll);document.removeEventListener('visibilitychange',hide);cancelAnimationFrame(raf.current);raf.current=0;};
 },[staticView,seek,pause]);
 const jump=(index)=>{
  pause();seek(index*180+90);setManualScroll(true);
 };
 const togglePlay=()=>{
  if(playingRef.current){pause();return;}
  if(frameRef.current>=DURATION-2)seek(0);
  playingRef.current=true;setPlaying(true);player.current?.play();
 };
 const steps=<ol className="weasel-static-steps">{chapters.map((c,i)=><li key={c.name}><span>0{i+1}</span><div><h4>{c.title}</h4><p>{c.copy}</p></div></li>)}</ol>;
 return <>
  <div className={`weasel-scroll ${staticView?'weasel-static':''}`} ref={section}>
   <div className="weasel-sticky">
    {staticView?<><div className="weasel-static-art"><img src="/assets/weaszel-graphite.png" alt="A graphite weasel leaping through layered browser windows"/></div>{steps}</>:<>
      <div className="weasel-caption"><span className="weasel-take">0{active+1} / {chapters[active].name}</span><h3>{chapters[active].title}</h3><p>{chapters[active].copy}</p></div>
      <div className="weasel-cinema" aria-label={`Animated Weaszel walkthrough. Chapter ${active+1}: ${chapters[active].name}.`}>
        <Player ref={player} component={WeaselFilm} inputProps={inputProps} durationInFrames={DURATION} fps={FPS} compositionWidth={compact?760:1200} compositionHeight={compact?850:650} style={{width:'100%'}} controls={false} autoPlay={false} loop={false} clickToPlay={false} doubleClickToFullscreen={false} spaceKeyToPlayOrPause={false} acknowledgeRemotionLicense aria-label="Weaszel animated story"/>
      </div>
      <div className="weasel-transport"><button type="button" className="weasel-play" onClick={togglePlay} aria-label={playing?'Pause the Weaszel movie':'Play the Weaszel movie'}>{playing?'Ⅱ Pause movie':'▷ Play movie'}</button><label className="weasel-scrub"><span className="sr-only">Movie position</span><input type="range" min="0" max={DURATION-1} value={frame} aria-valuetext={`Chapter ${active+1}: ${chapters[active].name}`} onChange={e=>{pause();seek(Number(e.target.value));setManualScroll(true);}}/></label><span className="weasel-time">{String(Math.floor(frame/FPS)).padStart(2,'0')} / 30s</span></div>
      <nav className="weasel-chapters" aria-label="Weaszel movie chapters">{chapters.map((c,i)=><button type="button" key={c.name} className={i===active?'active':''} aria-current={i===active?'step':undefined} onClick={()=>jump(i)}><span>0{i+1}</span>{c.name}</button>)}</nav>
      <p className="weasel-scroll-hint">{playing?'Settle in. Weaszel’s got this.':manualScroll?'Scroll to rejoin the trail.':'Scroll to move the story. A little further…'}</p>
    </>}
   </div>
  </div>
  <div className="weasel-after"><p>From a page to a tool an agent can understand.</p><div className="weasel-actions"><a href="https://weaszel-youtube-swagger.smammadov494.chatgpt.site" target="_blank" rel="noreferrer">Explore the YouTube Swagger ↗</a><a href="https://github.com/smammadov1994/Weaszel/tree/codex/website-mcp-adapter/adapter" target="_blank" rel="noreferrer">See the adapter code ↗</a></div><p className="weasel-scope">Local adapter prototype. The hosted Swagger is a reference; live calls run on your computer.</p><button type="button" className="weasel-motion" onClick={()=>{pause();setStaticMode(!staticMode);}} disabled={reduced}>{reduced?'Motion reduced to match your device':staticMode?'Show the animated story':'Read without animation'}</button></div>
 </>;
}

const root=typeof document==='undefined'?null:document.getElementById('weasel-story');
if(root) createRoot(root).render(<App/>);
