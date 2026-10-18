import {chromium} from '/node_modules/playwright-core/index.mjs';
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});
const p=await (await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2})).newPage();
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text());if(m.text().startsWith('STUCK'))console.log(m.text())});p.on('pageerror',e=>errs.push(String(e)));
await p.goto('file:///workspace/pathrpg/index.html');await p.waitForTimeout(500);
const N=+(process.argv[2]||30);
const strats=JSON.parse(process.argv[3]||'[{"cls":"surveyor","br":"b","path":"mix"},{"cls":"surveyor","br":"c","path":"mix"},{"cls":"surveyor","br":"w","path":"mix"},{"cls":"knight","br":"b","path":"fight"},{"cls":"rumor","br":"c","path":"safe"},{"cls":"witch","br":"w","path":"mix"},{"cls":"intern","br":"c","path":"mix"}]');
for(const st of strats){const o=await p.evaluate(([n,st])=>PR.sim(n,st),[N,st]);
 const w=o.filter(x=>x.won).length,acts=[0,0,0,0];o.forEach(x=>acts[x.act]++);const avg=k=>(o.reduce((a,x)=>a+x[k],0)/o.length).toFixed(1);
 const kl={};o.forEach(x=>{if(x.killer)kl[x.killer]=(kl[x.killer]||0)+1});const ends={};o.forEach(x=>ends[x.end]=(ends[x.end]||0)+1);
 console.log(JSON.stringify(st),'win',w+'/'+o.length,'diedInAct',acts.slice(1).join('/'),'lvl',avg('lvl'),'turns',avg('turns'),'nodes',avg('nodes'),'score',avg('score'),JSON.stringify(ends),'maxsteps',Math.max(...o.map(x=>x.steps)));console.log('   killers',JSON.stringify(kl));}
console.log('errors',errs.length,errs.slice(0,5).join('\n'));await b.close();
