const {WINDS,TILES,deck,shuffle,tileSVG,tileBack}=window.MahjongTiles;
const $=id=>document.getElementById(id), STORE='mahjong-helper-v1';
const LESSONS=[['Know your tiles','Learn the Chinese names, alternate names, suits, honour tiles and bonus tiles.'],['Draw winds & choose dealer','Draw wind tiles, identify East, then place players and trace turn order.'],['Build the wall','Arrange all 144 tiles into four double-high walls.'],['Roll the dice','Use the dice total to choose which wall opens.'],['Break the wall','Count stacks from the right end to find the opening.'],['Deal the tiles','Deal four at a time in East–South–West–North order.'],['Flowers & seasons','Expose bonus tiles and take replacements.'],['Drawing & discarding','Play East’s first discard, follow automated opponents, then draw and discard again.'],['Build sets & pairs','Choose tiles to complete Chows, Pungs, Kongs, and a pair.'],['Claim a discard','Practise when to call Chow, Pung, Kong or Pass on an opponent’s discard.'],['Develop your hand','Choose useful draws and discards with an optional Strategy Coach (牌效率).'],['Complete a winning hand','Solve interactive four-sets-and-a-pair Mahjong puzzles (和牌).'],['Beginner scoring','Recognize simple winning-hand features and bonus combinations.'],['Guided playable hand','Play three full circuits and make your own choices against three automated opponents.']];
// Beginner-oriented Mandarin pinyin; local Cantonese pronunciations and regional aliases vary.
const FAMILY_TERMS={
 Dots:{zh:'筒子',pinyin:'tǒngzi',aliases:'Circles · Coins · Dots',summary:'Numbered circle suit, 1–9. Also called bǐngzi (饼子).'},
 Bamboo:{zh:'索子',pinyin:'suǒzi',aliases:'Bams · Sticks · Bamboo',summary:'Numbered bamboo suit, 1–9. Also called tiáozi (條子). The 1 Bamboo commonly shows a bird.'},
 Characters:{zh:'萬子',pinyin:'wànzi',aliases:'Craks · Wan · Characters',summary:'Numbered character suit, 1–9. 萬 means ten thousand.'},
 Winds:{zh:'風牌',pinyin:'fēngpái',aliases:'Winds · Direction tiles',summary:'Honour tiles showing 東, 南, 西 and 北. They also identify player seats.'},
 Dragons:{zh:'三元牌',pinyin:'sānyuánpái',aliases:'Dragons · Dragon tiles',summary:'Honour tiles: Red (中), Green (發), and White (白 / blank).'},
 Flowers:{zh:'花牌',pinyin:'huāpái',aliases:'Flowers · Bonus tiles',summary:'Four distinct flower tiles, exposed and replaced after dealing.'},
 Seasons:{zh:'季節牌',pinyin:'jìjiépái',aliases:'Seasons · Bonus tiles',summary:'Four distinct season tiles, exposed and replaced after dealing.'}
};
const TILE_TERMS={
 'Wind-East':['東','dōng'], 'Wind-South':['南','nán'],'Wind-West':['西','xī'],'Wind-North':['北','běi'],
 'Dragon-Red':['中','zhōng'],'Dragon-Green':['發','fā'],'Dragon-White':['白','bái'],
 'Flower-Plum':['梅','méi'],'Flower-Orchid':['蘭','lán'],'Flower-Chrysanthemum':['菊','jú'],'Flower-Bamboo':['竹','zhú'],
 'Season-Spring':['春','chūn'],'Season-Summer':['夏','xià'],'Season-Autumn':['秋','qiū'],'Season-Winter':['冬','dōng']
};
const NUMBER_CHINESE=['一','二','三','四','五','六','七','八','九'];
function tileTerm(t){if(t.number){const name=FAMILY_TERMS[t.suit];return `${NUMBER_CHINESE[t.number-1]}${t.suit==='Dots'?'筒':t.suit==='Bamboo'?'索':'萬'} · ${t.number} ${t.suit} (${name.pinyin})`;} const [zh,pinyin]=TILE_TERMS[t.id]||['',''];return `${t.name} · ${zh} (${pinyin})`;}
const STEPSETS=[[
['Identify the suits','Chinese Mahjong has three numbered suits, 1–9 each: Dots / Circles (筒子, tǒngzi), Bamboo / Bams / Sticks (索子, suǒzi), and Characters / Craks / Wan (萬子, wànzi).','suits'],
['Recognize the honours','The winds (風牌, fēngpái) are East 東 (dōng), South 南 (nán), West 西 (xī), and North 北 (běi). Dragons (三元牌, sānyuánpái) are Red 中, Green 發, and White 白 (often blank).','honours'],
['Find the bonus tiles','Traditional sets include Flowers (花牌, huāpái): Plum 梅, Orchid 蘭, Chrysanthemum 菊, Bamboo 竹; and Seasons (季節牌, jìjiépái): Spring 春, Summer 夏, Autumn 秋, Winter 冬. These bonus tiles are exposed and replaced.','bonus']],
[['Draw wind tiles','Four players (A–D) each draw a shuffled wind tile (風牌). Reveal the tiles to learn who gets each wind.','seatdraw'],['Find the dealer','The player holding East (東, dōng) is the dealer (莊家, zhuāngjiā). Select that PLAYER, not a compass direction.','east'],['Seat the players','Place each player at the correct seat. Choose who occupies East (bottom), South (right), West (top), and North (left).','seating'],['Follow turn order','Tap the four seats in play order: East → South → West → North. The arrows trace the counterclockwise play direction.','turnorder']],
[['Build from the mixed pile','Start with 144 shuffled, face-down Mahjong tiles (麻將牌, májiàngpái). Tap a side to move six double-high stacks (12 tiles) from the centre to that wall. Build 18 stacks per player.','build'],['Check the complete wall','The four walls form a square: 4 × 18 × 2 = 144 tiles.','builtcheck']],
[['Roll three dice','In our selected 144-tile convention, East rolls three dice. Count the total beginning with East as 1, then South, West, North.','roll'],['Select the wall','Count East → South → West → North, repeating until reaching your dice total. Select that wall.','wallselect']],
[['Choose the wall','Roll and identify the selected wall. East is counted as 1.','breakroll'],['Count stacks','From the chosen wall’s right-hand end (as viewed by its owner), tap the stacks in order, one per count.','count'],['Make the break','The break is immediately after the last counted stack, toward the wall’s left-hand end. Confirm the break.','breakconfirm']],
[['Four tiles at a time','The dealer (莊家, zhuāngjiā), East, starts; then South, West and North. Each receives 4 tiles per turn for three circuits (12 each). Select the player to receive the next group.','deal4'],['Finish the deal','After everyone has 12, East takes 2 more tiles; South, West and North each take 1. Select the next recipient.','deal1'],['Check hand sizes','East begins with 14 tiles and discards first. Everyone else starts with 13.','dealcheck']],
[['Identify bonus tiles','A Flower (花牌, huāpái) or Season (季節牌, jìjiépái) is placed face-up in front of its owner, not kept in the 13/14-tile concealed hand.','flowerpick'],['Take a replacement','Beginning with East (the dealer, 莊家), take a replacement tile from the replacement end of the wall for each exposed flower or season. Repeat if the replacement is another bonus tile.','flowerreplace']],
[['East discards first','East (莊家, zhuāngjiā) begins with 14 tiles and therefore discards without drawing. Select any tile from your face-up hand to place in East’s discard area.','turn-east-first'],['Follow the other turns','South, West and North each draw one tile from the live wall and discard one tile, counterclockwise. Select Play next opponent to follow the turn order.','turn-opponents'],['Draw a tile as East','Now East has 13 tiles. Draw one tile from the live wall to return to 14. Notice the highlighted DRAW stack and shrinking wall.','turn-east-draw'],['Discard and verify','Choose a tile from East’s 14-tile hand to discard, leaving 13. Then verify that every player has 13 concealed tiles and their discards appear on the table.','turn-east-discard']],
[['Make a Chow (吃, chī)','Select three consecutive tiles from the same numbered suit. A Chow is a sequence, like 3–4–5 Bamboo.','set-chow'],['Make a Pung (碰, pèng)','Select three identical tiles to form a Pung (triplet). Honour tiles can form Pungs too.','set-pung'],['Make a Kong (槓, gàng)','Select four identical tiles to make a Kong (quad). Kongs need a replacement draw during actual play.','set-kong'],['Identify a pair (將, jiàng)','Select two identical tiles. A standard winning hand normally contains four sets and a pair.','set-pair']],
[['Claim a Chow','North just discarded 3 Bamboo. East is next, so East may claim a Chow using 2 and 4 Bamboo. Choose the legal action.','claim-chow'],['When a Chow is not allowed','South discarded 3 Bamboo. East is not next in turn order, so East cannot claim that discard for a Chow. Choose what to do.','claim-pass'],['Claim a Pung','West discarded Red Dragon. East holds two Red Dragons. A Pung may claim a discard from any opponent.','claim-pung'],['Claim a Kong','South discarded 7 Dots. East holds three 7 Dots. An exposed Kong can claim that discard, then requires a replacement draw.','claim-kong'],['Review claim priority','North discards East Wind. East holds two East Winds. Pung can interrupt normal turn order; a Mahjong win, if valid, has higher priority.','claim-priority']],
[['Spot the isolated tile','This hand has several promising sequences and a lone North Wind. Select the discard that preserves the most connected tiles.','strategy-isolated'],['Keep a flexible shape','Which tile should you discard to keep your connected Dots and Bamboo groups intact?','strategy-shapes'],['Preserve a pair','A pair is needed for most standard winning hands. Choose a discard that retains your pair and good sequences.','strategy-pair'],['Compare useful draws','Which draw most directly improves the incomplete Bamboo 4–5 shape?','strategy-draw']],
[['Find the winning tile','Choose the tile that completes a legal four-sets-and-a-pair hand.','win-complete'],['Recognize an invalid hand','Choose whether the presented 14-tile hand is winning.','win-validity'],['Find another winning tile','Identify a useful winning draw from a different incomplete hand.','win-alternative']],
[['Identify a dragon Pung','Select the scoring feature shown in the highlighted winning hand.','score-dragon'],['Recognize a concealed hand','Identify the basic scoring feature in this completed example.','score-concealed'],['Understand bonuses','Recognize the role of Flower and Season bonus tiles.','score-bonus']],
[['Play a guided hand','You are East. Make your own discard decisions, follow three complete circuits of play, and decide when your hand is ready to declare Mahjong. Errors will be explained without giving away the next move.','guided-game']]
];
let saved={};try{saved=JSON.parse(localStorage.getItem(STORE))||{}}catch{};
const state={lesson:Math.max(0,Math.min(LESSONS.length-1,saved.lesson||0)),step:0,done:new Set(saved.done||[]),mode:'guided',sound:!!saved.sound,labels:saved.labels!==false,speed:saved.speed??'1',reduced:!!saved.reduced,stage:{},feedback:'',feedbackType:'',ready:false};
function persist(){localStorage.setItem(STORE,JSON.stringify({lesson:state.lesson,done:[...state.done],sound:state.sound,labels:state.labels,speed:state.speed,reduced:state.reduced}));}
function beep(){if(!state.sound)return;try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(410,a.currentTime);o.frequency.exponentialRampToValueAtTime(210,a.currentTime+.1);g.gain.setValueAtTime(.045,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.11);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+.11);o.onended=()=>a.close()}catch{}}
function random(n){return Math.floor(Math.random()*n)+1}
function setup(){state.stage={built:new Set(),buildCounts:{East:0,South:0,West:0,North:0},drawn:new Set(),seatTiles:shuffle([...WINDS]),dice:state.mode==='guided'?[2,3,2]:[],counts:[],selectedWall:null,broken:false,dealIndex:0,hands:[[],[],[],[]],bonusRevealed:false,replaceIndex:0,bonusCount:0,flowerPicked:false,replacementConfirmed:false,diceRolled:false,selectedBonus:new Set(),seatProgress:0,orderProgress:0,wallOrder:[],takenStacks:{},drawOrder:[],drawPointer:0,quiz:null,groupsSeen:new Set()};let pack=deck();shuffle(pack);state.stage.deck=pack;state.stage.flowerHand=[];state.ready=false;state.feedback='';state.feedbackType='';if(state.lesson===5){state.stage.dice=[2,3,2];state.stage.selectedWall='West';state.stage.broken=true;state.stage.built=new Set(WINDS);initializeDealWall(state.stage)}if(state.lesson===6)setupFlowerHands(state.stage);if(state.lesson===7)setupTurnLesson(state.stage);if(state.lesson===8||state.lesson===9)setupMeldLesson(state.stage);if(state.lesson===10)setupStrategyLesson(state.stage);if(state.lesson===11||state.lesson===12)setupWinningLesson(state.stage);if(state.lesson===13)setupGuidedGame(state.stage);render();}
// Lesson 7 begins after a full deal. East has 14 tiles, the other seats 13.
// Two bonus tiles are deliberately placed in East's hand so the learner can find them.
function setupFlowerHands(s){
 s.dice=[2,3,2];s.selectedWall='West';s.broken=true;s.built=new Set(WINDS);
 initializeDealWall(s);
 const stock=deck();shuffle(stock);
 function pull(id){const i=stock.findIndex(t=>t.id===id);return i<0?null:stock.splice(i,1)[0]}
 const eastIds=['Dots-1','Dots-2','Flower-Plum','Dots-3','Bamboo-3','Bamboo-4','Bamboo-5','Characters-2','Characters-3','Characters-4','Season-Spring','Wind-East','Wind-East','Dragon-Red'];
 s.hands[0]=eastIds.map(pull);
 // Opponent tiles are drawn from the remaining stock, keeping the sample tile set consistent.
 for(let i=1;i<4;i++)s.hands[i]=stock.splice(0,13);
 s.flowerHand=s.hands[0];
 s.deck=stock;
 s.drawPointer=53; // 14 + 13 + 13 + 13 tiles already distributed
 for(let n=0;n<53;n++){const pair=s.drawOrder[Math.floor(n/2)];if(pair){const key=pair.join(':');s.takenStacks[key]=(s.takenStacks[key]||0)+1;}}
 s.flowerExposed=[];
}
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
// Phase 2A: one set of tile objects is moved from stock → hands → discard piles.

// Phase 3B guided hand: every physical tile is a unique object in exactly one zone.
// A prescribed winning draw is deliberately placed fourth in the live-wall draw order.
const GAME_WIN_IDS=['Dots-1','Dots-2','Dots-3','Bamboo-2','Bamboo-3','Bamboo-4','Characters-6','Characters-7','Characters-8','Dragon-Red','Dragon-Red','Dragon-Red','Wind-East','Wind-East'];
function setupGuidedGame(s){
 s.dice=[2,3,2];s.selectedWall='West';s.broken=true;s.built=new Set(WINDS);initializeDealWall(s);
 const all=shuffle(deck().map((t,i)=>({...t,uid:i})));
 const take=id=>{const ix=all.findIndex(t=>t.id===id);if(ix<0)throw Error('Missing physical tile: '+id);return all.splice(ix,1)[0]};
 // Three East discards before a third East draw completes four sets and a pair.
 // Deliberate but undisclosed exercise: retain the connected hand; discard isolated tiles.
 const east=GAME_WIN_IDS.filter((id,i)=>i!==2).map(take);
 east.push(take('Dots-9'));
 const winningDraw=take('Dots-3');
 const others=[[],[],[]];for(let i=0;i<3;i++)for(let j=0;j<13;j++){
  const ix=all.findIndex(t=>!['Flowers','Seasons'].includes(t.suit));others[i].push(all.splice(ix,1)[0]);
 }
 // Ordered draws: three opponent draws then East, repeated for three complete circuits.
 // Early East draws are distinct isolated honour tiles; the third draw completes Mahjong.
 const eastDraws=[take('Wind-North'),take('Dragon-Green'),winningDraw];
 const first=[];for(let circuit=0;circuit<3;circuit++){
  for(let i=0;i<3;i++){
   const ix=all.findIndex(t=>!['Flowers','Seasons'].includes(t.suit));first.push(all.splice(ix,1)[0]);
  }
  first.push(eastDraws[circuit]);
 }
 const reserve=all.splice(all.length-14,14),live=[...first,...all];
 s.game={hands:[east,...others],discards:[[],[],[],[]],melds:[[],[],[],[]],live,reserve,exposed:[],phase:'discard',turn:0,round:1,won:false,coach:false,xray:false,drawCount:0,log:['East begins with 14 tiles. Choose a discard to start play.']};
 s.hands=s.game.hands;s.discards=s.game.discards;s.drawPointer=53;s.takenStacks={};
 for(let n=0;n<53;n++){const pair=s.drawOrder[Math.floor(n/2)];if(pair){const key=pair.join(':');s.takenStacks[key]=(s.takenStacks[key]||0)+1;}}
 assertGameInventory(s.game);
}
function assertGameInventory(g){const zones=[...g.hands,...g.discards,...g.melds.flatMap(p=>p),g.live,g.reserve,g.exposed],flat=zones.flat();if(flat.length!==144||new Set(flat.map(t=>t.uid)).size!==144)throw Error('Tile inventory mismatch: '+flat.length+' tiles');}
function gameWallDraw(){const s=state.stage,g=s.game;if(!g.live.length){g.phase='draw-end';return null;}const t=g.live.shift(),pair=s.drawOrder[Math.floor(s.drawPointer/2)];if(pair){const key=pair.join(':');s.takenStacks[key]=(s.takenStacks[key]||0)+1;}s.drawPointer++;g.drawCount++;return t;}
function guidedDiscard(index){
 const g=state.stage.game;if(!g||g.phase!=='discard')return;
 const t=g.hands[0][index];if(!t)return;
 // Let learners choose. Check hand preservation, not an explicitly named tile.
 if(!['Dots-9','Wind-North','Dragon-Green'].includes(t.id)){
  wrong(`You selected ${t.name}. You may discard it in a real game, but this exercise focuses on keeping useful groups together. That choice would break a completed set or your pair. Look for a tile that is not helping those combinations, or ask the Strategy Coach.`);
  return;
 }
 g.hands[0].splice(index,1);g.discards[0].push(t);g.phase='opponents';g.turn=1;
 g.log.push(`East discarded ${t.name}. The next player is South.`);
 assertGameInventory(g);beep();renderBoard();renderControls();message('Your discard preserves the useful groups in your hand.','success');
}
function guidedOpponents(){
 const g=state.stage.game;if(!g||g.phase!=='opponents')return;
 const i=g.turn,t=gameWallDraw();if(!t)return;
 g.hands[i].push(t);const discarded=g.hands[i].pop();g.discards[i].push(discarded);
 g.log.push(`${WINDS[i]} drew and discarded ${discarded.name}.`);g.turn++;
 if(g.turn===4){g.turn=0;g.phase='draw';g.log.push('The turn has returned to East.');}
 assertGameInventory(g);beep();renderBoard();renderControls();message(g.log.at(-1),'success');
}
function guidedDraw(){
 const g=state.stage.game;if(!g||g.phase!=='draw')return;
 const t=gameWallDraw();if(!t)return;
 g.hands[0].push(t);
 const valid=validStandardHand(g.hands[0].map(tile=>tile.id));
 g.phase='decide';g.log.push(`East drew ${t.name}. Check your hand and decide what to do.`);
 g.canWin=valid;
 assertGameInventory(g);beep();renderBoard();renderControls();message(g.log.at(-1),'info');
}
function guidedContinue(){
 const g=state.stage.game;if(!g||g.phase!=='decide')return;
 if(g.canWin){wrong('Your hand is already complete. Look for four sets and a pair, then declare Mahjong.');return;}
 if(g.round>=3){wrong('The scenario has reached its last circuit. Review your hand before continuing.');return;}
 g.round++;g.phase='discard';g.log.push(`Circuit ${g.round}: select a tile from your 14-tile hand to discard.`);
 renderBoard();renderControls();message('Look for a discard that preserves your sets and pair.','info');
}
function guidedWin(){
 const g=state.stage.game;if(!g||!['decide','discard'].includes(g.phase))return;
 if(g.round<3){wrong('Keep playing: you have not yet completed three full circuits of the table.');return;}
 if(!validStandardHand(g.hands[0].map(t=>t.id))){wrong('Not Mahjong yet. Try to organize your tiles into four sets and a pair, or use the Strategy Coach.');return;}
 g.phase='won';g.won=true;assertGameInventory(g);beep();renderBoard();renderControls();complete('Mahjong! You completed three circuits, then formed four sets and a pair: 1–2–3 Dots, 2–3–4 Bamboo, 6–7–8 Characters, Red Dragon Pung, and East Wind pair.');
}
function guidedHint(){
 const g=state.stage.game;if(!g)return '';
 if(g.phase==='discard')return 'Look for isolated tiles. Try to preserve your three sequences, a triplet and a pair; look for an unpaired tile that does not support those groups.';
 if(g.phase==='opponents')return 'Follow the other players counterclockwise: South, West, then North.';
 if(g.phase==='draw')return 'Draw from the live wall when your turn comes around.';
 if(g.phase==='decide')return g.canWin?'Count your sets and pair. A completed hand can declare Mahjong.':'You are not ready to win yet. Continue the hand, then choose a discard that preserves promising combinations.';
 return g.won?'You have completed this hand.':'Examine the current hand and turn indicator.';
}
function guidedShowMe(){
 const g=state.stage.game;if(!g)return;
 if(g.phase==='discard'){const i=g.hands[0].findIndex(t=>['Dots-9','Wind-North','Dragon-Green'].includes(t.id));guidedDiscard(i);}
 else if(g.phase==='opponents')guidedOpponents();else if(g.phase==='draw')guidedDraw();
 else if(g.phase==='decide'){if(g.canWin)guidedWin();else guidedContinue();}
 else message('Guided hand complete.','success');
}
function guidedControls(s){
 const g=s.game,counts=g.hands.map(h=>h.length);
 const label={discard:'Select one tile from your hand to discard.',opponents:`${WINDS[g.turn]} is taking a turn.`,draw:'Your turn: draw from the live wall.',decide:'Examine your hand. Do you have Mahjong, or should play continue?',won:'Mahjong! Your winning hand is complete.'}[g.phase]||'Follow the table';
 return `<div class="chip"><strong>${label}</strong><span style="margin-left:8px">Circuit ${g.round} of 3</span></div><div class="pill-count">${WINDS.map((w,i)=>`<span>${w}: ${counts[i]} concealed · ${g.discards[i].length} discarded</span>`).join('')}<span>Live wall: ${g.live.length} · Replacement end: ${g.reserve.length}</span></div><div class="button-grid">${g.phase==='opponents'?'<button id="guidedOpponents">▶ Play next opponent</button>':''}${g.phase==='draw'?'<button id="guidedDraw">Draw from live wall</button>':''}${g.phase==='decide'?'<button id="guidedWin">Declare Mahjong · 和牌</button><button id="guidedContinue">Continue playing</button>':''}<button id="guidedCoach">${g.coach?'Hide':'Show'} Strategy Coach</button><button id="guidedXray">${g.xray?'Hide':'Reveal'} opponents (X-ray)</button></div>${g.coach?`<div class="instruction-note">${guidedHint()}</div>`:''}<div class="instruction-note">${g.log.slice(-3).join('<br>')}</div>`;
}
function renderGuidedGame(s){const g=s.game;if(!g)return '';let o='';const hand=g.hands[0].map((t,i)=>({t,i})).sort((a,b)=>tileSort(a.t,b.t));const gap=34,start=410-(hand.length-1)*gap/2;
 hand.forEach(({t,i},j)=>{const x=start+j*gap,y=569;o+=`<g data-guided-tile="${i}" tabindex="0" role="button" aria-label="Discard ${t.name}"><title>${tileTerm(t)}</title>${tileSVG(t,x,y,30,43)}</g>`});o+=`<text x="410" y="609" text-anchor="middle" fill="#f9e4af" font-size="13">EAST ★ ${g.hands[0].length} tiles · ${g.phase==='discard'?'TAP TO DISCARD':''}</text>`;
 [{i:2,x:410,y:67,vert:false},{i:3,x:91,y:323,vert:true},{i:1,x:729,y:323,vert:true}].forEach(p=>{const tiles=g.hands[p.i];tiles.forEach((t,j)=>{const d=(j-(tiles.length-1)/2)*21,x=p.x+(p.vert?0:d),y=p.y+(p.vert?d:0);o+=g.xray?tileSVG(t,x,y,19,28,p.vert?90:0):tileBack(x,y,19,28,p.vert?90:0)});o+=`<text x="${p.x}" y="${p.i===2?24:115}" text-anchor="middle" fill="#f8dfa5" font-size="12">${WINDS[p.i]}: ${tiles.length}</text>`});
 [[410,437],[550,325],[410,214],[270,325]].forEach(([cx,cy],i)=>{g.discards[i].forEach((t,j)=>o+=tileSVG(t,cx+j*34,cy,30,42))});
 o+=`<rect x="323" y="270" width="174" height="105" rx="12" fill="#103b2c" stroke="#c5a568"/><text x="410" y="293" text-anchor="middle" font-size="15" font-weight="bold" fill="#ffe09b">${g.won?'MAHJONG · 和牌':'TURN · '+WINDS[g.turn]}</text><text x="410" y="316" text-anchor="middle" font-size="13" fill="#f6f0d8">Live wall: ${g.live.length} tiles</text><text x="410" y="337" text-anchor="middle" font-size="12" fill="#f6f0d8">Replacement end: ${g.reserve.length} tiles</text><text x="410" y="357" text-anchor="middle" font-size="12" fill="#f1cf87">${g.phase==='decide'?'Check your hand':'Circuit '+g.round+' of 3'}</text>`;
 return o;
}

// The live wall display derives its depletion exclusively from the shared draw pointer.
function setupTurnLesson(s){
 s.dice=[2,3,2];s.selectedWall='West';s.broken=true;s.built=new Set(WINDS);
 initializeDealWall(s);
 const stock=deck().filter(t=>!['Flowers','Seasons'].includes(t.suit));shuffle(stock);
 // The example is deliberately free of bonus tiles, so replacements do not obscure the turn lesson.
 s.hands=Array.from({length:4},()=>[]);
 for(let round=0;round<13;round++)for(let i=0;i<4;i++)s.hands[i].push(stock.shift());
 s.hands[0].push(stock.shift());
 s.deck=stock;s.drawPointer=53;
 s.takenStacks={};
 for(let n=0;n<53;n++){const pair=s.drawOrder[Math.floor(n/2)];if(pair){let key=pair.join(':');s.takenStacks[key]=(s.takenStacks[key]||0)+1;}}
 s.discards=[[],[],[],[]];s.turnSeat=0;s.opponentsPlayed=0;s.drawnThisTurn=false;
}
function tileSort(a,b){const order=['Dots','Bamboo','Characters','Winds','Dragons','Flowers','Seasons'];return order.indexOf(a.suit)-order.indexOf(b.suit)||(a.number||0)-(b.number||0)||a.name.localeCompare(b.name)}
function discardFromEast(i){
 const s=state.stage,k=step()[2];if(!['turn-east-first','turn-east-discard'].includes(k))return;
 if(s.hands[0].length!==14){wrong('East needs 14 tiles before discarding.');return;}
 const [t]=s.hands[0].splice(i,1);if(!t)return;s.discards[0].push(t);beep();renderBoard();renderControls();
 if(k==='turn-east-first'){s.turnSeat=1;complete(`${t.name} discarded. East now has 13 tiles. South is next.`)}
 else {s.turnSeat=1;complete(`${t.name} discarded. All hands now have 13 concealed tiles; the discard areas show the turn history.`)}
}
function playOpponent(){const s=state.stage;if(step()[2]!=='turn-opponents')return;
 const i=s.opponentsPlayed+1;if(i>3)return;
 if(s.hands[i].length!==13){wrong('Unexpected opponent hand size. Restart the lesson.');return;}
 const drawn=takeLiveTile(s);if(!drawn){wrong('The live wall is empty.');return;}
 s.hands[i].push(drawn);const discardIndex=state.mode==='practice'?Math.floor(Math.random()*14):13;
 const [out]=s.hands[i].splice(discardIndex,1);s.discards[i].push(out);
 s.opponentsPlayed++;s.turnSeat=(i+1)%4;beep();renderBoard();renderControls();
 if(s.opponentsPlayed===3)complete('South, West and North each drew and discarded one tile. It is East’s turn again.');
 else message(`${WINDS[i]} drew from the wall and discarded ${out.name}. Next: ${WINDS[i+1]}.`,'success');
}
function drawForEast(){const s=state.stage;if(step()[2]!=='turn-east-draw'||s.drawnThisTurn)return;
 if(s.hands[0].length!==13){wrong('East must have 13 tiles before drawing.');return;}
 const t=takeLiveTile(s);if(!t){wrong('No tiles remain on the live wall.');return;}
 s.hands[0].push(t);s.drawnThisTurn=true;beep();renderBoard();renderControls();complete(`East drew ${t.name}. East now has 14 tiles. Choose one to discard next.`);
}
function renderTurnLesson(s){
 let out='';
 const totalDiscard=s.discards.reduce((sum,a)=>sum+a.length,0);
 // East hand: 14 at most, displayed as a single uncluttered SVG row.
 const sorted=s.hands[0].map((tile,i)=>({tile,i})).sort((a,b)=>tileSort(a.tile,b.tile));
 const gap=35, start=410-(sorted.length-1)*gap/2;
 sorted.forEach(({tile,i},j)=>{const x=start+j*gap;out+=`<g data-turn-tile="${i}" tabindex="0" role="button" aria-label="Discard ${tile.name}"><title>${tile.name} — click to discard</title>${tileSVG(tile,x,564,31,43)}</g>`});
 out+=`<text x="410" y="606" fill="#f8dfa5" text-anchor="middle" font-size="13">EAST · YOUR HAND (${s.hands[0].length})</text>`;
 const seats=[['East',410,465,0],['South',736,325,1],['West',410,61,2],['North',84,325,3]];
 for(const [w,x,y,i] of seats){
  if(i!==0){const n=s.hands[i].length;for(let j=0;j<n;j++){
   if(i===2)out+=tileBack(x+(j-(n-1)/2)*24,y,20,29);
   else out+=tileBack(x,y+(j-(n-1)/2)*29,19,26,90);
  }}
  const pile=s.discards[i];const center={East:[410,432],South:[544,325],West:[410,217],North:[277,325]}[w];
  pile.forEach((t,j)=>{const cx=center[0]+(i===1?-j*34:i===3?j*34:j*34),cy=center[1];out+=tileSVG(t,cx,cy,30,41)});
  if(i!==0)out+=`<text x="${x}" y="${i===2?18:120}" text-anchor="middle" fill="#ffefbe" font-size="12">${w}: ${s.hands[i].length} tiles</text>`;
 }
 out+=`<rect x="334" y="282" width="152" height="87" rx="11" fill="#123a2e" stroke="#c4a36c"/><text x="410" y="303" fill="#f6d991" text-anchor="middle" font-size="14" font-weight="bold">TURN: ${WINDS[s.turnSeat]}</text><text x="410" y="325" fill="#f8efd9" text-anchor="middle" font-size="12">${s.drawPointer} wall tiles used</text><text x="410" y="345" fill="#f8efd9" text-anchor="middle" font-size="12">${totalDiscard} discarded</text>`;
 return out;
}
function takeLiveTile(s){
 const pair=s.drawOrder[Math.floor(s.drawPointer/2)];
 if(!pair)return null;
 const key=pair.join(':');s.takenStacks[key]=(s.takenStacks[key]||0)+1;
 s.drawPointer++;
 return s.deck.pop();
}

// Phase 2B: deterministic, repeatable tile-selection and discard-claim exercises.
// Scenarios operate on the same authentic tile SVG data as the reference and lessons.
const MELD_EXERCISES={
 'set-chow':{instruction:'Find a consecutive 3–4–5 Bamboo sequence (索子).',ids:['Bamboo-3','Dots-3','Bamboo-4','Bamboo-5','Characters-5','Bamboo-8'],correct:[0,2,3],required:3},
 'set-pung':{instruction:'Make a Pung of three Red Dragons (中).',ids:['Dragon-Red','Wind-East','Dragon-Green','Dragon-Red','Dragon-Red','Wind-North'],correct:[0,3,4],required:3},
 'set-kong':{instruction:'Make a Kong with four identical 7 Dots (七筒).',ids:['Dots-7','Dots-9','Dots-7','Bamboo-7','Dots-7','Dots-7'],correct:[0,2,4,5],required:4},
 'set-pair':{instruction:'Find the pair of East Winds (東).',ids:['Wind-South','Wind-East','Dragon-White','Wind-North','Wind-East','Wind-West'],correct:[1,4],required:2}
};
const CLAIM_EXERCISES={
 'claim-chow':{from:'North',discard:'Bamboo-3',hand:['Bamboo-2','Bamboo-4','Dots-8','Wind-East','Characters-1'],choices:['Chow','Pung','Kong','Pass'],correct:'Chow',prompt:'North (the immediately previous player) discarded 3 Bamboo. East has 2 and 4 Bamboo. What can East call?',explain:'Correct. East may Chow North’s discard to make 2–3–4 Bamboo. The claimed Chow is exposed and East must discard.'},
 'claim-pass':{from:'South',discard:'Bamboo-3',hand:['Bamboo-2','Bamboo-4','Dots-8','Wind-East','Characters-1'],choices:['Chow','Pung','Kong','Pass'],correct:'Pass',prompt:'South discarded 3 Bamboo. East has 2 and 4 Bamboo, but South is not immediately before East. Can East Chow?',explain:'Correct. Pass: a Chow normally only claims the discard from the player immediately before you (North for East).'},
 'claim-pung':{from:'West',discard:'Dragon-Red',hand:['Dragon-Red','Bamboo-4','Dragon-Red','Dots-8','Characters-2'],choices:['Chow','Pung','Kong','Pass'],correct:'Pung',prompt:'West discards Red Dragon (中). East has two Red Dragons. What valid set claim can East make?',explain:'Correct. East can call Pung from any opponent, exposes the three identical dragons, and then discards.'},
 'claim-kong':{from:'South',discard:'Dots-7',hand:['Dots-7','Dots-7','Wind-East','Dots-7','Characters-2'],choices:['Chow','Pung','Kong','Pass'],correct:'Kong',prompt:'South discards 7 Dots. East holds three copies of 7 Dots. Which four-of-a-kind call is available?',explain:'Correct. East may call an exposed Kong using the discarded tile and its three matching tiles, then draw a replacement tile before discarding.'},
 'claim-priority':{from:'North',discard:'Wind-East',hand:['Wind-East','Bamboo-4','Wind-East','Dots-8','Characters-2'],choices:['Chow','Pung','Kong','Pass'],correct:'Pung',prompt:'North discards East Wind (東). East holds two East Winds. Which set claim is legal?',explain:'Correct. A Pung can use a discard from any player and interrupts turn order. A valid Mahjong win takes precedence over meld claims.'}
};
function setupMeldLesson(s){s.exerciseSelected=new Set();s.exerciseCorrect=false;s.built=new Set(WINDS);s.dice=[2,3,2];s.selectedWall='West';s.broken=true;initializeDealWall(s);s.drawPointer=53;for(let n=0;n<53;n++){const pair=s.drawOrder[Math.floor(n/2)];if(pair){const key=pair.join(':');s.takenStacks[key]=(s.takenStacks[key]||0)+1;}}}
function selectExerciseTile(i){const k=step()[2],ex=MELD_EXERCISES[k],s=state.stage;if(!ex||s.exerciseCorrect)return;if(i<0||i>=ex.ids.length)return;if(s.exerciseSelected.has(i))s.exerciseSelected.delete(i);else s.exerciseSelected.add(i);beep();renderBoard();renderControls();}
function checkSet(){const k=step()[2],ex=MELD_EXERCISES[k],s=state.stage;if(!ex||s.exerciseCorrect)return;const actual=[...s.exerciseSelected].sort((a,b)=>a-b).join(','),expected=[...ex.correct].sort((a,b)=>a-b).join(',');if(actual!==expected){wrong(`Not quite. You selected ${s.exerciseSelected.size} tile(s). ${ex.instruction} Try again or use Hint.`);return;}s.exerciseCorrect=true;beep();renderBoard();renderControls();complete(`${k==='set-chow'?'Chow — three consecutive tiles from one suit':k==='set-pung'?'Pung — three identical tiles':k==='set-kong'?'Kong — four identical tiles, followed by a replacement draw':'Pair — two identical tiles'}. Correct!`);}
function chooseClaim(choice){const k=step()[2],ex=CLAIM_EXERCISES[k],s=state.stage;if(!ex||s.exerciseCorrect)return;if(choice!==ex.correct){wrong(`Not in this example. ${choice==='Chow'?'A Chow can only claim the immediately preceding player’s discard and requires matching consecutive suited tiles.':choice==='Kong'?'A Kong requires three matching tiles already in your hand.':choice==='Pung'?'A Pung needs two identical tiles in hand.':'Look for an available legal claim.'}`);return;}s.exerciseCorrect=true;s.claimed=choice==='Pass'?null:{type:choice,from:ex.from,discard:ex.discard};beep();renderBoard();renderControls();complete(ex.explain);}
function renderMeldLesson(s,k){let o='';const isSet=!!MELD_EXERCISES[k];const ex=isSet?MELD_EXERCISES[k]:CLAIM_EXERCISES[k];if(!ex)return '';o+=`<rect x="169" y="198" width="482" height="271" rx="17" fill="#0b372b" stroke="#c6a56c" stroke-width="2"/><text x="410" y="231" text-anchor="middle" font-size="20" font-weight="bold" fill="#ffe2a0">${isSet?'BUILD THE SET · 組牌':'CLAIM A DISCARD · 吃碰槓'}</text>`;if(isSet){o+=`<text x="410" y="262" text-anchor="middle" font-size="13" fill="#dfecdd">Select the correct ${ex.required} tiles</text>`;ex.ids.forEach((id,i)=>{const t=TILES.find(z=>z.id===id);const x=235+i*70,y=335,sel=s.exerciseSelected.has(i);o+=`<g data-exercise-tile="${i}" tabindex="0" role="button" aria-label="Select ${t.name}"><title>${t.name}</title><rect x="${x-29}" y="${y-49}" width="58" height="101" rx="10" fill="${sel?'#537a46':'#124d39'}" stroke="${sel?'#ffdd82':'#7e9a75'}" stroke-width="${sel?4:1}"/>${tileSVG(t,x,y,47,67)}<text x="${x}" y="${y+65}" fill="#ffecbd" font-size="13" text-anchor="middle">${sel?'✓':'Tap'}</text></g>`;});}else{const disc=TILES.find(t=>t.id===ex.discard);o+=`<text x="410" y="265" text-anchor="middle" font-size="15" fill="#f4e8cc">${ex.from} discarded:</text>${tileSVG(disc,410,322,50,70)}<text x="410" y="384" text-anchor="middle" font-size="13" fill="#e5e8d5">East has these useful tiles:</text>`;ex.hand.forEach((id,i)=>{const t=TILES.find(z=>z.id===id);o+=tileSVG(t,296+i*57,425,35,49)});if(s.exerciseCorrect)o+=`<text x="410" y="281" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffdf82">${ex.correct==='Pass'?'Correct: no claim':'✓ '+ex.correct+' claimed'}</text>`;}return o;}

// Phase 2C: scenarios keep authentic individual tile objects and test specific strategic ideas.
// Strategies are illustrative rather than claiming a unique mathematically optimal move.
const STRATEGY_SCENARIOS={
 'strategy-isolated':{type:'discard',ids:['Dots-2','Dots-3','Dots-4','Bamboo-3','Bamboo-4','Bamboo-5','Characters-5','Characters-6','Characters-7','Dots-7','Dots-8','Wind-East','Wind-East','Wind-North'],good:['Wind-North'],reason:'North Wind is isolated: it is neither paired nor part of a numbered sequence. Discarding it preserves three complete Chows, an East pair, and the Dots 7–8 shape.',coach:'Look for tiles that cannot connect to their neighbours. A single honour tile cannot form a Chow. Your East pair is more useful than a lone North.',focus:'Isolated tiles · 孤張'},
 'strategy-shapes':{type:'discard',ids:['Dots-2','Dots-3','Dots-4','Dots-6','Dots-7','Bamboo-3','Bamboo-4','Bamboo-5','Bamboo-7','Bamboo-8','Characters-4','Characters-5','Wind-South','Dragon-White'],good:['Wind-South','Dragon-White'],reason:'Either isolated, unpaired honour can be a reasonable discard. Keeping 6–7 Dots, 7–8 Bamboo and 4–5 Characters preserves several useful potential draws.',coach:'Adjacent tiles such as 6–7 Dots can improve with either 5 or 8 Dots. Lone South and White honours have fewer immediate ways to improve.',focus:'Connected shapes · 搭子'},
 'strategy-pair':{type:'discard',ids:['Dots-1','Dots-2','Dots-3','Bamboo-2','Bamboo-3','Bamboo-4','Characters-3','Characters-4','Characters-5','Dots-7','Dots-8','Dragon-Red','Dragon-Red','Wind-West'],good:['Wind-West'],reason:'Keeping the two Red Dragons preserves a pair while the lone West Wind is currently isolated. You still retain useful suited shapes.',coach:'A standard four-sets-and-a-pair hand needs one pair. Here Red Dragon ×2 is already a pair. West ×1 is not.',focus:'Pairs · 將'},
 'strategy-draw':{type:'draw',ids:['Bamboo-2','Bamboo-3','Bamboo-4','Bamboo-5','Bamboo-6'],good:['Bamboo-3','Bamboo-6'],reason:'With 4–5 Bamboo, either 3 Bamboo or 6 Bamboo completes a Chow. This is a two-sided wait; 2 and 5 do not complete that specific shape.',coach:'To complete 4–5 Bamboo as a three-tile sequence, you need 3–4–5 or 4–5–6. Both 3 and 6 Bamboo are useful draws.',focus:'Useful tiles · 有效牌'}
};
function setupStrategyLesson(s){s.strategyChoice=null;s.strategyCorrect=false;s.coachOpen=false;s.built=new Set();}
function strategyChoose(id){const s=state.stage,k=step()[2],ex=STRATEGY_SCENARIOS[k];if(!ex||s.strategyCorrect)return;s.strategyChoice=id;beep();if(ex.good.includes(id)){s.strategyCorrect=true;renderBoard();complete(ex.reason)}else{renderBoard();wrong(ex.type==='draw'?`${TILES.find(t=>t.id===id).name} does not complete the specific 4–5 Bamboo Chow. Try another draw.`:`${TILES.find(t=>t.id===id).name} is not the best example here. Look for an isolated tile or keep a useful pair. Try again.`)}renderControls()}
function renderStrategy(s,k){const ex=STRATEGY_SCENARIOS[k];if(!ex)return '';let o=`<rect x="155" y="200" width="510" height="247" rx="15" fill="#103c2e" stroke="#bda16f" stroke-width="2"/><text x="410" y="233" text-anchor="middle" font-size="20" font-weight="bold" fill="#ffe2a0">${ex.focus}</text><text x="410" y="261" text-anchor="middle" font-size="13" fill="#f2e8d3">${ex.type==='draw'?'Current shape: 4–5 Bamboo. Tap a useful draw.':'Tap a tile in East’s hand to discard.'}</text>`;
 if(ex.type==='draw'){const a=TILES.find(t=>t.id==='Bamboo-4'),b=TILES.find(t=>t.id==='Bamboo-5');o+=tileSVG(a,390,325,42,58)+tileSVG(b,438,325,42,58);o+=`<text x="410" y="410" text-anchor="middle" fill="#e8d8af" font-size="13">Choose from the candidate tiles below ↓</text>`}
 const n=ex.ids.length,w=ex.type==='draw'?54:34,cx=410,first=cx-(n-1)*w/2;ex.ids.forEach((id,i)=>{const t=TILES.find(z=>z.id===id),x=first+i*w,y=ex.type==='draw'?494:508,chosen=s.strategyChoice===id; o+=`<g data-strategy-tile="${id}" tabindex="0" role="button" aria-label="Choose ${t.name}"><title>${t.name}</title>${chosen?`<rect x="${x-19}" y="${y-31}" width="38" height="61" rx="6" fill="none" stroke="${s.strategyCorrect?'#83dfa5':'#ff9c87'}" stroke-width="3"/>`:''}${tileSVG(t,x,y,ex.type==='draw'?43:31,ex.type==='draw'?59:45)}</g>`});o+=`<text x="410" y="575" text-anchor="middle" fill="#ffe4aa" font-size="14">${s.strategyCorrect?'✓ Correct — read the explanation on the right':ex.type==='draw'?'Choose a tile that completes 4–5 Bamboo':'Select your recommended discard'}</text>`;return o;
}

// Phase 3: introductory four-melds-and-a-pair validator. Special hands and regional scoring
// are deliberately outside the scope of this beginner module.
function validStandardHand(ids){if(ids.length!==14)return false;const counts=new Map();for(const id of ids)counts.set(id,(counts.get(id)||0)+1);
 if([...counts.values()].some(n=>n>4))return false;
 function melds(c){const first=[...c.keys()].filter(x=>c.get(x)>0).sort()[0];if(!first)return true;
  if(c.get(first)>=3){c.set(first,c.get(first)-3);if(melds(c))return true;c.set(first,c.get(first)+3)}
  const m=/^(Dots|Bamboo|Characters)-(\d)$/.exec(first);if(m&&Number(m[2])<=7){const ids2=[`${m[1]}-${+m[2]+1}`,`${m[1]}-${+m[2]+2}`];if(ids2.every(x=>(c.get(x)||0)>0)){c.set(first,c.get(first)-1);ids2.forEach(x=>c.set(x,c.get(x)-1));if(melds(c))return true;c.set(first,c.get(first)+1);ids2.forEach(x=>c.set(x,c.get(x)+1))}}
  return false;
 }
 for(const [id,n] of counts){if(n>=2){const c=new Map(counts);c.set(id,n-2);if(melds(c))return true}}return false;
}
const WIN_SCENARIOS={
 'win-complete':{question:'East has thirteen tiles. Which draw completes a standard winning hand?',ids:['Dots-1','Dots-2','Dots-3','Bamboo-2','Bamboo-3','Bamboo-4','Characters-4','Characters-5','Characters-6','Dragon-Red','Dragon-Red','Dragon-Red','Wind-East'],choices:['Wind-East','Wind-South','Dots-5'],labels:['East Wind 東','South Wind 南','5 Dots'],answer:'Wind-East',explanation:'Three Chows + a Red Dragon Pung = four sets; two East Winds form the required pair.'},
 'win-validity':{question:'Can these 14 tiles form four complete sets and one pair?',ids:['Dots-1','Dots-2','Dots-3','Bamboo-2','Bamboo-3','Bamboo-4','Characters-4','Characters-5','Characters-6','Dragon-Red','Dragon-Red','Dragon-Red','Wind-East','Wind-South'],choices:['Yes','No'],labels:['Yes — Mahjong!','No — not yet'],answer:'No',explanation:'The final East and South Winds do not form a pair. This 14-tile arrangement is not a standard winning hand.'},
 'win-alternative':{question:'Select the draw that completes this 13-tile hand.',ids:['Dots-6','Dots-7','Dots-8','Bamboo-1','Bamboo-2','Bamboo-3','Characters-2','Characters-3','Characters-4','Wind-North','Wind-North','Wind-North','Dots-9'],choices:['Dots-9','Dots-8','Wind-West'],labels:['9 Dots','8 Dots','West Wind 西'],answer:'Dots-9',explanation:'9 Dots forms the final pair alongside a North Pung and three Chows.'},
 'score-dragon':{question:'Which feature does this example winning hand contain?',ids:['Dots-1','Dots-2','Dots-3','Bamboo-2','Bamboo-3','Bamboo-4','Characters-4','Characters-5','Characters-6','Dragon-Red','Dragon-Red','Dragon-Red','Wind-East','Wind-East'],choices:['Dragon Pung','All Chows','No honours'],labels:['Red Dragon Pung','All Chows','No honour tiles'],answer:'Dragon Pung',explanation:'The three Red Dragons (中) make a Pung. Its point or bonus value depends on the specific Chinese scoring rules.'},
 'score-concealed':{question:'The displayed hand was completed without exposing any melds. What feature is that?',ids:['Dots-1','Dots-2','Dots-3','Bamboo-2','Bamboo-3','Bamboo-4','Characters-4','Characters-5','Characters-6','Dragon-Red','Dragon-Red','Dragon-Red','Wind-East','Wind-East'],choices:['Concealed','Exposed','Kong'],labels:['Concealed hand','Exposed hand','Kong'],answer:'Concealed',explanation:'All four sets were kept concealed. Some traditional scoring systems award a bonus for concealment; the precise value varies.'},
 'score-bonus':{question:'What happens to a Flower or Season tile when it appears in your hand?',ids:['Dots-1','Dots-2','Dots-3','Bamboo-2','Bamboo-3','Bamboo-4','Characters-4','Characters-5','Characters-6','Dragon-Red','Dragon-Red','Dragon-Red','Wind-East','Wind-East'],choices:['Expose','Keep','Discard'],labels:['Expose & replace','Keep as a Chow','Discard normally'],answer:'Expose',explanation:'Flowers and Seasons are exposed as bonus tiles and replaced from the reserved end. Specific bonus point values vary by ruleset.'}
};
function setupWinningLesson(s){s.winningCorrect=false;s.winningChoice=null;s.built=new Set();}
function chooseWinning(choice){const s=state.stage,k=step()[2],ex=WIN_SCENARIOS[k];if(!ex||s.winningCorrect)return;s.winningChoice=choice;
 let correct=choice===ex.answer;
 if(k==='win-complete'||k==='win-alternative')correct=validStandardHand([...ex.ids,choice]);
 if(k==='win-validity')correct=choice===(validStandardHand(ex.ids)?'Yes':'No');
 if(correct){s.winningCorrect=true;beep();renderBoard();complete(ex.explanation)}else{renderBoard();wrong('Not quite. Check for four complete sets and one pair, or review the highlighted scoring feature. Try again.')}renderControls();}
function renderWinning(s,k){const ex=WIN_SCENARIOS[k];if(!ex)return '';let o=`<rect x="135" y="184" width="550" height="346" rx="17" fill="#0e3b2d" stroke="#c6a56c" stroke-width="2"/><text x="410" y="220" font-size="19" fill="#ffe5aa" text-anchor="middle" font-weight="bold">${k.startsWith('win-')?'WINNING HAND · 和牌':'SCORING BASICS · 計分'}</text><text x="410" y="251" font-size="13" fill="#f1e2c4" text-anchor="middle">${ex.ids.length} tiles · East’s hand</text>`;
 const n=ex.ids.length,dx=37,start=410-(n-1)*dx/2;ex.ids.forEach((id,i)=>{const t=TILES.find(z=>z.id===id);if(t)o+=tileSVG(t,start+i*dx,335,34,48)});
 if(k==='win-complete'||k==='win-alternative'){o+=`<text x="410" y="409" fill="#ffda8f" text-anchor="middle" font-size="14">Tap the tile you would draw:</text>`;ex.choices.forEach((id,i)=>{const t=TILES.find(z=>z.id===id),x=298+i*112;if(t)o+=`<g tabindex="0" role="button" data-winning-choice="${id}" aria-label="Choose ${t.name}"><title>${t.name}</title><rect x="${x-34}" y="430" width="68" height="87" rx="10" fill="${s.winningChoice===id?'#618247':'#235443'}" stroke="#d8c38c"/>${tileSVG(t,x,471,43,59)}</g>`})}
 else o+=`<text x="410" y="469" fill="#f3d59d" font-size="15" text-anchor="middle">${s.winningCorrect?'✓ Correct! See explanation at right.':'Choose your answer using the buttons at right.'}</text>`;
 return o;}

function step(){return STEPSETS[state.lesson][state.step]}
function stepSatisfied(){
 const s=state.stage,k=step()[2],total=s.dice.reduce((a,b)=>a+b,0);
 switch(k){
 case 'suits':case 'honours':case 'bonus':return targets().every(g=>s.groupsSeen.has(g));
 case 'seatdraw':return s.drawn.size===4;
 case 'east':return s.dealerFound===true;
 case 'seating':return s.seatProgress===4;
 case 'turnorder':return s.orderProgress===4;
 case 'build':return WINDS.every(w=>s.buildCounts[w]===18);
 case 'roll':return s.diceRolled===true;
 case 'wallselect':case 'breakroll':return s.selectedWall===chosenWall() && !!s.dice.length;
 case 'count':return s.counts.length===total && total>0;
 case 'breakconfirm':return s.broken===true;
 case 'deal4':return s.dealIndex===12 && s.hands.every(h=>h.length===12);
 case 'deal1':return s.dealIndex===16 && s.hands.every((h,i)=>h.length===(i===0?14:13));
 case 'flowerpick':return s.bonusCount>=2;
 case 'flowerreplace':return s.replacementConfirmed===true;
 case 'turn-east-first':return s.discards[0].length===1;
 case 'turn-opponents':return s.opponentsPlayed===3;
 case 'turn-east-draw':return s.drawnThisTurn;
 case 'turn-east-discard':return s.discards[0].length===2&&s.hands.every(h=>h.length===13);
 case 'strategy-isolated':case 'strategy-shapes':case 'strategy-pair':case 'strategy-draw':return !!s.strategyCorrect;
 case 'win-complete':case 'win-validity':case 'win-alternative':case 'score-dragon':case 'score-concealed':case 'score-bonus':return !!s.winningCorrect;
 case 'guided-game':return !!s.game?.won;
 case 'set-chow':case 'set-pung':case 'set-kong':case 'set-pair':case 'claim-chow':case 'claim-pass':case 'claim-pung':case 'claim-kong':case 'claim-priority':return !!s.exerciseCorrect;
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
function setLesson(i){state.lesson=i;state.step=0;persist();closePath();setup();}
function next(){if(!(state.ready||stepSatisfied())){wrong('Complete this step first, or use “Show me” for a demonstration.');return;}if(state.step<STEPSETS[state.lesson].length-1){state.step++;state.ready=false;state.stage.groupsSeen=new Set();state.stage.exerciseCorrect=false;state.stage.exerciseSelected=new Set();state.stage.strategyChoice=null;state.stage.strategyCorrect=false;state.stage.coachOpen=false;state.stage.winningCorrect=false;state.stage.winningChoice=null;state.feedback='';state.feedbackType='';render()}else{state.done.add(state.lesson);persist();if(state.lesson<LESSONS.length-1){setLesson(state.lesson+1)}else{state.step=0;setup();message('You completed all 14 lessons! Revisit any lesson from Learning Path.','success')}}}
function prev(){if(state.step){state.step--;state.ready=false;state.stage.groupsSeen=new Set();state.stage.exerciseCorrect=false;state.stage.exerciseSelected=new Set();state.stage.strategyCorrect=false;state.stage.strategyChoice=null;state.stage.coachOpen=false;state.stage.winningCorrect=false;state.stage.winningChoice=null;render()}else if(state.lesson)setLesson(state.lesson-1)}
function targets(){const k=step()[2];if(k==='suits')return ['Dots','Bamboo','Characters'];if(k==='honours')return ['Winds','Dragons'];return ['Flowers','Seasons']}
function render(){const [title,desc]=LESSONS[state.lesson],st=step();$('lessonCount').textContent=`LESSON ${state.lesson+1} OF ${LESSONS.length}`;$('lessonTitle').textContent=title;$('lessonSubtitle').textContent=desc;$('stepTag').textContent=`STEP ${state.step+1}`;$('stepProgress').textContent=`${state.step+1} / ${STEPSETS[state.lesson].length}`;$('stepTitle').textContent=st[0];$('stepBody').textContent=st[1];$('tableStatus').textContent=(state.lesson===5||state.lesson===6||state.lesson===7)?`${state.stage.hands.map(a=>a.length).join(' · ')} tiles in hands`:'144 tiles · 4 players';$('nextBtn').textContent=state.step===STEPSETS[state.lesson].length-1?'Complete lesson ✓':'Next →';refreshNext();$('backBtn').disabled=state.step===0;renderList();renderBoard();renderControls();message(state.feedback||'Follow the instructions above. Select a highlighted option or object. ',state.feedbackType||'info');}
function renderList(){$('pathCurrent').textContent=`${state.lesson+1} / ${LESSONS.length}`;$('lessonList').innerHTML=LESSONS.map(([n,d],i)=>`<button class="lesson ${i===state.lesson?'current':''} ${state.done.has(i)?'done':''}" data-lesson="${i}"><span class="number">${state.done.has(i)?'✓':i+1}</span><span><strong>${n}</strong><small>${i===state.lesson?'Learning now':state.done.has(i)?'Completed':'Open lesson'}</small></span></button>`).join('');document.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>setLesson(+b.dataset.lesson));$('progressText').textContent=`${state.done.size} / ${LESSONS.length} completed`;$('progressBar').style.width=`${state.done.size/LESSONS.length*100}%`}
function seatXY(w){return state.lesson===5?{East:[410,568],South:[770,325],West:[410,91],North:[50,325]}[w]:{East:[410,568],South:[716,326],West:[410,91],North:[106,326]}[w]}
function seat(w){let [x,y]=seatXY(w),isTop=w==='West';let count=state.stage.hands[WINDS.indexOf(w)]?.length||0;const side=state.lesson===5&&(w==='South'||w==='North');const seatWidth=side?82:122;return `<g class="player-seat" data-seat="${w}" tabindex="0" role="button" aria-label="${w} seat"><rect x="${x-seatWidth/2}" y="${y-20}" width="${seatWidth}" height="40" rx="10" fill="#173e31" stroke="#bb9860" stroke-width="2"/><text x="${x}" y="${y-2}" fill="#fff5d9" font-size="15" font-weight="bold" text-anchor="middle">${w}${w==='East'?' ★':''}</text><text x="${x}" y="${y+13}" fill="#d4b983" font-size="11" text-anchor="middle">${(state.lesson===5||state.lesson===6||state.lesson===7)?count+' tiles':w==='East'?'Dealer':isTop?'Opposite':''}</text></g>`}
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
 const showReserve=s.broken && (state.lesson===4 || state.lesson===5 || state.lesson===6 || state.lesson===7 || state.lesson===13) && w===s.selectedWall;
 for(let i=0;i<n;i++){
  const [baseX,baseY]=stackPosition(w,i);
  const counted=s.counts.includes(i)&&s.selectedWall===w;
  const isTarget=k==='count'&&w===s.selectedWall&&i===17-s.counts.length;
  const reserve=showReserve&&i>=cut;
  const removed=(state.lesson===5||state.lesson===6||state.lesson===7||state.lesson===13)?(s.takenStacks[w+':'+i]||0):0;
  if(removed>=2)continue;
  const source=(state.lesson===5||state.lesson===7||state.lesson===13) && s.drawOrder[Math.floor(s.drawPointer/2)]?.join(':')===w+':'+i;
  const inward={East:[0,-32],West:[0,32],South:[-32,0],North:[32,0]}[w];
  const along={East:[0,0],West:[0,0],South:[0,0],North:[0,0]}[w];
  const x=baseX+(reserve?inward[0]:0);
  const y=baseY+(reserve?inward[1]:0);
  out+=`<g class="wall-stack ${counted?'counted':''} ${isTarget?'target':''} ${source?'draw-source':''}" data-stack="${w}:${i}" tabindex="0" role="button" aria-label="${w} wall stack ${18-i}${reserve?' reserved replacement end':''}"><title>${w} stack ${18-i}${reserve?' — replacement reserve':''}</title><g transform="${w==='South'||w==='North'?`rotate(90 ${x} ${y})`:``}">${removed===0?`<rect x="${x-10}" y="${y-9}" width="20" height="20" rx="2" fill="#9fb5a2" stroke="#e4e9d9"/>`:''}<rect x="${x-10}" y="${y-14}" width="20" height="20" rx="2" fill="${counted?'#f2c86f':built||state.lesson>2?'#f4f1e2':'#d5dacd'}" stroke="#e5d8be"/><rect x="${x-8}" y="${y-12}" width="16" height="16" rx="2" fill="${counted?'#e4b751':reserve?'#b59c69':'#5d9077'}" opacity=".8"/></g>${counted?`<text x="${x}" y="${y-18}" text-anchor="middle" fill="#ffecae" font-weight="bold" font-size="14">${s.counts.indexOf(i)+1}</text>`:''}${source?`<circle cx="${x}" cy="${y}" r="17" fill="none" stroke="#ffda63" stroke-width="3" stroke-dasharray="5 3"/><text x="${x}" y="${y-27}" fill="#ffe69a" text-anchor="middle" font-size="12" font-weight="bold">DRAW</text>`:''}</g>`;
 }
 if(showReserve){const [ax,ay]=stackPosition(w,Math.min(17,cut+3));const [dx,dy]={East:[0,-47],West:[0,50],South:[-58,0],North:[58,0]}[w];out+=`<text x="${ax+dx}" y="${ay+dy}" text-anchor="middle" fill="#fff1b7" font-size="12" font-weight="bold">REPLACEMENT · 14 TILES</text>`}
 if(showReserve){
  const [bx,by]=stackPosition(w,Math.max(0,cut-1));
  const shift={East:[0,-55],West:[0,55],South:[-55,0],North:[55,0]}[w];
  const lx=bx+shift[0],ly=by+shift[1];
  out+=`<g class="wall-break-marker"><path d="M${bx},${by} L${lx},${ly}" fill="none" stroke="#ffdd70" stroke-width="3"/><rect x="${lx-34}" y="${ly-27}" width="68" height="23" rx="7" fill="#422918" stroke="#ffdd70"/><text x="${lx}" y="${ly-11}" fill="#fff2bd" text-anchor="middle" font-size="13" font-weight="bold">BREAK</text></g>`;
 }
 return out;
}
function renderBoard(){const s=state.stage;let svg=`<defs><radialGradient id="felt"><stop stop-color="#236c4b"/><stop offset="1" stop-color="#154733"/></radialGradient></defs><rect x="20" y="20" width="780" height="610" rx="26" fill="url(#felt)" stroke="#bf9d5c" stroke-width="3" opacity=".48"/><circle cx="410" cy="325" r="79" fill="#1b583f" stroke="#74a081" opacity=".38" stroke-width="2"/><text x="410" y="328" text-anchor="middle" font-family="Georgia,serif" font-size="25" fill="#e2d3ac" opacity=".24">麻將</text>`;
for(const w of WINDS)svg+=svgWall(w);if(state.lesson!==0&&state.lesson!==6&&state.lesson!==1&&state.lesson!==7)for(const w of WINDS)svg+=seat(w);
const k=step()[2];if(['roll','wallselect','breakroll','count','breakconfirm'].includes(k)){const dice=s.dice.length?s.dice:[1,4,2];svg+=dice.map((n,i)=>die(363+i*47,315,n)).join('');if(s.dice.length)svg+=`<text x="410" y="388" fill="#f9ebc3" text-anchor="middle" font-weight="bold" font-size="17">Total ${s.dice.reduce((a,b)=>a+b,0)}</text>`}
if(state.lesson===1)svg+=renderSeatLesson(s,k);
if(state.lesson===2){svg+=renderMixedPile(s)}
if(state.lesson===0){svg+=renderLearningTiles(k)}
if(state.lesson===6)svg+=renderFlowerHands(s);
if(state.lesson===7)svg+=renderTurnLesson(s);if(state.lesson===8||state.lesson===9)svg+=renderMeldLesson(s,k);if(state.lesson===10)svg+=renderStrategy(s,k);if(state.lesson===11||state.lesson===12)svg+=renderWinning(s,k);if(state.lesson===13)svg+=renderGuidedGame(s);
if(state.lesson===5){svg+=`<rect x="302" y="273" width="216" height="95" rx="13" fill="#103b2c" stroke="#c5a568"/><text x="410" y="297" fill="#ffde8f" text-anchor="middle" font-size="15" font-weight="bold">OPENING: ${s.selectedWall}</text><text x="410" y="321" fill="#fff0c7" text-anchor="middle" font-size="13">${s.dice.join(' + ')} = ${s.dice.reduce((a,b)=>a+b,0)} · break after stack ${s.dice.reduce((a,b)=>a+b,0)}</text><text x="410" y="345" fill="#d8e5d1" text-anchor="middle" font-size="13">${s.drawPointer} tiles taken from live wall</text>`;WINDS.forEach((w,idx)=>{const c=Math.min(s.hands[idx].length,14);const x=w==='South'?684:w==='North'?136:410;const y=w==='East'?616:w==='West'?44:325;if(w==='East'||w==='West'){for(let j=0;j<c;j++)svg+=tileBack(x+(j-(c-1)/2)*23,y,20,29)}else{for(let j=0;j<c;j++)svg+=tileBack(x,y+(j-(c-1)/2)*29,19,26,90)}})}$('gameBoard').innerHTML=svg;attachBoard()}
// Lesson 1 displays the entire relevant family, generated from the shared tile definitions.

const SEAT_ZH={East:'東',South:'南',West:'西',North:'北'};
const PLAYER_IDS=['A','B','C','D'];
const SEAT_POS={East:[410,526],South:[672,325],West:[410,121],North:[148,325]};
function renderSeatLesson(s,k){
 let o='';
 if(k==='seatdraw'||k==='east'){
  o+=`<text x="410" y="208" text-anchor="middle" fill="#f5d99e" font-size="20" font-weight="bold">DRAW WINDS · 抽風牌</text>`;
  PLAYER_IDS.forEach((name,i)=>{
   const x=275+i*90,shown=s.drawn.has(i),wind=s.seatTiles[i],tile=TILES.find(t=>t.id==='Wind-'+wind);
   o+=`<g class="wind-choice" data-wind-tile="${i}" tabindex="0" role="button" aria-label="Player ${name}: ${shown?wind+' '+SEAT_ZH[wind]:'concealed wind tile'}"><rect x="${x-37}" y="245" width="74" height="138" rx="13" fill="${k==='east'&&shown&&wind==='East'?'#58714a':'#154b38'}" stroke="${k==='east'&&shown&&wind==='East'?'#ffe58b':'#bc9d60'}" stroke-width="2"/><text x="${x}" y="268" text-anchor="middle" fill="#fff1cc" font-weight="bold" font-size="16">PLAYER ${name}</text>${shown?tileSVG(tile,x,323,47,66):tileBack(x,323,47,66)}${shown?`<text x="${x}" y="376" text-anchor="middle" fill="#ffdf90" font-size="12">${wind} · ${SEAT_ZH[wind]}</text>`:''}</g>`;
  });
  o+=`<text x="410" y="421" text-anchor="middle" fill="#dcebd7" font-size="15">${k==='seatdraw'?s.drawn.size+' / 4 tiles revealed':'Select the player holding 東 (East)'}</text>`;
 }else{
  const seats=['East','South','West','North'];
  o+=`<text x="410" y="215" text-anchor="middle" fill="#f3dda9" font-size="19" font-weight="bold">${k==='seating'?'ASSIGN EACH SEAT':'TURN ORDER · COUNTERCLOCKWISE ↺'}</text>`;
  o+=`<rect x="265" y="240" width="290" height="184" rx="22" fill="#10422e" stroke="#ad9361" stroke-width="3"/>`;
  o+=`<path d="M468 454 Q584 435 581 353 Q580 244 467 232 M350 232 Q237 246 238 352 Q239 434 350 454" stroke="#f1cb74" stroke-width="3" stroke-dasharray="7 7" fill="none"/>`;
  seats.forEach((w,i)=>{const [x,y]=SEAT_POS[w],pi=s.seatTiles.indexOf(w),highlight=k==='turnorder'?i===s.orderProgress:i===s.seatProgress,done=k==='turnorder'?i<s.orderProgress:i<s.seatProgress;const label=k==='seating'&&!done?'?':`P${PLAYER_IDS[pi]} · ${w}`;
   o+=`<g data-seat-lesson="${w}" role="button" tabindex="0" aria-label="${w} seat, player ${PLAYER_IDS[pi]}"><rect x="${x-69}" y="${y-26}" width="138" height="52" rx="12" fill="${done?'#366f51':highlight?'#705829':'#184536'}" stroke="${highlight?'#ffde7c':'#b69a63'}" stroke-width="${highlight?3:2}"/><text x="${x}" y="${y-4}" font-size="14" text-anchor="middle" fill="#fff2d1" font-weight="bold">${label}</text><text x="${x}" y="${y+14}" font-size="12" text-anchor="middle" fill="#e7cd91">${SEAT_ZH[w]}${w==='East'?' ★ dealer':''}</text></g>`;});
  o+=`<text x="410" y="333" fill="#f9e3b6" font-size="17" text-anchor="middle">${k==='seating'?'Choose player '+PLAYER_IDS[s.seatTiles.indexOf(seats[s.seatProgress]||'East')]: 'East → South'}</text><text x="410" y="357" fill="#f9e3b6" font-size="17" text-anchor="middle">${k==='seating'?'for '+(seats[s.seatProgress]||'all seats assigned'):'West → North'}</text>`;
 }
 return o;
}
function chooseSeatLesson(w){const k=step()[2],s=state.stage,order=['East','South','West','North'],field=k==='seating'?'seatProgress':'orderProgress';if(!['seating','turnorder'].includes(k))return;const expected=order[s[field]];if(w!==expected){wrong(`Not quite. Select ${expected} next. ${k==='seating'?`It belongs to Player ${PLAYER_IDS[s.seatTiles.indexOf(expected)]}.`:'Follow East → South → West → North.'}`);return;}s[field]++;beep();renderBoard();renderControls();if(s[field]===4)complete(k==='seating'?'All four players are seated according to their wind tiles.':'Correct! Play travels East → South → West → North, counterclockwise.');else message(k==='seating'?`${expected} is Player ${PLAYER_IDS[s.seatTiles.indexOf(expected)]}. Now assign ${order[s[field]]}.`:`${expected} ✓ Next: ${order[s[field]]}.`,'success')}

function renderFlowerHands(s){
 // East's actual concealed hand occupies one accessible, non-overlapping row
 // along the bottom edge. Each tile is individually selectable.
 const tileW=30,tileH=44,spacing=34,startX=189,handY=577;
 let out=`<text x="112" y="569" text-anchor="middle" fill="#ffdc8b" font-size="13" font-weight="bold">EAST ★</text><text x="112" y="587" text-anchor="middle" fill="#fff1cb" font-size="12">Dealer · ${s.hands[0].length} tiles</text>`;
 s.hands[0].forEach((t,i)=>{
  const x=startX+i*spacing,selected=s.selectedBonus.has(i);
  out+=`<g data-center-tile="${i}" tabindex="0" role="button" aria-label="East hand tile ${i+1}: ${t.name}"><title>${t.name}</title>${tileSVG(t,x,handY,tileW,tileH)}${selected?`<rect x="${x-tileW/2-2}" y="${handY-tileH/2-2}" width="${tileW+4}" height="${tileH+6}" rx="5" fill="none" stroke="#ffce65" stroke-width="3"/>`:''}</g>`;
 });
 // Each opponent's fully dealt concealed hand is visible as an individual
 // face-down row, clearly separated from the remaining outer wall.
 // South: right side, North: left side, West: top. The tile backs are
 // representations of the 13 tiles already removed from the wall.
 const opponents=[
  {w:'West',idx:2,x:410,y:74,orientation:'horizontal'},
  {w:'North',idx:3,x:105,y:321,orientation:'vertical'},
  {w:'South',idx:1,x:715,y:321,orientation:'vertical'}
 ];
 for(const p of opponents){
  const count=s.hands[p.idx].length;
  out+=`<g aria-label="${p.w} concealed hand, ${count} tiles"><title>${p.w}: ${count} dealt, concealed tiles</title>`;
  for(let i=0;i<count;i++){
   const d=(i-(count-1)/2)*20;
   out+=p.orientation==='horizontal'
    ? tileBack(p.x+d,p.y,18,29)
    : tileBack(p.x,p.y+d,18,29,90);
  }
  if(p.orientation==='horizontal'){
   out+=`<text x="410" y="46" text-anchor="middle" fill="#ffdc8b" font-size="12" font-weight="bold">WEST · ${count} TILES</text>`;
  }else{
   const lx=p.w==='North'?62:758;
   out+=`<text x="${lx}" y="160" text-anchor="middle" fill="#ffdc8b" font-size="12" font-weight="bold">${p.w.toUpperCase()}</text><text x="${lx}" y="176" text-anchor="middle" fill="#fff1cb" font-size="11">${count} tiles</text>`;
  }
  out+='</g>';
 }
 if(s.flowerExposed?.length){
  out+=`<text x="410" y="402" fill="#ffe09e" text-anchor="middle" font-size="13" font-weight="bold">EXPOSED BONUS TILES</text>`;
  s.flowerExposed.forEach((t,i)=>{out+=tileSVG(t,410+(i-(s.flowerExposed.length-1)/2)*43,439,30,43)});
 }else{
  out+=`<text x="410" y="423" fill="#d7e9da" text-anchor="middle" font-size="13">Select the flower and season in East's hand below</text>`;
 }
 return out;
}
function renderMixedPile(s){const remaining=144-Object.values(s.buildCounts).reduce((sum,n)=>sum+n*2,0);let out=`<text x="410" y="255" fill="#fff1cc" font-size="18" font-weight="bold" text-anchor="middle">MIXED TILES</text>`;const visible=Math.min(remaining,15);for(let i=0;i<visible;i++){const x=348+(i%5)*31,y=289+Math.floor(i/5)*36;out+=tileBack(x,y,23,30,0)}out+=`<rect x="341" y="396" width="138" height="34" rx="12" fill="#0d392d" stroke="#c8ad6c"/><text x="410" y="418" fill="#fff1cc" text-anchor="middle" font-size="17" font-weight="bold">${remaining} tiles left</text>`;return out}
function renderLearningTiles(k){
 const groups=k==='suits'?['Dots','Bamboo','Characters']:k==='honours'?['Winds','Dragons']:['Flowers','Seasons'];
 const subtitles={Dots:'筒子 · CIRCLES · 1–9',Bamboo:'索子 · BAMS · 1–9',Characters:'萬子 · CRAKS · 1–9',Winds:'風牌 · FOUR WINDS',Dragons:'三元牌 · THREE DRAGONS',Flowers:'花牌 · FOUR FLOWERS',Seasons:'季節牌 · FOUR SEASONS'};
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
function attachBoard(){document.querySelectorAll('[data-guided-tile]').forEach(e=>{const fn=()=>guidedDiscard(Number(e.dataset.guidedTile));e.onclick=fn;e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();fn()}}});document.querySelectorAll('[data-seat-lesson]').forEach(e=>{e.onclick=()=>chooseSeatLesson(e.dataset.seatLesson);e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();chooseSeatLesson(e.dataset.seatLesson)}}});document.querySelectorAll('[data-seat]').forEach(e=>{e.onclick=()=>chooseSeat(e.dataset.seat);e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();chooseSeat(e.dataset.seat)}}});document.querySelectorAll('[data-stack]').forEach(e=>{e.onclick=()=>chooseStack(e.dataset.stack);e.onkeydown=ev=>{if(ev.key==='Enter'){chooseStack(e.dataset.stack)}}});document.querySelectorAll('[data-wind-tile]').forEach(e=>{e.onclick=()=>reveal(+e.dataset.windTile);e.onmouseenter=()=>{const i=+e.dataset.windTile;const known=state.stage.drawn.has(i);$('boardOverlay').textContent=known?`${state.stage.seatTiles[i]} wind · ${({East:'東',South:'南',West:'西',North:'北'})[state.stage.seatTiles[i]]}`:'Click to reveal wind';};e.onmouseleave=()=>$('boardOverlay').textContent='';e.onfocus=e.onmouseenter;e.onblur=e.onmouseleave;e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();reveal(+e.dataset.windTile)}}});document.querySelectorAll('[data-center-tile]').forEach(e=>e.onclick=()=>chooseCenter(+e.dataset.centerTile));document.querySelectorAll('[data-turn-tile]').forEach(e=>{e.onclick=()=>discardFromEast(+e.dataset.turnTile);e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();discardFromEast(+e.dataset.turnTile)}}});document.querySelectorAll('[data-winning-choice]').forEach(e=>{const fn=()=>chooseWinning(e.dataset.winningChoice);e.onclick=fn;e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();fn()}}});document.querySelectorAll('[data-strategy-tile]').forEach(e=>{const fn=()=>strategyChoose(e.dataset.strategyTile);e.onclick=fn;e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();fn()}}});document.querySelectorAll('[data-exercise-tile]').forEach(e=>{const fn=()=>selectExerciseTile(+e.dataset.exerciseTile);e.onclick=fn;e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();fn()}}});document.querySelectorAll('[data-tile-group]').forEach(e=>{e.onclick=()=>studyGroup(e.dataset.tileGroup);e.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();studyGroup(e.dataset.tileGroup)}}})}
function chosenWall(){return WINDS[(state.stage.dice.reduce((a,b)=>a+b,0)-1)%4]}
function chooseSeat(w){const s=state.stage,k=step()[2];beep();if(k==='build'){if(s.buildCounts[w]>=18){wrong(`${w}'s wall already has 18 stacks. Select an unfinished side.`);return;}s.buildCounts[w]=Math.min(18,s.buildCounts[w]+6);if(s.buildCounts[w]===18)s.built.add(w);beep();renderBoard();renderControls();const left=144-Object.values(s.buildCounts).reduce((sum,n)=>sum+n*2,0);if(left===0)complete('All 144 tiles moved into four walls: 18 stacks per side, two tiles high.');else message(`${w} now has ${s.buildCounts[w]} of 18 stacks; ${left} loose tiles remain in the middle.`,'info');return}if(k==='east'||k==='south'){if(s.drawn.size<4){wrong('Reveal the four wind tiles first.');return;}const expected=k==='east'?'East':'South';if(w!==expected){wrong(`Not quite. ${expected} is ${k==='east'?'the dealer':'immediately after East in turn order'}. Try the ${expected} seat.`);return;}complete(`${w} is correct! ${k==='east'?'East deals and begins the hand.':'Players follow East → South → West → North.'}`);return}if(k==='wallselect'||k==='breakroll'){if(!s.dice.length){wrong('Roll the dice first.');return}if(w!==chosenWall()){wrong(`Count the dice total, starting with East as 1: East, South, West, North, repeating. Try again.`);return;}s.selectedWall=w;complete(`${w}'s wall is correct. Total ${s.dice.reduce((a,b)=>a+b,0)} selects ${w}.`);renderBoard();return}if(k==='deal4'||k==='deal1'){dealTo(w);return}if(k==='builtcheck'){complete('Yes. Every player has 18 double-high stacks, giving 144 tiles altogether.');return}wrong('This seat is not the interactive target in this step. Read the instruction panel.')}
function reveal(i){if(!['seatdraw','east'].includes(step()[2]))return;if(step()[2]==='east'){if(state.stage.seatTiles[i]!=='East'){wrong('That player did not draw East. Find the 東 tile.');return;}state.stage.dealerFound=true;renderBoard();complete(`Player ${PLAYER_IDS[i]} drew East (東) and becomes the dealer (莊家).`);return;}state.stage.drawn.add(i);renderBoard();if(state.stage.drawn.size===4)complete('All four wind tiles are revealed. East is the dealer; South follows East, then West and North.');else message(`${state.stage.seatTiles[i]} revealed. Tap the remaining face-down tiles.`,'info')}
function chooseStack(val){const [w,ii]=val.split(':'),i=+ii,s=state.stage,k=step()[2];if(k!=='count'){if(k==='build'){chooseSeat(w)}return}if(w!==s.selectedWall){wrong(`Count on the ${s.selectedWall} wall, not ${w}.`);return}let expected=17-s.counts.length;if(i!==expected){wrong(`Count each stack from the ${w} player's right-hand end. Next is stack ${s.counts.length+1}.`);return}s.counts.push(i);beep();renderBoard();if(s.counts.length===s.dice.reduce((a,b)=>a+b,0)){complete(`Great! You counted ${s.counts.length} stacks. The wall is split just beyond this stack, toward the owner's left.`)}else message(`Counted ${s.counts.length} of ${s.dice.reduce((a,b)=>a+b,0)} stacks. Tap the next stack.`,'info')}
function chooseCenter(i){const k=step()[2];if(k==='flowerpick'){
 const s=state.stage,tile=s.hands[0][i];
 if(!tile)return;
 if(!['Flowers','Seasons'].includes(tile.suit)){wrong(`${tile.name} is an ordinary tile, not a bonus tile. Try a flower or season in East's dealt hand.`);return}
 if(s.selectedBonus.has(i)){wrong('You already selected this bonus tile. Find the other one.');return}
 s.selectedBonus.add(i);s.bonusCount=s.selectedBonus.size;
 renderBoard();
 if(s.bonusCount>=2)complete('Correct! Plum and Spring are bonus tiles in East’s 14-tile hand. Next, expose them and take replacements.');
 else message('Correct bonus tile. Find the other flower or season in East’s hand.','success');
}}
// After the third four-tile circuit, continue the deal without requiring Next.
// Keep the current hands and wall draw position intact.
function advanceToFinalDeal(){
 const s=state.stage;
 if(s.dealIndex!==12 || !s.hands.every(h=>h.length===12))return;
 state.step=STEPSETS[state.lesson].findIndex(entry=>entry[2]==='deal1');
 state.ready=false;
 state.feedback='';
 state.feedbackType='';
 render();
 message('Everyone now has 12 tiles. Continue dealing: East takes 2 tiles, then South, West and North take 1 each. Select East to start.','success');
}
function dealTo(w){
 const s=state.stage,k=step()[2];
 if(k!=='deal4' && k!=='deal1')return;
 const firstPhaseDone=s.hands.every(h=>h.length===12);
 const finalDone=s.hands.every((h,i)=>h.length===(i===0?14:13));
 if(finalDone){message('Dealing is finished. East has 14 tiles and the other players each have 13. Select Next to continue.','success');refreshNext();return;}
 if(k==='deal4' && firstPhaseDone){advanceToFinalDeal();return;}
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
  advanceToFinalDeal();
 }else if(k==='deal1' && s.hands.every((h,i)=>h.length===(i===0?14:13))){
  complete('Dealing finished: East has 14 tiles; South, West, and North each have 13. No more tiles may be dealt.');
 }else{
  message(`${w} takes ${amount} tile${amount>1?'s':''}. Next: ${WINDS[s.dealIndex%4]}.`,'info');
 }
}

function roll(){const s=state.stage,k=step()[2];if(!['roll','breakroll'].includes(k))return;s.dice=state.mode==='guided'?[2,3,2]:[random(6),random(6),random(6)];s.diceRolled=true;s.selectedWall=null;s.counts=[];renderBoard();const w=chosenWall();if(k==='roll')complete(`Dice: ${s.dice.join(' + ')} = ${s.dice.reduce((a,b)=>a+b,0)}. Count seats East → South → West → North.`);else message(`Total ${s.dice.reduce((a,b)=>a+b,0)}. Which player's wall is selected?`,'info');renderControls()}
function renderControls(){let k=step()[2],s=state.stage,h='';switch(k){case 'suits':case 'honours':case 'bonus':{let choices=targets();h=`<div class="chip">All ${k==='suits'?'27 numbered designs':k==='honours'?'7 honour designs':'8 unique bonus designs'} are displayed on the table. Tap a row of tiles or its button to explore that family.</div><div class="button-grid">${choices.map(g=>`<button data-quiz="${g}" class="${s.groupsSeen.has(g)?'selected':''}">${s.groupsSeen.has(g)?'✓ ':''}${g}</button>`).join('')}</div><div class="instruction-note">${s.groupsSeen.size} of ${choices.length} groups explored. Select each group to unlock Next.</div>`;break}case 'seatdraw':h='<div class="chip">Tap all four face-down wind tiles at the center of the table.</div>';break;case 'east':h='<div class="chip">Click the PLAYER card showing East (東). That person is the dealer.</div>';break;case 'seating':h=`<div class="chip">Assign the seat highlighted on the table. ${s.seatProgress} / 4 seats assigned.</div>`;break;case 'turnorder':h=`<div class="chip">Trace the counterclockwise turn order. ${s.orderProgress} / 4 seats selected.</div>`;break;case 'build':h=`<div class="chip">Tap each player position to move 12 tiles (6 stacks) from the shuffled centre pile to their wall.</div><div class="pill-count">${WINDS.map(w=>`<span>${w}: ${s.buildCounts[w]}/18 stacks</span>`).join('')}</div><div class="button-grid">${WINDS.map(w=>`<button data-build="${w}" ${s.buildCounts[w]===18?'disabled':''}>Build ${w} +6</button>`).join('')}</div>`;break;case 'builtcheck':h='<button id="confirmBtn">144 tiles — looks correct!</button>';break;case 'roll':case 'breakroll':h=`<button id="rollBtn">🎲 Roll three dice</button>`;if(s.dice.length)h+=`<div class="big-total">${s.dice.join(' + ')} = ${s.dice.reduce((a,b)=>a+b,0)}</div>`;if(k==='breakroll'&&s.dice.length)h+=`<div class="button-grid">${WINDS.map(w=>`<button data-wall="${w}">${w}</button>`).join('')}</div>`;break;case 'wallselect':h=`<div class="big-total">${s.dice.join(' + ')} = ${s.dice.reduce((a,b)=>a+b,0)}</div><div class="chip">Click the correct seat / wall.</div>`;break;case 'count':h=`<div class="chip">${s.counts.length} / ${s.dice.reduce((a,b)=>a+b,0)} stacks counted. Tap stacks along ${s.selectedWall}'s wall.</div>`;break;case 'breakconfirm':h='<button id="confirmBtn">Open the wall at this break</button>';break;case 'deal4':case 'deal1':h=`<div class="chip">${(k==='deal4'&&s.hands.every(h=>h.length===12))||(k==='deal1'&&s.hands.every((h,i)=>h.length===(i===0?14:13)))?'Dealing for this step is complete. Select Next. ':''}The yellow DRAW marker identifies the next stack on the live side of the BREAK. The separate REPLACEMENT END is not used for ordinary dealing. Next recipient: ${WINDS[s.dealIndex%4]}. Click the appropriate seat.</div><div class="pill-count">${WINDS.map((w,i)=>`<span>${w}: ${s.hands[i].length}</span>`).join('')}</div>`;break;case 'dealcheck':h=`<div class="pill-count">${WINDS.map((w,i)=>`<span>${w}: ${s.hands[i].length} / ${i===0?14:13}</span>`).join('')}</div><button id="confirmBtn" ${s.hands.every((h,i)=>h.length===(i===0?14:13))?'':'disabled'}>Verify final hand sizes ✓</button>`;break;case 'turn-east-first':case 'turn-east-discard':h=`<div class="chip">Select one tile in East’s face-up hand at the bottom of the table to discard. East: ${s.hands[0].length} tiles. Click any tile in your hand.</div><div class="pill-count">${WINDS.map((w,i)=>`<span>${w}: ${s.hands[i].length} in hand · ${s.discards[i].length} discards</span>`).join('')}</div>`;break;case 'turn-opponents':h=`<div class="chip">The opponents draw one tile and discard one each, in order. You control when each turn happens so you can see the live wall shrink.</div><div class="pill-count">${WINDS.slice(1).map((w,i)=>`<span>${w}: ${s.discards[i+1].length} discard</span>`).join('')}</div><button id="opponentBtn" ${s.opponentsPlayed===3?'disabled':''}>▶ Play ${WINDS[s.opponentsPlayed+1]||'completed'} turn</button>`;break;case 'turn-east-draw':h=`<div class="chip">It’s East’s turn again. East currently has ${s.hands[0].length} tiles; tap the button to draw from the highlighted live wall. The replacement end is not used.</div><button id="drawLiveBtn" ${s.drawnThisTurn?'disabled':''}>Draw one tile from live wall</button>`;break;case 'set-chow':case 'set-pung':case 'set-kong':case 'set-pair':{const ex=MELD_EXERCISES[k];h=`<div class="chip">${ex.instruction} Click ${ex.required} tiles on the table. Click a selected tile again to undo.</div><div class="pill-count"><span>${s.exerciseSelected.size} / ${ex.required} selected</span></div><div class="button-grid"><button id="checkSetBtn" ${s.exerciseCorrect?'disabled':''}>Check my tiles</button><button id="clearSetBtn">Clear selection</button></div>`;break;}case 'claim-chow':case 'claim-pass':case 'claim-pung':case 'claim-kong':case 'claim-priority':{const ex=CLAIM_EXERCISES[k];h=`<div class="chip">${ex.prompt}</div><div class="button-grid">${ex.choices.map(c=>`<button data-claim="${c}" ${s.exerciseCorrect?'disabled':''}>${c}</button>`).join('')}</div>`;break;}case 'strategy-isolated':case 'strategy-shapes':case 'strategy-pair':case 'strategy-draw':{const ex=STRATEGY_SCENARIOS[k];h=`<div class="chip">${ex.type==='draw'?'Choose a draw that completes 4–5 Bamboo.':'Tap the tile you would discard. Mistakes are safe: the game explains why and lets you retry.'}</div><button id="coachBtn">${s.coachOpen?'Hide Strategy Coach':'💡 Strategy Coach'}</button>${s.coachOpen?`<div class="instruction-note">${ex.coach}</div>`:''}${s.strategyCorrect?`<div class="instruction-note"><strong>Why:</strong> ${ex.reason}</div>`:''}`;break;}case 'win-complete':case 'win-validity':case 'win-alternative':case 'score-dragon':case 'score-concealed':case 'score-bonus':{const ex=WIN_SCENARIOS[k];h=`<div class="chip">${ex.question}</div><div class="button-grid">${ex.choices.map((v,i)=>`<button data-win-button="${i}" ${s.winningCorrect?'disabled':''}>${ex.labels[i]}</button>`).join('')}</div>${s.winningCorrect?`<div class="instruction-note">${ex.explanation}</div>`:''}`;break;}case 'guided-game':h=guidedControls(s);break;case 'flowerpick':h='<div class="chip">East has a full 14-tile hand, and each other player has 13 tiles. Click the two bonus tiles in East’s hand; all other hands are face-down.</div>';break;case 'flowerreplace':h='<div class="chip">The selected bonus tiles are exposed in front of East, and two replacement tiles are drawn from the reserved end. The hand stays at 14 tiles.</div><button id="confirmBtn">Expose & replace bonus tiles</button>';break}
$('interaction').innerHTML=h;document.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>chooseSeat(b.dataset.build));document.querySelectorAll('[data-quiz]').forEach(b=>b.onclick=()=>studyGroup(b.dataset.quiz));document.querySelectorAll('[data-wall]').forEach(b=>b.onclick=()=>chooseSeat(b.dataset.wall));document.querySelectorAll('[data-win-button]').forEach(b=>b.onclick=()=>chooseWinning(WIN_SCENARIOS[k].choices[+b.dataset.winButton]));document.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>chooseClaim(b.dataset.claim));if($('guidedOpponents'))$('guidedOpponents').onclick=guidedOpponents;if($('guidedDraw'))$('guidedDraw').onclick=guidedDraw;if($('guidedWin'))$('guidedWin').onclick=guidedWin;if($('guidedContinue'))$('guidedContinue').onclick=guidedContinue;if($('guidedCoach'))$('guidedCoach').onclick=()=>{s.game.coach=!s.game.coach;renderControls()};if($('guidedXray'))$('guidedXray').onclick=()=>{s.game.xray=!s.game.xray;renderBoard();renderControls()};if($('coachBtn'))$('coachBtn').onclick=()=>{s.coachOpen=!s.coachOpen;renderControls()};if($('checkSetBtn'))$('checkSetBtn').onclick=checkSet;if($('clearSetBtn'))$('clearSetBtn').onclick=()=>{s.exerciseSelected.clear();renderBoard();renderControls()};if($('rollBtn'))$('rollBtn').onclick=roll;if($('opponentBtn'))$('opponentBtn').onclick=playOpponent;if($('drawLiveBtn'))$('drawLiveBtn').onclick=drawForEast;if($('confirmBtn'))$('confirmBtn').onclick=()=>{if(k==='breakconfirm'){s.broken=true;renderBoard();complete('Correct. The wall opens after the counted stacks. Dealing begins from the live side of the opening.')}else if(k==='flowerreplace'){const indexes=[...s.selectedBonus].sort((a,b)=>a-b);for(const i of indexes){const old=s.hands[0][i];if(old && ['Flowers','Seasons'].includes(old.suit)){s.flowerExposed.push(old);let replacement=s.deck.pop();while(replacement&&['Flowers','Seasons'].includes(replacement.suit)){s.flowerExposed.push(replacement);replacement=s.deck.pop()}if(replacement)s.hands[0][i]=replacement;}}s.flowerHand=s.hands[0];s.replacementConfirmed=true;renderBoard();complete('Correct! Both bonus tiles are exposed and replaced. East still has 14 playable tiles; the other three players each have 13.');}else if(k==='dealcheck'){if(s.hands.every((h,i)=>h.length===(i===0?14:13)))complete('Correct starting counts: East 14, all others 13.');else wrong('Hand counts are incorrect. Restart this lesson to deal again.')}else complete('Correct! Four complete double-high walls use all 144 tiles.')};refreshNext();}
function hint(){if(step()[2]==='guided-game'){message(guidedHint(),'info');return;}const k=step()[2],s=state.stage;const hints={suits:'Look for numbered Dots, Bamboo and Characters, 1–9 in each.',honours:'Winds are East, South, West, North. Dragons are Red, Green, White.',bonus:'There are eight unique bonus tiles: four flowers and four seasons.',seatdraw:'Tap each of the four tiles at the center of the table.',east:`Player ${PLAYER_IDS[s.seatTiles.indexOf('East')]} drew East (東). Click that player card.`,seating:`Next wind is ${['East','South','West','North'][s.seatProgress]}. It belongs to Player ${PLAYER_IDS[s.seatTiles.indexOf(['East','South','West','North'][s.seatProgress])]}.`,turnorder:'East → South → West → North. Tap the seats in this order.',build:'Each tap builds six two-high stacks (12 tiles). Complete all 18 stacks on each of the four sides.',roll:'Click the dice button to roll three dice.',wallselect:`Total ${s.dice.reduce((a,b)=>a+b,0)} selects ${chosenWall()}. East counts as 1.`,breakroll:`Total ${s.dice.reduce((a,b)=>a+b,0)} points to ${chosenWall()}.`,count:`Tap stack ${s.counts.length+1}, counting from the wall owner's right end.`,breakconfirm:'The gap goes just after the last counted stack.',deal4:`Give the next four tiles to ${WINDS[s.dealIndex%4]}.`,deal1:`The next player is ${WINDS[s.dealIndex%4]}. East takes 2; others take 1.`,'turn-east-first':'East has 14 tiles, so its first action is a discard, not a draw.', 'turn-opponents':'South draws and discards, then West, then North. Click each opponent in order.', 'turn-east-draw':'Draw from the live wall, never the reserved replacement end.', 'turn-east-discard':'Click any tile in East’s hand. A legal discard reduces 14 tiles to 13.', 'set-chow':'A Chow has three consecutive numbers in the SAME suit, for example 3–4–5 Bamboo.', 'set-pung':'A Pung uses three identical tiles.', 'set-kong':'A Kong uses four identical tiles; draw a replacement in a real hand.', 'set-pair':'A pair is two identical tiles.', 'claim-chow':'North is immediately before East in turn order, so East can Chow North’s discard.', 'claim-pass':'East cannot Chow South’s discard: South is not immediately before East.', 'claim-pung':'An available Pung can be claimed from any opponent.', 'claim-kong':'An exposed Kong needs three matching tiles in hand plus the discard.', 'claim-priority':'A claim of Pung interrupts the usual turn order; valid Mahjong claims have precedence.','win-complete':'A standard hand needs four sets of three and one matching pair. Find the final tile.', 'win-validity':'Check all fourteen tiles: can they be divided into four sets and a pair?', 'win-alternative':'Try each proposed draw using the four-sets-and-a-pair pattern.', 'score-dragon':'Three identical dragon tiles form a dragon Pung.', 'score-concealed':'A concealed hand has no exposed melds; consult your local rules for its value.', 'score-bonus':'Flower and Season tiles are exposed and replaced; they are bonuses, not sets.',flowerpick:'Look in East’s 14-tile hand for Plum and Spring; click those two bonus tiles.'};message(hints[k]||'Follow the instruction, then confirm the step.','info')}
function showMe(){if(step()[2]==='guided-game'){guidedShowMe();return;}const k=step()[2],s=state.stage;if(k==='seatdraw'){s.drawn=new Set([0,1,2,3]);renderBoard();complete('Demonstration: all four wind tiles revealed.')}else if(k==='build'){s.built=new Set(WINDS);s.buildCounts={East:18,South:18,West:18,North:18};renderBoard();renderControls();complete('Demonstration: 144 tiles become four walls, 18 double-high stacks each.')}else if(k==='roll'||k==='breakroll'){roll();if(k==='breakroll'){s.selectedWall=chosenWall();complete(`${s.selectedWall} is selected by the dice.`)}}else if(k==='wallselect'){s.selectedWall=chosenWall();complete(`Demonstration: ${s.selectedWall} is the selected wall.`)}else if(k==='count'){s.counts=Array.from({length:s.dice.reduce((a,b)=>a+b,0)},(_,i)=>17-i);renderBoard();complete('Demonstration: counting from the wall owner’s right-hand end.')}else if(k==='deal4'){while(s.dealIndex<12){let idx=s.dealIndex%4;for(let i=0;i<4;i++)s.hands[idx].push(takeLiveTile(s));s.dealIndex++}renderBoard();complete('Demonstration: all four players now have 12 tiles.')}else if(k==='deal1'){while(s.dealIndex<16){let idx=s.dealIndex%4;for(let i=0;i<(idx===0?2:1);i++)s.hands[idx].push(takeLiveTile(s));s.dealIndex++}renderBoard();complete('Demonstration: East 14; other players 13.')}else if(['suits','honours','bonus'].includes(k)){s.groupsSeen=new Set(targets());renderBoard();renderControls();complete('Demonstration: each tile family has been identified.');}else if(k==='turn-east-first'||k==='turn-east-discard'){discardFromEast(0)}else if(k==='turn-opponents'){while(s.opponentsPlayed<3)playOpponent()}else if(k==='turn-east-draw'){drawForEast()}else if(WIN_SCENARIOS[k]){chooseWinning(WIN_SCENARIOS[k].answer)}else if(STRATEGY_SCENARIOS[k]){strategyChoose(STRATEGY_SCENARIOS[k].good[0])}else if(k.startsWith('set-')){const ex=MELD_EXERCISES[k];s.exerciseSelected=new Set(ex.correct);checkSet();}else if(k.startsWith('claim-')){chooseClaim(CLAIM_EXERCISES[k].correct)}else if(k==='flowerpick'){s.selectedBonus=new Set([0,2]);s.bonusCount=2;complete('Plum and Spring are both bonus tiles.')}else if(k==='east'){const i=s.seatTiles.indexOf('East');s.dealerFound=true;renderBoard();complete(`Player ${PLAYER_IDS[i]} is East and is the dealer.`)}else if(k==='seating'||k==='turnorder'){s[k==='seating'?'seatProgress':'orderProgress']=4;renderBoard();complete('Demonstration: East → South → West → North.')} else if(k==='breakconfirm'){s.broken=true;renderBoard();complete('Demonstration: gap made after the counted stacks.')}else complete('Demonstration complete. Continue when ready.')}
function reference(){
 const groups=['Dots','Bamboo','Characters','Winds','Dragons','Flowers','Seasons'];
 $('tileReference').innerHTML=groups.map(key=>{
  const info=FAMILY_TERMS[key];
  return `<section class="tile-section"><h3>${key} <span class="term-chinese" lang="zh-Hant">${info.zh}</span><span class="muted"> (${info.pinyin})</span></h3><p class="tile-family-info"><strong>Also:</strong> ${info.aliases}. ${info.summary}</p><div class="tiles">${TILES.filter(t=>t.suit===key).map(t=>{
   const term=tileTerm(t),short=t.number?`${t.number} ${key==='Dots'?'筒':key==='Bamboo'?'索':'萬'}`:`${t.name.replace(' dragon','')} · ${(TILE_TERMS[t.id]||[])[0]||''}`;
   return `<div class="ref-tile" title="${term}" tabindex="0" aria-label="${term}"><svg viewBox="-24 -35 48 70" role="img" aria-label="${t.name}">${tileSVG(t,0,0,44,61)}</svg><span class="tile-label" style="display:${state.labels?'':'none'}">${short}</span>${!t.number&&state.labels?`<span class="tile-pinyin">${TILE_TERMS[t.id][1]}</span>`:''}</div>`;
  }).join('')}</div></section>`;
 }).join('')+`<section class="tile-terms-guide"><strong>Glossary · 常用術語</strong><p><b>Honour tiles</b> (字牌, zìpái): winds and dragons. <b>Bonus tiles</b> (花牌, huāpái): flowers and seasons. <b>Dealer</b> (莊家, zhuāngjiā): East. <b>Wall</b> (牌牆, páiqiáng): stacked face-down tiles. <b>Draw</b> (摸牌, mōpái): take a tile. <b>Discard</b> (打牌, dǎpái): put a tile out. <b>Chow</b> (吃, chī): three consecutive suited tiles; <b>Pung</b> (碰, pèng): three identical tiles; <b>Kong</b> (槓, gàng): four identical tiles.</p><small>Mandarin pinyin shown; pronunciations and tile names vary by region. Hover or focus a tile for its complete name.</small></section>`;
}
function closePath(){$('pathMenu').hidden=true;$('homeBtn').setAttribute('aria-expanded','false')}function openPath(){$('pathMenu').hidden=false;$('homeBtn').setAttribute('aria-expanded','true')} $('hintBtn').onclick=hint;$('showBtn').onclick=showMe;$('nextBtn').onclick=next;$('backBtn').onclick=prev;$('homeBtn').onclick=()=>{let opened=!$('pathMenu').hidden;opened?closePath():openPath()};document.addEventListener('pointerdown',e=>{if(!$('pathWrap').contains(e.target))closePath()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closePath()});$('modeSelect').onchange=e=>{state.mode=e.target.value;setup()};$('labelsToggle').checked=state.labels;$('labelsToggle').onchange=e=>{state.labels=e.target.checked;persist();reference()};$('soundBtn').onclick=()=>{state.sound=!state.sound;$('soundBtn').textContent=state.sound?'♫ On':'♪ Off';persist();beep()};$('soundBtn').textContent=state.sound?'♫ On':'♪ Off';$('settingsBtn').onclick=()=>$('settingsDialog').showModal();$('closeSettings').onclick=()=>$('settingsDialog').close();$('speedSelect').value=state.speed;$('speedSelect').onchange=e=>{state.speed=e.target.value;persist()};$('reduceMotion').checked=state.reduced;$('reduceMotion').onchange=e=>{state.reduced=e.target.checked;persist()};$('resetBtn').onclick=()=>{if(confirm('Reset all completed lessons and settings?')){state.done.clear();setLesson(0);persist()}};reference();setup();
