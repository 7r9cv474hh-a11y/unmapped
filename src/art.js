// ===== ART: boiling ink + misregistered print =====
let BOIL=0;
function jit(k){const x=Math.sin(k*12.9898+BOIL*78.233)*43758.5453;return (x-Math.floor(x))-.5}
function inkPath(g,pts,closed,w,fill,j,col){
 j=j==null?1.6:j;
 if(fill){g.save();g.translate(3,2.5);g.globalAlpha=.85;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fillStyle=fill;g.fill();g.restore()}
 g.beginPath();pts.forEach((p,i)=>{const x=p[0]+jit(i*3.1+p[0]*.7)*j,y=p[1]+jit(i*7.7+p[1]*.3)*j;i?g.lineTo(x,y):g.moveTo(x,y)});if(closed)g.closePath();
 g.lineWidth=w||3;g.strokeStyle=col||COL.ink;g.lineJoin='round';g.lineCap='round';g.stroke();
}
function ell(cx,cy,rx,ry,n,wob,seed){n=n||20;const p=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,k=1+(wob||0)*Math.sin(a*3+(seed||0));p.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k])}return p}
function rr(x,y,w,h){return [[x,y],[x+w*.5,y-1],[x+w,y],[x+w+1,y+h*.5],[x+w,y+h],[x+w*.5,y+h+1],[x,y+h],[x-1,y+h*.5]]}
function line(g,x1,y1,x2,y2,w,col){inkPath(g,[[x1,y1],[(x1+x2)/2,(y1+y2)/2],[x2,y2]],false,w||3,null,1.4,col)}
function dot(g,x,y,r,col){g.beginPath();g.arc(x+jit(x)*.8,y+jit(y)*.8,r,0,7);g.fillStyle=col||COL.ink;g.fill()}
function eyes(g,x,y,n,s,look,blink){
 const sp=s*.32;for(let i=0;i<n;i++){const ex=x+(i-(n-1)/2)*sp,ey=y+(n>2&&i%2?-s*.08:0);
  if(blink){line(g,ex-s*.09,ey,ex+s*.09,ey,2.5);continue}
  inkPath(g,ell(ex,ey,s*.11,s*.13,12),true,2.5,'#fff',.8);dot(g,ex+(look||0)*s*.04,ey+s*.02,s*.05)}
}
function txt(g,s,x,y,size,col,align,font){g.font=(size||16)+'px '+(font||'Hand');g.textAlign=align||'center';g.textBaseline='middle';g.fillStyle=col||COL.ink;g.fillText(s,x,y)}
function txtO(g,s,x,y,size,col,oc,font){g.font=(size||16)+'px '+(font||'Brush');g.textAlign='center';g.textBaseline='middle';g.lineWidth=5;g.strokeStyle=oc||COL.paper;g.lineJoin='round';g.strokeText(s,x,y);g.fillStyle=col||COL.ink;g.fillText(s,x,y)}

function drawCreature(g,a,x,y,s,t,flash,dead){
 // x,y = feet center; s = size (height-ish)
 const bob=Math.sin(t*2.2+x)*s*.025,c=a.c,blink=(Math.floor(t*10+x)%37)===0;
 g.save();g.translate(x,y+bob);
 if(dead){g.globalAlpha=.25}
 // shadow
 g.fillStyle='rgba(42,35,32,.12)';g.beginPath();g.ellipse(0,s*.02,s*.42,s*.07,0,0,7);g.fill();
 const L=(n,arr)=>arr;
 switch(a.s){
  case 'blob':inkPath(g,ell(0,-s*.38,s*.42,s*.36,22,.06,x),true,3,c);eyes(g,0,-s*.45,a.e,s,Math.sin(t),blink);inkPath(g,[[-s*.12,-s*.25],[0,-s*.22],[s*.12,-s*.26]],false,2.5);
   if(a.ex==='leaf'){inkPath(g,[[0,-s*.72],[s*.12,-s*.9],[s*.2,-s*.78],[0,-s*.72]],true,2.5,COL.green)}
   if(a.ex==='clock'){inkPath(g,ell(0,-s*.88,s*.12,s*.12,14),true,2.5,'#fff');line(g,0,-s*.88,0,-s*.96,2);line(g,0,-s*.88,s*.06,-s*.86,2)}
   break;
  case 'post':line(g,0,0,0,-s*.85,6);inkPath(g,[[-s*.35,-s*.8],[s*.25,-s*.8],[s*.42,-s*.68],[s*.25,-s*.56],[-s*.35,-s*.56]],true,3,c);eyes(g,-s*.02,-s*.68,2,s*.8,0,blink);
   inkPath(g,[[s*.3,-s*.5],[-s*.25,-s*.5],[-s*.4,-s*.4],[-s*.25,-s*.3],[s*.3,-s*.3]],true,3,COL.paper2);txt(g,'?',0,-s*.4,s*.15);break;
  case 'wasp':{const w=Math.sin(t*30)*s*.06;inkPath(g,[[-s*.05,-s*.55],[-s*.35,-s*.85-w],[-s*.15,-s*.5]],true,2,'rgba(255,255,255,.7)');inkPath(g,[[s*.05,-s*.55],[s*.35,-s*.85+w],[s*.15,-s*.5]],true,2,'rgba(255,255,255,.7)');
   inkPath(g,ell(0,-s*.45,s*.28,s*.2,18),true,3,c);line(g,-s*.08,-s*.62,-s*.1,-s*.28,3);line(g,s*.08,-s*.62,s*.1,-s*.28,3);inkPath(g,[[s*.26,-s*.45],[s*.42,-s*.43]],false,3);eyes(g,-s*.2,-s*.5,2,s*.5,0,blink);break}
  case 'sock':inkPath(g,[[-s*.15,-s*.85],[s*.15,-s*.85],[s*.15,-s*.25],[s*.35,-s*.18],[s*.38,-s*.04],[s*.1,0],[-s*.15,-s*.05]],true,3,c);line(g,-s*.15,-s*.75,s*.15,-s*.75,2.5,COL.ink);line(g,-s*.15,-s*.7,s*.15,-s*.7,2.5,COL.red);eyes(g,0,-s*.55,2,s*.7,0,blink);
   dot(g,-s*.05,-s*.02,s*.03,COL.blue);dot(g,s*.25,s*.03,s*.025,COL.blue);break;
  case 'moth':{const w=Math.sin(t*8)*.25;inkPath(g,[[0,-s*.5],[-s*.45,-s*(.8+w*.3)],[-s*.4,-s*.3],[0,-s*.45]],true,2.5,c);inkPath(g,[[0,-s*.5],[s*.45,-s*(.8+w*.3)],[s*.4,-s*.3],[0,-s*.45]],true,2.5,c);
   line(g,-s*.3,-s*.6,-s*.15,-s*.45,1.5);line(g,s*.3,-s*.6,s*.15,-s*.45,1.5);inkPath(g,ell(0,-s*.45,s*.08,s*.22,12),true,3,COL.ink);eyes(g,0,-s*.62,2,s*.45,0,blink);break}
  case 'wolf':inkPath(g,[[-s*.45,-s*.15],[-s*.4,-s*.55],[0,-s*.62],[s*.3,-s*.58],[s*.45,-s*.2],[s*.3,0],[-s*.35,0]],true,3,c);
   inkPath(g,[[s*.15,-s*.6],[s*.22,-s*.95],[s*.38,-s*.62]],true,3,c);inkPath(g,[[-s*.2,-s*.6],[-s*.18,-s*.95],[-s*.02,-s*.62]],true,3,c);
   inkPath(g,ell(0,-s*.38,s*.18,s*.18,16),true,2.5,'#fff');line(g,0,-s*.52,0,-s*.24,2,COL.red);line(g,-s*.14,-s*.38,s*.14,-s*.38,2);eyes(g,0,-s*.7,2,s*.6,0,blink);break;
  case 'tall':inkPath(g,[[-s*.2,0],[-s*.25,-s*.7],[-s*.15,-s*.85],[s*.15,-s*.85],[s*.25,-s*.7],[s*.2,0]],true,3,c);line(g,-s*.25,-s*.55,-s*.45,-s*.3,4);line(g,s*.25,-s*.55,s*.45,-s*.35,4);eyes(g,0,-s*.7,a.e,s*.8,0,blink);line(g,-s*.07,-s*.58,s*.07,-s*.58,2.5);
   if(a.ex==='hat')inkPath(g,[[-s*.35,-s*.85],[s*.35,-s*.85],[s*.15,-s*.88],[s*.12,-s*1.05],[-s*.12,-s*1.05],[-s*.15,-s*.88]],true,3,'#6b4e2e');
   if(a.ex==='glasses'){inkPath(g,ell(-s*.09,-s*.7,s*.08,s*.07,10),true,2);inkPath(g,ell(s*.09,-s*.7,s*.08,s*.07,10),true,2);line(g,-s*.2,-s*.92,s*.2,-s*.92,6,'#5a4a3a')}break;
  case 'goose':{const nk=Math.sin(t*3)*s*.05;inkPath(g,ell(-s*.05,-s*.3,s*.42,s*.26,22,.05),true,3,c);inkPath(g,[[s*.2,-s*.45],[s*.25+nk,-s*.8],[s*.3+nk,-s*.95],[s*.4+nk,-s*.98],[s*.42+nk,-s*.88],[s*.35+nk,-s*.8],[s*.34,-s*.4]],true,3,c);
   inkPath(g,[[s*.42+nk,-s*.93],[s*.62+nk,-s*.88],[s*.42+nk,-s*.85]],true,2.5,COL.gold);dot(g,s*.36+nk,-s*.92,s*.025);inkPath(g,[[-s*.3,-s*.35],[-s*.05,-s*.25],[-s*.35,-s*.18]],false,2.5);
   line(g,-s*.1,-s*.05,-s*.12,0,4,COL.gold);line(g,s*.08,-s*.05,s*.1,0,4,COL.gold);txt(g,'TOLL',-s*.08,-s*.65,s*.12,COL.red,'center','Brush');break}
  case 'slug':inkPath(g,[[-s*.5,0],[-s*.45,-s*.25],[-s*.1,-s*.35],[s*.3,-s*.45],[s*.42,-s*.3],[s*.4,0]],true,3,c);line(g,s*.3,-s*.45,s*.35,-s*.65,2);line(g,s*.38,-s*.42,s*.48,-s*.6,2);dot(g,s*.35,-s*.67,s*.03);dot(g,s*.48,-s*.62,s*.03);
   inkPath(g,[[-s*.4,-s*.12],[s*.3,-s*.12]],false,2,null,1,'#fff');break;
  case 'box':inkPath(g,rr(-s*.28,-s*.8,s*.56,s*.62),true,3,c);line(g,-s*.15,-s*.18,-s*.15,0,4);line(g,s*.15,-s*.18,s*.15,0,4);eyes(g,0,-s*.6,a.e,s*.8,0,blink);line(g,-s*.1,-s*.42,s*.1,-s*.42,2.5);
   if(a.ex==='tie')inkPath(g,[[0,-s*.36],[-s*.05,-s*.3],[0,-s*.2],[s*.05,-s*.3]],true,2,COL.red);break;
  case 'stamp':inkPath(g,rr(-s*.3,-s*.25,s*.6,s*.22),true,3,c);inkPath(g,rr(-s*.12,-s*.75,s*.24,s*.5),true,3,'#6b4e2e');inkPath(g,ell(0,-s*.82,s*.16,s*.1,12),true,3,'#6b4e2e');eyes(g,0,-s*.55,2,s*.6,0,blink);txt(g,'OK',0,-s*.14,s*.14,'#fff','center','Brush');break;
  case 'bird':inkPath(g,ell(0,-s*.35,s*.28,s*.25,18),true,3,c);inkPath(g,ell(s*.1,-s*.65,s*.14,s*.14,14),true,3,c);inkPath(g,[[s*.22,-s*.68],[s*.36,-s*.64],[s*.22,-s*.6]],true,2,COL.gold);dot(g,s*.13,-s*.68,s*.025);
   line(g,-s*.05,-s*.1,-s*.06,0,3,COL.gold);line(g,s*.06,-s*.1,s*.07,0,3,COL.gold);inkPath(g,[[-s*.2,-s*.4],[0,-s*.3],[-s*.22,-s*.25]],false,2);break;
  case 'assessor':inkPath(g,rr(-s*.4,-s*.95,s*.8,s*.95),true,3.5,c);for(let i=0;i<4;i++)line(g,-s*.3,-s*.3+i*-s*.08,s*.3,-s*.3+i*-s*.08,1.5,'#9a8f7f');eyes(g,0,-s*.75,a.e,s*.9,Math.sin(t*.7),blink);
   inkPath(g,[[-s*.15,-s*.5],[s*.15,-s*.5]],false,3,null,1,COL.red);inkPath(g,[[s*.45,-s*.3],[s*.65,-s*.9],[s*.7,-s*.88],[s*.5,-s*.28]],true,2.5,COL.red);break;
  case 'folded':inkPath(g,[[-s*.25,0],[-s*.3,-s*.3],[-s*.1,-s*.45],[-s*.3,-s*.6],[-s*.15,-s*.85],[s*.15,-s*.85],[s*.3,-s*.6],[s*.1,-s*.45],[s*.3,-s*.3],[s*.25,0]],true,3,c);
   line(g,-s*.1,-s*.45,s*.1,-s*.45,1.5);line(g,-s*.3,-s*.6,s*.3,-s*.6,1.5,'#9a8f7f');line(g,-s*.3,-s*.3,s*.3,-s*.3,1.5,'#9a8f7f');eyes(g,0,-s*.72,2,s*.7,0,blink);break;
  case 'cloud':{const p=[];for(let i=0;i<7;i++){const a=i/7*6.28;p.push(...ell(Math.cos(a)*s*.25,-s*.45+Math.sin(a)*s*.15,s*.14,s*.13,8))}
   inkPath(g,ell(0,-s*.45,s*.36,s*.24,24,.12,3),true,3,c);eyes(g,0,-s*.47,2,s*.7,0,blink);if(a.ex==='halo')inkPath(g,ell(0,-s*.82,s*.18,s*.05,16),true,3,null,1,COL.gold);break}
  case 'tri':for(let i=-1;i<=1;i++){const ox=i*s*.22,sz=s*(.5-.1*Math.abs(i));inkPath(g,[[ox,-s*.1-sz],[ox+sz*.5,-s*.1],[ox-sz*.5,-s*.1]],true,3,i?COL.paper2:c)}eyes(g,0,-s*.32,a.e,s*.6,0,blink);break;
  case 'owl':inkPath(g,ell(0,-s*.4,s*.28,s*.38,18),true,3,c);inkPath(g,ell(0,-s*.33,s*.18,s*.22,14),true,2,'#c9b48f');inkPath(g,[[-s*.22,-s*.7],[-s*.15,-s*.88],[-s*.05,-s*.72]],true,2.5,c);inkPath(g,[[s*.22,-s*.7],[s*.15,-s*.88],[s*.05,-s*.72]],true,2.5,c);
   eyes(g,0,-s*.58,2,s*1.0,Math.sin(t*2),blink);inkPath(g,[[-s*.03,-s*.48],[s*.03,-s*.48],[0,-s*.42]],true,2,COL.gold);
   g.save();g.translate(s*.38,-s*.85);g.scale(.25,.25);inkPath(g,ell(0,-s*.4,s*.28,s*.38,12),true,3,c);g.restore();break;
  case 'echo':g.globalAlpha*=.75;drawPlayerShape(g,0,0,s,COL.purple,t,true,S.run&&S.run.cls);g.globalAlpha=dead?.25:1;break;
  case 'kraken':for(let i=0;i<5;i++){const ox=(i-2)*s*.17,w=Math.sin(t*2+i)*s*.06;inkPath(g,[[ox,-s*.35],[ox+w,-s*.18],[ox-w,0]],false,6,null,1.5,c)}inkPath(g,ell(0,-s*.55,s*.38,s*.32,22,.05),true,3,c);eyes(g,0,-s*.6,2,s,Math.sin(t),blink);
   txt(g,'here be me',0,-s*.97,s*.1,COL.ink,'center','Brush');break;
  case 'eye':{const r=s*.45;inkPath(g,[[-r*1.2,-s*.5],[0,-s*.5-r*.8],[r*1.2,-s*.5],[0,-s*.5+r*.8]],true,4,'#fff');inkPath(g,ell(0,-s*.5,r*.42,r*.42,18),true,3,'#ddd');dot(g,Math.sin(t)*r*.15,-s*.5,r*.18);
   for(let i=0;i<8;i++){const a=i/8*6.28+t*.2;line(g,Math.cos(a)*r*1.3,-s*.5+Math.sin(a)*r*1.1,Math.cos(a)*r*1.5,-s*.5+Math.sin(a)*r*1.3,2,'#bbb')}break}
  case 'prime':inkPath(g,[[-s*.3,0],[-s*.35,-s*.7],[0,-s*1.0],[s*.35,-s*.7],[s*.3,0]],true,3.5,c);inkPath(g,[[0,-s*1.0],[s*.08,-s*1.15],[0,-s*1.25],[-s*.08,-s*1.15]],true,2.5,COL.gold);
   g.save();g.globalAlpha*=.9;eyes(g,0,-s*.62,a.e,s*.9,Math.sin(t),blink);g.restore();for(let i=0;i<3;i++)dot(g,(i-1)*s*.15,-s*.2+Math.sin(t*3+i)*s*.03,s*.04,'#1f1b2e');break;
  case 'ruler':inkPath(g,rr(-s*.12,-s*1.0,s*.24,s*1.0),true,3.5,c);for(let i=0;i<12;i++)line(g,-s*.12,-s*.08-i*s*.075,-s*.12+(i%2?s*.06:s*.11),-s*.08-i*s*.075,1.5);eyes(g,s*.02,-s*.82,2,s*.6,0,blink);line(g,-s*.12,-s*.55,-s*.4,-s*.7,4);line(g,s*.12,-s*.55,s*.4,-s*.7,4);break;
  case 'edit':inkPath(g,rr(-s*.38,-s*.9,s*.76,s*.86),true,3,'#fff');for(let i=0;i<6;i++)line(g,-s*.3,-s*.8+i*s*.12,s*.3,-s*.8+i*s*.12,2,'#888');line(g,-s*.4,-s*.6,s*.42,-s*.45,5,c);line(g,-s*.4,-s*.25,s*.42,-s*.38,5,c);eyes(g,0,-s*.55,2,s*.9,Math.sin(t),blink);break;
  case 'door':inkPath(g,rr(-s*.25,-s*.95,s*.5,s*.95),true,3.5,c);inkPath(g,rr(-s*.18,-s*.85,s*.36,s*.32),true,2);dot(g,s*.15,-s*.45,s*.04,COL.gold);eyes(g,0,-s*.7,2,s*.6,0,blink);inkPath(g,rr(-s*.2,-s*.38,s*.4,s*.1),true,2,'#fff');txt(g,'NOT A DOOR',0,-s*.33,s*.07);break;
  default:inkPath(g,ell(0,-s*.4,s*.35,s*.35,18),true,3,c);eyes(g,0,-s*.45,2,s,0,blink);
 }
 if(flash>0){g.globalCompositeOperation='source-atop';g.fillStyle='rgba(255,255,255,'+Math.min(1,flash*1.6)+')';g.fillRect(-s,-s*1.4,s*2,s*1.6);g.globalCompositeOperation='source-over'}
 g.restore();
}
function drawPlayerShape(g,x,y,s,col,t,mirror,kind){
 g.save();g.translate(x,y);if(mirror)g.scale(-1,1);
 const b=Math.sin(t*2.5)*s*.02;kind=kind||'surveyor';
 // held item
 if(kind==='knight'){line(g,s*.3,-s*.1,s*.36,-s*.92,4,'#888');line(g,s*.2,-s*.32,s*.44,-s*.36,4,'#6b4e2e');}
 else if(kind==='rumor'){line(g,s*.28,-s*.38,s*.42,-s*.6,4,'#999');line(g,s*.24,-s*.4,s*.34,-s*.32,3,'#6b4e2e')}
 else if(kind==='witch'){const o=Math.sin(t*3)*s*.04;inkPath(g,ell(s*.38,-s*.62+o,s*.08,s*.08,10),true,2.5,COL.purple);g.globalAlpha*=.4;inkPath(g,ell(s*.38,-s*.62+o,s*.13,s*.13,10),true,1.5,null,1.5,COL.purple);g.globalAlpha=1}
 else if(kind==='intern'){inkPath(g,rr(s*.2,-s*.55,s*.2,s*.26),true,2.5,'#fff');line(g,s*.24,-s*.48,s*.36,-s*.48,1.5);line(g,s*.24,-s*.42,s*.36,-s*.42,1.5)}
 else{line(g,s*.28,-s*.05,s*.32,-s*.95,4,'#6b4e2e');inkPath(g,ell(s*.32,-s*.98,s*.06,s*.06,10),true,2.5,COL.gold)}
 inkPath(g,[[-s*.28,0],[-s*.12,-s*.62+b],[s*.12,-s*.62+b],[s*.28,0]],true,3,col);
 if(kind==='knight')inkPath(g,ell(-s*.2,-s*.3,s*.14,s*.17,12),true,3,'#bbb');
 inkPath(g,ell(0,-s*.72+b,s*.16,s*.16,16),true,3,'#f6e7cf');
 if(kind==='knight'){inkPath(g,[[-s*.18,-s*.7+b],[-s*.17,-s*.86+b],[0,-s*.92+b],[s*.17,-s*.86+b],[s*.18,-s*.7+b]],true,3,'#c9c9c9');inkPath(g,[[0,-s*.92+b],[s*.1,-s*1.08+b],[s*.18,-s*1.0+b]],false,4,null,1,COL.red)}
 else if(kind==='rumor')inkPath(g,[[-s*.2,-s*.62+b],[-s*.2,-s*.85+b],[0,-s*.96+b],[s*.2,-s*.85+b],[s*.2,-s*.62+b],[s*.12,-s*.82+b],[-s*.12,-s*.82+b]],true,3,col);
 else if(kind==='witch')inkPath(g,[[-s*.36,-s*.82+b],[s*.36,-s*.82+b],[s*.12,-s*.86+b],[-s*.1,-s*1.18+b],[-s*.12,-s*.86+b]],true,3,col);
 else if(kind==='intern'){inkPath(g,[[-s*.17,-s*.8+b],[-s*.12,-s*.92+b],[s*.12,-s*.92+b],[s*.17,-s*.8+b],[s*.34,-s*.79+b],[s*.17,-s*.8+b]],true,3,col)}
 else inkPath(g,[[-s*.28,-s*.8+b],[s*.28,-s*.8+b],[s*.1,-s*.84+b],[s*.02,-s*1.08+b],[-s*.12,-s*.84+b]],true,3,col);
 dot(g,-s*.05,-s*.72+b,s*.022);dot(g,s*.06,-s*.72+b,s*.022);if(kind!=='intern'&&kind!=='witch')line(g,-s*.12,-s*.4,s*.28,-s*.5,3,COL.ink);
 g.restore();
}
function drawPaper(g,w,h,bg,seed){
 g.fillStyle=bg;g.fillRect(0,0,w,h);
 const r=srand(seed||7);g.globalAlpha=.06;
 for(let i=0;i<5;i++){g.beginPath();g.arc(r()*w,r()*h,30+r()*90,0,7);g.strokeStyle='#7a5a30';g.lineWidth=6+r()*10;g.stroke()}
 g.globalAlpha=.08;g.strokeStyle=COL.blue;g.lineWidth=1;for(let y=24;y<h;y+=24){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke()}
 g.globalAlpha=1;
}
function srand(s){s=(s|0)||1;return ()=>{s=(s*16807)%2147483647;return (s-1)/2147483646}}
function drawIcon(g,type,x,y,r,col){
 const c=col||COL.ink;g.save();g.translate(x,y);
 switch(type){
  case 'fight':line(g,-r*.5,r*.5,r*.5,-r*.5,3,c);line(g,r*.5,r*.5,-r*.5,-r*.5,3,c);line(g,-r*.45,r*.15,-r*.15,r*.45,3,c);line(g,r*.45,r*.15,r*.15,r*.45,3,c);break;
  case 'elite':inkPath(g,ell(0,r*.1,r*.45,r*.4,12),true,3,COL.red,1,c);inkPath(g,[[-r*.35,-r*.15],[-r*.55,-r*.7],[-r*.1,-r*.3]],true,2.5,COL.red,1,c);inkPath(g,[[r*.35,-r*.15],[r*.55,-r*.7],[r*.1,-r*.3]],true,2.5,COL.red,1,c);dot(g,-r*.15,r*.05,r*.08,c);dot(g,r*.15,r*.05,r*.08,c);break;
  case 'event':txt(g,'!',0,r*.05,r*1.6,c,'center','Brush');break;
  case 'mystery':txt(g,'?',0,r*.05,r*1.6,c,'center','Brush');break;
  case 'shop':inkPath(g,ell(0,0,r*.5,r*.5,14),true,3,COL.gold,1,c);txt(g,'g',0,-r*.05,r*.9,c,'center','Brush');break;
  case 'rest':inkPath(g,[[-r*.4,r*.5],[0,-r*.6],[r*.4,r*.5]],true,3,'#f0a040',1,c);inkPath(g,[[-r*.15,r*.5],[0,-r*.1],[r*.15,r*.5]],true,2,COL.red,1,c);line(g,-r*.55,r*.55,r*.55,r*.55,3,c);break;
  case 'treasure':inkPath(g,rr(-r*.5,-r*.2,r,r*.65),true,3,COL.gold,1,c);inkPath(g,[[-r*.5,-r*.2],[-r*.4,-r*.5],[r*.4,-r*.5],[r*.5,-r*.2]],true,3,'#b07d2a',1,c);dot(g,0,r*.05,r*.08,c);break;
  case 'boss':inkPath(g,[[-r*.6,r*.4],[-r*.6,-r*.3],[-r*.3,0],[0,-r*.55],[r*.3,0],[r*.6,-r*.3],[r*.6,r*.4]],true,3.5,COL.gold,1,c);break;
 }
 g.restore();
}
