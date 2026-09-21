import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';

const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{const t=clamp(x);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
const body="'Manrope',sans-serif",hand="'Caveat',cursive";
const paper='#faf9f5',ink='#41433e',muted='#74776c';

// Continuous, reversible positions: every actor is determined by the scroll frame.
export function bugAt(frame,compact=false){
  const points=compact?[
    [0,-150,240,145],[105,150,270,145],[195,220,275,145],
    [310,235,473,165],[445,235,473,165],[580,535,698,105],[719,535,698,105]
  ]:[
    [0,-150,280,170],[105,160,370,170],[195,240,345,170],
    [310,550,371,185],[445,550,371,185],[580,885,466,110],[719,885,466,110]
  ];
  let a=points[0],b=points[1];
  for(let i=1;i<points.length;i++){a=points[i-1];b=points[i];if(frame<=b[0])break;}
  const t=smooth((frame-a[0])/(b[0]-a[0]));
  const flying=frame<310||frame>445&&frame<580;
  return {x:mix(a[1],b[1],t),y:mix(a[2],b[2],t)-(flying?Math.sin(t*Math.PI)*35:0)+Math.sin(frame/10)*(flying?5:2),size:mix(a[3],b[3],t),rotation:flying?Math.sin(frame/14)*8:Math.sin(frame/22)*3};
}
function Ghost({style,frame}){
  return <svg viewBox="0 0 110 125" aria-hidden="true" style={{position:'absolute',...style,transform:`translateY(${Math.sin(frame/17)*4}px)`}}><path d="M15 105V51C15 1 96 1 96 51V107L83 96L68 108L54 97L39 109L27 98Z" fill="#faf9f5" stroke="#777b70" strokeWidth="2"/><ellipse cx="46" cy="51" rx="5" ry="9" fill="#555c4e"/><ellipse cx="72" cy="51" rx="5" ry="9" fill="#555c4e"/><path d="M49 72Q59 80 70 71" fill="none" stroke="#777b70" strokeWidth="2"/><circle cx="83" cy="83" r="16" fill="#e4e9ddaa" stroke="#777b70" strokeWidth="3"/><path d="M94 96L105 116" stroke="#777b70" strokeWidth="5" strokeLinecap="round"/></svg>;
}
function Card({children,style}){return <div style={{position:'absolute',background:paper,border:'1.5px solid #bec2b5',borderRadius:10,boxShadow:'3px 8px 0 #555d4508',...style}}>{children}</div>;}

export function SignalBugFilm({compact=false}){
  const f=useCurrentFrame(),act=Math.min(2,Math.floor(f/240));
  const bug=bugAt(f,compact),scan=smooth((f-250)/35)*(1-smooth((f-430)/30));
  const machine=compact?{x:65,y:345,size:340}:{x:370,y:235,size:360};
  const receipt=compact?{x:420,y:348,w:305,h:305}:{x:815,y:210,w:335,h:290};
  const ready=smooth((f-465)/60),fix=smooth((f-555)/45);
  const machineX=machine.x+machine.size*.5,machineY=machine.y+machine.size*.378;
  return <AbsoluteFill style={{background:'#eeedeb',color:ink,fontFamily:body,lineHeight:1.4,overflow:'hidden'}}>
    <svg viewBox={compact?'0 0 760 1000':'0 0 1200 720'} style={{position:'absolute',inset:0,width:'100%',height:'100%'}} aria-hidden="true">
      <defs><pattern id="s98-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#a3aa982a"/></pattern><clipPath id="s98-aperture"><circle cx={machineX} cy={machineY} r={machine.size*.278}/></clipPath></defs>
      <rect width="100%" height="100%" fill="url(#s98-grid)"/>
      <path d={compact?'M75 282 Q365 242 237 473 T620 755':'M40 398 C270 480 343 290 550 371 S780 580 1035 555'} stroke="#aab19d" strokeWidth="2" fill="none" strokeDasharray="3 9"/>
      <ellipse cx={machineX} cy={machine.y+machine.size+9} rx={machine.size*.44} ry="12" fill="#d3d6cc" opacity=".45"/>
      <circle cx={machineX} cy={machineY} r={machine.size*.278} fill="#dbe4c555" opacity={scan}/>
      <path d={compact?'M415 810H680':'M794 573H1164'} stroke="#b7beab" strokeWidth="2"/>
    </svg>
    <div style={{position:'absolute',left:30,right:30,top:22,borderBottom:'1px solid #c5c8be',paddingBottom:14,display:'flex',justifyContent:'space-between',fontSize:compact?22:17,color:muted}}><span>Signal98 / the bug’s journey</span><span>0{act+1} / 03</span></div>
    <div style={{position:'absolute',left:compact?38:46,top:compact?88:80,font:`${compact?44:46}px/1.15 ${hand}`}}>{act===0?'Something broke. Follow the bug.':act===1?'JEV takes a closer look.':'An assessed issue. A useful next step.'}</div>
    <Card style={{left:compact?38:38,top:compact?153:222,width:compact?684:248,padding:compact?'14px 24px':'22px',opacity:1-ready*.65}}>
      <div style={{display:compact?'flex':'block',alignItems:'center',justifyContent:'space-between',gap:15}}><div style={{fontSize:compact?22:17,color:muted,marginBottom:compact?0:8}}>Incoming issue</div><div style={{fontSize:compact?26:23,fontWeight:600}}>Checkout failed</div></div>
      <div style={{fontSize:compact?21:17,marginTop:compact?6:12,color:muted}}>{f<115?'SDK captures the event':'Stack trace + user steps'}</div>
      {!compact&&<div style={{fontSize:16,marginTop:14,paddingTop:12,borderTop:'1px solid #d9dccf',opacity:smooth((f-135)/30)}}>Repeated events, grouped.</div>}
    </Card>
    <div style={{position:'absolute',left:machine.x-10,top:machine.y-83,width:machine.size+20,textAlign:'center'}}><div style={{font:`${compact?47:44}px/1 ${hand}`}}>JEV</div><div style={{fontSize:compact?21:18,marginTop:7}}>by TypeSafe AI</div></div>
    <Img src="assets/signal98-jev-machine-v1.png" style={{position:'absolute',left:machine.x,top:machine.y,width:machine.size,height:machine.size,filter:'grayscale(1)'}}/>
    <Img src="assets/signal98-bug-v1.png" data-signal-bug="true" style={{position:'absolute',left:bug.x-bug.size/2,top:bug.y-bug.size/2,width:bug.size,height:bug.size,transform:`rotate(${bug.rotation}deg)`,filter:'grayscale(1)',zIndex:3}}/>
    <svg viewBox={compact?'0 0 760 1000':'0 0 1200 720'} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:4}} aria-hidden="true"><g clipPath="url(#s98-aperture)" opacity={scan}><rect x={machineX-machine.size*.28} y={machineY-machine.size*.27+(Math.sin(f/17)+1)*machine.size*.24} width={machine.size*.56} height="18" fill="#c1ce9f" opacity=".4"/><path d={`M${machineX-machine.size*.3} ${machineY-machine.size*.27+(Math.sin(f/17)+1)*machine.size*.24}h${machine.size*.6}`} stroke="#82955e" strokeWidth="2"/></g></svg>
    <div style={{position:'absolute',left:machine.x,top:machine.y+machine.size+(compact?14:24),width:machine.size,textAlign:'center',font:`${compact?22:26}px/1.2 ${hand}`,color:muted}}>{f<240?'waiting for an issue':f<445?'assessing category, severity & impact':'assessment complete ✓'}</div>
    <Card style={{left:receipt.x,top:receipt.y,width:receipt.w,height:receipt.h,padding:compact?20:22,opacity:.28+.72*smooth((f-250)/40),transform:`translateY(${(1-smooth((f-250)/50))*15}px)`}}>
      <div style={{font:`${compact?33:31}px/1.2 ${hand}`,marginBottom:15}}>JEV’s assessment</div>
      {[['Category','Payments'],['Severity','Major'],['User-facing','Likely']].map(([key,value],i)=><div key={key} style={{display:'flex',justifyContent:'space-between',gap:8,borderTop:'1px solid #d5dacb',padding:compact?'14px 0':'12px 0',fontSize:compact?23:21,opacity:smooth((f-290-i*46)/30),transform:`translateX(${(1-smooth((f-290-i*46)/30))*12}px)`}}><span style={{color:muted}}>{key}</span><span>{value}</span></div>)}
      <div style={{fontSize:compact?18:16,marginTop:12,color:muted,opacity:smooth((f-430)/25)}}>Priority comes from app rules.</div>
    </Card>
    <Card style={{left:compact?62:786,top:compact?735:510,width:compact?630:370,height:compact?182:145,padding:compact?'22px 28px':'19px 22px',opacity:ready,transform:`translateY(${(1-ready)*40}px)`}}>
      <div style={{font:`${compact?34:29}px/1.2 ${hand}`,paddingRight:90}}>Ghost investigates.</div>
      <div style={{fontSize:compact?22:17,marginTop:12,opacity:fix}}>Prepare a fix in an isolated worktree.</div>
      <div style={{fontSize:compact?22:17,marginTop:8,opacity:smooth((f-635)/35)}}>Review the diff → apply</div>
    </Card>
    <Ghost frame={f} style={{left:compact?610:1065,top:compact?688:470,width:compact?91:88,height:110,opacity:ready,zIndex:5}}/>
    <div style={{position:'absolute',left:32,right:32,bottom:20,textAlign:'center',fontSize:compact?20:15,color:muted}}>Illustrative issue · JEV assesses, Ghost investigates, you review.</div>
  </AbsoluteFill>;
}
