// ===== CORE =====
const R=Math.random,ri=(a,b)=>a+Math.floor(R()*(b-a+1)),pick=a=>a[Math.floor(R()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const $=s=>document.querySelector(s);
const KEY_META='unmapped.meta.v1',KEY_RUN='unmapped.run.v1';
let SPD=1;// animation speed factor (tests lower it)
const S={meta:null,run:null};
function defMeta(){return {ink:0,inkTotal:0,cls:{surveyor:1},perks:{hp:0,gold:0,sp:0,pot:0,luck:0},heatMax:0,runs:[],endings:{},mute:false,stats:{runs:0,wins:0,kills:0,best:0},seenIntro:0}}
function loadAll(){
 try{const m=JSON.parse(localStorage.getItem(KEY_META)||'null');S.meta=Object.assign(defMeta(),m||{});S.meta.perks=Object.assign(defMeta().perks,S.meta.perks||{});S.meta.stats=Object.assign(defMeta().stats,S.meta.stats||{})}catch(e){S.meta=defMeta()}
 try{S.run=JSON.parse(localStorage.getItem(KEY_RUN)||'null')}catch(e){S.run=null}
 if(S.run&&(!S.run.v||!S.run.map))S.run=null;
}
function save(){try{localStorage.setItem(KEY_META,JSON.stringify(S.meta));if(S.run)localStorage.setItem(KEY_RUN,JSON.stringify(S.run));else localStorage.removeItem(KEY_RUN)}catch(e){}}

// ===== RUN =====
function newRun(cls,heat){
 const c=CL[cls],P=S.meta.perks;
 const r={v:1,cls,heat:heat||0,act:1,lvl:1,xp:0,sp:c.sp+P.sp,ranks:{},gold:c.gold+25*P.gold,bonusHp:6*P.hp,bonusAtk:0,
  gear:{weapon:{slot:'weapon',name:'Stick of Reasonable Length',rar:0,atk:1,val:5,q:'It is a stick. Of reasonable length.'},armor:{slot:'armor',name:'Raincoat',rar:0,def:1,hp:0,val:5,q:'Mostly for rain.'},trinket:null},
  pots:[],rep:{ink:0,blank:0,folk:0},sworn:null,flags:{},corners:0,seenEv:[],pendingLv:0,pendingFight:null,
  kills:0,elites:0,bosses:0,nodes:0,turns:0,tutor:0,t0:Date.now(),play:0,scr:'map',pos:null,combat:null,ev:null,shop:null,loot:null,log:[]};
 SKIDS.forEach(k=>r.ranks[k]=0);
 if(c.start==='random'){const ks=SKIDS.slice().sort(()=>R()-.5).slice(0,2);ks.forEach(k=>r.ranks[k]=1);r.gear.trinket=mkItem(1,1,'trinket')}else Object.assign(r.ranks,c.start);
 for(let i=0;i<P.pot;i++)r.pots.push('tonic');
 r.map=genMap(1);r.hp=stats(r).maxHp;
 return r;
}
function bp(r,b){let s=0;for(const k of SKIDS)if(SK[k].br===b)s+=r.ranks[k];return s}
function gearArr(r){return [r.gear.weapon,r.gear.armor,r.gear.trinket].filter(Boolean)}
function gsum(r,f){let s=0;for(const g of gearArr(r))s+=g[f]||0;return s}
function stats(r){
 const c=CL[r.cls],K=r.ranks;
 const s={maxHp:c.hp+(r.lvl-1)*4+5*K.b1+(r.bonusHp||0)+gsum(r,'hp'),atk:c.atk+Math.floor((r.lvl-1)/2)+(r.bonusAtk||0)+gsum(r,'atk'),
  def:c.def+Math.floor((r.lvl-1)/3)+gsum(r,'def'),crit:c.crit+5*K.c1+gsum(r,'crit'),dodge:Math.min(60,6*K.c3+gsum(r,'dodge')),
  en:3+(K.c3>=5?1:0)+gsum(r,'en'),critX:1.5+.1*K.c1,goldX:1+.1*K.c1,sk:gsum(r,'sk'),post:gsum(r,'post'),shop:Math.min(50,gsum(r,'shop')),gp:gsum(r,'gp'),
  str:gsum(r,'str'),sb:gsum(r,'sb'),thorn:gsum(r,'thorn'),mis:7*K.w3,echo:10*K.w4};
 s.maxHp=Math.max(10,s.maxHp);s.strike=s.atk+2*K.b1;s.guard=s.def+K.b3;s.hide=2*K.b3;
 return s;
}
function fixHp(r){r.hp=Math.min(r.hp,stats(r).maxHp);if(r.hp<1)r.hp=1}
function need(l){return 18+14*(l-1)}
function gainXP(r,n){r.xp+=n;let up=0;while(r.xp>=need(r.lvl)){r.xp-=need(r.lvl);r.lvl++;r.sp++;r.pendingLv++;up++;r.hp+=4+8}fixHp(r);return up}
function gain(r,k,n){r[k]=Math.max(0,r[k]+n);if(k==='gold'&&n>0)sfx('coin')}
function heal(r,n){const m=stats(r).maxHp;const b=r.hp;r.hp=Math.min(m,r.hp+n);return r.hp-b}
function hurt(r,n){r.hp=Math.max(1,r.hp-n)}
function rep(r,f,n){if(r.sworn&&f!==r.sworn&&n>0)return;r.rep[f]+=n}
function swear(r,f){r.sworn=f;r.rep[f]+=3}
function hasTrk(r,n){return r.gear.trinket&&r.gear.trinket.name.indexOf(n)>=0}
function givePot(r,p){if(r.pots.length<3){r.pots.push(p);return true}gain(r,'gold',10);return false}
function giveItem(r,it){r.loot={gold:0,xp:0,items:[it],pots:[],from:'event',done:{}};r.afterLoot='map'}
function power(it){if(!it)return 0;return (it.atk||0)*3+(it.def||0)*2.2+(it.hp||0)*.5+(it.crit||0)*.5+(it.dodge||0)*.6+(it.en||0)*16+(it.post||0)*.8+(it.sk||0)*2+(it.str||0)*5+(it.sb||0)*.7+(it.thorn||0)*1.6+(it.gp||0)*.3+(it.shop||0)*.2}
function mkItem(act,rar,slot,name){
 const lb=.06*(S.meta?S.meta.perks.luck:0);
 if(rar==null){const x=R();rar=x<.07+lb?2:x<.33+lb?1:0}
 slot=slot||pick(['weapon','armor','trinket']);let it={slot,rar};
 if(name&&slot==='trinket'){const t=TRK.find(t=>t.n===name);if(t)return mkTrk(act,rar,t)}
 if(slot==='weapon'){it.atk=act+rar+ri(0,1);if(rar>=1&&R()<.6)it.crit=3*rar+ri(0,2);if(rar>=2)it.sk=2+ri(0,2);it.name=name||((rar?pick(PRE[rar])+' ':'')+pick(WEAP));it.q=pick(['Pointy end goes toward the problem.','Has a little dent where someone tried.','Comes with no instructions.','Reviews: 4 stars.','Smells faintly of pencil shavings.'])}
 else if(slot==='armor'){it.def=act+rar+ri(0,1);it.hp=4*act+5*rar+ri(0,4);if(rar>=2)it.dodge=4;it.name=name||((rar?pick(PRE[rar])+' ':'')+pick(ARM));it.q=pick(['Fits like a suggestion.','Machine washable, unfortunately.','Someone drew pockets on it.','Rated for minor-to-moderate peril.'])}
 else{let pool=TRK.filter(t=>!t.epic||rar>=2);return mkTrk(act,rar,pick(pool))}
 it.val=(8+act*6)*(1+rar);return it;
}
function mkTrk(act,rar,t){const it={slot:'trinket',rar,name:(rar&&!t.epic?pick(PRE[rar])+' ':'')+t.n,q:t.q};
 const m={crit:2,dodge:2,post:2,sk:2,shop:5,gp:3,sb:3,thorn:2};for(const k in t){if(['n','q','epic'].includes(k))continue;it[k]=t[k]+(m[k]?m[k]*(rar+act-1):0)}
 if(t.str&&rar>=2)it.str=2;it.val=(8+act*6)*(1+rar);return it}
function itemStats(it){if(!it)return 'empty';const o=[];
 if(it.atk)o.push('+'+it.atk+' ATK');if(it.def)o.push('+'+it.def+' DEF');if(it.hp)o.push('+'+it.hp+' HP');if(it.crit)o.push('+'+it.crit+'% crit');if(it.dodge)o.push('+'+it.dodge+'% dodge');
 if(it.en)o.push('+'+it.en+' Energy');if(it.post)o.push('heal '+it.post+' after fights');if(it.sk)o.push('skills +'+it.sk+' dmg');if(it.shop)o.push(it.shop+'% off shops');if(it.gp)o.push('+'+it.gp+' gold/fight');
 if(it.str)o.push('start fights +'+it.str+' Str');if(it.sb)o.push('start fights '+it.sb+' Block');if(it.thorn)o.push('zap '+it.thorn+' when hit');return o.join(', ')}

// ===== MAP =====
function genMap(act){
 const rows=[];
 for(let r=0;r<7;r++){
  const n=r===0?3:ri(2,4);const cols=[0,1,2,3].sort(()=>R()-.5).slice(0,n).sort();
  rows.push(cols.map(c=>{let t;
   if(r===0)t='fight';else if(r===6)t='rest';else if(r===3&&R()<.45)t='treasure';
   else{const x=R()*100;t=x<40?'fight':x<62?'event':x<76?'mystery':x<87?(r>=2?'elite':'fight'):x<96?'shop':(r>=2&&r!==5?'rest':'event')}
   return {r,c,x:(c+.5)/4+(R()-.5)*.07,y:(R()-.5)*.25,t,l:[],done:0}}));
 }
 if(!rows.slice(1,6).some(row=>row.some(n=>n.t==='shop'))){const row=rows[ri(2,4)];pick(row).t='shop'}
 for(let r=0;r<6;r++){const A=rows[r],B=rows[r+1];
  A.forEach(a=>{let t=B.map((b,i)=>({i,d:Math.abs(b.c-a.c)})).filter(o=>o.d<=1).sort((p,q)=>p.d-q.d).slice(0,2);if(!t.length)t=[B.map((b,i)=>({i,d:Math.abs(b.c-a.c)})).sort((p,q)=>p.d-q.d)[0]];a.l=t.map(o=>o.i)});
  B.forEach((b,i)=>{if(!A.some(a=>a.l.includes(i))){const a=A.slice().sort((p,q)=>Math.abs(p.c-b.c)-Math.abs(q.c-b.c))[0];a.l.push(i)}});
 }
 rows[6].forEach(n=>n.l=[0]);rows.push([{r:7,c:1.5,x:.5,y:0,t:'boss',l:[],done:0}]);
 return {act,rows};
}
function reachable(r){const M=r.map.rows;if(!r.pos)return M[0].map((n,i)=>[0,i]);const n=M[r.pos[0]][r.pos[1]];if(r.pos[0]>=7)return [];return n.l.map(i=>[r.pos[0]+1,i])}
function goNode(r,ri_,ci){
 const n=r.map.rows[ri_][ci];r.pos=[ri_,ci];n.done=1;r.nodes++;
 let t=n.t;if(t==='mystery'){const x=R();t=x<.5?'event':x<.72?'fight':x<.84?'treasure':x<.94?'shop':'elite';n.rv=t}
 enter(r,t,ri_);
}
function enter(r,t,row){
 if(t==='fight'||t==='elite'||t==='boss')startCombat(r,t,row);
 else if(t==='event')startEvent(r);
 else if(t==='shop')startShop(r);
 else if(t==='rest'){r.scr='rest'}
 else if(t==='treasure'){r.loot={gold:Math.round((25+r.act*20)*stats(r).goldX),xp:0,items:[mkItem(r.act,R()<.25?2:1)],pots:[],from:'treasure',done:{}};if(R()<.35){r.corners++;r.loot.corner=1}gain(r,'gold',r.loot.gold);r.afterLoot='map';r.scr='loot'}
}

// ===== EVENTS =====
function startEvent(r){
 let pool=EVS.filter(e=>e.acts.includes(r.act)&&!r.seenEv.includes(e.id)&&(!e.cond||e.cond(r)));
 if(!pool.length)pool=EVS.filter(e=>e.acts.includes(r.act)&&(!e.cond||e.cond(r)));
 const e=pick(pool);r.seenEv.push(e.id);r.ev={id:e.id,res:null};r.scr='event';
}
function evText(e){if(e.id==='ghost'){const p=S.meta.runs[0];return 'A faint figure waves at you. It is '+(CL[p.cls]||CL.surveyor).name+' from your last run'+(p.won?', who actually won, and is insufferable about it.':', who got as far as Act '+p.act+' before '+(p.ending==='dead'?'getting erased.':'wandering off.')+' They look fine. Translucent, but fine.')}return e.text}
function reqOk(r,q){if(!q)return true;for(const k in q){if(k==='g'){if(r.gold<q.g)return false}else if(bp(r,k)<q[k])return false}return true}
function reqLabel(q){if(!q)return '';const o=[];for(const k in q){if(k==='g')continue;o.push(BR[k].name+' '+q[k])}return o.length?'['+o.join(', ')+'] ':''}
function chooseEv(r,i){const e=EVS.find(x=>x.id===r.ev.id),c=e.ch[i];if(!reqOk(r,c.req)||r.ev.res)return;
 r.loot=null;const res=c.fx(r);r.ev.res=res;r.ev.pick=i;fixHp(r);sfx('select');}
function evContinue(r){
 if(r.pendingFight){const f=r.pendingFight;r.pendingFight=null;startCombat(r,'elite',4,[f]);return}
 if(r.loot&&r.loot.from==='event'){r.scr='loot';return}
 r.scr='map';r.ev=null;
}

// ===== SHOP / REST =====
function price(r,base){return Math.max(1,Math.round(base*(1-stats(r).shop/100)))}
function startShop(r){
 const items=[];for(let i=0;i<3;i++){const it=mkItem(r.act,R()<.12?2:R()<.45?1:0);items.push({k:'item',it,p:[40,75,140][it.rar]+r.act*[15,25,35][it.rar]})}
 const ps=Object.keys(POT).sort(()=>R()-.5).slice(0,2);ps.forEach(p=>items.push({k:'pot',p:22+r.act*4,pot:p}));
 items.push({k:'tutor',p:70+40*r.tutor+r.act*10});items.push({k:'heal',p:30+r.act*10});
 r.shop={items,sold:{}};r.scr='shop';
}
function shopBuy(r,i){const o=r.shop.items[i];if(r.shop.sold[i])return;const p=price(r,o.p);if(r.gold<p)return;
 if(o.k==='pot'&&r.pots.length>=3)return;
 r.gold-=p;sfx('coin');
 if(o.k==='item'){const old=r.gear[o.it.slot];if(old)r.gold+=Math.floor(old.val/2);r.gear[o.it.slot]=o.it;fixHp(r);r.shop.sold[i]=1}
 else if(o.k==='pot'){r.pots.push(o.pot);r.shop.sold[i]=1}
 else if(o.k==='tutor'){r.sp++;r.tutor++;o.p=70+40*r.tutor+r.act*10}
 else if(o.k==='heal'){heal(r,Math.round(stats(r).maxHp*.3));r.shop.sold[i]=1;sfx('heal')}
}
function restDo(r,k){
 if(k==='nap'){heal(r,Math.round(stats(r).maxHp*.35));sfx('heal');r.restRes='You nap under a tree that is mostly a sketch of a tree. You feel restored.'}
 else if(k==='practice'){r.sp++;sfx('rank');r.restRes='You practice until it stops being embarrassing. +1 skill point.'}
 else if(k==='sharpen'){r.gear.weapon.atk+=2;r.gear.weapon.name=r.gear.weapon.name.replace(/^(Sharpened )?/,'Sharpened ');sfx('block');r.restRes='You sharpen your '+r.gear.weapon.name.replace('Sharpened ','')+'. +2 ATK.'}
 r.scr='restdone';
}

// ===== COMBAT =====
const BAL={hn:2.1,he:1.8,hb:1.3,dk:1.4};
function hpMul(r,row){return (1+.05*r.heat)*(1+.035*(row||0))}
function dmgMul(r){return BAL.dk*(1+.04*r.heat)}
function mkEnemy(r,id,row,boss){const b=EN[id];let hp=Math.round(b.hp*hpMul(r,row)*(boss?BAL.hb:b.elite?BAL.he:BAL.hn*(.9+R()*.2)));
 if(id==='goose'&&r.flags.goosePaid)hp=Math.round(hp*.8);
 return {id,n:b.n,hp,max:hp,b:0,st:{weak:0,vuln:0,bleed:0,stun:0,str:0},pi:b.rnd?ri(0,b.pat.length-1):0,it:null,dhp:hp,fl:0,lunge:0}}
function bossFor(r){if(r.act===1)return 'goose';if(r.act===2)return 'assessor';const f=topFac(r);return f==='ink'?'blank':f==='blank'?'prime':f==='folk'?'ruler':'lastedit'}
function topFac(r){if(r.sworn)return r.sworn;let best=null,v=2;for(const f of ['ink','blank','folk'])if(r.rep[f]>=3&&r.rep[f]>v){v=r.rep[f];best=f}return best}
function startCombat(r,kind,row,ids){
 if(!ids){
  if(kind==='boss')ids=[bossFor(r)];
  else if(kind==='elite'){const e=pick(POOL[r.act].e);ids=e==='committee'?['member','member','member']:[e]}
  else{const P=POOL[r.act].n;let n=r.act===1?(row<=1?1:(R()<.55?2:1)):r.act===2?(row===0?1:2):(row===0?2:(R()<.3?3:2));ids=[];for(let i=0;i<n;i++)ids.push(pick(P))}
 }
 const en=ids.map(id=>mkEnemy(r,id,row,kind==='boss'));
 const s=stats(r);
 r.combat={kind,en,energy:s.en,block:0,pst:{weak:0,vuln:0,str:s.str},turn:0,tgt:0,log:kind==='boss'?EN[ids[0]].n+' blocks the way.':pick(['Something wants a word.','Ink on the move.','A fight! How unfortunate. For them.','Here we go.']),xp:0,used:0};
 en.forEach(e=>nextIntent(r,e));
 r.scr='combat';
 playerTurn(r,true);
 if(s.sb){r.combat.block+=s.sb}
}
function nextIntent(r,e){const b=EN[e.id];const p=b.pat[e.pi%b.pat.length];e.it=Object.assign({},p);if(b.rnd)e.pi=ri(0,b.pat.length-1);else e.pi++}
function alive(c){return c.en.filter(e=>e.hp>0)}
function playerTurn(r,first){const c=r.combat,s=stats(r);c.turn++;r.turns++;c.energy=s.en;c.block=s.hide;c.echoed=0;if(!first)c.log='Your turn.';
 if(c.tgt==null||!c.en[c.tgt]||c.en[c.tgt].hp<=0)c.tgt=c.en.findIndex(e=>e.hp>0)}
function predicted(r,e){// dmg per hit shown to player
 if(!e.it||e.it.a==null)return 0;let d=e.it.a*dmgMul(r)+e.st.str;if(e.st.weak>0)d*=.75;if(r.combat.pst.vuln>0)d*=1.5;return Math.max(0,Math.floor(d))}
function incoming(r){let t=0;for(const e of alive(r.combat)){if(e.st.stun>0)continue;t+=predicted(r,e)*(e.it.x||1)}return t}
const ACT={
 strike:{n:'Strike',cost:1,col:'',val:(r,s)=>s.strike,d:'Hit one enemy.'},
 guard:{n:'Guard',cost:1,col:'blue',val:(r,s)=>s.guard,d:'Gain Block.'},
 b2:{n:'Cleave',cost:2,col:'red',val:(r,s)=>5+3*r.ranks.b2+Math.floor(s.atk/2)+s.sk},
 b4:{n:'Haymaker',cost:3,col:'red',val:(r,s)=>14+6*r.ranks.b4+s.atk+s.sk},
 c2:{n:'Shiv',cost:1,col:'green',val:(r,s)=>3+2*r.ranks.c2+Math.floor(s.atk/3)+s.sk},
 c4:{n:'Rumor',cost:1,col:'green',val:()=>0},
 w1:{n:'Ink Bolt',cost:1,col:'purple',val:(r,s)=>4+3*r.ranks.w1+r.lvl+s.sk},
 w2:{n:'Redraw',cost:2,col:'purple',val:(r,s)=>5+3*r.ranks.w2+Math.floor(r.lvl/2)},
};
function actions(r){const a=['strike','guard'];for(const k of ['b2','b4','c2','c4','w1','w2'])if(r.ranks[k]>0)a.push(k);return a}
function actLabel(r,k){const s=stats(r),v=ACT[k].val(r,s),c=r.combat;
 const out=x=>{let d=x+c.pst.str;if(c.pst.weak>0)d*=.75;return Math.floor(d)};
 if(k==='strike')return out(v)+' dmg';if(k==='guard')return v+' Block';if(k==='b2')return out(v)+' to all';if(k==='b4')return out(v)+(r.ranks.b4>=3?' + stun':' dmg');
 if(k==='c2')return out(v)+' +'+(1+r.ranks.c2)+' bleed';if(k==='c4')return 'Weak '+(1+Math.ceil(r.ranks.c4/2))+(r.ranks.c4>=4?' all':'');if(k==='w1')return out(v)+' pierce';if(k==='w2')return 'heal '+v;return ''}
// FX hooks (no-ops in sim)
let FX={float(){},flash(){},shake(){},hp(){},lunge(){}};
function dealE(r,e,base,o){o=o||{};const c=r.combat,s=stats(r);const i=c.en.indexOf(e);
 let d=base+(o.nostr?0:c.pst.str);if(c.pst.weak>0&&!o.nostr)d*=.75;let crit=false;if(!o.nocrit&&R()*100<s.crit){crit=true;d*=s.critX}
 if(e.st.vuln>0)d*=1.5;d=Math.max(0,Math.floor(d));let bl=0;if(!o.pierce){bl=Math.min(e.b,d);e.b-=bl;d-=bl}
 e.hp-=d;const dl=o.delay||0;
 FX.float('e'+i,crit?d+'!':(d>0?''+d:(bl?'blocked':'0')),crit?COL.gold:'#fff',crit?40:30,dl,crit?'CRIT':'');if(bl&&d>0)FX.float('e'+i,'-'+bl+' block',COL.blue,16,dl+.08);
 FX.flash('e'+i,dl);FX.hp('e'+i,Math.max(0,e.hp),dl);FX.shake(crit?9:d>=15?6:3,dl);FX.sound(crit?'crit':'hit',dl);
 if(e.hp<=0){e.hp=0;r.kills++;S.meta.stats.kills++;FX.sound('kill',dl+.1);FX.float('e'+i,pick(['erased','smudged','scribbled out','gone','unwritten']),COL.ink,18,dl+.25)}
 return d}
function useAct(r,k,free){
 const c=r.combat;if(!c||r.scr!=='combat')return false;const A=ACT[k];if(!A)return false;
 if(!free&&c.energy<A.cost)return false;const s=stats(r),v=A.val(r,s);
 let t=c.en[c.tgt];if(!t||t.hp<=0){c.tgt=c.en.findIndex(e=>e.hp>0);t=c.en[c.tgt]}if(!t)return false;
 if(!free)c.energy-=A.cost;const dl=free?.35*SPD:0;
 if(k==='strike'){dealE(r,t,v,{delay:dl});c.log='You strike '+t.n+'.';FX.lunge('p',dl)}
 else if(k==='guard'){c.block+=v;FX.float('p','+'+v+' block',COL.blue,24,dl);FX.sound('block',dl);c.log='You brace.'}
 else if(k==='b2'){alive(c).forEach((e,j)=>dealE(r,e,v,{delay:dl+j*.08*SPD}));c.log='Cleave! Everybody gets some.';FX.lunge('p',dl)}
 else if(k==='b4'){dealE(r,t,v,{delay:dl});if(r.ranks.b4>=3&&t.hp>0){t.st.stun=1;FX.float('e'+c.en.indexOf(t),'STUNNED',COL.gold,20,dl+.2)}c.log='HAYMAKER.';FX.lunge('p',dl);FX.shake(12,dl)}
 else if(k==='c2'){dealE(r,t,v,{delay:dl});if(t.hp>0){t.st.bleed+=1+r.ranks.c2;FX.float('e'+c.en.indexOf(t),'+'+(1+r.ranks.c2)+' bleed',COL.red,18,dl+.15)}c.log='Shiv. Rude, but effective.';FX.lunge('p',dl)}
 else if(k==='c4'){const tg=r.ranks.c4>=4?alive(c):[t];tg.forEach(e=>{e.st.weak+=1+Math.ceil(r.ranks.c4/2);e.st.vuln+=Math.ceil(r.ranks.c4/2);FX.float('e'+c.en.indexOf(e),'WEAK + VULN',COL.green,18,dl)});FX.sound('debuff',dl);c.log=pick(['You tell everyone '+t.n+' cheats at cards.','You start a rumor. It spreads fast.','"I heard '+t.n+' cries at commercials."'])}
 else if(k==='w1'){dealE(r,t,v,{pierce:1,delay:dl});FX.sound('ink',dl);c.log='Ink Bolt. Straight through.'}
 else if(k==='w2'){const h=heal(r,v);if(r.ranks.w2>=3){c.pst.weak=0;c.pst.vuln=0}FX.float('p','+'+h,COL.green,28,dl);FX.sound('heal',dl);FX.hp('p',r.hp,dl);c.log='You redraw yourself, a bit better.'}
 if(k!=='strike'&&k!=='guard'&&!free&&s.echo&&R()*100<s.echo){FX.float('p','ECHO!',COL.purple,22,.2*SPD);useAct(r,k,true);c.log+=' ...and again.'}
 checkEnd(r);return true;
}
function usePot(r,i){const c=r.combat,p=r.pots[i];if(!c||!p||r.scr!=='combat')return;r.pots.splice(i,1);
 if(p==='tonic'){const h=heal(r,20);FX.float('p','+'+h,COL.green,28,0);FX.hp('p',r.hp,0);FX.sound('heal',0)}
 else if(p==='fizz'){c.energy+=2;FX.float('p','+2 energy',COL.purple,22,0);FX.sound('ink',0)}
 else if(p==='thunder'){alive(c).forEach((e,j)=>dealE(r,e,12,{nostr:1,nocrit:1,delay:j*.08*SPD}));FX.shake(10,0)}
 else if(p==='tea'){c.pst.str+=3;FX.float('p','+3 STR',COL.green,24,0);FX.sound('rank',0)}
 c.log=POT[p].n+'!';checkEnd(r)}
function checkEnd(r){const c=r.combat;if(!c)return;if(alive(c).length===0){c.won=1;winCombat(r)}}
function endTurn(r){
 const c=r.combat;if(!c||r.scr!=='combat'||c.won)return;const s=stats(r);let d=.25*SPD;const step=.42*SPD;
 c.log='';
 for(const e of c.en){if(e.hp<=0)continue;const i=c.en.indexOf(e);const ix='e'+i;
  if(e.st.bleed>0){e.hp-=e.st.bleed;FX.float(ix,'-'+e.st.bleed+' bleed',COL.red,22,d);FX.hp(ix,Math.max(0,e.hp),d);FX.flash(ix,d);e.st.bleed--;if(e.hp<=0){e.hp=0;r.kills++;FX.sound('kill',d);d+=step;continue}d+=step*.5}
  e.b=0;
  if(e.st.stun>0){e.st.stun--;FX.float(ix,'stunned',COL.gold,20,d);d+=step*.6;nextIntent(r,e);continue}
  const it=e.it;FX.lunge(ix,d);
  if(it.b){e.b+=Math.round(it.b*dmgMul(r));FX.float(ix,'+'+Math.round(it.b*dmgMul(r))+' block',COL.blue,20,d);FX.sound('block',d)}
  if(it.str){e.st.str+=it.str;FX.float(ix,'+'+it.str+' STR',COL.red,20,d+.05)}
  if(it.heal){const tg=it.all?alive(c):[e];tg.forEach(x=>{x.hp=Math.min(x.max,x.hp+it.heal);FX.hp('e'+c.en.indexOf(x),x.hp,d);FX.float('e'+c.en.indexOf(x),'+'+it.heal,COL.green,22,d)})}
  if(it.weak){c.pst.weak+=it.weak+1;FX.float('p','WEAK',COL.purple,20,d);FX.sound('debuff',d)}
  if(it.vuln){c.pst.vuln+=it.vuln+1;FX.float('p','VULNERABLE',COL.purple,20,d+.05);FX.sound('debuff',d)}
  if(it.strip&&c.block>0){FX.float('p','block erased',COL.pink,18,d);c.block=0}
  if(it.steal){const g=Math.min(r.gold,it.steal);r.gold-=g;if(g)FX.float('p','-'+g+' gold',COL.gold,20,d+.1);e.stolen=(e.stolen||0)+g}
  if(it.a!=null){const hits=it.x||1;const mis=s.mis&&R()*100<s.mis;
   for(let h=0;h<hits;h++){const dd=d+h*.16*SPD;let dm=predicted(r,e);
    if(mis){e.hp-=dm;FX.float(ix,'MISPRINT -'+dm,COL.purple,22,dd);FX.hp(ix,Math.max(0,e.hp),dd);FX.flash(ix,dd);FX.sound('ink',dd);if(e.hp<=0){e.hp=0;r.kills++;FX.sound('kill',dd);break}continue}
    if(R()*100<s.dodge){FX.float('p','dodge',COL.green,22,dd);FX.sound('dodge',dd);continue}
    const bl=Math.min(c.block,dm);c.block-=bl;dm-=bl;r.hp-=dm;
    FX.float('p',dm>0?'-'+dm:'blocked',dm>0?COL.red:COL.blue,dm>=12?36:28,dd);FX.hp('p',Math.max(0,r.hp),dd);FX.flash('p',dd);FX.shake(dm>=12?10:dm>0?5:2,dd,dm>=12);FX.sound(dm>0?'hurt':'block',dd);
    if(s.thorn&&e.hp>0){e.hp-=s.thorn;FX.float(ix,'zap '+s.thorn,COL.gold,18,dd+.1);FX.hp(ix,Math.max(0,e.hp),dd+.1);if(e.hp<=0){e.hp=0;r.kills++}}
    if(r.hp<=0)break}
  }
  d+=step;nextIntent(r,e);
  if(r.hp<=0)break;
 }
 FX.busy(d+.15*SPD);
 if(r.hp<=0){r.hp=0;c.lost=1;FX.sound('die',d);FX.busy(d+1.2*SPD);endRun(r,false);return}
 // end of round decrements
 for(const e of c.en){if(e.st.weak>0)e.st.weak--;if(e.st.vuln>0)e.st.vuln--}
 if(c.pst.weak>0)c.pst.weak--;if(c.pst.vuln>0)c.pst.vuln--;
 if(alive(c).length===0){c.won=1;winCombat(r);return}
 playerTurn(r);FX.sound('turn',d);
}
function winCombat(r){
 const c=r.combat,s=stats(r);let xp=0;c.en.forEach(e=>xp+=EN[e.id].xp);xp=Math.round(xp*(1+.05*r.heat));
 const stolen=c.en.reduce((a,e)=>a+(e.stolen||0),0);
 let gold=c.kind==='boss'?70+r.act*35:c.kind==='elite'?30+r.act*15:ri(10,16)+r.act*6;gold=Math.round(gold*s.goldX)+s.gp+stolen;
 const items=[],pots=[];
 if(c.kind==='boss')items.push(mkItem(r.act,R()<.5?2:1));else if(c.kind==='elite')items.push(mkItem(r.act,R()<.3?2:1));else if(R()<.38)items.push(mkItem(r.act));
 if(R()<(c.kind==='fight'?.28:.55)){const p=pick(Object.keys(POT));pots.push(p)}
 if(c.kind==='elite'){r.elites++;if(R()<.2){r.corners++;c.corner=1}}if(c.kind==='boss')r.bosses++;
 r.gold+=gold;pots.forEach(p=>givePot(r,p));
 if(s.post)heal(r,s.post);
 gainXP(r,xp);
 r.loot={gold,xp,items,pots,from:c.kind,done:{},corner:c.corner};r.afterLoot=c.kind==='boss'?'act':'map';
 r.combat=null;r.scr='loot';FX.busy(.75*SPD);
 FX.sound(c.kind==='boss'?'victory':'coin',.3*SPD);
}
function lootTake(r,i,mode){const it=r.loot.items[i];if(!it||r.loot.done[i])return;
 if(mode==='equip'){const old=r.gear[it.slot];if(old)r.gold+=Math.floor(old.val/2);r.gear[it.slot]=it;fixHp(r);sfx('block')}else{r.gold+=it.val;sfx('coin')}
 r.loot.done[i]=mode}
function lootContinue(r){
 r.loot.items.forEach((it,i)=>{if(!r.loot.done[i])lootTake(r,i,'sell')});
 const nx=r.afterLoot;r.loot=null;r.ev=null;
 if(nx==='act'){if(r.act>=3){endRun(r,true);return}r.act++;r.map=genMap(r.act);r.pos=null;r.path=[];heal(r,Math.round(stats(r).maxHp*.4));r.scr='map';r.newAct=1;if(r.act===2){r.ev={id:'crossroads',res:null};r.scr='event'}}
 else r.scr='map';
}

// ===== END / META =====
function calcScore(r,won){let s=r.nodes*10+r.kills*5+r.elites*25+r.bosses*100+r.lvl*10+Math.floor(r.gold/5)+(won?300:0)+r.corners*20;return Math.round(s*(1+.25*r.heat))}
function endingFor(r){if(r.corners>=3)return 'back';const f=topFac(r);return f||'none'}
function endRun(r,won){
 const M=S.meta;const ending=won?endingFor(r):'dead';const score=calcScore(r,won);const ink=Math.max(5,Math.floor(score/8));
 const rec={cls:r.cls,heat:r.heat,act:r.act,lvl:r.lvl,score,ending,won:won?1:0,kills:r.kills,date:Date.now(),mins:Math.round((r.play||0)/60),ranks:Object.assign({},r.ranks)};
 M.runs.unshift(rec);M.runs=M.runs.slice(0,40);M.ink+=ink;M.inkTotal+=ink;M.stats.runs++;if(won)M.stats.wins++;M.stats.best=Math.max(M.stats.best,score);
 const newEnd=!M.endings[ending];M.endings[ending]=(M.endings[ending]||0)+1;
 let heatUp=false;if(won&&r.heat>=M.heatMax&&M.heatMax<10){M.heatMax=r.heat+1;heatUp=true}
 r.result={won,ending,score,ink,newEnd,heatUp,rank:M.runs.slice().sort((a,b)=>b.score-a.score).indexOf(rec)+1};
 r.scr='end';r.combat=null;r.pendingLv=0;r.newAct=0;
}
function bestRuns(){return S.meta.runs.slice().sort((a,b)=>b.score-a.score).slice(0,10)}
