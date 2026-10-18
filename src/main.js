// ===== BOT (used by automated tests & balance sim) =====
function botSkill(r,br){const ks=SKIDS.filter(k=>SK[k].br===br&&canRank(r,k)).sort((a,b)=>SK[b].tier-SK[a].tier);
 let k=ks.find(k=>r.ranks[k]<3)||ks[0];if(!k){k=SKIDS.filter(k=>canRank(r,k)).sort((a,b)=>SK[b].tier-SK[a].tier)[0]}return k}
function botDecide(st){
 const r=S.run,M=S.meta;const B=b=>({b,fn:()=>botDo(b)});
 if(UI.title||!r){
  if(UI.ov==='cls'){if(UI.clsSel!==st.cls&&M.cls[st.cls])return B('cls-'+st.cls);return B('begin')}
  if(UI.ov==='table'){if(!M.cls[st.cls]&&M.ink>=CL[st.cls].cost)return B('unlock-'+st.cls);return B('back')}
  if(UI.ov)return B('back');
  if(!M.cls[st.cls]&&M.ink>=CL[st.cls].cost)return B('table');
  return B('new');
 }
 if(UI.ov==='menu')return B('resume');if(UI.ov==='gear')return B('close');
 if(UI.ov==='skills'){if(r.sp>0){const k=botSkill(r,st.br);if(k){if(UI.sel!==k)return B('sk-'+k);return B('rank')}}return B('close')}
 const s=stats(r);
 if(r.scr==='map'){if(r.sp>0&&botSkill(r,st.br))return B('skills');
  const hpR=r.hp/s.maxHp;let best=null,bs=-1;
  for(const [a,b] of reachable(r)){const n=r.map.rows[a][b];const t=n.t;let v={fight:3,elite:st.path==='fight'?(hpR>.65?5:0):(hpR>.85?2:0),event:st.path==='safe'?4.5:3,mystery:3,shop:r.gold>=90?4.5:1,rest:hpR<.5?7:1.5,treasure:5,boss:10}[t];v+=R()*1.5;if(v>bs){bs=v;best=n}}
  const p=nodeXY(best);return {x:p.x,y:p.y,fn:()=>{tapAt(p.x,p.y)}};
 }
 if(r.scr==='combat'){const c=r.combat,al=alive(c);if(!al.length)return {wait:1};
  const tg=al.slice().sort((a,b)=>a.hp-b.hp)[0],ti=c.en.indexOf(tg);
  if(c.tgt!==ti){const L=layout(),P=L.e[ti];return {x:P.x,y:P.y-P.s*.4,fn:()=>{c.tgt=ti}}}
  const inc=incoming(r)-c.block,hpR=r.hp/s.maxHp;
  const pi=n=>r.pots.indexOf(n);
  if(pi('tonic')>=0&&hpR<.35)return B('pot-'+pi('tonic'));
  if(pi('thunder')>=0&&(al.length>=2||c.kind!=='fight'))return B('pot-'+pi('thunder'));
  if(pi('tea')>=0&&c.kind!=='fight'&&c.turn<=2)return B('pot-'+pi('tea'));
  const can=k=>r.ranks[k]>0&&c.energy>=ACT[k].cost||(k==='strike'||k==='guard')&&c.energy>=1;
  if(can('w2')&&r.ranks.w2>0&&hpR<.5)return B('act-w2');
  if(c.bgT!==c.turn){c.bgT=c.turn;c.bg=0}
  if(can('guard')&&inc>0&&c.bg<2&&(inc>=r.hp*.35||r.hp<inc+12)){c.bg++;return B('act-guard')}
  if(can('c4')&&tg.st.weak===0&&incoming(r)>=10)return B('act-c4');
  if(can('b4'))return B('act-b4');
  if(can('b2')&&al.length>=2)return B('act-b2');
  const dmg=['strike','c2','w1'].filter(can).map(k=>({k,v:ACT[k].val(r,s)*(k==='w1'&&tg.b>0?1.4:1)+(k==='c2'&&tg.hp>25?3+r.ranks.c2:0)})).sort((a,b)=>b.v-a.v);
  if(dmg.length)return B('act-'+dmg[0].k);
  if(pi('fizz')>=0&&c.energy===0&&al.length)return B('pot-'+pi('fizz'));
  return B('end');
 }
 if(r.scr==='event'){if(r.ev.res)return B('cont');const e=EVS.find(x=>x.id===r.ev.id);let bi=0,bs=-99;
  e.ch.forEach((c,i)=>{if(!reqOk(r,c.req))return;const f=c.fx.toString();let v=1+R()*.6;if(/^Leave/.test(c.t))v=.2;
   if(st.fac&&(f.includes("swear(r,'"+st.fac+"')")||f.includes("rep(r,'"+st.fac+"'")))v+=4;if(st.fac&&/swear\(r,'(\w+)'/.test(f)&&!f.includes("'"+st.fac+"'"))v-=5;
   if(st.corners&&f.includes('corners++'))v+=5;if(!st.fac&&r.ev.id==='crossroads'&&i===3)v+=3;if(f.includes('hurt(')&&r.hp/s.maxHp<.4)v-=3;if(f.includes('pendingFight')&&r.hp/s.maxHp<.6)v-=3;if(f.includes('heal(r')&&r.hp/s.maxHp<.5)v+=2;if(f.includes('r.sp'))v+=1;
   if(v>bs){bs=v;bi=i}});return B('ch-'+bi)}
 if(r.scr==='shop'){const sh=r.shop;for(let i=0;i<sh.items.length;i++){const o=sh.items[i];if(sh.sold[i])continue;const p=price(r,o.p);if(r.gold<p)continue;
   if(o.k==='heal'&&r.hp/s.maxHp<.5)return B('buy-'+i);if(o.k==='item'&&power(o.it)>power(r.gear[o.it.slot])+6)return B('buy-'+i);
   if(o.k==='tutor'&&r.gold-p>=20)return B('buy-'+i);if(o.k==='pot'&&r.pots.length<2)return B('buy-'+i)}return B('leave')}
 if(r.scr==='rest')return B(r.hp/s.maxHp<.6?'nap':(R()<.3?'sharpen':'practice'));
 if(r.scr==='restdone')return B('cont');
 if(r.scr==='loot'){const L=r.loot;for(let i=0;i<L.items.length;i++)if(!L.done[i])return B(power(L.items[i])>power(r.gear[L.items[i].slot])?'equip-'+i:'sell-'+i);return B('cont')}
 if(r.scr==='end')return B('title');
 return {wait:1};
}
function botDo(b){const r=S.run,[k,a]=b.split(/-(.+)/);
 switch(k){case 'cls':UI.clsSel=a;break;case 'begin':beginRun();break;case 'unlock':buyMeta('cls',a);break;case 'back':case 'resume':case 'close':UI.ov=null;break;
  case 'table':UI.ov='table';break;case 'new':UI.ov='cls';break;case 'sk':UI.sel=a;break;case 'rank':rankUp(r,UI.sel);break;case 'skills':UI.ov='skills';break;
  case 'pot':usePot(r,+a);break;case 'act':useAct(r,a);break;case 'end':endTurn(r);break;
  case 'cont':if(r.scr==='event')evContinue(r);else if(r.scr==='loot')lootContinue(r);else r.scr='map';break;
  case 'ch':chooseEv(r,+a);break;case 'buy':shopBuy(r,+a);break;case 'leave':r.scr='map';r.shop=null;break;
  case 'nap':case 'practice':case 'sharpen':restDo(r,k);break;case 'equip':lootTake(r,+a,'equip');break;case 'sell':lootTake(r,+a,'sell');break;
  case 'title':S.run=null;UI.title=true;break}}
// headless balance sim: runs the same bot through pure logic, no saving, no FX
function sim(n,st){const bk={m:JSON.stringify(S.meta),r:JSON.stringify(S.run),t:UI.title,ov:UI.ov,fx:FX,spd:SPD,sv:save};
 const out=[];FX={float(){},flash(){},shake(){},hp(){},lunge(){},sound(){},busy(){}};save=()=>{};const rd=render;render=()=>{};SPD=0;
 try{for(let i=0;i<n;i++){S.run=newRun(st.cls||'surveyor',st.heat||0);S.run.path=[];UI.title=false;UI.ov=null;let k=0;
  let lastC=null;while(S.run.scr!=='end'&&k++<6000){if(S.run.combat)lastC=S.run.combat;const d=botDecide(st);if(d.wait)break;if(k>5995&&S.run.combat){const c=S.run.combat;const e0=c.energy;d.fn();console.log('STUCK-DBG',d.b,e0,'->',c.energy,S.run.combat===c,c.tgt,JSON.stringify(c.en.map(e=>e.hp)),S.run.scr,c.won)}else d.fn()}
  if(k>=6000)console.log('STUCK',S.run.scr,JSON.stringify(botDecide(st)),S.run.combat&&JSON.stringify(S.run.combat.en.map(e=>[e.n,e.hp,e.it])),S.run.combat&&S.run.combat.energy);
  out.push({won:S.run.result&&S.run.result.won,act:S.run.act,lvl:S.run.lvl,end:S.run.result&&S.run.result.ending,score:S.run.result&&S.run.result.score,turns:S.run.turns,nodes:S.run.nodes,steps:k,killer:S.run.result&&!S.run.result.won&&lastC?lastC.kind+':'+lastC.en.map(e=>e.id).join('+'):''})}}
 finally{S.meta=JSON.parse(bk.m);S.run=JSON.parse(bk.r);UI.title=bk.t;UI.ov=bk.ov;FX=bk.fx;SPD=bk.spd;save=bk.sv;render=rd;render()}
 return out}
window.PR={S,BAL,botDo,UI,botDecide,sim,stats,layout,nodeXY,tapAt,setSpeed:v=>SPD=v,busy,get run(){return S.run},actLabel};
// ===== BOOT =====
loadAll();AU.muted=!!S.meta.mute;
document.addEventListener('touchend',()=>auInit(),{passive:true});document.addEventListener('click',()=>auInit());
document.fonts&&document.fonts.ready.then(()=>render());
render();requestAnimationFrame(loop);
