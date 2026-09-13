import React,{useEffect,useRef,useState,useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {AbsoluteFill,Img,useCurrentFrame,useVideoConfig} from 'remotion';
import {Player} from '@remotion/player';

export const TOTAL=720;
export const chapters=[
 {name:'Collect',title:'Keep what catches your eye.',copy:'Crawlers and browser imports turn scattered ad references into a growing library of creative ideas.'},
 {name:'Organize',title:'Give your ideas a home.',copy:'Bring references into a shared board. Keep the creative, its context, and the team’s conversation together.'},
 {name:'Explore',title:'Find the useful thread.',copy:'Semantic search finds relevant ideas across 100K+ transcribed ads, beyond an exact keyword match.'},
 {name:'Rewrite',title:'Make the next story yours.',copy:'Retrieved examples meet a new product, offer, and audience. A grounded first draft begins to take shape.'},
];
const references=[
 {image:'pumpads-tumbler.png',name:'The morning ritual',tag:'everyday essentials'},
 {image:'pumpads-skincare.png',name:'A moment for yourself',tag:'little daily rituals'},
 {image:'pumpads-headphones.png',name:'Room for your sound',tag:'a different perspective'},
];
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
function PaperCard({item,index,width,height}){
 return <div style={{width,height,padding:10,background:'#f8f7f2',border:'1px solid #b8b9b1',boxShadow:'3px 10px 18px #383b2f20',position:'relative'}}>
  <div style={{position:'absolute',width:54,height:19,left:'calc(50% - 27px)',top:-9,zIndex:1,background:'#d6d4c8bb',border:'1px solid #b4b2a655',transform:'rotate(-5deg)'}}/>
  <Img src={`/assets/${item.image}`} alt={`Illustrative creative reference: ${item.name}`} style={{width:'100%',height:height-100,display:'block',objectFit:'cover',objectPosition:'50% 38%',filter:'grayscale(1)'}}/>
  <div style={{padding:'12px 8px 0'}}><div style={{fontSize:19,color:'#777b71'}}>0{index+1} / {item.tag}</div><div style={{fontSize:30,marginTop:4,lineHeight:1.1}}>{item.name}</div></div>
 </div>;
}
export function SwipeFilm({compact=false}){
 const f=useCurrentFrame(),{width:w,height:h}=useVideoConfig(),act=Math.min(3,Math.floor(f/180));
 const board=ease((f-155)/80),explore=ease((f-345)/65),rewrite=ease((f-525)/70);
 const boardOpacity=board*(1-explore),transcriptOpacity=explore*(1-rewrite);
 const cw=compact?260:270,ch=compact?355:335;
 const paper={background:'#f8f7f2',border:'1px solid #bfc0b5',boxShadow:'4px 10px 20px #353c2d18'};
 const query='a calmer morning routine';
 const script='Before the day gets loud,\nmake a little room\nfor your own ideas.';
 const writing=clamp((f-587)/98),written=Math.floor(writing*script.length);
 return <AbsoluteFill style={{background:'#eeedeb',color:'#3f433e',fontFamily:"'Caveat',cursive",lineHeight:1.2,overflow:'hidden'}}>
  <div style={{position:'absolute',left:28,right:28,top:23,display:'flex',justifyContent:'space-between',fontSize:compact?24:22,borderBottom:'1px solid #c1c3b9',paddingBottom:15}}><span>SwipeBuilder / creative notebook</span><span>0{act+1} / 04</span></div>
  <div style={{position:'absolute',inset:compact?'115px 32px 105px':'105px 60px 105px',border:'1px dashed #aeb3a6',borderRadius:5,background:'#dddcd422',opacity:boardOpacity,transform:`scale(${.95+board*.05})`}}>
   <div style={{position:'absolute',top:18,left:25,fontSize:compact?30:25}}>the everyday moments board</div>
   <svg viewBox={`0 0 ${w} ${h}`} style={{position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible'}} aria-hidden="true"><path d={compact?'M210 310 Q400 490 590 310 M200 370 Q360 610 540 420':'M200 210 Q560 420 1000 200'} fill="none" stroke="#a8afa0" strokeWidth="2" strokeDasharray="6 8" pathLength="1" strokeDashoffset={1-board}/></svg>
  </div>
  {references.map((item,i)=>{
   const arrival=ease((f-i*17+30)/75);
   const initialX=compact?[80,410,245][i]:[115,465,805][i];
   const initialY=compact?[175,185,350][i]:[155,125,170][i];
   const boardX=compact?[95,450,290][i]:[140,470,800][i];
   const boardY=compact?[190,190,460][i]:[190,190,190][i];
   const x=mix(mix(initialX,boardX,board),compact?48:135,explore);
   const y=mix(mix(initialY,boardY,board),compact?255:220,explore);
   const scale=mix(mix(1,compact?.68:.91,board),compact?.9:.92,explore);
   const angle=mix((i-1)*9+Math.sin((f+i*40)/80)*2,(i-1)*1.5,board)*(1-explore);
   const opacity=arrival*(i===0?1-rewrite:(1-explore));
   return <div key={item.image} style={{position:'absolute',left:x,top:y+(1-arrival)*180+(1-board)*Math.sin((f+i*33)/60)*5,opacity,transform:`translateX(${(1-arrival)*(i===0?-150:150)}px) rotate(${angle}deg) scale(${scale})`,transformOrigin:'top left',zIndex:i===2?3:2}}><PaperCard item={item} index={i} width={cw} height={ch}/></div>;
  })}
  <div style={{position:'absolute',bottom:compact?75:80,left:30,right:30,textAlign:'center',fontSize:compact?33:30,opacity:1-explore,transform:`translateY(${(1-board)*4}px)`}}>{board>.65?'“What if we opened with the daily ritual?”':'a few things worth another look'}</div>
  <div style={{position:'absolute',left:compact?52:120,right:compact?52:120,top:compact?125:105,opacity:transcriptOpacity,padding:'15px 25px',border:'1px solid #b6bcb0',borderRadius:30,fontSize:compact?29:27,background:'#f6f5ef'}}><span style={{marginRight:20,color:'#777f72'}}>⌕</span>{query.slice(0,Math.floor(clamp((f-365)/50)*query.length))}<span style={{opacity:f%25<13?1:0}}>│</span><span style={{float:'right',fontSize:compact?21:20,color:'#7a8073',paddingTop:4}}>search by meaning</span></div>
  <div style={{position:'absolute',left:compact?335:510,right:compact?35:120,top:compact?230:200,paddingLeft:compact?20:32,borderLeft:'1px solid #b7bfb0',opacity:transcriptOpacity,transform:`translateY(${(1-explore)*30}px)`}}>
   <div style={{fontSize:compact?24:22,color:'#7b8373',marginBottom:22}}>a relevant transcript</div>
   <div style={{fontSize:compact?23:20,color:'#7b8373'}}>00:00 / the hook</div>
   <div style={{fontSize:compact?37:39,lineHeight:1.15,minHeight:100,margin:'10px 0 22px',whiteSpace:'pre-line'}}>{'“A slower start.\nA warmer morning.”'.slice(0,Math.floor(clamp((f-395)/60)*35))}</div>
   <div style={{fontSize:compact?23:20,color:'#7b8373'}}>00:04 / the everyday moment</div>
   <div style={{fontSize:compact?32:33,lineHeight:1.2,marginTop:10,opacity:ease((f-445)/28)}}>A cup on the counter.<br/>A familiar little ritual.</div>
   <div style={{fontSize:compact?27:25,color:'#69765e',marginTop:28,opacity:ease((f-480)/30)}}>the idea: a better morning<div style={{height:2,background:'#8d9783',width:`${ease((f-482)/35)*90}%`,marginTop:5}}/></div>
  </div>
  <div style={{position:'absolute',left:compact?38:105,top:compact?130:190,width:compact?w-76:290,opacity:rewrite,transform:`translateX(${(1-rewrite)*-40}px)`}}>
   <div style={{fontSize:compact?25:22,color:'#7b8373'}}>a different product + audience</div>
   <div style={{fontSize:compact?39:45,lineHeight:1.1,marginTop:16}}>A notebook for small ideas.</div>
   <div style={{fontSize:compact?26:28,color:'#6e7668',lineHeight:1.35,marginTop:18}}>For the person who always has<br/>one more thought to jot down.</div>
   {!compact&&<div style={{fontSize:65,textAlign:'right',color:'#949d8b',marginTop:18,transform:`translateX(${Math.sin(f/30)*5}px)`}}>⤴</div>}
  </div>
  <div style={{...paper,position:'absolute',left:compact?65:510,top:compact?340:130,width:compact?620:545,minHeight:compact?385:415,padding:compact?'28px 34px':'32px 40px',opacity:rewrite,transform:`translateY(${(1-rewrite)*85}px) rotate(${(1-rewrite)*-9+1}deg)`}}>
   <div style={{fontSize:compact?25:22,color:'#7b8373'}}>a new first draft</div>
   <div style={{position:'relative',marginTop:24,minHeight:compact?150:160,fontSize:compact?41:43,lineHeight:1.16,whiteSpace:'pre-line'}}>{script.slice(0,written)}<span style={{opacity:writing<1?1:0,fontSize:35,display:'inline-block',transform:'rotate(-25deg)',color:'#656e5e'}}>✎</span></div>
   <div style={{height:1,background:'#b9c0af',width:`${ease((f-663)/30)*100}%`,margin:'16px 0'}}/>
   <div style={{fontSize:compact?29:28,lineHeight:1.3,opacity:ease((f-671)/30)}}>A quiet desk. A blank page.<br/>Your next good thought.</div>
   <div style={{fontSize:compact?23:21,color:'#7b8373',marginTop:18,opacity:ease((f-691)/25)}}>a starting point. make it yours.</div>
  </div>
  <div style={{position:'absolute',left:28,right:28,bottom:22,fontSize:compact?22:19,textAlign:'center',color:'#797e74'}}>Illustrative creative examples · the workflow, sketched on paper</div>
 </AbsoluteFill>;
}
function SwipeStory(){
 const player=useRef(null),track=useRef(null),raf=useRef(0),visible=useRef(false),running=useRef(false),position=useRef(0);
 const [frame,setFrame]=useState(0),[playing,setPlaying]=useState(false),[compact,setCompact]=useState(()=>matchMedia('(max-width:650px)').matches),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion:reduce)').matches),[reading,setReading]=useState(false);
 const still=reduced||reading,act=Math.min(3,Math.floor(frame/180)),props=useMemo(()=>({compact}),[compact]);
 const pause=()=>{player.current?.pause();running.current=false;setPlaying(false)};
 const seek=n=>{n=Math.max(0,Math.min(TOTAL-1,Math.round(n)));position.current=n;setFrame(n);player.current?.seekTo(n)};
 useEffect(()=>{const a=matchMedia('(max-width:650px)'),b=matchMedia('(prefers-reduced-motion:reduce)');const change=()=>{pause();setCompact(a.matches);setReduced(b.matches)};a.addEventListener('change',change);b.addEventListener('change',change);return()=>{a.removeEventListener('change',change);b.removeEventListener('change',change)}},[]);
 useEffect(()=>{if(still)return;const p=player.current;const update=e=>{position.current=e.detail.frame;setFrame(e.detail.frame)},end=()=>{running.current=false;setPlaying(false)};p.addEventListener('frameupdate',update);p.addEventListener('ended',end);return()=>{p.removeEventListener('frameupdate',update);p.removeEventListener('ended',end)}},[still,compact]);
 useEffect(()=>{if(still)return;const scroll=()=>{if(raf.current)return;raf.current=requestAnimationFrame(()=>{raf.current=0;if(!visible.current||running.current||matchMedia('(max-height:620px) and (min-width:651px)').matches)return;const rect=track.current.getBoundingClientRect();seek(clamp(-rect.top/Math.max(1,track.current.offsetHeight-innerHeight))*(TOTAL-1))})};const observer=new IntersectionObserver(([e])=>{visible.current=e.isIntersecting;if(e.isIntersecting)scroll();else pause()});observer.observe(track.current);const hide=()=>{if(document.hidden)pause()};addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);document.addEventListener('visibilitychange',hide);return()=>{observer.disconnect();removeEventListener('scroll',scroll);removeEventListener('resize',scroll);document.removeEventListener('visibilitychange',hide);cancelAnimationFrame(raf.current);raf.current=0}},[still]);
 return <><div ref={track} className={`swipe-track ${still?'swipe-still':''}`}><div className="swipe-sticky">{still?<ol className="swipe-readable">{chapters.map((item,i)=><li key={item.name}><span>0{i+1} / {item.name}</span><h3>{item.title}</h3><p>{item.copy}</p></li>)}</ol>:<>
  <div className="swipe-caption"><span>0{act+1} / {chapters[act].name}</span><h3>{chapters[act].title}</h3><p>{chapters[act].copy}</p></div>
  <div className="swipe-cinema"><Player ref={player} component={SwipeFilm} inputProps={props} durationInFrames={TOTAL} fps={30} compositionWidth={compact?760:1200} compositionHeight={compact?850:650} style={{width:'100%'}} controls={false} autoPlay={false} clickToPlay={false} doubleClickToFullscreen={false} spaceKeyToPlayOrPause={false} acknowledgeRemotionLicense/></div>
  <div className="swipe-controls"><button type="button" onClick={()=>{if(running.current){pause();return}if(position.current>=TOTAL-2)seek(0);running.current=true;setPlaying(true);player.current?.play()}}>{playing?'Ⅱ Pause story':'▷ Play story'}</button><label><span className="sr-only">SwipeBuilder animation position</span><input type="range" min="0" max={TOTAL-1} value={frame} aria-valuetext={chapters[act].name} onChange={e=>{pause();seek(+e.target.value)}}/></label><span>{Math.floor(frame/30)} / 24s</span></div>
  <nav className="swipe-chapters" aria-label="SwipeBuilder story chapters">{chapters.map((item,i)=><button type="button" key={item.name} aria-current={act===i?'step':undefined} onClick={()=>{pause();seek(i===3?TOTAL-1:i*180+110)}}>{item.name}</button>)}</nav><p className="swipe-hint">Scroll to turn inspiration into the next idea.</p>
 </>}</div></div><button className="swipe-read-toggle" type="button" disabled={reduced} onClick={()=>{pause();setReading(!reading)}}>{reduced?'Motion reduced to match your device':reading?'Show the animated notebook':'Read without animation'}</button></>;
}
const mount=typeof document==='undefined'?null:document.getElementById('swipebuilder-story');if(mount)createRoot(mount).render(<SwipeStory/>);
