// ===== UI / RENDER =====
const cv=$('#cv'),g=cv.getContext('2d');let W=0,H=0,DPR=1;
const UI={title:true,ov:null,sel:null,busyUntil:0,dhp:null,floats:[],parts:[],shk:0,Q:[],last:0,lastCombat:null,confirmAbandon:0,clsSel:'surveyor',heat:0,flashP:0,lungeP:0,t:0};
function now(){return performance.now()}
function busy(){return now()<UI.busyUntil}
function at(d,fn){UI.Q.push({at:now()+Math.max(0,d)*1000,fn})}
FX={
 float(who,text,col,size,d,sub){at(d,()=>{const p=anchor(who);if(!p)return;UI.floats.push({x:p.x+(R()-.5)*20,y:p.y,text,col,size:size||26,t0:now(),sub})})},
 flash(who,d){at(d,()=>{if(who==='p')UI.flashP=1;else{const e=curCombat()&&curCombat().en[+who.slice(1)];if(e)e.fl=1}})},
 hp(who,v,d){at(d,()=>{if(who==='p')UI.dhp=v;else{const e=curCombat()&&curCombat().en[+who.slice(1)];if(e){const was=e.dhp;e.dhp=v;if(v<=0&&was>0){const p=anchor(who);if(p)splat(p.x,p.y+20,26,COL.ink)}}}})},
 shake(a,d,big){at(d,()=>{UI.shk=Math.max(UI.shk,a);if(big){const ap=$('#app');ap.classList.remove('shake');void ap.offsetWidth;ap.classList.add('shake')}})},
 sound(n,d){at(d,()=>sfx(n))},
 lunge(who,d){at(d,()=>{if(who==='p')UI.lungeP=1;else{const e=curCombat()&&curCombat().en[+who.slice(1)];if(e)e.lunge=1}})},
 busy(s){UI.busyUntil=Math.max(UI.busyUntil,now()+s*1000);setTimeout(()=>render(),s*1000+30)},
};
function curCombat(){const r=S.run;return r&&r.combat?r.combat:UI.lastCombat}
function splat(x,y,n,col){for(let i=0;i<n;i++){const a=R()*6.28,v=40+R()*160;UI.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,r:2+R()*5,col,t0:now(),life:.6+R()*.5})}}
function confetti(){for(let i=0;i<70;i++){UI.parts.push({x:W/2+(R()-.5)*60,y:H*.45,vx:(R()-.5)*420,vy:-150-R()*300,r:3+R()*4,col:pick([COL.gold,COL.red,COL.green,COL.purple,COL.blue]),t0:now(),life:1.2+R()*.6,sq:1})}}
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);const w=cv.clientWidth,h=cv.clientHeight;if(w!==W||h!==H||cv.width!==Math.round(w*DPR)){W=w;H=h;cv.width=Math.round(w*DPR);cv.height=Math.round(h*DPR)}}
function layout(){const c=curCombat();const n=c?c.en.length:1;const ey=H*.5;const xs=n===1?[.6]:n===2?[.33,.74]:[.18,.5,.82];
 const boss=c&&c.kind==='boss';const s=boss?Math.min(W*.55,H*.3):Math.min(W/n*(n===1?.62:.72),H*.27);
 return {p:{x:W*.2,y:H-18,s:Math.min(H*.24,120)},e:xs.map(x=>({x:W*x,y:ey,s:n===3?Math.min(s,W*.26):s}))}}
function anchor(w){if(w==='p'){const L=layout();return {x:L.p.x,y:L.p.y-L.p.s*1.0}}const L=layout(),i=+w.slice(1),e=L.e[i];return e?{x:e.x,y:e.y-e.s*.8}:null}
// map geometry
function nodeXY(n){const rs=(H-110)/7;return {x:24+n.x*(W-48),y:H-34-n.r*rs+n.y*rs*.5}}

function loop(ts){
 requestAnimationFrame(loop);resize();const t=ts/1000;UI.t=t;const dt=Math.min(.05,(ts-(UI.last||ts))/1000);UI.last=ts;BOIL=Math.floor(t*7);
 while(UI.Q.length){let k=UI.Q.findIndex(q=>q.at<=now());if(k<0)break;const q=UI.Q.splice(k,1)[0];try{q.fn()}catch(e){console.warn(e)}}
 if(S.run&&!UI.title&&S.run.scr!=='end')S.run.play=(S.run.play||0)+dt;
 g.setTransform(DPR,0,0,DPR,0,0);
 const sh=UI.shk;UI.shk*=.86;if(UI.shk<.3)UI.shk=0;
 g.save();if(sh)g.translate((R()-.5)*sh*2,(R()-.5)*sh*2);
 const r=S.run;
 if(UI.title||!r)drawTitle(t);
 else if(r.combat||(UI.lastCombat&&busy()))drawCombat(t,dt);
 else drawMap(t);
 g.restore();
 // floaters & particles
 const n=now();UI.floats=UI.floats.filter(f=>{const a=(n-f.t0)/1000;if(a>1.1)return false;const y=f.y-a*60-(a<.15?(.15-a)*-80:0);g.globalAlpha=Math.min(1,1.6-a*1.4);
  const sc=a<.12?1+(.12-a)*5:1;txtO(g,f.text,f.x,y,f.size*sc,f.col,COL.ink);if(f.sub)txtO(g,f.sub,f.x,y-f.size*.8,14,COL.gold,COL.ink);g.globalAlpha=1;return true});
 UI.parts=UI.parts.filter(p=>{const a=(n-p.t0)/1000;if(a>p.life)return false;p.vy+=500*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;g.globalAlpha=1-a/p.life;g.fillStyle=p.col;if(p.sq){g.save();g.translate(p.x,p.y);g.rotate(a*8);g.fillRect(-p.r,-p.r/2,p.r*2,p.r);g.restore()}else{g.beginPath();g.arc(p.x,p.y,p.r,0,7);g.fill()}g.globalAlpha=1;return true});
 if(UI.flashP>0)UI.flashP=Math.max(0,UI.flashP-dt*4);if(UI.lungeP>0)UI.lungeP=Math.max(0,UI.lungeP-dt*4);
 const c=curCombat();if(c)c.en.forEach(e=>{if(e.fl>0)e.fl=Math.max(0,e.fl-dt*4);if(e.lunge>0)e.lunge=Math.max(0,e.lunge-dt*3.5)});
 updTop();
}
function drawTitle(t){
 drawPaper(g,W,H,'#efe4c8',3);
 // wandering dotted path
 g.save();g.setLineDash([3,9]);g.lineWidth=3;g.strokeStyle='rgba(42,35,32,.4)';g.beginPath();for(let i=0;i<=40;i++){const x=i/40*W,y=H*.78+Math.sin(i*.5+t*.3)*30;i?g.lineTo(x,y):g.moveTo(x,y)}g.stroke();g.restore();
 const px=(t*40)%(W+80)-40;drawPlayerShape(g,px,H*.78+Math.sin(px/W*20+t*.3)*30,70,CL[UI.clsSel]?CL[UI.clsSel].col:COL.blue,t,false,UI.clsSel);
 drawCreature(g,EN.goose.art,W*.82,H*.93,90,t,0);drawCreature(g,EN.wasp.art,W*.15+Math.sin(t)*20,H*.6+Math.cos(t*1.3)*14,40,t,0);
 drawCreature(g,EN.signpost.art,W*.12,H*.97,70,t,0);
 for(let i=0;i<6;i++){const x=W*(.1+i*.16),y=H*.69+Math.sin(t+i)*6;g.globalAlpha=.25;drawIcon(g,['fight','event','shop','rest','mystery','elite'][i],x,y,12);g.globalAlpha=1}
}
function drawMap(t){
 const r=S.run,A=ACTS[r.act];drawPaper(g,W,H,A.bg,r.act*13);
 const M=r.map.rows,R_=reachable(r),isR=(a,b)=>R_.some(q=>q[0]===a&&q[1]===b)&&r.scr==='map';
 const path=r.path||[];const onPath=(a,b)=>path.some(q=>q[0]===a&&q[1]===b);
 // edges
 M.forEach((row,ri_)=>row.forEach((n,ci)=>{const p=nodeXY(n);n.l.forEach(li=>{const m=M[ri_+1][li],q=nodeXY(m);const used=onPath(ri_,ci)&&onPath(ri_+1,li)&&path.findIndex(z=>z[0]===ri_&&z[1]===ci)+1===path.findIndex(z=>z[0]===ri_+1&&z[1]===li);
  g.save();if(!used)g.setLineDash([4,7]);inkPath(g,[[p.x,p.y],[(p.x+q.x)/2+jit(p.x+q.y)*3,(p.y+q.y)/2],[q.x,q.y]],false,used?4:2.2,null,1,used?COL.red:'rgba(42,35,32,.55)');g.restore()})}));
 // nodes
 M.forEach((row,ri_)=>row.forEach((n,ci)=>{const p=nodeXY(n),boss=n.t==='boss',rad=boss?27:17,reach=isR(ri_,ci);
  if(reach){const pu=1+Math.sin(t*5)*.12;g.beginPath();g.arc(p.x,p.y,(rad+8)*pu,0,7);g.fillStyle='rgba(217,164,65,.35)';g.fill()}
  g.globalAlpha=n.done||(!reach&&r.pos&&ri_<=r.pos[0])?.45:1;
  inkPath(g,ell(p.x,p.y,rad,rad,16),true,reach?3.5:2.5,n.done?'#d8ccb2':'#fffaf0');
  drawIcon(g,n.done&&n.rv?n.rv:n.t,p.x,p.y,boss?20:12,reach?COL.ink:'#3a312c');
  if(n.done&&!(r.pos&&r.pos[0]===ri_&&r.pos[1]===ci)){line(g,p.x-9,p.y-9,p.x+9,p.y+9,2,COL.red)}
  g.globalAlpha=1;if(boss)txtO(g,'BOSS',p.x,p.y-38,18,COL.red);
 }));
 // player token
 if(r.pos){const tp=nodeXY(M[r.pos[0]][r.pos[1]]);drawPlayerShape(g,tp.x+20,tp.y+14,38,CL[r.cls].col,t,false,r.cls)}
 // legend
 const L=[['fight','fight'],['elite','elite'],['event','event'],['mystery','???'],['shop','shop'],['rest','rest'],['treasure','loot']];
 g.fillStyle='rgba(243,234,215,.85)';g.fillRect(0,0,W,24);L.forEach((l,i)=>{const x=10+i*(W-10)/7;drawIcon(g,l[0],x+7,12,7);txt(g,l[1],x+17,12,13,COL.ink,'left')});
}
function drawCombat(t,dt){
 const r=S.run,c=curCombat();if(!c)return;const A=ACTS[r.act];drawPaper(g,W,H,A.bg,r.act*7+3);
 // ground sketch
 inkPath(g,[[0,H*.52],[W*.3,H*.515],[W*.6,H*.525],[W,H*.51]],false,2,null,2,'rgba(42,35,32,.35)');
 for(let i=0;i<5;i++){const x=(i*97+r.act*31)%W;inkPath(g,[[x,H*.52],[x+8,H*.49],[x+16,H*.52]],false,1.5,null,1,'rgba(42,35,32,.3)')}
 const L=layout();
 c.en.forEach((e,i)=>{const P=L.e[i];const dead=e.dhp<=0&&e.hp<=0;const lg=e.lunge>0?Math.sin(e.lunge*Math.PI)*24:0;
  if(c.tgt===i&&!dead&&r.combat){g.save();g.setLineDash([6,5]);g.beginPath();g.ellipse(P.x,P.y+2,P.s*.45,P.s*.1,0,0,7);g.lineWidth=3;g.strokeStyle=COL.red;g.stroke();g.restore()}
  drawCreature(g,EN[e.id].art,P.x-lg*.4,P.y+lg,P.s,t,e.fl,dead);
  if(dead)return;
  // intent
  if(e.it&&r.combat){const it=e.it;const parts=[];const iy=Math.max(18,P.y-P.s*(EN[e.id].boss?1.12:1.02)-14);
   if(e.st.stun>0)parts.push(['zz','stunned',COL.gold]);else{
   if(it.a!=null)parts.push(['fight',predicted(r,e)+(it.x>1?'x'+it.x:''),COL.red]);if(it.b)parts.push(['blk','+'+Math.round(it.b*dmgMul(r)),COL.blue]);if(it.str)parts.push(['up','+'+it.str,COL.red]);
   if(it.weak||it.vuln)parts.push(['deb',it.weak&&it.vuln?'weak+vuln':it.weak?'weak':'vuln',COL.purple]);if(it.heal)parts.push(['heal','+'+it.heal,COL.green]);if(it.steal)parts.push(['g','steal',COL.gold]);if(it.strip)parts.push(['x','erase blk',COL.pink])}
   g.font='17px Brush';const ws=parts.map(p=>g.measureText(p[1]).width+(p[0]==='fight'?20:6));let tw=ws.reduce((a,b)=>a+b+6,0)+8;let x=P.x-tw/2;
   inkPath(g,rr(x,iy-13,tw,26),true,2,'#fffaf0',.8);x+=6;
   parts.forEach((p,j)=>{if(p[0]==='fight'){drawIcon(g,'fight',x+8,iy,8,COL.red);x+=18}txt(g,p[1],x,iy,17,p[2],'left','Brush');x+=ws[j]-(p[0]==='fight'?18:0)+6});
  }
  // hp bar
  const bw=Math.min(P.s*.95,W/c.en.length-16),bx=P.x-bw/2,by=P.y+12;
  g.fillStyle='#4a3f39';g.fillRect(bx,by,bw,13);g.fillStyle=COL.red;g.fillRect(bx,by,bw*clamp(e.dhp/e.max,0,1),13);g.strokeStyle=COL.ink;g.lineWidth=2;g.strokeRect(bx,by,bw,13);
  txt(g,Math.max(0,Math.ceil(e.dhp))+'/'+e.max,P.x,by+7,13,'#fff');
  if(e.b>0){inkPath(g,[[bx-14,by-4],[bx+2,by-4],[bx+2,by+10],[bx-6,by+17],[bx-14,by+10]],true,2,COL.blue,.6);txt(g,''+e.b,bx-6,by+5,14,'#fff','center','Brush')}
  txt(g,e.n,P.x,by+26,15,COL.ink);
  const st=[];if(e.st.weak)st.push(['Weak '+e.st.weak,COL.purple]);if(e.st.vuln)st.push(['Vuln '+e.st.vuln,COL.purple]);if(e.st.bleed)st.push(['Bleed '+e.st.bleed,COL.red]);if(e.st.str)st.push(['Str +'+e.st.str,COL.red]);
  st.forEach((s,j)=>txt(g,s[0],P.x,by+42+j*15,14,s[1]));
 });
 // player
 const P=L.p,lg=UI.lungeP>0?Math.sin(UI.lungeP*Math.PI)*26:0;
 g.save();drawPlayerShape(g,P.x+lg,P.y-lg*.6,P.s,CL[r.cls].col,t,false,r.cls);if(UI.flashP>0){g.globalAlpha=UI.flashP*.6;g.fillStyle=COL.red;g.fillRect(P.x-P.s*.5,P.y-P.s*1.2,P.s,P.s*1.2)}g.restore();
 const bx=W*.4,by=H-62,bw=W*.55,s=stats(r),hp=UI.dhp==null?r.hp:UI.dhp;
 g.fillStyle='#4a3f39';g.fillRect(bx,by,bw,18);g.fillStyle=COL.red;g.fillRect(bx,by,bw*clamp(hp/s.maxHp,0,1),18);g.strokeStyle=COL.ink;g.lineWidth=2.5;g.strokeRect(bx,by,bw,18);
 txt(g,Math.max(0,Math.ceil(hp))+' / '+s.maxHp+' HP',bx+bw/2,by+10,15,'#fff');
 const cb=c.block||0;if(cb>0){inkPath(g,[[bx-26,by-6],[bx-4,by-6],[bx-4,by+12],[bx-15,by+22],[bx-26,by+12]],true,2.5,COL.blue,.6);txt(g,''+cb,bx-15,by+6,17,'#fff','center','Brush')}
 const ps=[];if(c.pst.weak)ps.push(['Weak '+c.pst.weak,COL.purple]);if(c.pst.vuln)ps.push(['Vulnerable '+c.pst.vuln,COL.purple]);if(c.pst.str)ps.push(['Str +'+c.pst.str,COL.green]);
 txt(g,CL[r.cls].name+' · Lv '+r.lvl,bx,by-14,15,COL.ink,'left');ps.forEach((p,j)=>txt(g,p[0],bx+j*86,by+32,14,p[1],'left'));
 const inc=r.combat?incoming(r):0;if(inc>0)txt(g,'Incoming: '+inc+(cb?' (block '+cb+')':''),bx+bw,by+32,14,COL.red,'right');
}
// ===== TOP BAR =====
let topSig='';
function updTop(){const r=S.run,top=$('#top');
 if(UI.title||!r){if(topSig!=='t'){top.style.display='none';topSig='t'}return}
 const s=stats(r),hp=Math.max(0,Math.ceil(UI.dhp==null||!r.combat?r.hp:UI.dhp));const sig=[hp,s.maxHp,r.gold,r.lvl,r.xp,AU.muted,r.sp].join();if(sig===topSig)return;topSig=sig;top.style.display='flex';
 top.innerHTML=`<span class="lv">Lv${r.lvl}</span><div class="bar" style="flex:1.4"><i style="width:${clamp(hp/s.maxHp,0,1)*100}%"></i><b>${hp}/${s.maxHp} HP</b></div><div class="bar xp" style="flex:.8"><i style="width:${clamp(r.xp/need(r.lvl),0,1)*100}%"></i><b>${r.xp}/${need(r.lvl)} XP</b></div><span class="gold">${r.gold}g</span><button class="ib" data-b="mute" onclick="toggleMute()">${AU.muted?'off':'snd'}</button><button class="ib" data-b="menu" onclick="openOv('menu')">||</button>`}
function toggleMute(){auInit();auMute(!AU.muted);S.meta.mute=AU.muted;save();topSig='';render()}
// ===== PANEL / OVERLAYS =====
const ROMAN=['','I','II','III'];
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function openOv(k){sfx('click');UI.ov=k;UI.sel=null;UI.confirmAbandon=0;render()}
function closeOv(){sfx('click');UI.ov=null;render()}
function render(){
 const r=S.run,pan=$('#panel'),ov=$('#ov');auMusic();
 if(UI.title||!r){pan.innerHTML='';showOv(titleHTML(),true);return}
 if(r.scr==='end'&&busy()){pan.innerHTML='';hideOv();setTimeout(render,UI.busyUntil-now()+40);return}
 if(r.scr==='combat'){UI.lastCombat=r.combat}
 // panel
 if(r.scr==='combat')pan.innerHTML=combatPanel();else if(r.scr==='map')pan.innerHTML=mapPanel();else pan.innerHTML='';
 if(busy()&&r.scr!=='combat'&&r.scr!=='map'){hideOv();setTimeout(render,UI.busyUntil-now()+40);save();return}
 if(r.scr!=='combat'&&!busy())UI.lastCombat=null;
 if(UI.dhp==null||!r.combat)UI.dhp=r.hp;
 // overlays
 let h=null;
 if(UI.ov==='menu')h=menuHTML();else if(UI.ov==='skills')h=skillsHTML();else if(UI.ov==='gear')h=gearHTML();
 else if(r.scr==='event')h=eventHTML();else if(r.scr==='shop')h=shopHTML();else if(r.scr==='rest'||r.scr==='restdone')h=restHTML();
 else if(r.scr==='loot')h=lootHTML();else if(r.scr==='end')h=endHTML();
 if(h)showOv(h,r.scr==='end');else hideOv();
 // fanfares
 if(!busy()&&r.newAct&&r.scr==='map'){r.newAct=0;fan('Act '+ROMAN[r.act]+'<small>'+ACTS[r.act].name+'</small>');sfx('victory')}
 else if(!busy()&&r.pendingLv>0&&(r.scr==='map'||r.scr==='loot')){fan('LEVEL UP!<small>Level '+r.lvl+' · +1 skill point</small>');r.pendingLv=0;sfx('level');confetti();FX.shake(6,0)}
 save();
}
function fan(h){const f=$('#fan');f.innerHTML='<div class="lv">'+h+'</div>';clearTimeout(fan.t);fan.t=setTimeout(()=>f.innerHTML='',1700)}
function showOv(h,full){const ov=$('#ov');ov.innerHTML=h;ov.className='on'+(full?' full':'');if(UI.title)ov.style.background='transparent';else ov.style.background='';ov.querySelectorAll('canvas[data-cls]').forEach(drawMini)}
function hideOv(){const ov=$('#ov');ov.className='';ov.innerHTML=''}
function drawMini(c){const x=c.getContext('2d'),k=c.dataset.cls;c.width=120;c.height=120;x.scale(2,2);drawPlayerShape(x,30,56,50,CL[k].col,1,false,k)}
function mapPanel(){const r=S.run,A=ACTS[r.act];
 return `<div class="hdr" style="margin-bottom:6px"><div><span style="font-family:Brush;font-size:22px">Act ${ROMAN[r.act]} · ${A.name}</span><div class="small">${A.sub} Tap a glowing spot.</div></div></div>
 <div class="row"><button class="btn purple" data-b="skills" onclick="openOv('skills')">Skills${r.sp?`<span class="badge">${r.sp}</span>`:''}</button><button class="btn" data-b="gear" onclick="openOv('gear')">Gear &amp; Journal</button></div>`}
function combatPanel(){const r=S.run,c=r.combat,s=stats(r),b=busy();
 let pips='';for(let i=0;i<Math.max(s.en,c.energy);i++)pips+=`<i class="${i<c.energy?'':'off'}"></i>`;
 const acts=actions(r).map(k=>{const A=ACT[k],dis=b||c.energy<A.cost;return `<button class="btn ${A.col}" data-b="act-${k}" ${dis?'disabled':''} onclick="doAct('${k}')">${A.n}<small>${actLabel(r,k)}</small><span class="cost">${A.cost}</span></button>`}).join('');
 const pots=r.pots.map((p,i)=>`<button class="btn" style="min-height:40px;padding:4px 8px;font-size:14px;flex:0 1 auto;border-color:${POT[p].col}" data-b="pot-${i}" ${b?'disabled':''} onclick="doPot(${i})">${POT[p].n}</button>`).join('');
 return `<div class="log">${esc(c.log||'')}</div><div class="row" style="margin-bottom:8px"><div class="energy">${pips}<span style="margin-left:4px">${c.energy} energy</span></div><div style="flex:1"></div><button class="btn gold" style="min-width:120px;font-family:Brush;font-size:20px" data-b="end" ${b?'disabled':''} onclick="doEnd()">End turn</button></div>
 <div class="grid">${acts}</div>${pots?`<div class="row" style="margin-top:8px;flex-wrap:wrap">${pots}</div>`:''}`}
function doAct(k){const r=S.run;if(busy())return;auInit();if(useAct(r,k)){FX.busy(.18*SPD);render()}}
function doPot(i){if(busy())return;usePot(S.run,i);FX.busy(.2*SPD);render()}
function doEnd(){if(busy())return;sfx('click');endTurn(S.run);render()}
function eventHTML(){const r=S.run,e=EVS.find(x=>x.id===r.ev.id);
 let h=`<div class="card"><div class="small">Act ${ROMAN[r.act]} · Event</div><h2>${esc(e.title)}</h2><p>${esc(evText(e))}</p>`;
 if(r.ev.res){h+=`<div class="res">${esc(r.ev.res)}</div><button class="btn big" data-b="cont" onclick="act(()=>evContinue(S.run))">Continue</button>`}
 else e.ch.forEach((c,i)=>{const ok=reqOk(r,c.req);const lab=reqLabel(c.req);h+=`<button class="btn choice" data-b="ch-${i}" ${ok?'':'disabled'} onclick="act(()=>chooseEv(S.run,${i}))">${lab?`<span class="req">${esc(lab)}</span>`:''}${esc(c.t)}${!ok&&c.req&&c.req.g&&r.gold<c.req.g?' <small>(need '+c.req.g+' gold)</small>':''}</button>`});
 return h+'</div>'}
function act(fn){if(busy())return;auInit();fn();render()}
function itemRow(it,cmp,btns){const s=it.slot,old=cmp;let d='';if(cmp!==undefined){const dp=Math.round(power(it)-power(old));d=` <span class="${dp>=0?'up':'dn'}">(${dp>=0?'better':'worse'} than ${old?esc(old.name):'nothing'})</span>`}
 return `<div class="item"><div class="sw" style="background:${RARC[it.rar]}">${s==='weapon'?'W':s==='armor'?'A':'T'}</div><div style="flex:1"><div class="nm" style="color:${RARC[it.rar]}">${esc(it.name)}</div><div class="st">${RAR[it.rar]} ${s} · ${itemStats(it)}${d}</div><div class="q">${esc(it.q||'')}</div></div>${btns||''}</div>`}
function lootHTML(){const r=S.run,L=r.loot;const t=L.from==='boss'?'Boss down!':L.from==='elite'?'Elite down!':L.from==='fight'?'Victory!':L.from==='treasure'?'Treasure!':'You got something';
 let h=`<div class="card"><h2>${t}</h2>`;
 if(L.gold)h+=`<p>+${L.gold} gold${L.xp?' · +'+L.xp+' XP':''}</p>`;else if(L.xp)h+=`<p>+${L.xp} XP</p>`;
 if(L.corner)h+=`<div class="res">You found a TORN CORNER of the map. It is warm. (Torn Corners: ${r.corners})</div>`;
 L.pots.forEach(p=>h+=`<div class="tag" style="border-color:${POT[p].col}">${POT[p].n}: ${POT[p].d}</div>`);
 L.items.forEach((it,i)=>{const dn=L.done[i];h+=itemRow(it,r.gear[it.slot],'')+(dn?`<div class="small">${dn==='equip'?'Equipped.':'Sold for '+it.val+' gold.'}</div>`:`<div class="row"><button class="btn green" data-b="equip-${i}" onclick="act(()=>lootTake(S.run,${i},'equip'))">Equip</button><button class="btn" data-b="sell-${i}" onclick="act(()=>lootTake(S.run,${i},'sell'))">Sell (+${it.val}g)</button></div>`)});
 if(L.from==='boss'&&r.act<3)h+=`<p class="small">Onward to Act ${ROMAN[r.act+1]}. You'll heal 40% on the way.</p>`;
 return h+`<button class="btn big" data-b="cont" onclick="act(()=>lootContinue(S.run))">${L.from==='boss'&&r.act>=3?'See how it ends':'Continue'}</button></div>`}
function shopHTML(){const r=S.run,sh=r.shop;let h=`<div class="card"><div class="hdr"><h2>The Margin Shop</h2><b style="color:#9a6a10;font-size:20px">${r.gold}g</b></div><p class="small">"Everything is priced to sell. Or at least priced."</p>`;
 sh.items.forEach((o,i)=>{const p=price(r,o.p),sold=sh.sold[i],can=!sold&&r.gold>=p&&!(o.k==='pot'&&r.pots.length>=3);
  const btn=`<button class="btn gold" style="min-width:74px" data-b="buy-${i}" ${can?'':'disabled'} onclick="act(()=>shopBuy(S.run,${i}))">${sold?'sold':p+'g'}</button>`;
  if(o.k==='item')h+=itemRow(o.it,r.gear[o.it.slot],btn);
  else if(o.k==='pot')h+=`<div class="item"><div class="sw" style="background:${POT[o.pot].col}">P</div><div style="flex:1"><div class="nm">${POT[o.pot].n}</div><div class="st">${POT[o.pot].d} (you carry ${r.pots.length}/3)</div></div>${btn}</div>`;
  else if(o.k==='tutor')h+=`<div class="item"><div class="sw" style="background:${COL.purple}">+1</div><div style="flex:1"><div class="nm">Skill Tutor</div><div class="st">+1 skill point. Price goes up each time.</div></div>${btn}</div>`;
  else h+=`<div class="item"><div class="sw" style="background:${COL.red}">+</div><div style="flex:1"><div class="nm">Patch Up</div><div class="st">Heal 30% of max HP.</div></div>${btn}</div>`});
 return h+`<button class="btn big" data-b="leave" onclick="act(()=>{S.run.scr='map';S.run.shop=null})">Leave</button></div>`}
function restHTML(){const r=S.run,s=stats(r);if(r.scr==='restdone')return `<div class="card"><h2>Rest Stop</h2><div class="res">${esc(r.restRes)}</div><button class="btn big" data-b="cont" onclick="act(()=>{S.run.scr='map'})">Continue</button></div>`;
 return `<div class="card"><h2>Rest Stop</h2><p>A campfire someone drew for you. It is warm anyway. Choose one:</p>
 <button class="btn choice red" data-b="nap" onclick="act(()=>restDo(S.run,'nap'))">Nap<small>Heal ${Math.round(s.maxHp*.35)} HP (you have ${r.hp}/${s.maxHp})</small></button>
 <button class="btn choice purple" data-b="practice" onclick="act(()=>restDo(S.run,'practice'))">Practice<small>+1 skill point</small></button>
 <button class="btn choice" data-b="sharpen" onclick="act(()=>restDo(S.run,'sharpen'))">Sharpen<small>+2 ATK on ${esc(r.gear.weapon.name)}</small></button></div>`}
function canRank(r,k){const s=SK[k];return r.sp>0&&r.ranks[k]<5&&bp(r,s.br)>=s.tier*2}
function rankUp(r,k){if(!canRank(r,k))return false;r.ranks[k]++;r.sp--;if(k==='b1')r.hp+=5;fixHp(r);return true}
function skillsHTML(){const r=S.run;const sel=UI.sel||null;
 let h=`<div class="card"><div class="hdr"><h2>Skills</h2><b style="font-size:19px">${r.sp} point${r.sp===1?'':'s'}</b></div><div class="tree">`;
 for(const b of ['b','c','w']){h+=`<div class="tcol"><h3 style="background:${BR[b].col}">${BR[b].name} ${bp(r,b)}</h3>`;
  SKIDS.filter(k=>SK[k].br===b).forEach(k=>{const s=SK[k],lock=bp(r,b)<s.tier*2,rk=r.ranks[k];let pips='';for(let i=0;i<5;i++)pips+=`<i class="${i<rk?'on':''}" style="${i<rk?'background:'+BR[b].col:''}"></i>`;
   h+=`<div class="sk ${lock?'lock':''} ${sel===k?'sel':''}" data-b="sk-${k}" onclick="UI.sel='${k}';sfx('select');render()"><span class="n">${s.name}${canRank(r,k)?' <b style="color:'+BR[b].col+'">+</b>':''}</span><span class="ty">${s.type}${s.cost?' · '+s.cost+' energy':''}${lock?' · needs '+s.tier*2+' in '+BR[b].name:''}</span><div class="pips">${pips}</div></div>`});h+='</div>'}
 h+='</div>';
 if(sel){const s=SK[sel],rk=r.ranks[sel];h+=`<div class="res"><b style="font-family:Brush;font-size:21px;color:${BR[s.br].col}">${s.name}</b> <span class="small">rank ${rk}/5 · ${s.type}</span><br>${rk?'Now: '+esc(s.d(rk))+'<br>':''}${rk<5?'Next: '+esc(s.d(rk+1)):'Maxed out.'}</div>
  <button class="btn big purple" data-b="rank" ${canRank(r,sel)?'':'disabled'} onclick="if(rankUp(S.run,UI.sel)){sfx('rank');confetti();}render()">${rk>=5?'Maxed':bp(r,s.br)<s.tier*2?'Locked':r.sp?'Rank up (1 point)':'No points'}</button>`}
 else h+=`<p class="small">Tap a skill to see what it does. Ranks 1-5. Deeper skills unlock as you invest in a branch. Earn points by leveling up, resting, and the occasional bribe.</p>`;
 return h+`<button class="btn big" data-b="close" onclick="closeOv()">Done</button></div>`}
function gearHTML(){const r=S.run,s=stats(r);
 let h=`<div class="card"><h2>${CL[r.cls].name}</h2><div class="tag">HP ${r.hp}/${s.maxHp}</div><div class="tag">ATK ${s.atk}</div><div class="tag">DEF ${s.def}</div><div class="tag">Strike ${s.strike}</div><div class="tag">Guard ${s.guard}</div><div class="tag">Crit ${s.crit}%</div><div class="tag">Dodge ${s.dodge}%</div><div class="tag">Energy ${s.en}</div>${r.heat?`<div class="tag">Heat ${r.heat}</div>`:''}<h3>Gear</h3>`;
 ['weapon','armor','trinket'].forEach(k=>{h+=r.gear[k]?itemRow(r.gear[k]):`<div class="item"><div class="sw" style="background:#aaa">-</div><div class="st">No ${k} yet.</div></div>`});
 h+=`<h3>Potions (${r.pots.length}/3)</h3>`+(r.pots.length?r.pots.map(p=>`<div class="tag" style="border-color:${POT[p].col}">${POT[p].n}: ${POT[p].d}</div>`).join(''):'<p class="small">None. Potions are used in fights.</p>');
 const fn={ink:'Inkwrights',blank:'Blankers',folk:'Margin Folk'};
 h+=`<h3>Journal</h3><p class="small" style="font-size:16px">${Object.keys(fn).map(f=>`${fn[f]}: <b>${r.rep[f]}</b>${r.sworn===f?' (sworn)':''}`).join(' · ')}<br>${r.sworn?'You are sworn. Other factions won\'t have you.':'Factions like you more when you side with them in events. Who you side with changes how this ends.'}${r.corners?'<br>Torn Corners: <b>'+r.corners+'</b>. They feel important.':''}</p>`;
 return h+`<button class="btn big" data-b="close" onclick="closeOv()">Done</button></div>`}
function menuHTML(){return `<div class="card"><h2>Paused</h2><p class="small">Your run is saved automatically.</p>
 <button class="btn big" data-b="resume" onclick="closeOv()">Resume</button>
 <button class="btn big purple" onclick="openOv('skills')">Skills</button><button class="btn big" onclick="openOv('gear')">Gear &amp; Journal</button>
 <button class="btn big" onclick="toggleMute()">Sound: ${AU.muted?'OFF':'ON'}</button>
 <button class="btn big" data-b="quit" onclick="UI.ov=null;UI.title=true;sfx('click');render()">Save &amp; quit to title</button>
 <button class="btn big red" data-b="abandon" onclick="if(UI.confirmAbandon){UI.ov=null;endRun(S.run,false);S.run.result.abandoned=1;render()}else{UI.confirmAbandon=1;this.innerHTML='Tap again to give up this run'}">Abandon run</button></div>`}
function endHTML(){const r=S.run,x=r.result,E=ENDINGS[x.ending];
 return `<div class="card" style="margin-top:4vh"><div class="small">${x.won?'Run complete':'Run over'} · ${CL[r.cls].name}${r.heat?' · Heat '+r.heat:''}</div><h2 style="font-size:38px">${esc(E.t)}</h2>${x.newEnd?'<div class="tag" style="background:#f6e6be">New ending found!</div>':''}<p>${esc(E.d)}</p>
 <table><tr><td>Reached</td><td>Act ${ROMAN[r.act]}, level ${r.lvl}</td></tr><tr><td>Enemies erased</td><td>${r.kills}</td></tr><tr><td>Places visited</td><td>${r.nodes}</td></tr><tr><td>Time</td><td>${Math.max(1,Math.round((r.play||0)/60))} min</td></tr>
 <tr><td><b>Score</b></td><td><b style="font-size:22px">${x.score}</b>${x.rank<=10?' · #'+x.rank+' all-time':''}</td></tr><tr><td>Ink earned</td><td><b style="color:${COL.purple}">+${x.ink}</b> (spend it at the Drafting Table)</td></tr></table>
 ${x.heatUp?`<div class="res">Heat ${S.meta.heatMax} unlocked. Enemies hit harder, scores go higher.</div>`:''}
 <button class="btn big gold" data-b="title" onclick="S.run=null;UI.title=true;UI.ov=null;sfx('click');save();render()">Back to title</button></div>`}
// ===== TITLE / META SCREENS =====
function titleHTML(){const M=S.meta,ov=UI.ov;
 if(ov==='cls')return clsHTML();if(ov==='table')return tableHTML();if(ov==='records')return recordsHTML();
 const nE=Object.keys(M.endings).filter(k=>k!=='dead').length;
 return `<div class="title"><h1 class="logo">Unmapped</h1><div class="sub">a pocket RPG about wandering off the edge of the map</div>
 <div style="max-width:330px;margin:18px auto 0">${S.run?`<button class="btn big gold" data-b="continue" onclick="startCont()">Continue<small style="font-family:Hand">${CL[S.run.cls].name} · Act ${ROMAN[S.run.act]} · Lv ${S.run.lvl}</small></button>`:''}
 <button class="btn big ${S.run?'':'gold'}" data-b="new" onclick="auInit();openOv('cls')">New run</button>
 <button class="btn big purple" data-b="table" onclick="auInit();openOv('table')">Drafting Table<small style="font-family:Hand">${M.ink} ink to spend</small></button>
 <button class="btn big" data-b="records" onclick="auInit();openOv('records')">Records</button>
 <button class="btn big" style="font-size:18px" onclick="toggleMute()">Sound: ${AU.muted?'OFF':'ON'}</button></div>
 <p class="small" style="margin-top:10px;background:rgba(243,234,215,.8);display:inline-block;padding:2px 8px;border-radius:8px">Best ${M.stats.best} · Runs ${M.stats.runs} · Wins ${M.stats.wins} · Endings ${nE}/5</p></div>`}
function startCont(){auInit();sfx('click');UI.title=false;UI.ov=null;UI.dhp=null;if(S.run.combat)S.run.combat.en.forEach(e=>e.dhp=e.hp);render()}
function clsHTML(){const M=S.meta;let h=`<div class="card"><h2>Pick a traveler</h2>${S.run?'<p class="small" style="color:#c8553d">Starting a new run ends your current one.</p>':''}`;
 for(const k in CL){const c=CL[k],own=M.cls[k];h+=`<div class="cls ${UI.clsSel===k?'sel':''} ${own?'':'lock'}" data-b="cls-${k}" onclick="${own?`UI.clsSel='${k}';sfx('select');render()`:''}"><canvas data-cls="${k}" style="width:60px;height:60px"></canvas><div style="flex:1"><div style="font-family:Brush;font-size:21px">${c.name}</div><div class="small" style="font-size:14.5px">${own?`HP ${c.hp} · ATK ${c.atk} · DEF ${c.def} · ${c.gold}g<br>`:''}${c.blurb}</div>${own?'':`<div class="small"><b>Locked.</b> Unlock at the Drafting Table (${c.cost} ink).</div>`}</div></div>`}
 if(M.heatMax>0)h+=`<div class="row" style="margin:8px 0"><b style="font-family:Brush;font-size:20px">Heat ${UI.heat}</b><span class="small" style="flex:1">+5% enemy HP, +4% dmg, +25% score each</span><button class="btn" style="flex:0 0 48px" onclick="UI.heat=Math.max(0,UI.heat-1);render()">-</button><button class="btn" style="flex:0 0 48px" onclick="UI.heat=Math.min(S.meta.heatMax,UI.heat+1);render()">+</button></div>`;
 return h+`<button class="btn big gold" data-b="begin" onclick="beginRun()">Begin</button><button class="btn big" data-b="back" onclick="openOv(null)">Back</button></div>`}
function beginRun(){auInit();if(!S.meta.cls[UI.clsSel])UI.clsSel='surveyor';S.run=newRun(UI.clsSel,UI.heat);S.run.path=[];UI.title=false;UI.ov=null;UI.dhp=null;UI.lastCombat=null;S.run.newAct=1;sfx('victory');render()}
function tableHTML(){const M=S.meta;let h=`<div class="card"><div class="hdr"><h2>Drafting Table</h2><b style="color:${COL.purple};font-size:20px">${M.ink} ink</b></div><p class="small">Every run earns ink, win or lose. Spend it here. It stays forever.</p><h3>Travelers</h3>`;
 for(const k in CL){const c=CL[k];if(!c.cost)continue;h+=`<div class="item"><canvas data-cls="${k}" style="width:44px;height:44px"></canvas><div style="flex:1"><div class="nm">${c.name}</div><div class="st">${c.blurb}</div></div>${M.cls[k]?'<b>owned</b>':`<button class="btn purple" style="min-width:76px" data-b="unlock-${k}" ${M.ink>=c.cost?'':'disabled'} onclick="buyMeta('cls','${k}')">${c.cost}</button>`}</div>`}
 h+='<h3>Perks</h3>';for(const k in PERKS){const p=PERKS[k],lv=M.perks[k];h+=`<div class="item"><div class="sw" style="background:${COL.purple}">${lv}/${p.max}</div><div style="flex:1"><div class="nm">${p.name}</div><div class="st">${p.d}</div></div>${lv>=p.max?'<b>max</b>':`<button class="btn purple" style="min-width:76px" data-b="perk-${k}" ${M.ink>=p.cost[lv]?'':'disabled'} onclick="buyMeta('perk','${k}')">${p.cost[lv]}</button>`}</div>`}
 h+=`<p class="small">Win a run to unlock Heat: harder runs, bigger scores. (Heat unlocked: ${M.heatMax}/10)</p>`;
 return h+`<button class="btn big" data-b="back" onclick="openOv(null)">Back</button></div>`}
function buyMeta(t,k){const M=S.meta;if(t==='cls'){const c=CL[k].cost;if(M.ink<c||M.cls[k])return;M.ink-=c;M.cls[k]=1;UI.clsSel=k}else{const p=PERKS[k],lv=M.perks[k];if(lv>=p.max||M.ink<p.cost[lv])return;M.ink-=p.cost[lv];M.perks[k]++}sfx('rank');confetti();save();render()}
function recordsHTML(){const M=S.meta,b=bestRuns();const end=k=>ENDINGS[k]?ENDINGS[k].t:k;
 let h=`<div class="card"><h2>Records</h2><h3>High scores</h3>`;
 h+=b.length?`<table><tr><th>#</th><th>Score</th><th>Traveler</th><th>Result</th></tr>${b.map((x,i)=>`<tr><td>${i+1}</td><td><b>${x.score}</b></td><td>${CL[x.cls]?CL[x.cls].name:x.cls}${x.heat?' H'+x.heat:''}</td><td>${x.won?esc(end(x.ending)):'Act '+ROMAN[x.act]}</td></tr>`).join('')}</table>`:'<p class="small">No runs yet. Go get lost.</p>';
 h+=`<h3>Endings found</h3>`;['ink','blank','folk','none','back'].forEach(k=>{h+=`<div class="tag" style="${M.endings[k]?'background:#f6e6be':''}">${M.endings[k]?esc(ENDINGS[k].t):'???'}</div>`});
 h+=`<h3>Recent runs</h3>`+(M.runs.length?`<table>${M.runs.slice(0,10).map(x=>`<tr><td>${new Date(x.date).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</td><td>${CL[x.cls]?CL[x.cls].name:''}</td><td>Lv ${x.lvl}, Act ${ROMAN[x.act]}</td><td>${x.won?'won':'lost'} · ${x.score}</td></tr>`).join('')}</table>`:'<p class="small">Nothing yet.</p>');
 h+=`<p class="small">Total kills ${M.stats.kills} · Lifetime ink ${M.inkTotal}</p>`;
 return h+`<button class="btn big" data-b="back" onclick="openOv(null)">Back</button></div>`}
// ===== INPUT =====
cv.addEventListener('pointerdown',ev=>{auInit();const r=S.run;if(!r||UI.title||UI.ov)return;const b=cv.getBoundingClientRect(),x=ev.clientX-b.left,y=ev.clientY-b.top;tapAt(x,y)});
function tapAt(x,y){const r=S.run;
 if(r.scr==='map'&&!busy()){for(const [a,b] of reachable(r)){const n=r.map.rows[a][b],p=nodeXY(n);if(Math.hypot(p.x-x,p.y-y)<(n.t==='boss'?38:30)){sfx('select');r.path=r.path||[];r.path.push([a,b]);goNode(r,a,b);UI.dhp=r.hp;if(r.combat)UI.lastCombat=r.combat;render();return true}}}
 else if(r.scr==='combat'){const L=layout();let best=-1,bd=1e9;r.combat.en.forEach((e,i)=>{if(e.hp<=0)return;const P=L.e[i];const d=Math.hypot(P.x-x,(P.y-P.s*.4)-y);if(d<Math.max(60,P.s*.7)&&d<bd){bd=d;best=i}});if(best>=0&&best!==r.combat.tgt){r.combat.tgt=best;sfx('select');render();return true}}
 return false}
function auMusic(){if(!AU.ctx)return;const r=S.run;let tr=0;if(!UI.title&&r&&r.combat)tr=r.combat.kind==='boss'?4:r.act;musSet(tr)}
document.addEventListener('visibilitychange',()=>{if(AU.ctx){if(document.hidden)AU.ctx.suspend();else if(!AU.muted)AU.ctx.resume()}save()});
