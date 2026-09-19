const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
export const CONTACT_REVEAL=19500;
// All beats share one clock; reduced motion lands on the same final frame.
export function catchPose(ms){
 const notice=ease((ms-9000)/500),pull=ease((ms-11200)/400);
 const retrieve=ease((ms-15000)/400),close=ease((ms-17500)/600);
 const approach=ease((ms-17500)/2000),lift=ease((ms-11400)/1400),flight=clamp((ms-12800)/1400);
 const airborne=ms>=11400&&ms<14200;
 return {notice:notice*(1-pull),pull:pull*(1-retrieve),retrieve:retrieve*(1-close),close,approach,
  original:1-notice,landscape:1-approach,bucket:notice*(1-retrieve),
  card:airborne?ease((ms-11400)/200):0,
  x:flight>0?460-66*flight:448+12*lift,
  y:flight>0?110+160*flight-125*Math.sin(Math.PI*flight):311-201*lift,
  angle:flight>0?flight*360:-12*lift,
  scale:.4+.2*lift,attached:airborne&&flight===0,
  phase:ms>=CONTACT_REVEAL?'connect':ms>=17500?'approach':ms>=15000?'retrieve':ms>=14000?'land':ms>=12800?'flight':ms>=11200?'pull':'notice',
  ready:ms>=CONTACT_REVEAL};
}
