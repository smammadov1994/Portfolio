import React,{useEffect,useRef,useState,useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {Player} from '@remotion/player';

export const TOTAL=720;
export const chapters=[
 {name:'Pull',title:'Every opportunity starts somewhere.',copy:'Bring job listings in from applicant tracking systems (ATS), giving each opening a path into the distribution workflow.'},
 {name:'Prepare',title:'Different systems. A common language.',copy:'Turn incoming listings into consistent job records, ready to evaluate by role, location, and destination requirements.'},
 {name:'Match',title:'Find the right place for each role.',copy:'Use the job’s context to choose relevant destinations. A nursing role and an engineering role take different paths.'},
 {name:'Distribute',title:'One opening. The right audience.',copy:'Send each job to its selected boards and track delivery, connecting the source listing to the places candidates look.'},
];
const jobs=[
 {title:'Software Engineer',short:'Engineering',location:'Remote',category:'Technology',board:'Tech careers',ats:'ATS / A'},
 {title:'Registered Nurse',short:'Nursing',location:'Boston, MA',category:'Healthcare',board:'Healthcare',ats:'ATS / B'},
 {title:'Operations Lead',short:'Operations',location:'Austin, TX',category:'Operations',board:'Local jobs',ats:'ATS / C'},
];
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
const ink='#414641',muted='#777d74',paper='#f9f8f4',line='#bcc1b7';
const hand="'Caveat',cursive",body="'Manrope',sans-serif";
function Paper({children,style={}}){return <div style={{position:'absolute',background:paper,border:`1px solid ${line}`,borderRadius:8,boxShadow:'3px 7px 16px #333c2d12',...style}}>{children}</div>}
function WindowBar({label,active=false}){return <div style={{height:42,padding:'10px 14px',display:'flex',alignItems:'center',gap:6,borderBottom:`1px solid ${line}`,fontSize:17,color:muted}}><i style={{width:5,height:5,background:active?ink:line,borderRadius:'50%'}}/><i style={{width:5,height:5,background:line,borderRadius:'50%'}}/><i style={{width:5,height:5,background:line,borderRadius:'50%'}}/><span style={{marginLeft:'auto'}}>{label}</span></div>}
function Ticket({job,small=false}){return <div style={{background:paper,border:`1px solid ${line}`,borderLeft:'4px solid #757e6c',padding:small?'9px 12px':'13px 17px',borderRadius:4,boxShadow:'2px 5px 8px #3b423b15',fontFamily:body}}><div style={{fontSize:small?19:22,fontWeight:600,whiteSpace:'nowrap'}}>{job.short}</div><div style={{fontSize:small?14:16,color:muted,marginTop:4}}>{job.location}</div></div>}
function curve(a,b,t,vertical){const k=ease(t);return {x:mix(a.x,b.x,k)+(vertical?Math.sin(k*Math.PI)*26:0),y:mix(a.y,b.y,k)+(vertical?0:Math.sin(k*Math.PI)*-22)}}
export function JobFilm({compact=false}){
 const f=useCurrentFrame(),act=Math.min(3,Math.floor(f/180));
 const incoming=ease((f-20)/120),prepared=ease((f-190)/60),matching=ease((f-370)/65),delivered=ease((f-565)/90);
 const hub=compact?{x:155,y:290,w:450,h:295}:{x:430,y:170,w:340,h:345};
 const source=i=>compact?{x:35+i*240,y:110,w:210,h:126}:{x:45,y:155+i*135,w:265,h:112};
 const dest=i=>compact?{x:35+i*240,y:665,w:210,h:120}:{x:890,y:155+i*135,w:265,h:112};
 const paths=jobs.map((_,i)=>{const a=source(i),b=dest(i);return {start:compact?{x:a.x+a.w/2,y:a.y+a.h}:{x:a.x+a.w,y:a.y+a.h/2},entry:compact?{x:hub.x+hub.w/2,y:hub.y}:{x:hub.x,y:hub.y+hub.h/2},exit:compact?{x:hub.x+hub.w/2,y:hub.y+hub.h}:{x:hub.x+hub.w,y:hub.y+hub.h/2},end:compact?{x:b.x+b.w/2,y:b.y}:{x:b.x,y:b.y+b.h/2}}});
 const path=(a,b)=>compact?`M${a.x} ${a.y} C${a.x} ${(a.y+b.y)/2},${b.x} ${(a.y+b.y)/2},${b.x} ${b.y}`:`M${a.x} ${a.y} C${(a.x+b.x)/2} ${a.y},${(a.x+b.x)/2} ${b.y},${b.x} ${b.y}`;
 return <AbsoluteFill style={{background:'#eeedeb',color:ink,fontFamily:body,lineHeight:1.2,overflow:'hidden'}}>
  <div style={{position:'absolute',left:28,right:28,top:23,display:'flex',justifyContent:'space-between',borderBottom:`1px solid ${line}`,paddingBottom:15,fontFamily:hand,fontSize:compact?25:23}}><span>JobTarget / an opportunity in motion</span><span>0{act+1} / 04</span></div>
  <div style={{position:'absolute',left:compact?36:45,top:compact?76:110,fontFamily:hand,fontSize:compact?27:30}}>where jobs begin</div>
  {!compact&&<div style={{position:'absolute',left:890,top:110,fontFamily:hand,fontSize:30}}>where people look</div>}
  <svg viewBox={compact?'0 0 760 860':'0 0 1200 680'} style={{position:'absolute',inset:0,width:'100%',height:'100%'}} aria-hidden="true">
   {paths.map((p,i)=><g key={i}><path d={path(p.start,p.entry)} fill="none" stroke={line} strokeWidth="1.5" strokeDasharray="4 6"/><path d={path(p.exit,p.end)} fill="none" stroke={line} strokeWidth="1.5" strokeDasharray="4 6"/><path d={path(p.start,p.entry)} fill="none" stroke="#778170" strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1-incoming} opacity={1-delivered*.6}/><path d={path(p.exit,p.end)} fill="none" stroke="#687660" strokeWidth="2.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1-ease((f-385-i*35)/85)}/><circle cx={p.end.x} cy={p.end.y} r={4+Math.sin(f/12+i)*1.5} fill="#687660" opacity={matching}/></g>)}
  </svg>
  {jobs.map((job,i)=>{const a=source(i),loaded=ease((f-15-i*24)/35);return <Paper key={job.ats} style={{left:a.x,top:a.y,width:a.w,height:a.h,transform:`rotate(${(i-1)*.8}deg)`,opacity:.5+.5*loaded}}>
   <WindowBar label={job.ats} active={act===0}/><div style={{padding:compact?'10px 12px':'10px 16px'}}><div style={{fontSize:compact?22:23,fontWeight:600}}>{job.short}</div><div style={{fontSize:compact?17:17,color:muted,marginTop:6}}>{f>175?'pulled from source':loaded>.95?'ready to pull':'reading listing…'} <span style={{float:'right',opacity:loaded}}>↗</span></div></div>
  </Paper>})}
  <Paper style={{left:hub.x,top:hub.y,width:hub.w,height:hub.h,borderColor:'#969f8f',boxShadow:'4px 12px 25px #333c2d18'}}>
   <div style={{height:compact?59:65,borderBottom:`1px solid ${line}`,padding:'13px 20px',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontFamily:hand,fontSize:compact?34:33}}>the routing desk</span><span style={{display:'inline-flex',width:30,height:30,border:'1px dashed #969f8f',borderRadius:'50%',alignItems:'center',justifyContent:'center',transform:`rotate(${f*.9}deg)`,fontSize:23}}>✳</span></div>
   <div style={{position:'absolute',left:22,right:22,top:compact?86:94,opacity:1-prepared}}>
    <div style={{fontFamily:hand,fontSize:compact?41:38}}>A place for every opening.</div><div style={{fontSize:compact?22:19,lineHeight:1.6,color:muted,marginTop:16}}>Pull the listing.<br/>Keep its source connected.</div>
    <div style={{display:'flex',gap:10,marginTop:18}}>{jobs.map((_,i)=><span key={i} style={{width:22,height:5,borderRadius:2,background:'#7b8573',opacity:.15+.85*ease((f-65-i*35)/20)}}/>)}</div>
   </div>
   <div style={{position:'absolute',left:22,right:22,top:compact?78:87,opacity:prepared*(1-matching),transform:`translateY(${(1-prepared)*18}px)`}}>
    <div style={{fontSize:compact?25:24,fontWeight:600,marginBottom:15}}>Software Engineer</div>{[['Role','Technology'],['Location','Remote'],['Source','ATS / A']].map(([k,v],i)=><div key={k} style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid #d9ddd3',padding:compact?'10px 0':'13px 0',fontSize:compact?21:19,opacity:ease((f-235-i*18)/22)}}><span style={{color:muted}}>{k}</span><span>{v}</span></div>)}
    {!compact&&<div style={{fontFamily:hand,fontSize:25,color:'#687660',marginTop:8}}>one consistent job record ✓</div>}
   </div>
   <div style={{position:'absolute',left:22,right:22,top:compact?80:88,opacity:matching}}>
    <div style={{fontSize:compact?20:18,color:muted,marginBottom:compact?15:20}}>role · location · destination fit</div>
    {jobs.map((job,i)=><div key={job.short} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:compact?'12px 0':'17px 0',borderTop:'1px solid #d9ddd3',fontSize:compact?21:18,opacity:ease((f-410-i*22)/25)}}><span>{job.short}</span><span style={{fontFamily:hand,fontSize:25,color:'#77836d'}}>→</span><span>{job.board}</span></div>)}
   </div>
  </Paper>
  {jobs.map((job,i)=>{const b=dest(i),ready=ease((f-590-i*30)/28);return <Paper key={job.board} style={{left:b.x,top:b.y,width:b.w,height:b.h,opacity:.45+.55*matching,borderColor:ready>.5?'#87927c':line}}>
   <WindowBar label="job board" active={ready>.5}/><div style={{padding:compact?'9px 12px':'10px 16px'}}><div style={{fontSize:compact?21:23,fontWeight:600}}>{job.board}</div><div style={{fontSize:compact?17:17,color:ready>.5?'#5e6f56':muted,marginTop:6}}>{ready>.5?'✓ Job delivered':matching>.6?'Selected destination':'Awaiting a match'}</div></div>
  </Paper>})}
  {jobs.map((job,i)=>{const t=(f-60-i*33)/88;if(t<0||t>1)return null;const p=curve(paths[i].start,paths[i].entry,t,compact);return <div key={'in'+i} style={{position:'absolute',left:p.x-(compact?72:85),top:p.y-30,width:compact?145:170,opacity:Math.sin(Math.PI*t),transform:`rotate(${Math.sin(t*Math.PI)*-7}deg) scale(${compact?.8:.85})`}}><Ticket job={job} small/></div>})}
  {jobs.map((job,i)=>{const t=(f-540-i*30)/82;if(t<0||t>1)return null;const p=curve(paths[i].exit,paths[i].end,t,compact);return <div key={'out'+i} style={{position:'absolute',left:p.x-80,top:p.y-30,width:160,opacity:Math.sin(Math.PI*t),transform:`scale(${compact?.85:.9})`}}><Ticket job={job} small/></div>})}
  <div style={{position:'absolute',left:30,right:30,bottom:compact?204:80,fontFamily:hand,fontSize:compact?30:35,textAlign:'center',opacity:compact?matching:1}}><span style={{background:'#eeedeb',padding:'0 8px'}}>{act===0?'opportunities, on their way':act===1?'a little order before the journey':act===2?'each role follows its own path':'the right job, in the right places'}</span></div>
  <div style={{position:'absolute',left:28,right:28,bottom:20,fontSize:compact?18:16,color:muted,textAlign:'center'}}>Illustrative workflow · sample jobs & destinations</div>
 </AbsoluteFill>;
}
function JobStory(){
 const player=useRef(null),track=useRef(null),raf=useRef(0),visible=useRef(false),running=useRef(false),position=useRef(0);
 const [frame,setFrame]=useState(0),[playing,setPlaying]=useState(false),[compact,setCompact]=useState(()=>matchMedia('(max-width:650px)').matches),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion:reduce)').matches),[reading,setReading]=useState(false);
 const still=reduced||reading,act=Math.min(3,Math.floor(frame/180)),props=useMemo(()=>({compact}),[compact]);
 const pause=()=>{player.current?.pause();running.current=false;setPlaying(false)};
 const seek=n=>{n=Math.max(0,Math.min(TOTAL-1,Math.round(n)));position.current=n;setFrame(n);player.current?.seekTo(n)};
 useEffect(()=>{const a=matchMedia('(max-width:650px)'),b=matchMedia('(prefers-reduced-motion:reduce)');const change=()=>{pause();setCompact(a.matches);setReduced(b.matches)};a.addEventListener('change',change);b.addEventListener('change',change);return()=>{a.removeEventListener('change',change);b.removeEventListener('change',change)}},[]);
 useEffect(()=>{if(still)return;const p=player.current;const update=e=>{position.current=e.detail.frame;setFrame(e.detail.frame)},end=()=>{running.current=false;setPlaying(false)};p.addEventListener('frameupdate',update);p.addEventListener('ended',end);return()=>{p.removeEventListener('frameupdate',update);p.removeEventListener('ended',end)}},[still,compact]);
 useEffect(()=>{if(still)return;const scroll=()=>{if(raf.current)return;raf.current=requestAnimationFrame(()=>{raf.current=0;if(!visible.current||running.current||matchMedia('(max-height:620px) and (min-width:651px)').matches)return;const rect=track.current.getBoundingClientRect();seek(clamp(-rect.top/Math.max(1,track.current.offsetHeight-innerHeight))*(TOTAL-1))})};const observer=new IntersectionObserver(([e])=>{visible.current=e.isIntersecting;if(e.isIntersecting)scroll();else pause()});observer.observe(track.current);const hide=()=>{if(document.hidden)pause()};addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);document.addEventListener('visibilitychange',hide);return()=>{observer.disconnect();removeEventListener('scroll',scroll);removeEventListener('resize',scroll);document.removeEventListener('visibilitychange',hide);cancelAnimationFrame(raf.current);raf.current=0}},[still]);
 return <><div ref={track} className={`job-track ${still?'job-still':''}`}><div className="job-sticky">{still?<ol className="job-readable">{chapters.map((item,i)=><li key={item.name}><span>0{i+1} / {item.name}</span><h3>{item.title}</h3><p>{item.copy}</p></li>)}</ol>:<>
  <div className="job-caption"><span>0{act+1} / {chapters[act].name}</span><h3>{chapters[act].title}</h3><p>{chapters[act].copy}</p></div>
  <div className="job-cinema"><Player ref={player} component={JobFilm} inputProps={props} durationInFrames={TOTAL} fps={30} compositionWidth={compact?760:1200} compositionHeight={compact?860:680} style={{width:'100%'}} controls={false} autoPlay={false} clickToPlay={false} doubleClickToFullscreen={false} spaceKeyToPlayOrPause={false} acknowledgeRemotionLicense/></div>
  <div className="job-controls"><button type="button" onClick={()=>{if(running.current){pause();return}if(position.current>=TOTAL-2)seek(0);running.current=true;setPlaying(true);player.current?.play()}}>{playing?'Ⅱ Pause story':'▷ Play story'}</button><label><span className="sr-only">JobTarget animation position</span><input type="range" min="0" max={TOTAL-1} value={frame} aria-valuetext={chapters[act].name} onChange={e=>{pause();seek(+e.target.value)}}/></label><span>{Math.floor(frame/30)} / 24s</span></div>
  <nav className="job-chapters" aria-label="JobTarget story chapters">{chapters.map((item,i)=><button type="button" key={item.name} aria-current={act===i?'step':undefined} onClick={()=>{pause();seek(i===3?TOTAL-1:i*180+110)}}>{item.name}</button>)}</nav><p className="job-hint">Scroll to follow an opening to its audience.</p>
 </>}</div></div><button className="job-read-toggle" type="button" disabled={reduced} onClick={()=>{pause();setReading(!reading)}}>{reduced?'Motion reduced to match your device':reading?'Show the animated routing desk':'Read without animation'}</button></>;
}
const mount=typeof document==='undefined'?null:document.getElementById('jobtarget-story');if(mount)createRoot(mount).render(<JobStory/>);
