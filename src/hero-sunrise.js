const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
export const SUNRISE_DURATION=14000;
// One continuous transformation, followed by a quiet return to fishing.
export function sunrisePose(ms,still=false){
 const t=still?8500:ms,out=1-ease((t-11400)/2200);
 const portrait=ease((t-5900)/800)*(1-ease((t-10400)/1100));
 const snow=ease((t-5500)/180)*(1-ease((t-6600)/300));
 return {landscape:ease(t/1600)*out,mountains:ease(t/2200),sun:ease((t-800)/2400),look:ease((t-2450)/1200)*out,eyes:ease((t-3650)/800)*out,portrait,glitch:still?0:snow,glitchX:still?0:Math.sin((t-5500)/67)*7*snow,staticFrame:Math.max(0,Math.floor((t-5500)/75)),trackingY:112+((Math.max(0,t-5500)/850)%1)*160,returning:t>10400,done:!still&&ms>=SUNRISE_DURATION};
}
