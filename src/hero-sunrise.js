const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)};
export const SUNRISE_DURATION=18000;
// Quicker formation, a clear portrait hold, and a distorted shrink back to Astro.
export function sunrisePose(ms,still=false){
 const t=still?10500:ms,out=1-ease((t-15900)/1900);
 const forming=ease((t-5300)/3300),shrinking=ease((t-12300)/3000);
 const morph=forming*(1-shrinking);
 const portrait=ease((t-5850)/2750)*(1-ease((t-12500)/2000));
 const snowIn=ease((t-5100)/450)*(1-ease((t-8450)/650));
 const snowOut=ease((t-12000)/500)*(1-ease((t-15250)/650));
 return {landscape:ease(t/2200)*out,mountains:ease(t/2800),nearMountains:ease((t-200)/3000),sun:ease((t-650)/2800),look:ease((t-2450)/1200)*out,eyes:ease((t-3650)/800)*out,portrait,morph,
  ghost:1-ease((t-5300)/1650)+ease((t-13750)/1650),
  glitch:still?0:Math.max(snowIn*(1-forming*.72),snowOut*(.28+shrinking*.72)),distortion:still?0:Math.sin(morph*Math.PI)*13,
  staticFrame:Math.max(0,Math.floor((t-5100)/110)),trackingY:28+((Math.max(0,t-5100)/1900)%1)*280,
  returning:t>=12000,done:!still&&ms>=SUNRISE_DURATION};
}
