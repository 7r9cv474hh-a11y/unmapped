// Full UI test: real touch taps at 390x844, bot plays complete runs.
import {chromium} from '/node_modules/playwright-core/index.mjs';
const URL=process.env.URL||'file:///workspace/pathrpg/index.html',D='/workspace/pathrpg/shots/';
const errs=[];let ok=0,fail=0;const chk=(c,m)=>{c?ok++:fail++;console.log((c?'PASS ':'FAIL ')+m)};
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:3});
const p=await ctx.newPage();
p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});p.on('pageerror',e=>errs.push(String(e)));
await p.goto(URL);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(700);
await p.screenshot({path:D+'01_title.png'});
const shots={};const shot=async(k,f)=>{if(!shots[k]){shots[k]=1;await p.waitForTimeout(350);await p.screenshot({path:D+f})}};
let missing=0,taps=0;
async function waitIdle(){for(let i=0;i<200;i++){if(!(await p.evaluate(()=>PR.busy())))break;await p.waitForTimeout(25)}await p.waitForTimeout(55)}
async function step(st){
 await waitIdle();
 const d=await p.evaluate(st=>{const d=PR.botDecide(st);return {b:d.b,x:d.x,y:d.y,wait:d.wait}},st);
 if(d.wait){await p.waitForTimeout(60);return}
 taps++;
 if(d.b){const loc=p.locator(`[data-b="${d.b}"]`).first();
  if(await loc.count()===0||await loc.isDisabled()){missing++;console.log('  missing',d.b);await p.evaluate(b=>PR.botDo(b),d.b);return}
  await loc.tap({timeout:3000}).catch(async e=>{missing++;console.log('  tapfail',d.b);await p.evaluate(b=>PR.botDo(b),d.b)});}
 else{const bb=await p.locator('#cv').boundingBox();await p.touchscreen.tap(bb.x+d.x,bb.y+d.y)}
 await p.waitForTimeout(15);
}
async function playRun(st,label,hooks){
 let n=0,started=false,info=null;const seen=new Set();
 while(n++<4000){
  const s=await p.evaluate(()=>{const r=PR.run;return {title:PR.UI.title,ov:PR.UI.ov,scr:r&&r.scr,act:r&&r.act,res:r&&r.result,cls:r&&r.cls,lvl:r&&r.lvl,ranks:r&&r.ranks,kind:r&&r.combat&&r.combat.kind}});
  if(s.scr&&!s.title)seen.add(s.scr+(s.kind?':'+s.kind:''));
  if(!s.title&&s.scr&&!started){started=true}
  if(started&&s.scr==='end'&&s.res&&!info){info=Object.assign({},s.res,{cls:s.cls,act:s.act,lvl:s.lvl,ranks:s.ranks});await waitIdle();await shot('end','10_end.png')}
  if(started&&s.title){break}
  if(hooks)await hooks(s,n);
  await step(st);
 }
 console.log(`  ${label}: ${info?((info.won?'WON':'died')+' ending='+info.ending+' class='+info.cls+' act='+info.act+' lvl='+info.lvl+' score='+info.score):'NO RESULT'} steps=${n} screens=${[...seen].join(',')}`);
 return info;
}
const t0=Date.now();
await p.evaluate(()=>PR.setSpeed(.06));
let reloadDone={map:0,combat:0};
const snap=()=>p.evaluate(()=>JSON.stringify({a:PR.run.act,hp:PR.run.hp,g:PR.run.gold,x:PR.run.xp,pos:PR.run.pos,en:PR.run.combat&&PR.run.combat.en.map(e=>[e.id,e.hp]),e:PR.run.combat&&PR.run.combat.energy,ranks:PR.run.ranks}));
const r1=await playRun({cls:'surveyor',br:'b',path:'fight',fac:'ink'},'Run 1 Surveyor/Brawn/fight/ink',async(s,n)=>{
 if(s.ov==='cls')await shot('cls','02_class_select.png');
 if(s.scr==='map'&&!s.ov&&s.act===1&&n>3)await shot('map','03_map.png');
 if(s.scr==='combat')await shot('combat','04_combat.png');
 if(s.scr==='combat'&&s.kind==='boss')await shot('boss','05_boss.png');
 if(s.ov==='skills')await shot('skills','06_skills.png');
 if(s.scr==='event')await shot('event','07_event.png');
 if(s.scr==='shop')await shot('shop','08_shop.png');
 if(s.scr==='loot')await shot('loot','09_loot.png');
 for(const k of ['map','combat']){
  if(!reloadDone[k]&&s.scr===k&&!s.ov&&n>40){await waitIdle();
   const before=await snap();
   await p.reload();await p.waitForTimeout(600);await p.evaluate(()=>PR.setSpeed(.06));
   const hasC=await p.locator('[data-b="continue"]').count();await p.locator('[data-b="continue"]').tap();await p.waitForTimeout(300);
   const after=await snap();const scr=await p.evaluate(()=>PR.run.scr);
   chk(hasC===1&&before===after&&scr===k,`save/continue survives reload (${k}) `+(before===after?'':before+' vs '+after));reloadDone[k]=1}
 }
});
const runs=[r1];
runs.push(await playRun({cls:'surveyor',br:'c',path:'safe',fac:'blank'},'Run 2 Surveyor/Cunning/safe/blank'));
runs.push(await playRun({cls:'surveyor',br:'w',path:'mix',corners:1},'Run 3 Surveyor/Weird/mix/corners'));
runs.push(await playRun({cls:'knight',br:'b',path:'mix',fac:'folk'},'Run 4 Knight(if unlocked)/Brawn/folk'));
runs.push(await playRun({cls:'rumor',br:'c',path:'fight'},'Run 5 Rumormonger(if unlocked)/Cunning/fight'));
chk(runs.every(Boolean),'all 5 runs reached an end screen and returned to title');
const m=await p.evaluate(()=>({runs:PR.S.meta.runs.length,ink:PR.S.meta.ink,cls:PR.S.meta.cls,endings:PR.S.meta.endings,best:PR.S.meta.stats.best}));
chk(m.runs===5,'run history recorded 5 runs ('+m.runs+')');console.log('  meta',JSON.stringify(m));
console.log('  classes played:',[...new Set(runs.filter(Boolean).map(r=>r.cls))].join(','));
chk(new Set(runs.filter(Boolean).map(r=>JSON.stringify(['b','c','w'].map(x=>Object.entries(r.ranks).filter(([k])=>k[0]===x).reduce((a,[,v])=>a+v,0))))).size>=3,'runs used different builds');
await p.reload();await p.waitForTimeout(500);await p.locator('[data-b="records"]').tap();await p.waitForTimeout(300);
const recRows=await p.locator('#ov table').first().locator('tr').count();chk(recRows>=6,'high score table persists after reload ('+(recRows-1)+' rows)');
await p.screenshot({path:D+'11_records.png'});await p.locator('[data-b="back"]').tap();
await p.locator('[data-b="new"]').tap();await p.waitForTimeout(200);await p.locator('[data-b="cls-surveyor"]').tap();await p.locator('[data-b="begin"]').tap();await p.waitForTimeout(1900);
await p.evaluate(()=>{PR.run.sp=40});
async function rank(k,times){await p.locator('[data-b="skills"]').tap();for(let i=0;i<times;i++){await p.locator(`[data-b="sk-${k}"]`).tap();await p.locator('[data-b="rank"]').tap()}await p.locator('[data-b="close"]').tap()}
await p.locator('[data-b="skills"]').tap();await p.locator('[data-b="sk-b4"]').tap();chk(await p.locator('[data-b="rank"]').isDisabled(),'deep skill (Haymaker) is locked until branch has 6 points');await p.locator('[data-b="close"]').tap();
const st0=await p.evaluate(()=>PR.stats(PR.run));
await rank('b1',4);let st1=await p.evaluate(()=>PR.stats(PR.run));chk(st1.strike===st0.strike+8&&st1.maxHp===st0.maxHp+20,`Muscle x4: strike ${st0.strike}->${st1.strike}, maxHP ${st0.maxHp}->${st1.maxHp}`);
await rank('b3',3);st1=await p.evaluate(()=>PR.stats(PR.run));chk(st1.hide===6&&st1.guard===st0.guard+3,`Iron Hide x3: start block ${st1.hide}, guard ${st0.guard}->${st1.guard}`);
await rank('c1',4);st1=await p.evaluate(()=>PR.stats(PR.run));chk(st1.crit===st0.crit+20,`Sharp Eye x4: crit ${st0.crit}->${st1.crit}%`);
await rank('c3',5);st1=await p.evaluate(()=>PR.stats(PR.run));chk(st1.dodge===30&&st1.en===st0.en+1,`Slippery x5: dodge ${st1.dodge}%, energy ${st0.en}->${st1.en}`);
await rank('w1',1);
const nd=await p.evaluate(()=>PR.nodeXY(PR.run.map.rows[0][0]));const bb=await p.locator('#cv').boundingBox();await p.touchscreen.tap(bb.x+nd.x,bb.y+nd.y);await p.waitForTimeout(700);
const lab=await p.locator('[data-b="act-strike"] small').textContent();const exp=await p.evaluate(()=>PR.stats(PR.run).strike);
chk(lab.startsWith(exp+' '),`Strike button shows ranked damage (${lab}, expected ${exp})`);
const blk=await p.evaluate(()=>PR.run.combat.block);chk(blk>=6,'Iron Hide block present at turn start ('+blk+')');
const ib1=await p.locator('[data-b="act-w1"] small').textContent();
await p.evaluate(()=>{PR.run.sp=1});await p.locator('[data-b="menu"]').tap();await p.locator('#ov button:has-text("Skills")').tap();await p.locator('[data-b="sk-w1"]').tap();await p.locator('[data-b="rank"]').tap();await p.locator('[data-b="close"]').tap();await p.waitForTimeout(200);
const ib2=await p.locator('[data-b="act-w1"] small').textContent();chk(parseInt(ib2)===parseInt(ib1)+3,`Ink Bolt rank 1->2 changes button: ${ib1} -> ${ib2}`);
await p.locator('[data-b="act-strike"]').tap();await p.waitForTimeout(250);
await p.screenshot({path:D+'12_ranked_combat.png'});
chk(errs.length===0,'no console errors ('+errs.length+')'+(errs.length?': '+errs.slice(0,3).join(' | '):''));
console.log(`taps=${taps} fallback(botDo, element missing/disabled)=${missing} time=${Math.round((Date.now()-t0)/1000)}s`);
console.log(`RESULT ${ok} passed, ${fail} failed`);await b.close();process.exit(fail?1:0);
