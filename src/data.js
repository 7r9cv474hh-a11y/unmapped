// ===== DATA =====
const COL={paper:'#f3ead7',paper2:'#e9dcc0',ink:'#2a2320',red:'#c8553d',green:'#4f8a5b',purple:'#7b5ea7',gold:'#d9a441',blue:'#3f6e9a',teal:'#3a8f8a',pink:'#d77a8f'};
const BR={b:{name:'Brawn',col:COL.red,tag:'Hit things. Be hard to hit back.'},c:{name:'Cunning',col:COL.green,tag:'Stab, slip, spread rumors.'},w:{name:'Weird',col:COL.purple,tag:'Bend the page. Ask questions later.'}};
const SK={
 b1:{br:'b',tier:0,name:'Muscle',type:'passive',d:r=>`Strike +${2*r} dmg. +${5*r} max HP.`},
 b2:{br:'b',tier:1,name:'Cleave',type:'active',cost:2,d:r=>`Hit ALL enemies for ${5+3*r}.`},
 b3:{br:'b',tier:2,name:'Iron Hide',type:'passive',d:r=>`Start each turn with ${2*r} Block. Guard +${r}.`},
 b4:{br:'b',tier:3,name:'Haymaker',type:'active',cost:3,d:r=>`Deal ${14+6*r}.${r>=3?' STUNS the target.':' (Rank 3: stuns)'}`},
 c1:{br:'c',tier:0,name:'Sharp Eye',type:'passive',d:r=>`+${5*r}% crit. Crits x${(1.5+.1*r).toFixed(1)}. +${10*r}% gold.`},
 c2:{br:'c',tier:1,name:'Shiv',type:'active',cost:1,d:r=>`Deal ${3+2*r}, apply ${1+r} Bleed.`},
 c3:{br:'c',tier:2,name:'Slippery',type:'passive',d:r=>`+${6*r}% dodge.${r>=5?' +1 Energy per turn.':' (Rank 5: +1 Energy)'}`},
 c4:{br:'c',tier:3,name:'Rumor',type:'active',cost:1,d:r=>`Weak ${1+Math.ceil(r/2)} + Vulnerable ${Math.ceil(r/2)}${r>=4?' on ALL enemies.':' (Rank 4: all enemies)'}`},
 w1:{br:'w',tier:0,name:'Ink Bolt',type:'active',cost:1,d:r=>`Deal ${4+3*r}. Ignores Block.`},
 w2:{br:'w',tier:1,name:'Redraw',type:'active',cost:2,d:r=>`Heal ${5+3*r}.${r>=3?' Clears your debuffs.':' (Rank 3: clears debuffs)'}`},
 w3:{br:'w',tier:2,name:'Misprint',type:'passive',d:r=>`${7*r}% chance an enemy attack hits the enemy instead.`},
 w4:{br:'w',tier:3,name:'Echo',type:'passive',d:r=>`${10*r}% chance any skill casts twice, free.`},
};
const SKIDS=Object.keys(SK);
const CL={
 surveyor:{name:'The Surveyor',hp:60,atk:6,def:5,crit:5,gold:40,sp:1,col:COL.blue,cost:0,start:{},blurb:'Measures things. Is sometimes right. Starts with a spare skill point.'},
 knight:{name:'Hedge Knight',hp:72,atk:7,def:6,crit:3,gold:25,sp:0,col:COL.red,cost:40,start:{b1:1},blurb:'Sworn to a hedge. The hedge has not sworn back. Starts with Muscle.'},
 rumor:{name:'Rumormonger',hp:54,atk:5,def:4,crit:12,gold:70,sp:0,col:COL.green,cost:70,start:{c2:1},blurb:'Knows a guy. Is the guy. Starts with Shiv and extra gold.'},
 witch:{name:'Margin Witch',hp:50,atk:4,def:4,crit:5,gold:40,sp:0,col:COL.purple,cost:100,start:{w1:1,w2:1},blurb:'Lives in the margins of the map. Starts with Ink Bolt and Redraw.'},
 intern:{name:'The Intern',hp:58,atk:6,def:5,crit:8,gold:10,sp:1,col:COL.gold,cost:200,start:'random',blurb:'Unpaid. Unbothered. Unclear. Starts with two random skills.'},
};
const PERKS={
 hp:{name:'Thicker Paper',max:3,cost:[25,50,80],d:'+6 max HP per rank'},
 gold:{name:'Pocket Money',max:3,cost:[20,40,70],d:'+25 starting gold per rank'},
 sp:{name:'Head Start',max:2,cost:[45,100],d:'+1 starting skill point per rank'},
 pot:{name:'Spare Bottle',max:2,cost:[30,60],d:'Start with a Tonic per rank'},
 luck:{name:'Lucky Ink',max:2,cost:[35,75],d:'Better loot odds per rank'},
};
const ACTS=[null,
 {name:'The Margins',sub:'Where the map gets vague.',bg:'#efe4c8',acc:COL.green},
 {name:'The Smudge',sub:'A town that is being erased, politely.',bg:'#e6e0d4',acc:COL.blue},
 {name:'The Fold',sub:'Where the page bends over itself.',bg:'#ece0e8',acc:COL.purple},
];
// intents: a=dmg,x=hits,b=block,str,weak,vuln,heal,all(heal allies),steal,strip
const EN={
 gremlin:{n:'Hedge Gremlin',hp:18,xp:10,art:{s:'blob',c:COL.green,e:2,ex:'leaf'},pat:[{a:6,nm:'Bite'},{a:3,b:5,nm:'Hide in hedge'}],rnd:1},
 signpost:{n:'Lost Signpost',hp:24,xp:11,art:{s:'post',c:COL.gold,e:2},pat:[{a:5,nm:'Poke'},{weak:2,nm:'Points the wrong way'},{a:8,nm:'Falls on you'}]},
 wasp:{n:'Paper Wasp',hp:13,xp:9,art:{s:'wasp',c:COL.gold,e:2},pat:[{a:3,x:2,nm:'Sting sting'},{a:3,x:2,nm:'Sting sting'},{str:1,nm:'Folds sharper'}]},
 sock:{n:'Damp Sock (Sentient)',hp:17,xp:9,art:{s:'sock',c:COL.blue,e:2},pat:[{a:5,nm:'Squelch'},{heal:5,b:4,nm:'Wrings itself out'}]},
 moth:{n:'Map Moth',hp:15,xp:9,art:{s:'moth',c:COL.paper2,e:2},pat:[{a:4,nm:'Flutter'},{vuln:1,a:2,nm:'Eats your legend'}]},
 wolf:{n:'Compass Wolf',hp:54,xp:32,elite:1,art:{s:'wolf',c:COL.blue,e:2},pat:[{a:10,nm:'Bites north'},{a:4,x:3,nm:'Spins'},{str:2,b:6,nm:'Howls at magnetic north'}]},
 scarecrow:{n:'Scarecrow Accountant',hp:48,xp:30,elite:1,art:{s:'tall',c:COL.gold,e:2,ex:'hat'},pat:[{a:7,b:6,nm:'Itemizes'},{weak:2,vuln:2,nm:'Audits your crows'},{a:13,nm:'Final notice'}]},
 goose:{n:'The Toll Goose',hp:115,xp:70,boss:1,art:{s:'goose',c:'#fbfaf5',e:1},pat:[{weak:2,vuln:1,a:4,nm:'HONK'},{a:6,x:2,nm:'Peck peck'},{steal:15,a:8,nm:'Collects toll'},{b:12,str:2,nm:'Puffs up'},{a:16,nm:'Wing slap'}]},
 slug:{n:'Eraser Slug',hp:34,xp:15,art:{s:'slug',c:COL.pink,e:2},pat:[{a:8,strip:1,nm:'Erases your Block'},{b:8,nm:'Curls up'}]},
 clerk:{n:'Clerk of Minor Forms',hp:30,xp:15,art:{s:'box',c:COL.paper2,e:2,ex:'tie'},pat:[{vuln:2,nm:'Stamps you INCOMPLETE'},{a:11,nm:'Paper cut'},{a:6,b:6,nm:'Files a complaint'}]},
 smudge:{n:'Smudge',hp:28,xp:14,art:{s:'blob',c:'#6b6460',e:3},pat:[{a:5,x:2,nm:'Smears'},{b:9,nm:'Spreads out'}],rnd:1},
 stamp:{n:'Rubber Stamp',hp:26,xp:14,art:{s:'stamp',c:COL.red,e:2},pat:[{b:4,nm:'Inks up'},{a:14,nm:'APPROVED'}]},
 pigeon:{n:'Bureau Pigeon',hp:22,xp:13,art:{s:'bird',c:'#9aa3ad',e:1},pat:[{a:4,x:3,nm:'Pecks in triplicate'},{weak:1,a:3,nm:'Coos condescendingly'}]},
 librarian:{n:'Overdue Librarian',hp:96,xp:50,elite:1,art:{s:'tall',c:COL.teal,e:2,ex:'glasses'},pat:[{a:12,nm:'Shushes violently'},{weak:2,vuln:2,nm:'Late fees'},{a:5,x:3,nm:'Throws returns'},{b:14,heal:10,nm:'Re-shelves self'}]},
 member:{n:'Committee Member',hp:28,xp:18,elite:1,art:{s:'box',c:COL.blue,e:2,ex:'tie'},pat:[{a:6,nm:'Motions'},{b:6,nm:'Seconds the motion'},{str:1,a:3,nm:'Forms a subcommittee'}],rnd:1},
 assessor:{n:'The Assessor',hp:230,xp:120,boss:1,art:{s:'assessor',c:COL.paper2,e:4},pat:[{vuln:2,str:1,nm:'Audit'},{a:15,nm:'Red pen'},{a:5,x:3,nm:'Footnotes'},{b:18,nm:'Hides behind policy'},{a:9,weak:2,nm:'Requests clarification'},{a:20,nm:'Denied'}]},
 folded:{n:'Folded Man',hp:46,xp:22,art:{s:'folded',c:'#cfc6b4',e:2},pat:[{a:13,nm:'Unfolds at you'},{b:12,a:5,nm:'Creases'}]},
 lint:{n:'Lint Angel',hp:36,xp:20,art:{s:'cloud',c:'#d9d4e6',e:2,ex:'halo'},pat:[{heal:10,all:1,nm:'Fluffs everyone'},{a:7,x:2,nm:'Static'}]},
 yesterday:{n:'Yesterday',hp:48,xp:22,art:{s:'blob',c:'#e0b36a',e:2,ex:'clock'},pat:[{a:9,weak:2,nm:'Regret'},{a:15,nm:'Happens again'}]},
 tess:{n:'Tessellation',hp:40,xp:21,art:{s:'tri',c:COL.teal,e:3},pat:[{a:5,x:3,nm:'Repeats'},{str:2,b:5,nm:'Repeats bigger'}]},
 owl:{n:'Recursive Owl',hp:34,xp:20,art:{s:'owl',c:'#8a6d4e',e:2},pat:[{a:6,x:2,nm:'Who? Who?'},{vuln:2,a:6,nm:'Asks who is asking'}]},
 echo:{n:'Echo of You',hp:135,xp:70,elite:1,art:{s:'echo',c:COL.purple,e:2},pat:[{a:14,nm:'Does your move'},{a:6,x:3,nm:'Does it again'},{b:15,str:3,nm:'Learns from you'},{weak:2,vuln:2,nm:'Says what you were thinking'}]},
 kraken:{n:'Margin Kraken',hp:145,xp:70,elite:1,art:{s:'kraken',c:COL.red,e:2},pat:[{a:8,x:2,nm:'Doodles at you'},{a:20,nm:'Here be me'},{b:20,nm:'Sinks into the margin'}]},
 blank:{n:'The Great Blank',hp:400,xp:200,boss:1,art:{s:'eye',c:'#ffffff',e:1},pat:[{a:20,strip:1,nm:'Unwrites you'},{weak:3,vuln:3,nm:'Forgets your name'},{a:8,x:3,nm:'White noise'},{b:25,str:3,nm:'Expands'},{a:32,nm:'Nothing, very hard'}]},
 prime:{n:'Inkwright Prime',hp:390,xp:200,boss:1,art:{s:'prime',c:'#1f1b2e',e:3},pat:[{a:14,x:2,nm:'Corrects you'},{b:20,heal:20,nm:'Redrafts'},{vuln:3,a:10,nm:'Draws a box around you'},{a:30,nm:'Final draft'}]},
 ruler:{n:'The Ruler',hp:390,xp:200,boss:1,art:{s:'ruler',c:COL.gold,e:2},pat:[{a:12,x:2,nm:'Straightens you'},{str:4,nm:'Measures twice'},{a:28,nm:'Cuts once'},{b:22,nm:'Stands to attention'}]},
 lastedit:{n:'The Last Edit',hp:400,xp:200,boss:1,art:{s:'edit',c:COL.red,e:2},pat:[{a:16,nm:'Strikethrough'},{weak:2,vuln:2,a:6,nm:'[citation needed]'},{a:7,x:3,nm:'Typos'},{b:20,str:2,nm:'Track changes'},{a:30,nm:'Delete'}]},
 mimic:{n:'Not A Door',hp:60,xp:35,elite:1,art:{s:'door',c:'#8a5a3b',e:2},pat:[{a:9,nm:'Slams'},{a:4,x:2,nm:'Creaks menacingly'},{b:10,nm:'Locks itself'}]},
};
const POOL={1:{n:['gremlin','signpost','wasp','sock','moth'],e:['wolf','scarecrow'],b:'goose'},2:{n:['slug','clerk','smudge','stamp','pigeon'],e:['librarian','committee'],b:'assessor'},3:{n:['folded','lint','yesterday','tess','owl'],e:['echo','kraken']}};
const POT={
 tonic:{n:'Tonic',d:'Heal 20.',col:COL.red},
 fizz:{n:'Fizzy Ink',d:'+2 Energy now.',col:COL.purple},
 thunder:{n:'Bottled Thunder',d:'12 dmg to ALL enemies.',col:COL.gold},
 tea:{n:'Strong Tea',d:'+3 Strength this fight.',col:COL.green},
};
const WEAP=['Stick of Reasonable Length','Survey Pole','Letter Opener','Bent Ruler','Inkfork','Big Compass Needle','Sword, Probably','Stapler (Loaded)','Umbrella of Disagreement','Very Long Pencil','Spoon of Consequence'];
const ARM=['Raincoat','Cardboard Mail','Folded Vest','Bureaucrat Robe','Doodled Plate','Sensible Cardigan','Laminated Tunic','Quilted Opinion'];
const TRK=[
 {n:'Lucky Pebble',crit:6,q:'Smooth. Smug.'},{n:'Rubber Band',dodge:6,q:'Snaps you out of the way.'},
 {n:'Bookmark',post:4,q:'Heals after each fight. Remembers where you were.'},{n:'Pencil Stub',sk:3,q:'Active skills deal more.'},
 {n:'Coupon',shop:15,q:'Expires never. Probably.'},{n:'Goose Feather',dodge:4,gp:6,q:'Stolen. The goose knows.'},
 {n:'Pocket Sun',str:1,q:'Start fights with Strength. Warm.'},{n:'Snail Shell',sb:6,q:'Start fights with Block.'},
 {n:'Small Thundercloud',thorn:3,q:'Zaps whoever hits you.'},{n:'Spare Minute',en:1,epic:1,q:'An extra Energy every turn. Where did it come from?'},
];
const PRE={1:['Sturdy','Keen','Polished','Smudged','Borrowed'],2:['Impossible','Self-Aware','Recently Invented','Load-Bearing','Legendary-ish']};
const RAR=['Common','Rare','Mythic'];const RARC=['#6b5f55',COL.blue,COL.purple];

// ===== EVENTS =====
// choice: {t, req:{b|c|w:n, g:n}, fx(run)=>text}
const EVS=[
 {id:'crossroads',acts:[],title:'The Crossroads of Act II',text:'Three emissaries are waiting where the road splits. An Inkwright with a clipboard. A Blanker with no face. A Margin Folk kid wearing a hat she drew herself. Each one wants you to finish the map their way. Whoever you pick, the others will stop talking to you.',ch:[
  {t:'Side with the Inkwrights: finish the map',fx:r=>{swear(r,'ink');giveItem(r,mkItem(2,1,'armor','Inkwright Coat'));return 'You sign in triplicate. They hand you a very official coat. (Sworn: Inkwrights.)'}},
  {t:'Side with the Blankers: erase it',fx:r=>{swear(r,'blank');r.sp++;return 'The faceless one nods. You feel lighter. +1 skill point. (Sworn: Blankers.)'}},
  {t:'Side with the Margin Folk: draw your own',fx:r=>{swear(r,'folk');heal(r,999);return 'The kid draws you a hat. It is awful. You are fully healed somehow. (Sworn: Margin Folk.)'}},
  {t:'Stay unaligned (+40 gold, +40 XP)',fx:r=>{gain(r,'gold',40);gainXP(r,40);return 'All three look disappointed. You can still change your mind later, if someone asks.'}}]},
 {id:'signpost',acts:[1],title:'A Signpost With Opinions',text:'The signpost points left. Then right. Then, slowly, at you.',ch:[
  {t:'Go where it says',fx:r=>{gain(r,'gold',20);rep(r,'folk',1);return 'It was right, annoyingly. You find 20 gold where it pointed.'}},
  {t:'Argue with it',req:{c:1},fx:r=>{gainXP(r,30);return 'You win the argument on a technicality. +30 XP. It points somewhere else, sulking.'}},
  {t:'Uproot it and carry it',req:{b:1},fx:r=>{giveItem(r,mkItem(r.act,1,'weapon','Signpost (Opinionated)'));return 'It complains the whole time. It hits hard, though.'}},
  {t:'Leave',fx:r=>'You leave. It points at you until you are out of sight.'}]},
 {id:'surveyteam',acts:[1,2],title:'The Inkwright Survey Team',text:'Three people with clipboards are finishing the map. "Hold this end," one says, handing you a measuring tape that goes on forever.',ch:[
  {t:'Help measure (-8 HP)',fx:r=>{hurt(r,8);gain(r,'gold',40);rep(r,'ink',1);return 'You hold the tape for what feels like a week. They pay 40 gold and call you "reliable." The Inkwrights like you.'}},
  {t:'Write down a wrong number on purpose',fx:r=>{gainXP(r,25);rep(r,'blank',1);return 'A small lake is now 4 miles to the left. Somewhere, a Blanker smiles. +25 XP.'}},
  {t:'Leave',fx:r=>'"Typical," says the clipboard.'}]},
 {id:'campfire',acts:[1,2],title:'Blankers at the Campfire',text:'People with no faces are sitting around a fire, painting things white. They wave. You think they are smiling. Hard to say.',ch:[
  {t:'Sit with them',fx:r=>{heal(r,15);rep(r,'blank',1);return 'It is quiet. Very quiet. You feel lighter. Heal 15. The Blankers nod.'}},
  {t:'Draw them faces',req:{w:1},fx:r=>{rep(r,'folk',2);rep(r,'blank',-1);gainXP(r,20);return 'They look at each other for the first time. Some are delighted. Some are furious. The Margin Folk hear about it.'}},
  {t:'Steal their eraser',req:{c:1},fx:r=>{giveItem(r,mkItem(r.act,1,'trinket'));rep(r,'blank',-1);return 'You pocket it. You also pocket something else by accident.'}},
  {t:'Leave',fx:r=>'They paint the spot where you were standing.'}]},
 {id:'market',acts:[1,2,3],title:'The Margin Market',text:'Little sketch-people trade doodles on the edge of the page. One offers to buy a memory. "Just a small one. Your third birthday?"',ch:[
  {t:'Sell a memory (-4 max HP, +1 skill point)',fx:r=>{r.bonusHp-=4;r.sp++;rep(r,'folk',1);fixHp(r);return 'You no longer remember a cake. You feel better at things, though. +1 skill point.'}},
  {t:'Buy a doodle (30 gold)',req:{g:30},fx:r=>{gain(r,'gold',-30);giveItem(r,mkItem(r.act,1));rep(r,'folk',1);return 'The doodle comes to life in your hands and insists on being equipment.'}},
  {t:'Leave',fx:r=>'They wave with hands they drew themselves.'}]},
 {id:'puddle',acts:[1,2,3],title:'A Puddle That Reflects Wrong',text:'Your reflection is a half-second late. Then it stops copying you entirely and holds out its hand.',ch:[
  {t:'Reach in',fx:r=>{if(R()<.55){r.corners++;return 'It hands you a TORN CORNER of the map. It is warm. Your reflection waves goodbye. (Torn Corners: '+r.corners+')'}hurt(r,10);return 'It slaps you. Fair. -10 HP.'}},
  {t:'Swap places',req:{w:2},fx:r=>{r.sp+=2;r.flags.swapped=1;return 'You swap. Everything is mirrored now. You are not sure which of you is reading this. +2 skill points.'}},
  {t:'Wave',fx:r=>'It waves back, a little late. That is fine. Everyone is a little late.'}]},
 {id:'tollnotice',acts:[1],title:'Notice: Goose Toll Ahead',text:'A sign, written in what you hope is ink: "TOLL AHEAD. PAY IN ADVANCE. NO EXCUSES. -THE GOOSE."',ch:[
  {t:'Pay in advance (25 gold)',req:{g:25},fx:r=>{gain(r,'gold',-25);r.flags.goosePaid=1;return 'You drop the coins in the slot. Somewhere ahead, a goose is slightly less furious. (The Goose starts weaker.)'}},
  {t:'Deface the notice',fx:r=>{rep(r,'blank',1);gainXP(r,15);return 'You draw a mustache on the goose. You feel powerful and also watched. +15 XP.'}},
  {t:'Leave',fx:r=>'"NO EXCUSES," the sign repeats, though it did not move.'}]},
 {id:'bridge',acts:[1,2],title:'The Unfinished Bridge',text:'The bridge stops halfway across. Whoever drew it got bored or died. Or both.',ch:[
  {t:'Jump the gap',req:{b:2},fx:r=>{gainXP(r,35);return 'You clear it with room to spare. +35 XP.'}},
  {t:'Jump the gap anyway',fx:r=>{if(R()<.5){gainXP(r,35);return 'You make it! Barely. +35 XP.'}hurt(r,12);return 'You do not make it. You land in a river that is just the word "river." -12 HP.'}},
  {t:'Draw the rest of it',req:{w:1},fx:r=>{rep(r,'folk',1);gainXP(r,40);return 'You draw it badly but confidently. It holds. +40 XP.'}},
  {t:'Go the long way (-10% gold)',fx:r=>{gain(r,'gold',-Math.floor(r.gold*.1));return 'It costs you. It always costs you.'}}]},
 {id:'forms',acts:[2],title:'Department of Roads',text:'A window with a bell. "To travel past here you need Form 27-B. To get Form 27-B you need to have already traveled past here."',ch:[
  {t:'Fill it out anyway (-6 HP)',fx:r=>{hurt(r,6);rep(r,'ink',2);gain(r,'gold',60);return 'Papercuts. So many papercuts. But they stamp it APPROVED and refund you 60 gold for reasons. The Inkwrights approve.'}},
  {t:'Forge a signature',req:{c:2},fx:r=>{giveItem(r,mkItem(r.act,2));return 'Your forgery is better than the original. They give you the good stuff from the back.'}},
  {t:'Set the form on fire',fx:r=>{rep(r,'blank',2);return 'It burns white. The clerk does not stop you. The clerk seems relieved. The Blankers like this.'}}]},
 {id:'street',acts:[2],title:'The Erased Street',text:'Half the street is gone. A kid sits on the curb. "My house was here," he says. "Was it?"',ch:[
  {t:'Redraw it for him',req:{w:2},fx:r=>{rep(r,'folk',2);r.flags.kind=1;heal(r,10);return 'You draw the house. The door is the wrong color. He says it is perfect. You feel better. Heal 10.'}},
  {t:'Help him look',fx:r=>{gainXP(r,30);r.flags.kind=1;return 'You find his house. It was one street over. Everyone forgets something. +30 XP.'}},
  {t:'Tell him the truth',fx:r=>{rep(r,'blank',1);return '"Oh," he says. "Okay." He seems fine. That is the weird part.'}}]},
 {id:'vending',acts:[1,2,3],title:'Vending Machine of Fate',text:'It hums. Every button says "?" except one, which says "NO."',ch:[
  {t:'Insert 20 gold',req:{g:20},fx:r=>{gain(r,'gold',-20);if(R()<.5){givePot(r,pick(Object.keys(POT)));return 'A bottle drops out. It is still fizzing.'}giveItem(r,mkItem(r.act,1));return 'Something that is definitely not a snack drops out.'}},
  {t:'Shake it',req:{b:1},fx:r=>{if(R()<.3){hurt(r,15);return 'It falls on you. Classic. -15 HP.'}givePot(r,pick(Object.keys(POT)));givePot(r,pick(Object.keys(POT)));return 'Two bottles fall out. The machine looks ashamed.'}},
  {t:'Press "NO"',fx:r=>{gainXP(r,10);return 'The machine says "Respect." +10 XP.'}}]},
 {id:'recruitink',acts:[2],cond:r=>!r.sworn,title:'An Inkwright Recruiter',text:'"The map is ALMOST done," she says, tapping a pen. "We need people who finish things. Are you a finisher?"',ch:[
  {t:'Swear to the Inkwrights',fx:r=>{swear(r,'ink');giveItem(r,mkItem(r.act,1,'armor','Inkwright Coat'));return 'You sign. Your signature is now part of the map. They give you a very official coat. (Sworn: Inkwrights. Other factions are now closed to you.)'}},
  {t:'"I am more of a starter"',fx:r=>{gainXP(r,15);return 'She writes that down. "Starter." +15 XP.'}}]},
 {id:'recruitblank',acts:[2],cond:r=>!r.sworn,title:'The Blank Invitation',text:'A blank piece of paper floats up to you. You understand, somehow, that it is an invitation. To nothing. Nothing sounds nice right now.',ch:[
  {t:'Accept the Blank',fx:r=>{swear(r,'blank');r.sp++;return 'You feel lighter. Your shadow gets lighter too. +1 skill point. (Sworn: Blankers. Other factions are now closed to you.)'}},
  {t:'Fold it into a paper plane',fx:r=>{gainXP(r,15);return 'It flies beautifully, into nothing. +15 XP.'}}]},
 {id:'recruitfolk',acts:[2,3],cond:r=>!r.sworn,title:'A Gathering in the Margin',text:'The Margin Folk are having a party in the white space at the edge of the page. Everyone drew their own hat.',ch:[
  {t:'Draw yourself a hat and join',fx:r=>{swear(r,'folk');heal(r,999);return 'Your hat is terrible. Everyone loves it. Full heal. (Sworn: Margin Folk. Other factions are now closed to you.)'}},
  {t:'Just take a snack',fx:r=>{heal(r,12);return 'The snack is a drawing of a snack. It works anyway. Heal 12.'}}]},
 {id:'ghost',acts:[1,2,3],cond:r=>(S.meta.runs||[]).length>0,title:'Your Previous Self',text:'',dyn:1,ch:[
  {t:'Take their stuff',fx:r=>{const g=20+Math.min(80,Math.floor((S.meta.runs[0].score||0)/15));gain(r,'gold',g);return 'They do not mind. They do not have pockets anymore. +'+g+' gold.'}},
  {t:'Ask for advice',fx:r=>{gainXP(r,40);return '"Rank things up," they say. "Do not spread yourself thin. Or do. I am not your mom." +40 XP.'}},
  {t:'Apologize',fx:r=>{heal(r,999);return '"It is fine," they say. "It was a good run. They are all good runs." Full heal.'}}]},
 {id:'door',acts:[2,3],title:'A Door Labeled "Not A Door"',text:'It is standing in the middle of a field. It is clearly a door. The label is very confident.',ch:[
  {t:'Pick the lock',req:{c:3},fx:r=>{r.corners++;gain(r,'gold',30);return 'Behind the not-door: a TORN CORNER and 30 gold. (Torn Corners: '+r.corners+')'}},
  {t:'Knock',fx:r=>{r.pendingFight='mimic';return 'It knocks back. Then it attacks. It was a door AND a liar.'}},
  {t:'Believe the label',fx:r=>{gainXP(r,30);return 'You respect its boundaries. It respects you back. +30 XP.'}}]},
 {id:'narrator',acts:[1,2,3],title:'The Narrator Coughs',text:'"Sorry. This event isn\'t finished yet. There was going to be a dragon? Give me a second."',ch:[
  {t:'Wait patiently',fx:r=>{r.sp++;return '"Thanks for your patience. Have a skill point for your trouble." +1 skill point.'}},
  {t:'Write it yourself',fx:r=>{rep(r,'folk',1);giveItem(r,mkItem(r.act,1));return 'You write a dragon. It is small and gives you an item. Honestly, better than mine.'}},
  {t:'Skip it',fx:r=>'"Rude," says the narrator, quietly.'}]},
 {id:'hiker',acts:[1,2,3],title:'The Lost Hiker',text:'A hiker with a perfect map is completely lost. "The map says I am standing on a lake," she says, standing on grass.',ch:[
  {t:'Give her directions (-15 gold for snacks)',req:{g:15},fx:r=>{gain(r,'gold',-15);gainXP(r,45);rep(r,'folk',1);return 'You share snacks and point her home. +45 XP.'}},
  {t:'Sell her a better map',req:{c:1},fx:r=>{gain(r,'gold',40);rep(r,'blank',1);return 'You sell her a blank page. "This is the honest one," you say. +40 gold.'}},
  {t:'Fix her map',fx:r=>{rep(r,'ink',1);gainXP(r,20);return 'You move the lake. She is grateful. The lake is not. +20 XP.'}}]},
 {id:'fold',acts:[3],title:'Where Two Places Overlap',text:'A kitchen overlaps a forest. A deer is making toast. Neither seems to mind.',ch:[
  {t:'Step into both',fx:r=>{hurt(r,10);giveItem(r,mkItem(r.act,2));return 'You are briefly in two places, which hurts. -10 HP. You bring back something from each.'}},
  {t:'Step into neither',fx:r=>{if(!r.flags.foldC){r.flags.foldC=1;r.corners++;return 'Between them there is a gap, and in the gap a TORN CORNER. (Torn Corners: '+r.corners+')'}return 'The gap is empty this time.'}},
  {t:'Have some toast',fx:r=>{heal(r,25);return 'The deer insists. It is good toast. Heal 25.'}}]},
 {id:'edge',acts:[3],title:'The Edge of the Map',text:'The ground just stops. Past it there is a soft light and the feeling of being looked at by something very big and very tired.',ch:[
  {t:'Look over the edge',fx:r=>{r.corners++;return 'You see a hand holding the world like a phone. The thumb is resting. You wave. You find a TORN CORNER at your feet. (Torn Corners: '+r.corners+')'}},
  {t:'Shout into it',fx:r=>{gainXP(r,50);return 'It shouts back, but nicer. +50 XP.'}},
  {t:'Back away slowly',fx:r=>{heal(r,15);return 'Good call. Heal 15.'}}]},
 {id:'teacloud',acts:[2,3],title:'Tea With a Cloud',text:'A small cloud has set out two cups. It is raining very gently into one of them.',ch:[
  {t:'Drink the rain tea',fx:r=>{heal(r,30);return 'It tastes like a Tuesday. Heal 30.'}},
  {t:'Ask the cloud to come with you',fx:r=>{if(!hasTrk(r,'Small Thundercloud')){giveItem(r,mkItem(r.act,1,'trinket','Small Thundercloud'));return 'It agrees. It has been looking for a reason.'}gainXP(r,30);return 'It says it would rather not. +30 XP for asking.'}}]},
 {id:'statue',acts:[1,2,3],title:'A Statue of Someone Who Never Existed',text:'The plaque reads: "IN HONOR OF ________, WHO DID ________." Someone left a pen.',ch:[
  {t:'Write your own name',fx:r=>{rep(r,'ink',1);gainXP(r,25);return 'The statue changes to look a little like you. Weird. Flattering. +25 XP.'}},
  {t:'Lift weights with it',req:{b:2},fx:r=>{r.bonusAtk=(r.bonusAtk||0)+1;return 'You do three reps. The statue is impressed. Permanent +1 attack.'}},
  {t:'Leave it blank',fx:r=>{rep(r,'blank',1);heal(r,10);return 'Some things should stay blank. Heal 10.'}}]},
];
const ENDINGS={
 back:{t:'The Back of the Map',d:'You put the torn corners together and turn the map over. On the back, in someone else\'s handwriting: a grocery list, a phone number, a doodle of you. It turns out the map was never the important side. You walk off the edge and into the doodle, and it is warm there, and someone is humming.'},
 ink:{t:'The Finished Map',d:'The last line is drawn. Every road goes exactly where it says. Every lake stays put. Nobody gets lost ever again, which is nice, and a little sad, and you are given a small medal that says FINISHER. You wear it every day.'},
 blank:{t:'The Clean Page',d:'Everything goes white, gently, like snow. No roads, no edges, no you. It is not scary. It is how things were before anyone drew anything. Somewhere, somebody picks up a pencil.'},
 folk:{t:'Your Own Handwriting',d:'You draw the rest of the world yourself. The mountains are lopsided. The sun has a face. Everybody gets a hat. It is the worst map anyone has ever made and you have never been happier.'},
 none:{t:'Close Enough',d:'You beat the final boss and stand at the end of the map, which is still unfinished. You decide that is fine. You pull out a snack, sit on the edge, and watch the margins wiggle. Close enough.'},
 dead:{t:'Erased',d:'You fall. The ink runs. Somewhere a new traveler sets out, holding a slightly better pencil.'},
};
