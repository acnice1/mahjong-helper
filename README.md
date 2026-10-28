# Mahjong Helper — Phase 1

Open `index.html` in a modern desktop or mobile browser. Keep `index.html`, `style.css`, `tiles.js`, and `script.js` in the same folder. No internet connection or installation is required.

This is a first playable learning build of the seven setup lessons: tiles, seating, walls, dice, wall break, dealing, flowers/seasons. Navigate with the lesson selector. `Guided example` uses a consistent dice roll; `Random practice` changes the dice. Use Hint or Show me if stuck. Lesson completion is stored in localStorage.

## Rules convention
Uses a 144-tile Chinese / Hong Kong-style setup: four walls of 18 stacks, 2 high; three dice (East rolls), wall count East-South-West-North with East = 1, counting stacks from the selected wall owner's right end. Hand sizes: East 14 and other players 13. Bonus flower/season tiles are exposed and replaced from the replacement end. Mahjong house rules vary.

## Notes about this initial build
The table teaches setup procedures rather than simulating all 144 physical tiles leaving the live wall. Interactive dealing shows hand counts and face-down tiles, and wall breaking uses selectable stacks. The seating lesson demonstrates wind-tile identification; a fully physical wind-selection ceremony, detailed wall-tile depletion, tile-face accuracy improvements, and advanced animated dealing remain future refinements. Scoring, claiming, opponents and full-hand play are planned for later phases.

References: https://mahjonglogbook.com/en/guides/hong-kong-mahjong-rules/ and https://www.ymimports.com/pages/how-to-play-chinese-mahjong


## Phase 2A — Drawing & Discarding (Lesson 8)

The learning path now includes **Drawing & discarding**, a four-step guided
exercise: East discards from its initial 14 tiles; South, West, and North
each draw from the live wall and discard; East draws and discards again.
The SVG table shows all four concealed hands (East face up), individual discard
areas, the live wall draw marker, and depletion of the live wall.
All player hands finish with 13 tiles. The example intentionally uses no
flowers or seasons so that replacement draws do not distract from turn order.
This is a focused tutorial, **not yet** a fully autonomous Mahjong rules engine
or a complete playable hand; claiming discards and scoring come later.

## Phase 2B
Lessons 9 and 10 add hands-on set building and discard claim eligibility. Select tiles in the center for Chow, Pung, Kong, pair puzzles and choose a call or Pass for five discard scenarios. These are guided exercises, not a full meld engine or opponent AI.


## Phase 2C — Lesson 11: Develop your hand
Four illustrated, interactive decisions introduce isolated tiles, flexible adjacent shapes, preserving a pair, and two-sided useful draws. Click a tile on the table; incorrect choices are explained and can be retried. The optional Strategy Coach provides a hint, and Show Me demonstrates an accepted choice. These are deliberately controlled instructional scenarios—not a full Mahjong hand-efficiency solver or a guarantee of the single best discard.

## Phase 3A — Lessons 12 and 13
Lesson 12 adds interactive standard-hand puzzles, checking the four sets plus one pair
rule with a recursive hand validator (including Chow and Pung combinations). It does
not validate regional special hands or full Kong / replacement sequences. Lesson 13
teaches basic scoring *features* (dragon Pung, concealed hand, bonus tiles), not
numerical points: traditional Chinese scoring systems vary and no complete point
schedule has been selected. The fully guided playable hand and regional scoring
calculator remain future work.


## Phase 3B: Guided playable hand
Lesson 14 demonstrates a synchronized 144-tile inventory, real wall depletion, counterclockwise automated turns, optional X-ray and coach, and a guaranteed winning draw. This is a short scripted guided hand, not yet an unrestricted multi-round game.

## Guided hand wall view fix
Lesson 14 now renders the physical walls, the BREAK marker, the separated 14-tile replacement end (seven stacks), and the highlighted DRAW stack. The same drawPointer and takenStacks state used for dealing and drawing determines which tiles remain visible. The live wall starts with 77 tiles after the initial 53-tile deal and separate 14-tile replacement reserve.

### Phase 3B draw variety update
East begins with an isolated 9 Dots, then draws a North Wind and Green Dragon before drawing the winning 3 Dots on the third circuit. The lesson accepts the isolated tile appropriate to each turn and keeps all tile inventory checks intact.


## Simulation mode — Lesson 15

A standalone **four-circuit training simulation** with no hints or move correction.
Choose any discard, advance the three controlled opponents, and draw from the tracked live wall.
A constructed winning draw is available to East on circuit four **if the player preserves the required tiles**. If East has not won by circuit five, South draws a legal winning tile and wins. This is an intentionally scripted opponent outcome, **not** a general opponent AI, and the mode does not yet offer meld claims, flower replacement, or full competitive rounds.


## Five simulation scenarios

Select **Simulation · Five games** in Learning Path, then choose a game from the selector in the lesson panel. Games range from a single missing tile to multiple incomplete groups and pairs; each scenario uses a fresh 144-tile physical inventory. All have a legal winning route by the fourth full circuit if the right tiles are retained. Choosing a different scenario resets the current simulation. No hints or corrections are provided. South has a scripted possible fifth-circuit win if East fails to win. These remain teaching scenarios, not an open-ended Mahjong rules engine; Chow/Pung/Kong claims and general opponent strategy are not yet supported.
