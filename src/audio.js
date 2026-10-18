// ===== AUDIO =====
const AU={ctx:null,m:null,sfx:null,mus:null,muted:false,track:0,step:0,next:0,timer:null};
function auInit(){
 if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return}
 const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
 try{AU.ctx=new C();}catch(e){return}
 const c=AU.ctx;AU.m=c.createGain();AU.m.gain.value=AU.muted?0:1;AU.m.connect(c.destination);
 AU.sfx=c.createGain();AU.sfx.gain.value=.55;AU.sfx.connect(AU.m);
 AU.mus=c.createGain();AU.mus.gain.value=.16;AU.mus.connect(AU.m);
 // tiny echo for music
 const d=c.createDelay();d.delayTime.value=.28;const fb=c.createGain();fb.gain.value=.3;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1800;
 AU.mus.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(AU.m);
 AU.next=c.currentTime+.1;AU.timer=setInterval(auTick,30);
}
function auMute(v){AU.muted=v;if(AU.m)AU.m.gain.setTargetAtTime(v?0:1,AU.ctx.currentTime,.02)}
function tone(f,dur,type,vol,slide,delay,dest){
 const c=AU.ctx;if(!c||AU.muted)return;const t=c.currentTime+(delay||0);
 const o=c.createOscillator(),g=c.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);
 if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+dur);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.2,t+.008);g.gain.exponentialRampToValueAtTime(.0008,t+dur);
 o.connect(g);g.connect(dest||AU.sfx);o.start(t);o.stop(t+dur+.05);
}
function noise(dur,vol,freq,delay,dest,type){
 const c=AU.ctx;if(!c||AU.muted)return;const t=c.currentTime+(delay||0);
 const n=Math.floor(c.sampleRate*dur),b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
 const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type=type||'lowpass';f.frequency.value=freq||1200;const g=c.createGain();
 g.gain.setValueAtTime(vol||.3,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(dest||AU.sfx);s.start(t);
}
const SFX={
 click:()=>tone(660,.05,'triangle',.12),
 hit:()=>{noise(.12,.5,900);tone(140,.12,'square',.18,60)},
 crit:()=>{noise(.18,.6,1600);tone(180,.15,'sawtooth',.2,50);tone(1320,.18,'triangle',.15,1800,.03)},
 hurt:()=>{noise(.2,.5,500);tone(110,.25,'sawtooth',.2,55)},
 block:()=>{tone(900,.12,'triangle',.18,600);tone(1350,.08,'sine',.08)},
 heal:()=>{[523,659,784].forEach((f,i)=>tone(f,.25,'sine',.14,0,i*.06))},
 coin:()=>{tone(988,.07,'square',.1);tone(1319,.18,'square',.1,0,.07)},
 ink:()=>{tone(300,.3,'sine',.18,900);tone(450,.3,'triangle',.08,1400,.05)},
 debuff:()=>{tone(400,.25,'triangle',.15,200);tone(300,.25,'triangle',.1,150,.05)},
 dodge:()=>{noise(.15,.25,3000,0,null,'highpass');tone(800,.1,'sine',.06,1600)},
 select:()=>tone(520,.06,'triangle',.12,780),
 die:()=>{tone(220,.6,'sawtooth',.2,40);noise(.4,.3,400)},
 kill:()=>{noise(.25,.4,1200);[392,330,262].forEach((f,i)=>tone(f,.15,'square',.1,0,i*.05))},
 level:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,.22,'square',.12,0,i*.09));[1047,1319,1568].forEach(f=>tone(f,.8,'triangle',.08,0,.4));noise(.6,.15,6000,.4,null,'highpass')},
 victory:()=>{[392,523,659,784,1047].forEach((f,i)=>tone(f,.3,'square',.1,0,i*.11));tone(1047,1.2,'triangle',.1,0,.6)},
 turn:()=>tone(330,.08,'triangle',.1,440),
 rank:()=>{tone(660,.1,'square',.1);tone(990,.2,'square',.1,0,.08);tone(1320,.25,'triangle',.08,0,.16)},
};
function sfx(n){if(!AU.ctx)return;try{SFX[n]&&SFX[n]()}catch(e){}}
// music: [roots], scale, bpm per track. track 0 title/map, 1-3 act combat, 4 boss
const MUS=[
 {bpm:84,ch:[[0,4,7],[9,12,16],[5,9,12],[7,11,14]],root:48,lead:.6},
 {bpm:104,ch:[[0,4,7],[5,9,12],[9,12,16],[7,11,14]],root:50,lead:.8,dr:1},
 {bpm:108,ch:[[0,3,7],[10,14,17],[8,12,15],[7,10,14]],root:50,lead:.8,dr:1},
 {bpm:96,ch:[[0,4,8],[2,6,10],[4,8,12],[6,10,14]],root:48,lead:.9,dr:1},
 {bpm:128,ch:[[0,3,7],[1,5,8],[0,3,7],[10,13,17]],root:45,lead:1,dr:2},
];
function musSet(i){AU.track=i}
function auTick(){
 const c=AU.ctx;if(!c)return;const M=MUS[AU.track]||MUS[0];const sp=60/M.bpm/2;
 while(AU.next<c.currentTime+.12){
  const st=AU.step,bar=Math.floor(st/8)%M.ch.length,ch=M.ch[bar],t=AU.next-c.currentTime;
  if(!AU.muted&&t>=0){
   const hz=n=>440*Math.pow(2,(n-69)/12);
   if(st%8===0)tone(hz(M.root-12+ch[0]),sp*7,'triangle',.5,0,t,AU.mus);
   if(st%8===4&&M.dr)tone(hz(M.root-12+ch[0]),sp*3,'triangle',.35,0,t,AU.mus);
   const k=(st*5+bar*3)%7;if(k<5*M.lead){const n=ch[(st+Math.floor(st/3))%3]+12*(st%4===3?1:0);tone(hz(M.root+12+n),sp*1.6,'square',.12,0,t,AU.mus)}
   if(M.dr){if(st%2===0)noise(.03,.12,7000,t,AU.mus,'highpass');if(st%8===4||(M.dr>1&&st%8===6))noise(.12,.25,1400,t,AU.mus);if(st%8===0)tone(110,.12,'sine',.6,45,t,AU.mus)}
  }
  AU.step++;AU.next+=sp;
 }
}
