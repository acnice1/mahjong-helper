const {WINDS,TILES,deck,shuffle,tileSVG,tileBack}=window.MahjongTiles;
const $=id=>document.getElementById(id), STORE='mahjong-helper-v1';
const LESSONS=[['Know your tiles','Learn the suits, honour tiles and bonus tiles.'],['Seats & dealer','Assign winds and identify the dealer.'],['Build the wall','Arrange all 144 tiles into four double-high walls.'],['Roll the dice','Use the dice total to choose which wall opens.'],['Break the wall','Count stacks from the right end to find the opening.'],['Deal the tiles','Deal four at a time in East–South–West–North order.'],['Flowers & seasons','Expose bonus tiles and take replacements.']];
const STEPSETS=[[
['Identify the suits','Chinese Mahjong has three numbered suits: Dots (circles), Bamboo (sticks), and Characters (wan). Each runs from 1 to 9.','suits'],
['Recognize the honours','The four winds are East, South, West, and North. The three dragons are Red, Green, and White.','honours'],
['Find the bonus tiles','Traditional 144-tile sets include four flowers and four seasons. These are displayed and replaced rather than held in your hand.','bonus']],
[['Draw wind tiles','Mix one East, South, West and North tile face down. Select each tile to reveal the four wind assignments.','seatdraw'],['Find East','East is the dealer. Select the seat that received East.','east'],['Seat order','Play moves counterclockwise: East (bottom) → South (right) → West (top) → North (left). These winds name seats, not compass directions. Tap South.','south']],
[['Build from the mixed pile','Start with 144 face-down mixed tiles. Tap a side to move six double-high stacks (12 tiles) from the centre to that wall. Build 18 stacks per player.','build'],['Check the complete wall','The four walls form a square: 4 × 18 × 2 = 144 tiles.','builtcheck']],
[['Roll three dice','In our selected 144-tile convention, East rolls three dice. Count the total beginning with East as 1, then South, West, North.','roll'],['Select the wall','Count East → South → West → North, repeating until reaching your dice total. Select that wall.','wallselect']],
[['Choose the wall','Roll and identify the selected wall. East is counted as 1.','breakroll'],['Count stacks','From the chosen wall’s right-hand end (as viewed by its owner), tap the stacks in order, one per count.','count'],['Make the break','The break is immediately after the last counted stack, toward the wall’s left-hand end. Confirm the break.','breakconfirm']],
[['Four tiles at a time','East starts, then South, West and North. Each receives 4 tiles per turn for three circuits (12 each). Select the player to receive the next group.','deal4'],['Finish the deal','After everyone has 12, East takes 2 more tiles; South, West and North each take 1. Select the next recipient.','deal1'],['Check hand sizes','East begins with 14 tiles and discards first. Everyone else starts with 13.','dealcheck']],
[['Identify bonus tiles','A flower or season is placed face-up in front of its owner, not kept in the 13/14-tile concealed hand.','flowerpick'],['Take a replacement','Beginning with East, take a replacement tile from the replacement end of the wall for each exposed flower or season. Repeat if the replacement is another bonus tile.','flowerreplace']]
];
let saved={};try{saved=JSON.parse(localStorage.getItem(STORE))||{}}catch{};
const state={lesson:Math.max(0,Math.min(6,saved.lesson||0)),step:0,done:new Set(saved.done||[]),mode:'guided',sound:!!saved.sound,labels:saved.labels!==false,speed:saved.speed??'1',reduced:!!saved.reduced,stage:{},feedback:'',feedbackType:'',ready:false};
function persist(){localStorage.setItem(STORE,JSON.stringify({lesson:state.lesson,done:[...state.done],sound:state.sound,labels:state.labels,speed:state.speed,reduced:state.reduced}));}
function beep(){if(!state.sound)return;try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(410,a.currentTime);o.frequency.exponentialRampToValueAtTime(210,a.currentTime+.1);g.gain.setValueAtTime(.045,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.11);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.11);o.onended=()=>a.close()}catch{}}
function random(n){return Math.floor(Math.random()*n)+1}
function setup(){state.stage={built:new Set(),buildCounts:{East:0,South:0,West:0,North:0},drawn:new Set(),seatTiles:shuffle([...WINDS]),dice:state.mode==='guided'?[2,3,2]:[],counts:[],selectedWall:null,broken:false,dealIndex:0,hands:[[],[],[],[]],bonusRevealed:false,replaceIndex:0,bonusCount:0,flowerPicked:false,replacementConfirmed:false,diceRolled:false,selectedBonus:new Set(),wallOrder:[],takenStacks:{},drawOrder:[],drawPointer:0,quiz:null,groupsSeen:new Set()};let pack=deck();shuffle(pack);state.stage.deck=pack;state.stage.flowerHand=[TILES.find(t=>t.id==='Flower-Plum'),TILES.find(t=>t.id==='Dots-3'),TILES.find(t=>t.id==='Season-Spring'),TILES.find(t=>t.id==='Bamboo-7')];state.ready=false;state.feedback='';state.feedbackType='';if(state.lesson===5){state.stage.dice=[2,3,2];state.stage.selectedWall='West';state.stage.broken=true;state.stage.built=new Set(WINDS);initializeDealWall(state.stage)}render();}
// The first live tile is immediately on the live side of the opening. The reserved
// end is kept physically separate. Draw positions track actual stacks, not a deck-only counter.
function initializeDealWall(s){
 const total=s.dice.reduce((a,b)=>a+b,0);
 const cut=18-total;
 const start=s.selectedWall||chosenWall();
 const sequence={West:['West','South','East','North'],South:['South','East','North','West'],East:['East','North','West','South'],North:['North','West','South','East']}[start];
 const direction={West:-1,South:1,East:-1,North:1};
 s.drawOrder=[];
 // The selected wall starts just beyond the break; only its live-side stacks are used first.
 const initial=direction[start]===-1?Array.from({length:cut},(_,i)=>cut-1-i):Array.from({length:cut},(_,i)=>i);
 for(const i of initial)s.drawOrder.push([start,i]);
 for(const wall of sequence.slice(1))for(let n=0;n<18;n++)s.drawOrder.push([wall,direction[wall]===-1?17-n:n]);
 s.drawPointer=0;s.takenStacks={};
}
function takeLiveTile(s){
 const pair=s.drawOrder[Math.floor(s.drawPointer/2)];
 if(!pair)return null;
 const key=pair.join(':');s.takenStacks[key]=(s.takenStacks[key]||0)+1;
 s.drawPointer++;
 return s.deck.pop();
}
function step(){return STEPSETS[state.lesson][state.step]}
function stepSatisfied(){
 const s=state.stage,k=step()[2],total=s.dice.reduce((a,b)=>a+b,0);
 switch(k){
 case 'suits':case 'honours':case 'bonus':return targets().every(g=>s.groupsSeen.has(g));
 case 'seatdraw':return s.drawn.size===4;
 case 'build':return WINDS.every(w=>s.buildCounts[w]===18);
 case 'roll':return s.diceRolled===true;
 case 'wallselect':case 'breakroll':return s.selectedWall===chosenWall() && !!s.dice.length;
 case 'count':return s.counts.length===total && total>0;
 case 'breakconfirm':return s.broken===true;
 case 'deal4':return s.dealIndex===12 && s.hands.every(h=>h.length===12);
 case 'deal1':return s.dealIndex===16 && s.hands.every((h,i)=>h.length===(i===0?14:13));
 case 'flowerpick':return s.bonusCount>=2;
 case 'flowerreplace':return s.replacementConfirmed===true;
 default:return false;
 }
}
function refreshNext(){
 const eligible=state.ready||stepSatisfied();
 const btn=$('nextBtn');
 btn.disabled=!eligible;
 btn.textContent=state.step===STEPSETS[state.lesson].length-1?'Complete lesson ✓':'Next →';
 btn.setAttribute('aria-disabled',String(!eligible));
}
function complete(msg){state.ready=true;message(msg,'success');renderControls();refreshNext()}
function message(msg,type='info'){state.feedback=msg;state.feedbackType=type;$('feedback').textContent=msg;$('feedback').className='feedback '+type;}
function wrong(msg){message(msg,'error');beep()}
function setLesson(i){state.lesson=i;state.step=0;persist();setup();}
function next(){if(!(state.ready||stepSatisfied())){wrong('Complete this step first, or use “Show me” for a demonstration.');return;}if(state.step<STEPSETS[state.lesson].length-1){state.step++;state.ready=false;state.stage.groupsSeen=new Set();state.feedback='';state.feedbackType='';render()}else{state.done.add(state.lesson);persist();if(state.lesson<6){setLesson(state.lesson+1)}else{state.step=0;render();complete('All seven Phase 1 lessons completed! You can replay any lesson or try randomized practice.')}}}
function prev(){if(state.step){state.step--;state.ready=false;state.stage.groupsSeen=new Set();render()}else if(state.lesson)setLesson(state.lesson-1)}
function targets(){const k=step()[2];if(k==='suits')return ['Dots','Bamboo','Characters'];if(k==='honours')return ['Winds','Dragons'];return ['Flowers','Seasons']}
function render(){const [title,desc]=LESSONS[state.lesson],st=step();$('lessonCount').textContent=`LESSON ${state.lesson+1} OF 7`;$('lessonTitle').textContent=title;$('lessonSubtitle').textContent=desc;$('stepTag').textContent=`STEP ${state.step+1}`;$('stepProgress').textContent=`${state.step+1} / ${STEPSETS[state.lesson].length}`;$('stepTitle').textContent=st[0];$('stepBody').textContent=st[1];$('tableStatus').textContent=state.lesson===5?`${state.stage.hands.map(a=>a.length).join(' · ')} tiles in hands`:'144 tiles · 4 players';$('nextBtn').textContent=state.step===STEPSETS[state.lesson].length-1?'Complete lesson ✓':'Next →';refreshNext();$('backBtn').disabled=state.step===0;renderList();renderBoard();renderControls();message(state.feedback||'Follow the instructions above. Select a highlighted option or object. ',state.feedbackType||'info');}
function renderList(){$('lessonList').innerHTML=LESSONS.map(([n,d],i)=>`<button class="lesson ${i===state.lesson?'current':''} ${state.done.has(i)?'done':''}" data-lesson="${i}"><span class="number">${state.done.has(i)?'✓':i+1}</span><span><strong>${n}</strong><small>${i===state.lesson?'Learning now':state.done.has(i)?'Completed':'Open lesson'}</small></span></button>`).join('');document.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>setLesson(+b.dataset.lesson));$('progressText').textContent=`${state.done.size} / 7 completed`;$('progressBar').style.width=`${state.done.size/7*100}%`}
function seatXY(w){return state.lesson===5?{East:[410,568],South:[716,568],West:[410,91],North:[106,568]}[w]:{East:[410,568],South:[716,326],West:[410,91],North:[106,326]}[w]}
function seat(w){let [x,y]=seatXY(w),isTop=w==='West';let count=state.stage.hands[WINDS.indexOf(w)]?.length||0;return `<g class="player-seat" data-seat="${w}" tabindex="0" role="button" aria-label="${w} seat"><rect x="${x-61}" y="${y-20}" width="122" height="40" rx="10" fill="#173e31" stroke="#bb9860" stroke-width="2"/><text x="${x}" y="${y-2}" fill="#fff5d9" font-size="15" font-weight="bold" text-anchor="middle">${w}${w==='East'?' ★':''}</text><text x="${x}" y="${y+13}" fill="#d4b983" font-size="11" text-anchor="middle">${state.lesson===5?count+' tiles':w==='East'?'Dealer':isTop?'Opposite':''}</text></g>`}
function stackPosition(w,i){const gap=22,offset=(i-8.5)*gap;return {East:[410+offset,514,0],West:[410-offset,136,0],South:[624,325+offset,90],North:[196,325-offset,90]}[w]}
function svgWall(w){
 const s=state.stage,k=step()[2],built=s.built.has(w),showWall=state.lesson>=2;
 if(!showWall)return '';
 let out='';
 const n=state.lesson===2?(s.buildCounts[w]||0):18;
 const total=s.dice.reduce((a,b)=>a+b,0);
 const cut=18-total;
 // A separated seven-stack replacement/dead-wall section is shown just inside the live wall.
 // In this beginner view we indicate the reserve visually, not a distinct Riichi dead wall.
 const showReserve=s.broken && (state.lesson===4 || state.lesson===5) && w===s.selectedWall;
 for(let i=0;i<n;i++){
  const [baseX,baseY]=stackPosition(w,i);
  const counted=s.counts.includes(i)&&s.selectedWall===w;
  const isTarget=k==='count'&&w===s.selectedWall&&i===17-s.counts.length;
  const reserve=showReserve&&i>=cut;
  const removed=state.lesson===5?(s.takenStacks[w+':'+i]||0):0;
  if(removed>=2)continue;
  const source=state.lesson===5 && s.drawOrder[Math.floor(s.drawPointer/2)]?.join(':')===w+':'+i;
  const inward={East:[0,-32],West:[0,32],South:[-32,0],North:[32,0]}[w];
  const along={East:[0,0],West:[0,0],South:[0,0],North:[0,0]}[w];
  const x=baseX+(reserve?inward[0]:0);
  const y=baseY+(reserve?inward[1]:0);
  out+=`<g class="wall-stack ${counted?'counted':''} ${isTarget?'target':''} ${source?'draw-source':''}" data-stack="${w}:${i}" tabindex="0" role="button" aria-label="${w} wall stack ${18-i}${reserve?' reserved replacement end':''}"><title>${w} stack ${18-i}${reserve?' — replacement reserve':''}</title><g transform="${w==='South'||w==='North'?`rotate(90 ${x} ${y})`:``}">${removed===0?`<rect x="${x-10}" y="${y-9}" width="20" height="20" rx="2" fill="#9fb5a2" stroke="#e4e9d9"/>`:''}<rect x="${x-10}" y="${y-14}" width="20" height="20" rx="2" fill="${counted?'#f2c86f':built||state.lesson>2?'#f4f1e2':'#d5dacd'}" stroke="#e5d8be"/><rect x="${x-8}" y="${y-12}" width="16" height="16" rx="2" fill="${counted?'#e4b751':reserve?'#b59c69':'#5d9077'}" opacity=".8"/></g>${counted?`<text x="${x}" y="${y-18}" text-anchor="middle" fill="#ffecae" font-weight="bold" font-size="14">${s.counts.indexOf(i)+1}</text>`:''}${source?`<circle cx="${x}" cy="${y}" r="17" fill="none" stroke="#ffda63" stroke-width="3" stroke-dasharray="5 3"/><text x="${x}" y="${y-27}" fill="#ffe69a" text-anchor="middle" font-size="12" font-weight="bold">DRAW</text>`:''}</g>`;
 }
 if(showReserve){const [ax,ay]=stackPosition(w,Math.min(17,cut+3));const [dx,dy]={East:[0,-47],West:[0,50],South:[-58,0],North:[58,0]}[w];out+=`<text x="${ax+dx}" y="${ay+dy}" text-anchor="middle" fill="#fff1b7" font-size="12" font-weight="bold">REPLACEMENT END</text>`}
 if(showReserve){
  const [bx,by]=stackPosition(w,Math.max(0,cut-1));
  const shift={East:[0,-55],West:[0,55],South:[-55,0],North:[55,0]}[w];
  const lx=bx+shift[0],ly=by+shift[1];
  out+=`<g class="wall-break-marker"><path d="M${bx},${by} L${lx},${ly}" fill="none" stroke="#ffdd70" stroke-width="3"/><rect x="${lx-34}" y="${ly-27}" width="68" height="23" rx="7" fill="#422918" stroke="#ffdd70"/><text x="${lx}" y="${ly-11}" fill="#fff2bd" text-anchor="middle" font-size="13" font-weight="bold">BREAK</text></g>`;
 }
 return out;
}
function renderBoard(){const s=state.stage;let svg=`<defs><radialGradient id="felt"><stop stop-color="#236c4b"/><stop offset="1" stop-color="#154733"/></radialGradient></defs><rect x="20" y="20" width="780" height="610" rx="26" fill="url(#felt)" stroke="#bf9d5c" stroke-width="3" opacity=".48"/><circle cx="410" cy="325" r="79" fill="#1b583f" stroke="#74a081" opacity=".38" stroke-width="2"/><text x="410" y="328" text-anchor="middle" font-family="Georgia,serif" font-size="25" fill="#e2d3ac" opacity=".24">麻將</text>`;
for(const w of WINDS)svg+=svgWall(w);if(state.lesson!==0)for(const w of WINDS)svg+=seat(w);
const k=step()[2];if(['roll','wallselect','breakroll','count','breakconfirm'].includes(k)){const dice=s.dice.length?s.dice:[1,4,2];svg+=dice.map((n,i)=>die(363+i*47,315,n)).join('');if(s.dice.length)svg+=`<text x="410" y="388" fill="#f9ebc3" text-anchor="middle" font-weight="bold" font-size="17">Total ${s.dice.reduce((a,b)=>a+b,0)}</text>`}
if(state.lesson===1){const show=s.drawn.size;for(let i=0;i<4;i++){const tile=TILES.find(t=>t.id==='Wind-'+s.seatTiles[i]);svg+=`<g data-wind-tile="${i}" role="button" tabindex="0" aria-label="Wind tile ${s.drawn.has(i)?s.seatTiles[i]:'face down'}"><title>${s.drawn.has(i)?s.seatTiles[i]+' wind ('+({East:'東',South:'南',West:'西',North:'北'}[s.seatTiles[i]])+')':'Face-down wind tile — click to reveal'}</title>${s.drawn.has(i)?tileSVG(tile,347+i*42,310,34,48):tileBack(347+i*42,310,34,48)}<rect x="${330+i*42}" y="286" width="34" height="48" opacity="0"/></g>`}svg+=`<text x="410" y="380" text-anchor="middle" fill="#d6e9d8" font-size="14">${show} of 4 revealed</text>`}
if(state.lesson===2){svg+=renderMixedPile(s)}
if(state.lesson===1){svg+=`<path d="M410 525 Q720 520 734 335 Q728 120 430 101 Q105 96 87 318 Q86 528 386 526" stroke="#f3ca79" stroke-width="3" stroke-dasharray="9 9" fill="none" opacity=".65"/><text x="410" y="614" fill="#f7e8bc" text-anchor="middle" font-size="14">Turn order: East → South → West → North ↺</text>`}
if(state.lesson===0){svg+=renderLearningTiles(k)}
if(state.lesson===6){s.flowerHand.forEach((t,i)=>{svg+=`<g data-center-tile="${i}" tabindex="0" role="button">${tileSVG(t,320+i*60,320,47,66)}</g>`})}
if(state.lesson===5){svg+=`<rect x="302" y="273" width="216" height="95" rx="13" fill="#103b2c" stroke="#c5a568"/><text x="410" y="297" fill="#ffde8f" text-anchor="middle" font-size="15" font-weight="bold">OPENING: ${s.selectedWall}</text><text x="410" y="321" fill="#fff0c7" text-anchor="middle" font-size="13">${s.dice.join(' + ')} = ${s.dice.reduce((a,b)=>a+b,0)} · break after stack ${s.dice.reduce((a,b)=>a+b,0)}</text><text x="410" y="345" fill="#d8e5d1" text-anchor="middle" font-size="13">${s.drawPointer} tiles taken from live wall</text>`;WINDS.forEach((w,idx)=>{const c=Math.min(s.hands[idx].length,14);const x=w==='South'?716:w==='North'?106:410;const y=w==='East'?616:w==='West'?44:325;if(w==='East'||w==='West'){for(let j=0;j<c;j++)svg+=tileBack(x+(j-(c-1)/2)*23,y,20,29)}else{for(let j=0;j<c;j++)svg+=tileBack(x,y+(j-(c-1)/2)*29,19,26,90)}})}$('gameBoard').innerHTML=svg;attachBoard()}
// Lesson 1 displays the entire relevant family, generated from the shared tile definitions.
function renderMixedPile(s){const remaining=144-Object.values(s.buildCounts).reduce((sum,n)=>sum+n*2,0);let out=`<text x="410" y="255" fill="#fff1cc" font-size="18" font-weight="bold" text-anchor="middle">MIXED TILES</text>`;const visible=Math.min(remaining,15);for(let i=0;i<visible;i++){const x=348+(i%5)*31,y=289+Math.floor(i/5)*36;out+=tileBack(x,y,23,30,0)}out+=`<rect x="341" y="396" width="138" height="34" rx="12" fill="#0d392d" stroke="#c8ad6c"/><text x="410" y="418" fill="#fff1cc" text-anchor="middle" font-size="17" font-weight="bold">${remaining} tiles left</text>`;return out}
function renderLearningTiles(k){
 const groups=k==='suits'?['Dots','Bamboo','Characters']:k==='honours'?['Winds','Dragons']:['Flowers','Seasons'];
 const subtitles={Dots:'CIRCLES · 1–9',Bamboo:'STICKS · 1–9',Characters:'WAN · 1–9',Winds:'EAST · SOUTH · WEST · NORTH',Dragons:'RED · GREEN · WHITE',Flowers:'FOUR UNIQUE FLOWERS',Seasons:'FOUR UNIQUE SEASONS'};
 const layout=k==='suits'?{top:162,gap:150,w:43,h:61,space:56}:{top:215,gap:175,w:56,h:80,space:91};
 let out=`<rect x="132" y="119" width="556" height="498" rx="17" fill="#0a352a" opacity=".87" stroke="#bd9b59" stroke-width="2"/><text x="410" y="146" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#f1dfb9">${k==='suits'?'The three numbered suits':k==='honours'?'Honour tiles':'Bonus tiles'}</text>`;
 groups.forEach((group,row)=>{
  const tiles=TILES.filter(t=>t.suit===group), y=layout.top+row*layout.gap;
  const seen=state.stage.groupsSeen.has(group);
  out+=`<g data-tile-group="${group}" tabindex="0" role="button" aria-label="Study ${group}" class="learning-group"><rect x="151" y="${y-9}" width="518" height="${k==='suits'?127:145}" rx="12" fill="${seen?'#2a7154':'#20513e'}" stroke="${seen?'#f0d17b':'#638674'}" stroke-width="${seen?2:1}"/><text x="166" y="${y+10}" font-size="15" font-weight="bold" fill="#fff0c8">${group}${seen?' ✓':''}</text><text x="652" y="${y+10}" font-size="10" text-anchor="end" letter-spacing=".6" fill="#c2d6c5">${subtitles[group]}</text>`;
  const cx=410, dx=layout.space, initial=cx-(tiles.length-1)*dx/2;
  tiles.forEach((tile,i)=>{
    const x=initial+i*dx,ty=y+(k==='suits'?54:67);
    out+=tileSVG(tile,x,ty,layout.w,layout.h);
    out+=`<text x="${x}" y="${ty+layout.h/2+16}" font-size="${tiles.length===9?12:11}" text-anchor="middle" fill="#f4e5c4">${tile.number||tile.name.replace(' dragon','')}</text>`;
  });
  out+='</g>';
 });
 return out;
}
function studyGroup(group){
 if(!targets().includes(group))return;
 state.stage.groupsSeen.add(group);beep();renderBoard();renderControls();
 const all=targets().every(g=>state.stage.groupsSeen.has(g));
 if(all)complete(`Excellent! You've explored all ${targets().length} tile families in this step.`);
 else message(`${group} identified. Tap another tile family to explore the rest.`,'success');
}
function die(x,y,n){let pts={1:[[0,0]],2:[[-9,-9],[9,9]],3:[[-9,-9],[0,0],[9,9]],4:[[-9,-9],[9,-9],[-9,9],[9,9]],5:[[-9,-9],[9,-9],[0,0],[-9,9],[9,9]],6:[[-9,-10],[9,-10],[-9,0],[9,0],[-9,10],[9,10]]};return `<g><rect x="${x-19}" y="${y-19}" width="38" height="38" rx="7" fill="#fbf6e8" stroke="#d5d7c5" stroke-width="2"/>${pts[n].map(([dx,dy])=>`<circle cx="${x+dx}" cy="${y+dy}" r="3.4" fill="${n===1?'#b94f45':'#2b4a44'}"/>`).join('')}</g>`}
function attachBoard(){document.querySelectorAll('[data-seat]').forEach(e=>{e.onclick=()=>chooseSeat(e.dataset.seat);e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();chooseSeat(e.dataset.seat)}}});document.querySelectorAll('[data-stack]').forEach(e=>{e.onclick=()=>chooseStack(e.dataset.stack);e.onkeydown=ev=>{if(ev.key==='Enter'){chooseStack(e.dataset.stack)}}});document.querySelectorAll('[data-wind-tile]').forEach(e=>{e.onclick=()=>reveal(+e.dataset.windTile);e.onmouseenter=()=>{const i=+e.dataset.windTile;const known=state.stage.drawn.has(i);$('boardOverlay').textContent=known?`${state.stage.seatTiles[i]} wind · ${({East:'東',South:'南',West:'西',North:'北'})[state.stage.seatTiles[i]]}`:'Click to reveal wind';};e.onmouseleave=()=>$('boardOverlay').textContent='';e.onfocus=e.onmouseenter;e.onblur=e.onmouseleave;e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();reveal(+e.dataset.windTile)}}});document.querySelectorAll('[data-center-tile]').forEach(e=>e.onclick=()=>chooseCenter(+e.dataset.centerTile));document.querySelectorAll('[data-tile-group]').forEach(e=>{e.onclick=()=>studyGroup(e.dataset.tileGroup);e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();studyGroup(e.dataset.tileGroup)}}})}
function chosenWall(){return WINDS[(state.stage.dice.reduce((a,b)=>a+b,0)-1)%4]}
function chooseSeat(w){const s=state.stage,k=step()[2];beep();if(k==='build'){if(s.buildCounts[w]>=18){wrong(`${w}'s wall already has 18 stacks. Select an unfinished side.`);return;}s.buildCounts[w]=Math.min(18,s.buildCounts[w]+6);if(s.buildCounts[w]===18)s.built.add(w);beep();renderBoard();renderControls();const left=144-Object.values(s.buildCounts).reduce((sum,n)=>sum+n*2,0);if(left===0)complete('All 144 tiles moved into four walls: 18 stacks per side, two tiles high.');else message(`${w} now has ${s.buildCounts[w]} of 18 stacks; ${left} loose tiles remain in the middle.`,'info');return}if(k==='east'||k==='south'){if(s.drawn.size<4){wrong('Reveal the four wind tiles first.');return;}const expected=k==='east'?'East':'South';if(w!==expected){wrong(`Not quite. ${expected} is ${k==='east'?'the dealer':'immediately after East in turn order'}. Try the ${expected} seat.`);return;}complete(`${w} is correct! ${k==='east'?'East deals and begins the hand.':'Players follow East → South → West → North.'}`);return}if(k==='wallselect'||k==='breakroll'){if(!s.dice.length){wrong('Roll the dice first.');return}if(w!==chosenWall()){wrong(`Count the dice total, starting with East as 1: East, South, West, North, repeating. Try again.`);return;}s.selectedWall=w;complete(`${w}'s wall is correct. Total ${s.dice.reduce((a,b)=>a+b,0)} selects ${w}.`);renderBoard();return}if(k==='deal4'||k==='deal1'){dealTo(w);return}if(k==='builtcheck'){complete('Yes. Every player has 18 double-high stacks, giving 144 tiles altogether.');return}wrong('This seat is not the interactive target in this step. Read the instruction panel.')}
function reveal(i){if(step()[2]!=='seatdraw')return;state.stage.drawn.add(i);renderBoard();if(state.stage.drawn.size===4)complete('All four wind tiles are revealed. East is the dealer; South follows East, then West and North.');else message(`${state.stage.seatTiles[i]} revealed. Tap the remaining face-down tiles.`,'info')}
function chooseStack(val){const [w,ii]=val.split(':'),i=+ii,s=state.stage,k=step()[2];if(k!=='count'){if(k==='build'){chooseSeat(w)}return}if(w!==s.selectedWall){wrong(`Count on the ${s.selectedWall} wall, not ${w}.`);return}let expected=17-s.counts.length;if(i!==expected){wrong(`Count each stack from the ${w} player's right-hand end. Next is stack ${s.counts.length+1}.`);return}s.counts.push(i);beep();renderBoard();if(s.counts.length===s.dice.reduce((a,b)=>a+b,0)){complete(`Great! You counted ${s.counts.length} stacks. The wall is split just beyond this stack, toward the owner's left.`)}else message(`Counted ${s.counts.length} of ${s.dice.reduce((a,b)=>a+b,0)} stacks. Tap the next stack.`,'info')}
function chooseCenter(i){const k=step()[2];if(k==='flowerpick'){const tile=state.stage.flowerHand[i];if(!['Flowers','Seasons'].includes(tile.suit)){wrong(`${tile.name} is an ordinary tile, not a bonus tile. Try a flower or season.`);return}if(state.stage.selectedBonus.has(i)){wrong('You already selected this bonus tile. Choose the other one.');return}state.stage.selectedBonus.add(i);state.stage.flowerPicked=true;state.stage.bonusCount=state.stage.selectedBonus.size;if(state.stage.bonusCount>=2)complete('Correct: both Plum and Spring are bonus tiles. They are displayed face-up and replaced from the replacement end.');else message('Correct bonus tile. Find the other one.','success')} }
function dealTo(w){
 const s=state.stage,k=step()[2];
 if(k!=='deal4' && k!=='deal1')return;
 const firstPhaseDone=s.hands.every(h=>h.length===12);
 const finalDone=s.hands.every((h,i)=>h.length===(i===0?14:13));
 if(finalDone){message('Dealing is finished. East has 14 tiles and the other players each have 13. Select Next to continue.','success');refreshNext();return;}
 if(k==='deal4' && firstPhaseDone){message('Everyone has 12 tiles. Select Next to give the last tiles.','success');refreshNext();return;}
 if(k==='deal1' && !firstPhaseDone && s.dealIndex<12){wrong('Complete the three circuits of four tiles first.');return;}
 const index=s.dealIndex;
 const expected=WINDS[index%4];
 if(w!==expected){wrong(`${expected} receives the next tiles. The order is East → South → West → North.`);return;}
 const amount=k==='deal4'?4:(w==='East'?2:1);
 const hand=s.hands[WINDS.indexOf(w)];
 const cap=k==='deal4'?12:(w==='East'?14:13);
 if(hand.length+amount>cap){wrong(`${w} already has the permitted number of tiles for this stage.`);return;}
 if(s.drawPointer+amount>s.drawOrder.length*2 || s.deck.length<amount){wrong('There are not enough tiles remaining in the live wall. Restart the lesson.');return;}
 for(let n=0;n<amount;n++)hand.push(takeLiveTile(s));
 s.dealIndex++;
 beep();renderBoard();renderControls();
 if(k==='deal4' && s.hands.every(h=>h.length===12)){
  complete('Stop: all four players have exactly 12 tiles. Select Next for the final allocation.');
 }else if(k==='deal1' && s.hands.every((h,i)=>h.length===(i===0?14:13))){
  complete('Dealing finished: East has 14 tiles; South, West, and North each have 13. No more tiles may be dealt.');
 }else{
  message(`${w} takes ${amount} tile${amount>1?'s':''}. Next: ${WINDS[s.dealIndex%4]}.`,'info');
 }
}

function roll(){const s=state.stage,k=step()[2];if(!['roll','breakroll'].includes(k))return;s.dice=state.mode==='guided'?[2,3,2]:[random(6),random(6),random(6)];s.diceRolled=true;s.selectedWall=null;s.counts=[];renderBoard();const w=chosenWall();if(k==='roll')complete(`Dice: ${s.dice.join(' + ')} = ${s.dice.reduce((a,b)=>a+b,0)}. Count seats East → South → West → North.`);else message(`Total ${s.dice.reduce((a,b)=>a+b,0)}. Which player's wall is selected?`,'info');renderControls()}
function renderControls(){let k=step()[2],s=state.stage,h='';switch(k){case 'suits':case 'honours':case 'bonus':{let choices=targets();h=`<div class="chip">All ${k==='suits'?'27 numbered designs':k==='honours'?'7 honour designs':'8 unique bonus designs'} are displayed on the table. Tap a row of tiles or its button to explore that family.</div><div class="button-grid">${choices.map(g=>`<button data-quiz="${g}" class="${s.groupsSeen.has(g)?'selected':''}">${s.groupsSeen.has(g)?'✓ ':''}${g}</button>`).join('')}</div><div class="instruction-note">${s.groupsSeen.size} of ${choices.length} groups explored. Select each group to unlock Next.</div>`;break}case 'seatdraw':h='<div class="chip">Tap all four face-down wind tiles at the center of the table.</div>';break;case 'east':case 'south':h='<div class="chip">Tap the correct labelled seat on the table.</div>';break;case 'build':h=`<div class="chip">Tap each player position to move 12 tiles (6 stacks) from the shuffled centre pile to their wall.</div><div class="pill-count">${WINDS.map(w=>`<span>${w}: ${s.buildCounts[w]}/18 stacks</span>`).join('')}</div><div class="button-grid">${WINDS.map(w=>`<button data-build="${w}" ${s.buildCounts[w]===18?'disabled':''}>Build ${w} +6</button>`).join('')}</div>`;break;case 'builtcheck':h='<button id="confirmBtn">144 tiles — looks correct!</button>';break;case 'roll':case 'breakroll':h=`<button id="rollBtn">🎲 Roll three dice</button>`;if(s.dice.length)h+=`<div class="big-total">${s.dice.join(' + ')} = ${s.dice.reduce((a,b)=>a+b,0)}</div>`;if(k==='breakroll'&&s.dice.length)h+=`<div class="button-grid">${WINDS.map(w=>`<button data-wall="${w}">${w}</button>`).join('')}</div>`;break;case 'wallselect':h=`<div class="big-total">${s.dice.join(' + ')} = ${s.dice.reduce((a,b)=>a+b,0)}</div><div class="chip">Click the correct seat / wall.</div>`;break;case 'count':h=`<div class="chip">${s.counts.length} / ${s.dice.reduce((a,b)=>a+b,0)} stacks counted. Tap stacks along ${s.selectedWall}'s wall.</div>`;break;case 'breakconfirm':h='<button id="confirmBtn">Open the wall at this break</button>';break;case 'deal4':case 'deal1':h=`<div class="chip">${(k==='deal4'&&s.hands.every(h=>h.length===12))||(k==='deal1'&&s.hands.every((h,i)=>h.length===(i===0?14:13)))?'Dealing for this step is complete. Select Next. ':''}The yellow DRAW marker identifies the next stack on the live side of the BREAK. The separate REPLACEMENT END is not used for ordinary dealing. Next recipient: ${WINDS[s.dealIndex%4]}. Click the appropriate seat.</div><div class="pill-count">${WINDS.map((w,i)=>`<span>${w}: ${s.hands[i].length}</span>`).join('')}</div>`;break;case 'dealcheck':h=`<div class="pill-count">${WINDS.map((w,i)=>`<span>${w}: ${s.hands[i].length} / ${i===0?14:13}</span>`).join('')}</div><button id="confirmBtn" ${s.hands.every((h,i)=>h.length===(i===0?14:13))?'':'disabled'}>Verify final hand sizes ✓</button>`;break;case 'flowerpick':h='<div class="chip">Tap the flower and season tiles shown in the centre.</div>';break;case 'flowerreplace':h='<button id="confirmBtn">Draw replacement tiles from the tail</button>';break}
$('interaction').innerHTML=h;document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>chooseSeat(b.dataset.build));document.querySelectorAll('[data-quiz]').forEach(b=>b.onclick=()=>studyGroup(b.dataset.quiz));document.querySelectorAll('[data-wall]').forEach(b=>b.onclick=()=>chooseSeat(b.dataset.wall));if($('rollBtn'))$('rollBtn').onclick=roll;if($('confirmBtn'))$('confirmBtn').onclick=()=>{if(k==='breakconfirm'){s.broken=true;renderBoard();complete('Correct. The wall opens after the counted stacks. Dealing begins from the live side of the opening.')}else if(k==='flowerreplace'){s.replacementConfirmed=true;complete('Correct. Expose a bonus tile and replace it from the replacement end; repeat for any bonus replacement tiles.');}else if(k==='dealcheck'){if(s.hands.every((h,i)=>h.length===(i===0?14:13)))complete('Correct starting counts: East 14, all others 13.');else wrong('Hand counts are incorrect. Restart this lesson to deal again.')}else complete('Correct! Four complete double-high walls use all 144 tiles.')};refreshNext();}
function hint(){const k=step()[2],s=state.stage;const hints={suits:'Look for numbered Dots, Bamboo and Characters, 1–9 in each.',honours:'Winds are East, South, West, North. Dragons are Red, Green, White.',bonus:'There are eight unique bonus tiles: four flowers and four seasons.',seatdraw:'Tap each of the four tiles at the center of the table.',east:'East (東) is the dealer. Tap East.',south:'Turn order is East, then South, West and North.',build:'Each tap builds six two-high stacks (12 tiles). Complete all 18 stacks on each of the four sides.',roll:'Click the dice button to roll three dice.',wallselect:`Total ${s.dice.reduce((a,b)=>a+b,0)} selects ${chosenWall()}. East counts as 1.`,breakroll:`Total ${s.dice.reduce((a,b)=>a+b,0)} points to ${chosenWall()}.`,count:`Tap stack ${s.counts.length+1}, counting from the wall owner's right end.`,breakconfirm:'The gap goes just after the last counted stack.',deal4:`Give the next four tiles to ${WINDS[s.dealIndex%4]}.`,deal1:`The next player is ${WINDS[s.dealIndex%4]}. East takes 2; others take 1.`,flowerpick:'Plum and Spring are bonus tiles in the center of the board.'};message(hints[k]||'Follow the instruction, then confirm the step.','info')}
function showMe(){const k=step()[2],s=state.stage;if(k==='seatdraw'){s.drawn=new Set([0,1,2,3]);renderBoard();complete('Demonstration: all four wind tiles revealed.')}else if(k==='build'){s.built=new Set(WINDS);s.buildCounts={East:18,South:18,West:18,North:18};renderBoard();renderControls();complete('Demonstration: 144 tiles become four walls, 18 double-high stacks each.')}else if(k==='roll'||k==='breakroll'){roll();if(k==='breakroll'){s.selectedWall=chosenWall();complete(`${s.selectedWall} is selected by the dice.`)}}else if(k==='wallselect'){s.selectedWall=chosenWall();complete(`Demonstration: ${s.selectedWall} is the selected wall.`)}else if(k==='count'){s.counts=Array.from({length:s.dice.reduce((a,b)=>a+b,0)},(_,i)=>17-i);renderBoard();complete('Demonstration: counting from the wall owner’s right-hand end.')}else if(k==='deal4'){while(s.dealIndex<12){let idx=s.dealIndex%4;for(let i=0;i<4;i++)s.hands[idx].push(takeLiveTile(s));s.dealIndex++}renderBoard();complete('Demonstration: all four players now have 12 tiles.')}else if(k==='deal1'){while(s.dealIndex<16){let idx=s.dealIndex%4;for(let i=0;i<(idx===0?2:1);i++)s.hands[idx].push(takeLiveTile(s));s.dealIndex++}renderBoard();complete('Demonstration: East 14; other players 13.')}else if(['suits','honours','bonus'].includes(k)){s.groupsSeen=new Set(targets());renderBoard();renderControls();complete('Demonstration: each tile family has been identified.');}else if(k==='flowerpick'){s.selectedBonus=new Set([0,2]);s.bonusCount=2;complete('Plum and Spring are both bonus tiles.')}else if(k==='east'||k==='south')chooseSeat(k==='east'?'East':'South');else if(k==='breakconfirm'){s.broken=true;renderBoard();complete('Demonstration: gap made after the counted stacks.')}else complete('Demonstration complete. Continue when ready.')}
function reference(){const sections=[['Dots','Circles · 1–9'],['Bamboo','Sticks · 1–9'],['Characters','Wan · 1–9'],['Winds','Four directions'],['Dragons','Three dragons'],['Flowers','Four flowers'],['Seasons','Four seasons']];$('tileReference').innerHTML=sections.map(([key,subtitle])=>`<div class="tile-section"><h3>${key} <span class="muted">— ${subtitle}</span></h3><div class="tiles">${TILES.filter(t=>t.suit===key).map(t=>`<div class="ref-tile"><svg viewBox="-24 -35 48 70" aria-label="${t.name}">${tileSVG(t,0,0,44,61)}</svg><span class="tile-label" style="display:${state.labels?'':'none'}">${t.number||t.name.replace(' dragon','')}</span></div>`).join('')}</div></div>`).join('')}
$('hintBtn').onclick=hint;$('showBtn').onclick=showMe;$('nextBtn').onclick=next;$('backBtn').onclick=prev;$('homeBtn').onclick=()=>{window.scrollTo({top:0,behavior:'smooth'});document.querySelector('.sidebar').scrollIntoView({behavior:'smooth',block:'nearest'})};$('modeSelect').onchange=e=>{state.mode=e.target.value;setup()};$('labelsToggle').checked=state.labels;$('labelsToggle').onchange=e=>{state.labels=e.target.checked;persist();reference()};$('soundBtn').onclick=()=>{state.sound=!state.sound;$('soundBtn').textContent=state.sound?'♫ On':'♪ Off';persist();beep()};$('soundBtn').textContent=state.sound?'♫ On':'♪ Off';$('settingsBtn').onclick=()=>$('settingsDialog').showModal();$('closeSettings').onclick=()=>$('settingsDialog').close();$('speedSelect').value=state.speed;$('speedSelect').onchange=e=>{state.speed=e.target.value;persist()};$('reduceMotion').checked=state.reduced;$('reduceMotion').onchange=e=>{state.reduced=e.target.checked;persist()};$('resetBtn').onclick=()=>{if(confirm('Reset all completed lessons and settings?')){state.done.clear();setLesson(0);persist()}};reference();setup();
