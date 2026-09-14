const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
export const SUNRISE_DURATION=18000;
// A slow silhouette morph, a clear portrait hold, then a quiet return to fishing.
export function sunrisePose(ms,still=false){
 const t=still?12000:ms,out=1-ease((t-15400)/2400);
 const morph=ease((t-5400)/4500),returnFade=1-ease((t-14200)/1200);
 const portrait=ease((t-6200)/3700)*returnFade;
 const snow=ease((t-5100)/650)*(1-ease((t-9700)/800));
 return {landscape:ease(t/1600)*out,mountains:ease(t/2200),sun:ease((t-800)/2400),look:ease((t-2450)/1200)*out,eyes:ease((t-3650)/800)*out,portrait,morph,
  ghost:(1-ease((t-5400)/2100))*returnFade+(1-returnFade),
  glitch:still?0:snow*(1-morph*.72),distortion:still?0:Math.sin(morph*Math.PI)*13,
  staticFrame:Math.max(0,Math.floor((t-5100)/110)),trackingY:28+((Math.max(0,t-5100)/1900)%1)*280,
  returning:t>14200,done:!still&&ms>=SUNRISE_DURATION};
}
