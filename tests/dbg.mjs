import {chromium} from '/node_modules/playwright-core/index.mjs';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
const p=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
p.on('pageerror',e=>console.log('ERR',String(e)));
await p.goto('file:///workspace/pathrpg/index.html');await p.waitForTimeout(400);
console.log(await p.evaluate(()=>{FX={float(){},flash(){},shake(){},hp(){},lunge(){},sound(){},busy(){}};save=()=>{};render=()=>{};SPD=0;
 S.run=newRun('surveyor',0);S.run.path=[];UI.title=false;const st={cls:'surveyor',br:'b',path:'mix'};const log=[];let lastScr='',k=0,fightTurns=0;
 while(S.run.scr!=='end'&&k++<3000){const r=S.run;if(r.scr==='combat'&&lastScr!=='combat'){log.push(`A${r.act} ${r.combat.kind} [${r.combat.en.map(e=>e.n+':'+e.hp).join(',')}] hp${r.hp}/${stats(r).maxHp} lv${r.lvl} strike${stats(r).strike}`);fightTurns=r.turns}
  if(lastScr==='combat'&&r.scr!=='combat')log.push('  -> turns '+(r.turns-fightTurns+1)+' hp'+r.hp);
  lastScr=r.scr;const d=botDecide(st);d.fn()}
 return log.join('\n')}));
await b.close();
