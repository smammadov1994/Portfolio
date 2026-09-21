import React, {useEffect, useMemo, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {Player} from '@remotion/player';

const TOTAL = 720;
const body = "'Manrope',sans-serif", hand = "'Caveat',cursive";
const ink = '#3c413b', muted = '#73786e', line = '#bec3b7', paper = '#faf9f5';
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { const t = clamp(x); return t*t*(3-2*t); };
const lerp = (a,b,t) => a+(b-a)*t;
const stories = {
  skadden: {
    name:'Skadden', art:'skadden-library-v1.png', label:'Legal knowledge, connected.',
    chapters:[
      {name:'Organize', title:'A corpus becomes searchable.', copy:'Content from the legacy CMS moves into the new intranet. Classification gives the legal-document corpus a useful structure.'},
      {name:'Retrieve', title:'Bring the right passages into context.', copy:'Search and retrieval find relevant material within the legal corpus and assemble context for the RAG system.'},
      {name:'Ground', title:'Build answers around the source material.', copy:'Retrieved legal content informs the generated answer. This conceptual example shows how sources stay connected to the response.'}
    ],
  },
  signal98: {
    name:'Signal98', art:'signal98-workbench-v1.png', label:'Follow the error. Understand the impact.',
    chapters:[
      {name:'Capture', title:'Repeated errors become one issue.', copy:'The SDK collects the error and the steps before it. Matching events are grouped, retaining the context needed to investigate.'},
      {name:'Assess', title:'JEV gives the issue structure.', copy:'JEV by TypeSafe AI assesses category, likely cause, severity, and user impact. Application rules turn those judgments into priorities.'},
      {name:'Investigate', title:'Carry that context into the fix.', copy:'Ghost investigates the issue separately from JEV. A proposed change is prepared in an isolated worktree for review before applying.'}
    ],
  }
};

function Sheet({style,children}) {
  return <div style={{position:'absolute',background:paper,border:`1.4px solid ${line}`,borderRadius:9,boxShadow:'0 10px 26px #383f3018',overflow:'hidden',...style}}>{children}</div>;
}
function Bar({children}) {
  return <div style={{display:'flex',gap:7,alignItems:'center',borderBottom:`1px solid ${line}`,height:48,padding:'0 20px',fontSize:17,color:muted}}><span aria-hidden="true">• • •</span><span style={{marginLeft:'auto'}}>{children}</span></div>;
}
function TextLines({progress=1,count=3}) {
  return <div aria-hidden="true">{Array.from({length:count},(_,i)=><div key={i} style={{height:5,marginTop:13,width:`${(i===count-1?68:100)*ease(progress*2-i*.23)}%`,background:i===0?'#a9b29d':'#d5d9ce',borderRadius:3}}/>)}</div>;
}
function TinyDoc({label,rotate=0,style}) {
  return <Sheet style={{width:145,height:116,padding:15,transform:`rotate(${rotate}deg)`,...style}}><div style={{fontSize:16,fontWeight:600}}>{label}</div><TextLines/></Sheet>;
}

export function AIStoryFilm({kind,compact=false}) {
  const f=useCurrentFrame(), story=stories[kind], legal=kind==='skadden';
  const act=Math.min(2,Math.floor(f/240)), local=f-act*240;
  const organize=ease((f-35)/170), finish=ease((f-495)/100);
  const panel=compact?{x:36,y:190,w:688,h:425}:{x:640,y:155,w:500,h:370};
  const left=compact?{x:80,y:680}:{x:95,y:240};
  const labels=legal?['Agreement','Legal memo','Precedent']:['Checkout error','Stack trace','User steps'];
  const title=legal?['Legal document corpus','Retrieval context','Source-grounded answer']:['Grouped issue','JEV · TypeSafe AI','Ghost investigation'];
  return <AbsoluteFill style={{background:'#eeedeb',fontFamily:body,color:ink,overflow:'hidden',lineHeight:1.4}}>
    <Img src={`assets/${story.art}`} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',objectPosition:'center bottom',opacity:compact?.27:.48,transform:`scale(${1+f/50000}) translateY(${-f/160}px)`}}/>
    <div style={{position:'absolute',inset:0,background:'linear-gradient(#eeedebd9, #eeedeb33 45%, transparent 75%)'}}/>
    <div style={{position:'absolute',left:30,right:30,top:22,display:'flex',justifyContent:'space-between',fontSize:compact?20:16,color:muted,borderBottom:`1px solid ${line}`,paddingBottom:15}}><span>{story.name} / {legal?'legal AI':'issue intelligence'}</span><span>0{act+1} / 03</span></div>
    <div style={{position:'absolute',left:compact?36:45,top:compact?86:80,fontFamily:hand,fontSize:compact?44:46,maxWidth:compact?660:1100}}>{story.label}</div>
    <svg viewBox={compact?'0 0 760 1000':'0 0 1200 720'} style={{position:'absolute',inset:0,width:'100%',height:'100%'}} aria-hidden="true">
      <path d={compact?'M170 745 C190 880 650 875 680 615':'M170 360 C320 490 440 185 640 270'} fill="none" stroke="#b5bcae" strokeWidth="2" strokeDasharray="4 8"/>
      <path d={compact?'M170 745 C190 880 650 875 680 615':'M170 360 C320 490 440 185 640 270'} fill="none" stroke="#727f65" strokeWidth="2.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1-organize}/>
      {Array.from({length:3},(_,i)=>{const t=clamp((f-80-i*33)/110);const x=compact?lerp(170,680,ease(t)):lerp(180,640,ease(t));const y=compact?lerp(745,615,t)+Math.sin(t*Math.PI)*100:lerp(340,270,t)+Math.sin(t*Math.PI)*-70;return <circle key={i} cx={x} cy={y} r="5" fill="#59694b" opacity={t>0&&t<1?.85:0}/>})}
    </svg>
    {labels.map((label,i)=>{
      const shift=ease((f-265-i*22)/90), travel=ease((f-405-i*18)/75);
      const x=left.x+i*(compact?175:90)+shift*(compact?10:140)+travel*(compact?0:165);
      const y=left.y+i*(compact?8:43)-shift*(compact?20:40)-Math.sin(travel*Math.PI)*60;
      return <TinyDoc key={label} label={label} rotate={(i-1)*9*(1-shift)} style={{left:x,top:y,opacity:(.6+.4*organize)*(1-travel*.7),width:compact?170:150,height:compact?120:126,transform:`rotate(${(i-1)*9*(1-shift)}deg) scale(${1-travel*.16})`}}/>;
    })}
    <div style={{position:'absolute',left:compact?75:80,top:compact?840:440,width:compact?590:450,font: `${compact?29:31}px/1.3 ${hand}`,color:'#50594b',textAlign:'center',opacity:ease((f-25)/25)}}>{legal?(act===0?'classify → organize → index':act===1?'a question meets its sources':'knowledge carried into the answer'):(act===0?'many events → one issue':act===1?'category · severity · impact':'assessment → investigation → review')}</div>
    <Sheet style={{left:panel.x,top:panel.y,width:panel.w,height:panel.h,transform:`translateY(${(1-ease(f/28))*15}px)`}}>
      <Bar>{title[act]}</Bar>
      <div style={{position:'absolute',inset:'68px 25px 20px',fontSize:compact?28:19,opacity:ease(local/16)*(act<2?1-ease((local-225)/15):1),transform:`translateY(${(1-ease(local/20))*8}px)`}}>
      {act===0&&<>
        <div style={{fontFamily:hand,fontSize:compact?39:33,marginBottom:14}}>{legal?'Make the collection usable.':'A checkout flow has broken.'}</div>
        {labels.map((label,i)=><div key={label} style={{borderTop:'1px solid #d9ddd2',padding:compact?'14px 0':'12px 0',display:'flex',justifyContent:'space-between',opacity:ease((f-45-i*36)/30),transform:`translateX(${(1-ease((f-45-i*36)/30))*22}px)`}}><span>{label}</span><span style={{fontSize:compact?23:15,color:muted}}>{legal?'classified ✓':i===0?'grouped ✓':'attached ✓'}</span></div>)}
        <div style={{fontSize:compact?23:15,marginTop:20,color:muted}}>{legal?'Legacy CMS → AI-driven intranet':'Shared context, without a new agent for every event.'}</div>
      </>}
      {act===1&&<>
        {legal?<>
          <div style={{border:'1px solid #b7c0ac',borderRadius:5,padding:'10px 14px',fontSize:compact?26:17,minHeight:48}}>⌕ {'Find relevant termination provisions'.slice(0,Math.floor(local/2))}<span style={{opacity:local%30<15?1:0}}>│</span></div>
          {[['Agreement · excerpt 01','A relevant provision'],['Legal memo · excerpt 02','Supporting context']].map(([a,b],i)=><div key={a} style={{marginTop:18,opacity:ease((local-70-i*42)/35),transform:`translateY(${(1-ease((local-70-i*42)/35))*18}px)`}}><div style={{fontSize:compact?21:14,color:muted}}>{a}</div><div style={{marginTop:7,background:'#e9edde',padding:'5px 8px',fontSize:compact?26:17}}>{b}</div></div>)}
        </>:<>
          <div style={{fontFamily:hand,fontSize:compact?38:32,marginBottom:7}}>Structured judgment by JEV.</div>
          {[['Category','Payments'],['Severity','Major'],['User-facing','Likely'],['Likely cause','Code defect']].map(([a,b],i)=><div key={a} style={{display:'flex',justifyContent:'space-between',borderBottom:'1px solid #d6dccf',padding:'10px 0',opacity:ease((local-25-i*32)/25)}}><span style={{color:muted}}>{a}</span><span>{b}</span></div>)}
        </>}
      </>}
      {act===2&&<>
        <div style={{fontFamily:hand,fontSize:compact?39:32}}>{legal?'Answer with relevant context.':'A proposed fix, ready to review.'}</div>
        {legal?<>
          <div style={{marginTop:18,padding:'12px 16px',background:'#edf0e7',borderLeft:'3px solid #909d81',opacity:finish}}><div style={{fontSize:compact?26:17}}>The response draws on the retrieved passages.</div><TextLines progress={(local-25)/130} count={3}/></div>
          <div style={{display:'flex',gap:10,marginTop:20,opacity:ease((local-100)/45)}}>{['[1] Agreement','[2] Legal memo'].map(x=><span key={x} style={{fontSize:compact?22:14,padding:'7px 10px',border:'1px solid #bdc6b2',borderRadius:4}}>{x}</span>)}</div>
        </>:<>
          <div style={{padding:'14px 15px',marginTop:20,background:'#f0f1eb',font:`${compact?25:17}px/1.8 'DM Mono',monospace`,opacity:ease(local/35)}}><div style={{color:'#867a70'}}>− unchecked input</div><div style={{color:'#56694d',opacity:ease((local-35)/45)}}>+ validate before submitting</div></div>
          <div style={{fontSize:compact?24:16,marginTop:20,opacity:ease((local-90)/45)}}>Isolated worktree → review diff → apply</div>
          <div style={{fontSize:compact?21:14,color:muted,marginTop:14,opacity:ease((local-140)/35)}}>JEV assesses. Ghost investigates. You review.</div>
        </>}
      </>}
      </div>
    </Sheet>
    <div style={{position:'absolute',left:28,right:28,bottom:20,fontSize:compact?21:14,textAlign:'center',color:'#666e5e'}}>{legal?'Conceptual workflow · fictional documents and query':'Illustrative issue and proposed change · no live model calls'}</div>
  </AbsoluteFill>;
}

function AIStory({kind}) {
  const story=stories[kind],player=useRef(null),root=useRef(null),started=useRef(false),running=useRef(false),position=useRef(0);
  const [frame,setFrame]=useState(0),[playing,setPlaying]=useState(false),[reading,setReading]=useState(false);
  const [compact,setCompact]=useState(()=>matchMedia('(max-width:700px)').matches);
  const [reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion:reduce)').matches);
  const still=reading||reduced, act=Math.min(2,Math.floor(frame/240));
  const props=useMemo(()=>({kind,compact}),[kind,compact]);
  function pause(){player.current?.pause();running.current=false;setPlaying(false);}
  function seek(n){position.current=n;player.current?.seekTo(n);setFrame(n);}
  function play(){started.current=true;if(position.current>=TOTAL-2)seek(0);player.current?.play();running.current=true;setPlaying(true);}
  useEffect(()=>{
    const size=matchMedia('(max-width:700px)'),motion=matchMedia('(prefers-reduced-motion:reduce)');
    const change=()=>{pause();setCompact(size.matches);setReduced(motion.matches);};
    size.addEventListener('change',change);motion.addEventListener('change',change);
    return()=>{size.removeEventListener('change',change);motion.removeEventListener('change',change);};
  },[]);
  useEffect(()=>{
    if(still)return;
    const p=player.current;
    const update=e=>{position.current=e.detail.frame;setFrame(e.detail.frame);};
    const ended=()=>{running.current=false;setPlaying(false);};
    p.addEventListener('frameupdate',update);p.addEventListener('ended',ended);
    p.seekTo(position.current);
    const observer=new IntersectionObserver(([e])=>{
      if(e.intersectionRatio<.35){pause();return;}
      if(!started.current&&!document.hidden)play();
    },{threshold:[0,.35]});
    observer.observe(root.current);
    const hide=()=>{if(document.hidden)pause();};document.addEventListener('visibilitychange',hide);
    return()=>{observer.disconnect();document.removeEventListener('visibilitychange',hide);p.removeEventListener('frameupdate',update);p.removeEventListener('ended',ended);};
  },[still,compact]);
  return <div className="ai-film-wrap" ref={root}>
    {still?<ol className="ai-film-readable">{story.chapters.map(c=><li key={c.name}><h3>{c.title}</h3><p>{c.copy}</p></li>)}</ol>:<>
      <div className="ai-film-caption"><span>0{act+1} / {story.chapters[act].name}</span><h3>{story.chapters[act].title}</h3><p>{story.chapters[act].copy}</p></div>
      <div className="ai-film-cinema" role="img" aria-label={`${story.name} illustrated workflow: ${story.chapters[act].title}`}><Player ref={player} component={AIStoryFilm} inputProps={props} durationInFrames={TOTAL} fps={30} compositionWidth={compact?760:1200} compositionHeight={compact?1000:720} style={{width:'100%'}} controls={false} autoPlay={false} clickToPlay={false} doubleClickToFullscreen={false} spaceKeyToPlayOrPause={false} acknowledgeRemotionLicense/></div>
      <div className="ai-film-controls"><button type="button" onClick={()=>playing?pause():play()} aria-label={`${playing?'Pause':frame>=TOTAL-2?'Replay':'Play'} ${story.name} story`}>{playing?'Ⅱ Pause':frame>=TOTAL-2?'↻ Replay':'▷ Play'}</button><label><span className="sr-only">{story.name} animation position</span><input type="range" min="0" max={TOTAL-1} value={frame} aria-valuetext={`${story.chapters[act].name}, ${Math.floor(frame/30)} seconds`} onChange={e=>{started.current=true;pause();seek(Number(e.target.value));}}/></label><span>{Math.floor(frame/30)} / 24s</span></div>
      <div className="ai-film-chapters" role="group" aria-label={`${story.name} story chapters`}>{story.chapters.map((c,i)=><button type="button" key={c.name} aria-current={i===act?'step':undefined} onClick={()=>{started.current=true;pause();seek(i*240+195);}}><small>0{i+1}</small>{c.name}</button>)}</div>
    </>}
    <button className="ai-film-reading" type="button" disabled={reduced} onClick={()=>{pause();setReading(!reading);}}>{reduced?'Reduced motion enabled':reading?'Show animation':'Read without animation'}</button>
  </div>;
}
for(const kind of Object.keys(stories)){
  const mount=document.getElementById(`${kind}-ai-story`);
  if(mount){mount.className='';mount.removeAttribute('data-walkthrough');createRoot(mount).render(<AIStory kind={kind}/>);}
}
