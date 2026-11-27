// COLD SUNSET — the engine. Deterministic, seeded, node-runnable, no DOM.
// An asymmetric hide-and-hunt: THE WALKER (one hidden veteran) vs THE LAW (the Sheriff + deputies + the K-9),
// with VERNA, his sister, as an independent automa and, in the expansion (COLD SUNSET: WE'RE HERE TO HELP [P]),
// MR. HELLER, the weather, the Nightmare deck, Psyche+, Ordnance+ and the Redacted Files.
//
// Every number is a knob in AS_WRITTEN (the source rules read literally, our defaults where they are silent)
// and TUNED (the house default the bench and the printed rules use). docs/DESIGN.md says where each came from.
// One input seam (E6): game.pending() -> { seat, fig, options[] } ; game.choose(optionId). Bots plug the same seam.
// Rendering never touches game RNG (E1).

// ---------------- RNG (sfc32 seeded by splitmix32) ----------------
export function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  const sm = () => { s = (s + 0x9e3779b9) >>> 0; let z = s; z = Math.imul(z ^ (z >>> 16), 0x85ebca6b); z = Math.imul(z ^ (z >>> 13), 0xc2b2ae35); return (z ^ (z >>> 16)) >>> 0; };
  let a = sm(), b = sm(), c = sm(), d = sm();
  const next = () => { a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; let t = (a + b) | 0; a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); d = (d + 1) | 0; t = (t + d) | 0; c = (c + t) | 0; return (t >>> 0) / 4294967296; };
  for (let i = 0; i < 12; i++) next();
  const r = { next, d6: () => 1 + Math.floor(next() * 6), int: (n) => Math.floor(next() * n), pick: (arr) => arr[Math.floor(next() * arr.length)],
    shuffle: (arr) => { const x = arr.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; } };
  return r;
}

// ---------------- KNOBS ----------------
// AS_WRITTEN: the clean/refined core + the ADJUSTED expansion read literally; where they are silent we pick the
// smallest default and file a Q (docs/DESIGN.md §Q). TUNED: what the battery says makes a fair asymmetric game.
export const AS_WRITTEN = {
  name: "AS WRITTEN",
  walkerHP: 6, sheriffHP: 6, otherHP: 5, healCap: 3,
  walkerStart: { rage: 1, zen: 1, psyche: 3 },
  nerve: { walker: 4, sheriff: 4, sister: 4, pruitt: 2, varner: 5, tolley: 3, crane: 3, heller: 3 },
  killRage: 4,             // Rage at which kill logic takes over (no WOUND; must FIRE at a hunter in his zone)
  coldAt: 6,               // Spiral at which the Cold Zone opens
  holdRounds: 2,           // rounds the Walker must hold the Cold Zone clean (expansion: 3)
  cleanZen: 2, cleanPsyche: 1,
  spiralMax: 10, guardMax: 6, showdownAt: 9,
  setupTraps: 3, trapKits: 2, caches: 2,
  trapLive: [1, 2],        // Risk Roll faces that make traps live
  riskEscalate: [6],       // Risk Roll faces that raise the Guard (+1) — our default for "global pressure"
  hitSame: 3, hitAdj: 4,
  scanSame: 3, scanAdj: 4, // d6 a Law SCAN needs to find him in its own zone / the next   // d6 needed to hit a target in your zone / the next zone
  reachHim: 5,               // REACH HIM succeeds on this or better
  misreadOn: 4,            // with Rage >= killRage the Walker misreads his sister coming: this or better kills her
  sisterArrive: 1,        // round the Sister arrives (2P text: she moves every round)
  sisterMove: "d6",       // "d6" = 1d6 zones toward the Walker (as written); a number = fixed steps
  sisterHidden: "COLD",   // where she heads when the Walker is hidden: "COLD" (as written) | "LASTSEEN"
  sisterTalksAdjacent: false, // as written: REACH HIM auto-triggers only when she ENTERS the Walker's zone
  clockEvery: 3,           // the Spiral clock: Spiral +1 every N rounds in PRESSURE (0 = none). 1124 Order 45 (Joe: GO): every 3rd
                           // round the Spiral advances by itself; the source reading had none (0): AS_WRITTEN_PRE45 below
  guardClockEvery: 0,      // 0 = no Guard clock; N = Guard +1 every N rounds
  townSightGuard: 1,       // Guard +1 when the Walker is sighted in a TOWN zone ("public escalation")
  allDeputies: false,      // false = as written: in a 3+ player game only the deputies players chose are on the board
  capForces: false,        // true = reaching the round cap forces the Spiral-10 ending (a provable terminus)
  roundCap: 40,            // stall cap (a game that reaches it ends STALL — the laws say it must not happen)
  dogSteps: 2,
  callOutSpiral: 1,        // a Law CALL OUT (radio the state) costs Spiral +1
  callOutLimit: 1,         // how many times a game the Law may radio the state. 1125 Joe: ONCE (the source had no limit, 0: a strong Law spammed it, Walker 2.6%)
  psychePlusAt: 7,         // expansion: Psyche+ replaces Trauma at this Spiral (as written: 7)
  // expansion
  hellerZenReset: "reset", // "reset" = all Zen to 0 at end of each round (as written); "sighted" = -1 only on rounds he's sighted
  holdRoundsX: 3,
  echoWho: "any",          // Chopper Echo: "any" figure ending there raises the Guard (as written) | "walker"
  overrideAt10: true,
  riseDraw: "every",       // Trauma at Spiral 6+: "every" rise draws (the literal "6+") | "once" (when it first reaches 6)
  clockX: null,            // the Spiral clock with the expansion (null = same as core; the weather's STILL COLD is a clock of its own)
  hellerEvery: 3,          // Heller-initiated Nightmare: every Nth round below Spiral 6 (0 = only at Spiral 6+)
  riskEscalateX: null,     // with the expansion: the Risk faces that raise the Guard (null = same as core)
  talkAdjX: null,          // with the expansion: does voice range include the next zone? (null = same as core)
  overrideNeedsSight: false, // FINAL OVERRIDE needs Heller to know where he is (seen this round or last)
  // the dead-verb pass (1123, docs/VERBS-1123.md): each verb gets one payoff nothing else gives
  walkerCallOut: "zen",    // the Walker's CALL OUT: "zen" (as written: Zen +1, seen) | "warning" (HOLLER: also Guard −1)
  woundCarry: false,       // a WOUND: false (as written: they lose a round) | true (carried out: back to the county jail, and they lose a round)
  holdNeedsClear: false,   // the Cold Zone hold ticks only with no hunter standing in the Cold Zone (what a WOUND is for)
  lawRadio: "scan",        // the Law's CALL OUT: "scan" (as written: SCANs +1 this round) | "ground" (the chopper names the ground he's on)
  radioStealth: false,     // with "ground": a Walker who went to ground (STEALTH) that round isn't spotted by the chopper
  // the expansion rebalance (1123)
  hellerColdFree: false,   // Heller's aura (Zen −1 when seen) stops at the Cold Zone's edge
  cleanBeatsOverride: false, // Spiral 10: clean in the Cold Zone is checked BEFORE Heller's FINAL OVERRIDE (as written: after)
  filesOnArrival: false,   // expansion, NOT used (too strong: Walker 52–77%): the Sister digs for files from the day she gets there
  hellerScan: true,        // Heller's "+1 to deputies' Risk Rolls" covers SCAN as well as FIRE (Q1576); measured: no effect either way
  // 1124 rule switches (the build-up ladder, docs/LADDER-1124.md, and CORE10): every one is ON in AS_WRITTEN and TUNED.
  // Off = the rule isn't in the game at all (no option offered, no effect). walkerCallOut "none" / lawRadio "none" = no CALL OUT.
  lawFire: true,           // the Law's FIRE (and Pruitt's SNAP FIRE)
  walkerFire: true,        // the Walker's FIRE (WOUND / KILL) and kill logic's forced shot
  ambush: true,            // the Law's STEALTH = hold an ambush
  walkerScan: true,        // the Walker's SCAN (listen: Zen +1, Rage −1)
  run: true,               // the Walker's RUN (two zones, loud)
  trauma: true,            // the Trauma deck (and every Trauma's Spiral +1)
  faceoff: true,           // Spiral 10 with the Sheriff alive: the face-off (off: straight to THE NET CLOSES)
  sheriffKit: true,          // the Sheriff's pistol (Coiled Precision), DESPERATE and the weapon SWAP
  deputyKit: true,         // the deputies' auras + abilities (Pruitt, Varner, Tolley + Boone, Crane): true | false | ["tolley", …]
  walkerAura: true,        // the Walker's aura: shots at him from inside his own zone are −1
  bravery: true,           // LEGENDARY BRAVERY (once a game, up at 1 HP)
  rifle: true,             // the rifle at the hunter's camp (and dead deputies' rifles)
  shafts: true,            // the mineshaft hazard roll
  // 1127 order 102 (docs/SYSTEMS-AUDIT-1126.md §4): switches that start OFF. All OFF = the game as it was, seed for seed.
  fogSheet: false,         // P1: true = view("law") omits the Walker's sheet (rage, zen, psyche, hold, weapon) and the rifle list (the kit's screen)
  endNeedsHold: "off",     // P2: Spiral 10, clean in the Cold Zone: "off" = wins (today) · "clear" = only with no hunter standing in it · "held" = clear AND the hold was at 1+ before this Collapse
};
export const TUNED = {
  ...AS_WRITTEN, name: "TUNED",
  allDeputies: true,       // all four deputies are always on the board; extra players take them over (shared table control)
  clockEvery: 2,           // the sun goes down: Spiral +1 every 2nd round (L2: a provable terminus, ≤ 20 rounds)
  guardClockEvery: 0,
  sisterArrive: 6,        // she drives all night and gets there at sundown, not round 1
  sisterMove: 1,          // she walks; she doesn't teleport
  sisterHidden: "LASTSEEN", // she goes where the Walker was last seen, not to the Cold Zone to wait
  sisterTalksAdjacent: true,  // voice range = same or next zone (the refined text)
  reachHim: 6,
  hellerZenReset: "sighted",
  echoWho: "walker",
  riseDraw: "once",
  clockX: 0,               // with the expansion the weather (STILL COLD) is the clock
  overrideNeedsSight: true,
  talkAdjX: false,         // with the expansion he has to walk into the zone to talk (Heller's world is louder)
  riskEscalateX: [],       // with the expansion the weather is the pressure; the Risk Roll stops raising the Guard
  psychePlusAt: 8,         // Psyche+ takes over one step later
  hellerEvery: 0,          // Heller plays Nightmare cards only at Spiral 6+ (the battery: every 3rd round runs the Spiral away)
  capForces: true,
  roundCap: 30,
  callOutLimit: 1,         // the radio budget: 1117 was 2 (CALL-OUT spam rushed the Spiral); 1123: once, now the chopper names his ground
  // 1123 the dead-verb pass [PROPOSALS P1–P3, docs/DESIGN.md §7 + docs/VERBS-1123.md]
  walkerCallOut: "warning", // P1 HOLLER: his CALL OUT also lowers the Guard by 1 — the only thing he can do to the Guard
  woundCarry: true,        // P2 a WOUND carries the hunter out to the county jail …
  holdNeedsClear: true,    // P2 … and the hold only ticks with no hunter in the Cold Zone: the wound is how he clears it, clean
  lawRadio: "ground",      // P3 the Law's CALL OUT: the chopper names the ground he's on (town / foothills / deep woods / Cold Zone)
  radioStealth: true,      // P3 … unless he went to ground that round
  // 1123 the expansion rebalance [PROPOSALS P4–P5]: Walker 24% → ~35%
  hellerColdFree: true,    // P4 Heller's aura (Zen −1 when seen) stops at the Cold Zone's edge
  cleanBeatsOverride: true, // P5 at Spiral 10, clean in the Cold Zone beats FINAL OVERRIDE
};
// CORE10 (1124): the core in ten printed rules (docs/rules/CORE10.md), the stranger-table game. TUNED minus the rules the
// build-up ladder and the removal test found don't pay (docs/LADDER-1124.md): caches, the rifle, the Sheriff's kit, the
// Walker's aura + LEGENDARY BRAVERY, the mineshaft hazard, and Varner's and Crane's kits (they play as plain deputies).
// Measured (6000 games, players 2–6): Walker 40.9 / Law 43.7 / Sister 15.2 vs TUNED 40.5 / 45.1 / 14.3. Core only:
// the expansion still layers on TUNED.
export const CORE10 = {
  ...TUNED, name: "CORE 10",
  caches: 0, rifle: false, sheriffKit: false, walkerAura: false, bravery: false, shafts: false,
  deputyKit: ["pruitt", "tolley"],
};
// AS_WRITTEN_PRE45: the source reading before Order 45 (no Spiral clock). Same game, seed for seed, as AS_WRITTEN was at 7351a4d.
export const AS_WRITTEN_PRE45 = { ...AS_WRITTEN, name: "AS WRITTEN (pre-45)", clockEvery: 0, callOutLimit: 0 };
export const PRESETS = { AS_WRITTEN, TUNED, CORE10, AS_WRITTEN_PRE45 };

// ---------------- THE BOARD: the Spiral Grid (14 zones + the Cold Zone) ----------------
// Tallow Gap, Merritt County, Tennessee, up onto the Cumberland Plateau: town → the creek → the bluffs → the bald → the old mine → the sink → out.
export const ZONES = [
  { id: "STATION", name: "COUNTY JAIL", tier: "TOWN", x: 2, y: 9 },
  { id: "MAIN", name: "THE SQUARE", tier: "TOWN", x: 10, y: 9 },
  { id: "BRIDGE", name: "SLAB BRIDGE", tier: "TOWN", x: 18, y: 9 },
  { id: "POST", name: "FEED STORE", tier: "TOWN", x: 10, y: 12 },
  { id: "BEND", name: "SAWMILL BEND", tier: "FOOTHILLS", x: 26, y: 9 },
  { id: "DRAW", name: "DEER CAMP", tier: "FOOTHILLS", x: 34, y: 6 },
  { id: "BLUFF", name: "THE SANDROCK", tier: "FOOTHILLS", x: 42, y: 9 },
  { id: "GRASS", name: "THE BALD", tier: "FOOTHILLS", x: 42, y: 3 },
  { id: "VALLEY", name: "CREEK BOTTOM", tier: "FOOTHILLS", x: 26, y: 12 },
  { id: "RAVINE", name: "THE GORGE", tier: "DEEP", x: 42, y: 12 },
  { id: "MINE", name: "NO. 4 MINE", tier: "DEEP", x: 50, y: 3 },
  { id: "SQUEEZE", name: "THE SINK", tier: "DEEP", x: 58, y: 6 },
  { id: "TRAIL", name: "LOGGING ROAD", tier: "DEEP", x: 50, y: 6 },
  { id: "RIDGE", name: "FIRE TOWER", tier: "DEEP", x: 50, y: 12 },
  { id: "COLD", name: "THE COLD ZONE", tier: "COLD", x: 58, y: 12 },
];
export const ZONE = Object.fromEntries(ZONES.map(z => [z.id, z]));
const LINKS = [
  ["STATION", "MAIN"], ["MAIN", "BRIDGE"], ["MAIN", "POST"], ["BRIDGE", "BEND"], ["POST", "VALLEY"],
  ["BEND", "DRAW"], ["BEND", "VALLEY"], ["DRAW", "BLUFF"], ["DRAW", "GRASS"], ["BLUFF", "VALLEY"], ["BLUFF", "RAVINE"],
  ["GRASS", "TRAIL"], ["GRASS", "MINE"], ["VALLEY", "RAVINE"], ["RAVINE", "RIDGE"], ["TRAIL", "RIDGE"], ["TRAIL", "MINE"],
  ["MINE", "SQUEEZE", "shaft"], ["SQUEEZE", "BRIDGE", "shaft"], ["RIDGE", "COLD"], ["SQUEEZE", "COLD"],
];
export const ADJ = Object.fromEntries(ZONES.map(z => [z.id, []]));
for (const [a, b, kind] of LINKS) { ADJ[a].push({ to: b, shaft: kind === "shaft" }); ADJ[b].push({ to: a, shaft: kind === "shaft" }); }
export const DIST = {};
for (const z of ZONES) { const d = { [z.id]: 0 }, q = [z.id]; while (q.length) { const x = q.shift(); for (const l of ADJ[x]) if (!(l.to in d)) { d[l.to] = d[x] + 1; q.push(l.to); } } DIST[z.id] = d; }
export const dist = (a, b) => DIST[a][b];
export const adjacent = (a, b) => ADJ[a].some(l => l.to === b);
// the expansion overlay (COLD SUNSET board overlay, as written)
export const OVERLAY = {
  frost: ["BLUFF", "VALLEY", "DRAW"],       // move cost doubled (3 zones; the overlay says 3–4, placement is ours)
  whiteout: ["GRASS", "TRAIL"],             // no ranged fire into or out of
  frozenSites: ["DRAW", "MINE"],            // traps live on Risk 1–3
  icedBridge: ["BRIDGE"],                   // a full action to cross (cost 2)
  blockedCave: "SQUEEZE",                   // usable only after Spiral 7
  echo: ["VALLEY", "BLUFF"],                // ending a turn here: Guard +1
  sisterPath: ["POST", "VALLEY", "BLUFF", "RAVINE", "RIDGE"], // the Sister's road in: Redacted Files come faster here
};

// ---------------- THE CAST ([P] names — docs/LORE+NAMES.md has the rename table) ----------------
export const ROLES = {
  walker: { key: "walker", name: "ROOK", title: "THE WALKER", side: "walker", aura: "CLOSE COUNTRY", ability: "LEGENDARY BRAVERY", glyph: "W" },
  sheriff: { key: "sheriff", name: "SHERIFF MABRY", title: "THE SHERIFF", side: "law", aura: "TACTICAL OVERRIDE", ability: "COUNTY BUSINESS", glyph: "M" },
  pruitt: { key: "pruitt", name: "SGT. PRUITT", title: "DEPUTY", side: "law", aura: "LOUD FIRST", ability: "SNAP FIRE", glyph: "P" },
  varner: { key: "varner", name: "DEP. VARNER", title: "DEPUTY", side: "law", aura: "COLD SHOT", ability: "NONLETHAL STUN", glyph: "V" },
  tolley: { key: "tolley", name: "TOLLEY", title: "DOG MAN", side: "law", aura: "BONDED UNIT", ability: "COMMAND DOG", glyph: "T" },
  crane: { key: "crane", name: "DEP. CRANE", title: "DEPUTY", side: "law", aura: "EARLY WARNING", ability: "ANCHOR", glyph: "C" },
  sister: { key: "sister", name: "VERNA ROOK", title: "THE SISTER", side: "sister", aura: "PORCH LIGHT", ability: "REACH HIM", glyph: "S" },
  heller: { key: "heller", name: "MR. HELLER", title: "THE SPOOK", side: "heller", aura: "OPERATIONAL CLARITY", ability: "OVERRIDE", glyph: "X" },
  dog: { key: "dog", name: "BOONE", title: "THE K-9", side: "law", glyph: "d" },
};
export const DEPUTY_ORDER = ["pruitt", "varner", "tolley", "crane"];   // who joins first in a 3–5 player game

// ---------------- ENDINGS ----------------
export const ENDINGS = {
  CLEAN_EVASION: { n: 1, title: "CLEAN EVASION", winner: "WALKER", line: "He went up into the cold with nothing in his hands. Nobody followed him far enough to matter." },
  BROUGHT_HOME: { n: 2, title: "BROUGHT HOME", winner: "SISTER", line: "Verna called him by the name their mother used. He set the shovel down and walked out with her." },
  COUNTY_BUSINESS: { n: 3, title: "COUNTY BUSINESS", winner: "LAW", line: "Mabry settled it himself, up on the plateau, the way he'd wanted to all day. The county went back to sleep." },
  AT_WHAT_COST: { n: 4, title: "AT WHAT COST", winner: "LAW", line: "Mabry got him. Then he had to drive home and keep living in that county." },
  FINAL_MISREAD: { n: 5, title: "FINAL MISREAD", winner: "NOBODY", line: "Somebody came up the hill too fast and he turned and fired. It was Verna." },
  NET_CLOSES: { n: 6, title: "THE NET CLOSES", winner: "LAW", line: "The state came up the mountain in trucks. After that nobody in Merritt County had a say." },
  // expansion additions
  THE_TRUTH: { n: 7, title: "THE TRUTH", winner: "WALKER", x: true, line: "Three files and one long talk on a cold rock. The Spiral stopped at nine and the two of them walked down together." },
  DISAPPEARED: { n: 8, title: "FINAL OVERRIDE: DISAPPEARED", winner: "HELLER", x: true, line: "There was no record of him by morning. Mr. Heller thanked everyone for their help." },
  OVERRIDE_CAUGHT: { n: 9, title: "FINAL OVERRIDE: CAUGHT", winner: "LAW", x: true, line: "The paperwork was already filled out. They only needed his signature, and then they didn't." },
  STALL: { n: 0, title: "STALL", winner: "NOBODY", line: "Nothing happened for a long time. (The game hit its round cap — a rules bug, not an ending.)" },
};

// ---------------- DECKS ----------------
const TRAUMA = [
  ...Array(4).fill({ k: "PSYCHE", t: "SMALL ROOMS", d: "When you draw this, raise your PSYCHE by 1." }),
  ...Array(2).fill({ k: "RAGE", t: "HANDS ON HIM", d: "When you draw this, raise your RAGE by 1." }),
  ...Array(2).fill({ k: "ZEN", t: "THE NAMES", d: "When you draw this, lower your ZEN by 1 (not below 0)." }),
  ...Array(2).fill({ k: "FLASH", t: "LOST TIME", d: "When you draw this, lose your next action." }),
  { k: "HEAL", t: "LIVING ROUGH", d: "When you draw this, heal 1 HP, unless you are at full HP or have already healed 3 HP this game." },
  { k: "NONE", t: "STAY UPRIGHT", d: "When you draw this, nothing else happens.", f: "You don't recover. You stay upright." },
];
const PSYCHE_PLUS = [
  ...Array(3).fill({ k: "PSYCHE2", t: "MEMORY COLLAPSE", d: "When you draw this, raise your PSYCHE by 2." }),
  ...Array(3).fill({ k: "ECHO", t: "ECHO TRAUMA", d: "When you draw this, raise your PSYCHE by 1. Raise your RAGE by 1." }),
  ...Array(3).fill({ k: "FLASH", t: "TURN RECURSION", d: "When you draw this, lose your next action." }),
  ...Array(3).fill({ k: "ZEN2", t: "IDENTITY CONFUSION", d: "When you draw this, lower your ZEN by 2 (not below 0)." }),
  ...Array(3).fill({ k: "ZENUP", t: "STILLNESS", d: "When you draw this, raise your ZEN by 1." }),
];
const NIGHTMARE = [
  ...Array(3).fill({ k: "SEIZE", t: "SEIZED", d: "When HELLER plays this, pick 1 DEPUTY at random. That DEPUTY loses their action this round." }),
  ...Array(3).fill({ k: "NOAURA", t: "AURAS CANCELLED", d: "When HELLER plays this, ignore every AURA on both sides until the end of this round." }),
  ...Array(3).fill({ k: "CONFLICT", t: "CONFLICTING ORDERS", d: "When HELLER plays this, pick 2 DEPUTIES at random. Each loses their next action." }),
  ...Array(2).fill({ k: "REASSIGN", t: "REASSIGNED", d: "When HELLER plays this, pick 1 DEPUTY at random. Take them off the board until the end of next round. They return to the same zone." }),
  { k: "SILENCE", t: "SILENCED", d: "When HELLER plays this, pick 1 DEPUTY at random and remove them for the rest of the game. Raise the SPIRAL by 1.", f: "A betrayal is witnessed." },
  ...Array(2).fill({ k: "FALSIFY", t: "FALSIFIED DROP", d: "When HELLER plays this, the next CACHE the WALKER opens gives PSYCHE +1 instead of 1 HP." }),
  ...Array(2).fill({ k: "LEAK", t: "PRESS LEAK", d: "When HELLER plays this, raise the GUARD by 1." }),
  ...Array(2).fill({ k: "JURIS", t: "JURISDICTION FIGHT", d: "When HELLER plays this, lower the GUARD by 1. Raise the SPIRAL by 1." }),
  ...Array(2).fill({ k: "COVER", t: "COVER STORY", d: "When HELLER plays this, raise the SPIRAL by 1." }),
];
const REDACTED = [...Array(8).fill({ k: "FILE", t: "A FILE" }), ...Array(4).fill({ k: "BLACK", t: "BLACKED OUT" })];
const ORDNANCE = [...Array(3).fill("SENSOR MINE"), ...Array(3).fill("TAGGED TRIPWIRE")];
export const WEATHER = ["", "BLACK ICE", "WHITEOUT", "FROZEN NERVE", "TRAP SURGE", "FROSTBITE", "STILL COLD"];
export const GROUND = { TOWN: "TOWN", FOOTHILLS: "THE FOOTHILLS", DEEP: "THE DEEP WOODS", COLD: "THE COLD ZONE" };
export const DECKS = { trauma: TRAUMA };   // the printed cards (the stranger kit prints the Trauma deck from this)
export const DECK_SIZES = { trauma: TRAUMA.length, psychePlus: PSYCHE_PLUS.length, nightmare: NIGHTMARE.length, redacted: REDACTED.length, ordnance: ORDNANCE.length };

// ---------------- ACTIONS (the six of the source + what each means here) ----------------
export const ACTS = ["MOVE", "FIRE", "SCAN", "STEALTH", "CALL OUT", "ACTIVATE"];

// ---------------- SEATS ----------------
// players 2..6 core (2..7 with the expansion). Seat 0 = the Walker. Law seats split the Sheriff + deputies (+ Heller).
// 2 players: one Law seat runs the Sheriff and ALL four deputies (and Heller). 3+: each extra player brings one deputy.
export function lawCast(players, expansion, allDeputies = false) {
  const nDep = players <= 2 || allDeputies ? 4 : Math.min(4, players - 2 - (expansion && players >= 4 ? 1 : 0));
  return { deputies: DEPUTY_ORDER.slice(0, Math.max(1, nDep)), heller: !!expansion };
}
export function seatPlan(players, expansion, allDeputies = false) {
  const { deputies, heller } = lawCast(players, expansion, allDeputies);
  const law = ["sheriff", ...deputies, ...(heller ? ["heller"] : [])];
  if (players <= 2) return [{ side: "walker", roles: ["walker"] }, { side: "law", roles: law }];
  const seats = [{ side: "walker", roles: ["walker"] }];
  const rest = players - 1; for (let i = 0; i < rest; i++) seats.push({ side: "law", roles: [] });
  law.forEach((r, i) => seats[1 + (i % rest)].roles.push(r));
  return seats.filter(s => s.roles.length);
}

// ---------------- THE GAME ----------------
export class Game {
  constructor({ seed = 1, players = 2, expansion = false, rules = "TUNED", knobs = null } = {}) {
    this.seed = seed >>> 0; this.players = players; this.expansion = !!expansion;
    this.K = { ...(knobs || PRESETS[rules] || TUNED) };
    if (this.expansion) { this.K.holdRounds = this.K.holdRoundsX; if (this.K.clockX !== null && this.K.clockX !== undefined) this.K.clockEvery = this.K.clockX; if (this.K.talkAdjX !== null && this.K.talkAdjX !== undefined) this.K.sisterTalksAdjacent = this.K.talkAdjX; if (this.K.riskEscalateX) this.K.riskEscalate = this.K.riskEscalateX; }
    this.rng = makeRng(this.seed ^ 0xC01D5);
    this.round = 0; this.spiral = 0; this.guard = 0; this.ended = null; this.phase = "setup";
    this.log = []; this.stats = { acts: { walker: {}, law: {} }, decisions: 0, options: 0, seatTurns: 0, traumas: 0, kills: 0, wounds: 0, hitsOnWalker: 0, trapsSprung: 0, reachHim: 0, showdowns: 0, sightings: 0 };
    this.seats = seatPlan(players, expansion, this.K.allDeputies);
    const { deputies, heller } = lawCast(players, expansion, this.K.allDeputies);
    const K = this.K;
    const fig = (role, hp, zone) => ({ id: role, role, ...ROLES[role], hp, maxHp: hp, zone, alive: true, skip: 0, away: 0, transit: null, nerve: K.nerve[role] ?? 3 });
    this.figs = {};
    this.figs.walker = { ...fig("walker", K.walkerHP, "BEND"), rage: K.walkerStart.rage, zen: K.walkerStart.zen, psyche: K.walkerStart.psyche, weapon: "TOOL", healed: 0, bravery: true, hold: 0, everCold: false, kits: K.trapKits, falsified: 0 };
    this.figs.sheriff = { ...fig("sheriff", K.sheriffHP, "STATION"), weapon: "PISTOL", desperate: false };
    for (const d of deputies) this.figs[d] = fig(d, K.otherHP, "STATION");
    if (this.figs.tolley && this.kit("tolley")) this.figs.dog = { ...fig("dog", 1, "STATION"), nerve: 0 };
    this.figs.sister = { ...fig("sister", K.otherHP, null), files: 0, filesOpen: false, spoke: false };
    if (heller) this.figs.heller = { ...fig("heller", K.otherHP, "POST"), override: true, ordnance: ORDNANCE.slice(), finalOverride: true };
    this.decks = { trauma: this.rng.shuffle(TRAUMA), psyche: this.rng.shuffle(PSYCHE_PLUS), nightmare: this.rng.shuffle(NIGHTMARE), redacted: this.rng.shuffle(REDACTED) };
    this.traps = [];        // { zone, owner: "walker"|"system", kind, known }
    this.caches = [];       // { zone, used }
    this.rifles = K.rifle === false ? [] : ["DRAW"]; // somebody's deer camp: a rifle the Walker can take
    this.lastSeen = { zone: "BEND", round: 0 };   // the Law watched him go off the road at the bend
    this.blips = [];        // { zone, round, why }
    this.scent = "BEND";
    this.anchor = null;     // Crane's held zone
    this.ambush = {};       // fig id -> zone (this round)
    this.engaged = false;   // shots involving the Walker this round
    this.loud = false;
    this.noAura = false; this.weather = 0; this.risk = 0;
    this.intents = {}; this.queue = []; this.pendingSetup = [];
    this.say(`COLD SUNSET. Seed ${this.seed} · ${players} players · ${this.expansion ? "with the expansion" : "core"} · ${K.name} rules.`, "all");
    this.say(`Tallow Gap, Tennessee. Rook went into the trees at Sawmill Bend. Sheriff Mabry has every deputy he's got in the jail lot.`, "all");
    this.setupQueue();
  }

  // ----- logging (vis: "all" | "walker" | "law") -----
  say(txt, vis = "all") { this.log.push({ r: this.round, txt, vis }); if (this.log.length > 600) this.log.shift(); }
  seatOf(role) { return this.seats.findIndex(s => s.roles.includes(role)); }
  W() { return this.figs.walker; }
  kit(role) { const k = this.K.deputyKit; return k === undefined || k === true || (Array.isArray(k) && k.includes(role)); } // a deputy's aura + ability is in play
  lawFigs() { return Object.values(this.figs).filter(f => f.side === "law" && f.role !== "dog" && f.alive && !f.away); }
  hunters() { return Object.values(this.figs).filter(f => f.side === "law" && f.alive && !f.away && f.zone); }
  coldOpen() { return this.spiral >= this.K.coldAt; }
  clean() { const w = this.W(); return w.weapon === "TOOL" && w.zen >= this.K.cleanZen && w.psyche <= this.K.cleanPsyche; }
  seenNow() { return this.W().seenRound === this.round; }
  canEnter(fig, to) {
    if (to === "COLD" && !this.coldOpen()) return false;
    if (this.expansion && to === OVERLAY.blockedCave && this.spiral < 7) return false;
    if (this.expansion && to === "COLD" && fig.side === "law" && !this.W().everCold) return false; // sealed trailhead (our reading)
    return true;
  }
  moveCost(to) {
    let c = 1;
    if (this.expansion && (OVERLAY.frost.includes(to) || OVERLAY.icedBridge.includes(to))) c = 2;
    if (this.expansion && this.weather === 1) c *= 2;
    return Math.min(c, 2);
  }

  // ----- setup: the Walker places traps and caches (hidden) -----
  setupQueue() {
    const n = this.K.setupTraps;
    for (let i = 0; i < n; i++) this.pendingSetup.push({ kind: "trap", i });
    for (let i = 0; i < this.K.caches; i++) this.pendingSetup.push({ kind: "cache", i });
  }
  setupOptions(item) {
    const taken = new Set([...this.traps.map(t => t.zone), ...this.caches.map(c => c.zone)]);
    return ZONES.filter(z => z.tier !== "TOWN" && z.id !== "COLD" && !taken.has(z.id)).map(z => ({
      id: `${item.kind}:${z.id}`, act: item.kind === "trap" ? "SET TRAP" : "HIDE CACHE", zone: z.id,
      label: `${item.kind === "trap" ? "SET A TRAP" : "HIDE A CACHE"} — ${z.name}`,
      cost: "setup · hidden from the Law",
      why: item.kind === "trap" ? "Traps spring on Risk Rolls of " + this.K.trapLive.join("–") + ". Put them where the Law will walk." : "A cache heals (Living Rough: 3 HP a game at most). Put it where you'll need it.",
    }));
  }

  // ----- the decision seam -----
  pending() {
    if (this.ended) return null;
    for (;;) {
      if (this.phase === "setup") {
        if (this.pendingSetup.length) { const item = this.pendingSetup[0]; return { seat: 0, fig: "walker", setup: true, options: this.setupOptions(item) }; }
        this.phase = "start"; continue;
      }
      if (this.phase === "start") { this.startRound(); if (this.ended) return null; continue; }
      if (this.phase === "intent") {
        while (this.queue.length) {
          const id = this.queue[0], f = this.figs[id];
          if (!f || !f.alive || f.away) { this.queue.shift(); continue; }
          if (f.skip > 0) { f.skip--; this.intents[id] = { act: "LOST", label: "loses the action" }; this.say(`${f.name} loses this action.`, f.side === "walker" ? "walker" : "all"); this.queue.shift(); continue; }
          const options = this.options(id);
          if (options.length === 1 && options[0].forced) { this.intents[id] = options[0]; this.queue.shift(); continue; }
          return { seat: this.seatOf(id), fig: id, options };
        }
        this.resolve(); if (this.ended) return null; continue;
      }
      return null;
    }
  }
  choose(optId) {
    const p = this.pending(); if (!p) throw new Error("no decision pending");
    const o = p.options.find(x => x.id === optId); if (!o) throw new Error(`bad option ${optId} for ${p.fig}: ${p.options.map(x => x.id).join(",")}`);
    this.stats.decisions++; this.stats.options += p.options.length;
    if (p.setup) {
      const item = this.pendingSetup.shift();
      if (item.kind === "trap") this.traps.push({ zone: o.zone, owner: "walker", kind: "SNARE", known: false });
      else this.caches.push({ zone: o.zone, used: false });
      this.say(`(setup) ${o.label}.`, "walker");
      return;
    }
    const side = this.figs[p.fig].side === "walker" ? "walker" : "law";
    this.stats.acts[side][o.act] = (this.stats.acts[side][o.act] || 0) + 1;
    this.intents[p.fig] = o; this.queue.shift();
  }

  // ----- ROUND: 1 RISK ROLL · 2 PRESSURE · 3 INTENTIONS -----
  startRound() {
    const K = this.K; this.round++;
    if (this.round > K.roundCap) {
      if (!K.capForces) return this.end("STALL", "The round cap was hit.");
      this.say(`DAWN. The round cap: the Spiral goes to ${K.spiralMax}.`, "all"); this.spiral = K.spiralMax; this.round--; return this.forced();
    }
    this.engaged = false; this.loud = false; this.noAura = false; this.ambush = {}; this.intents = {}; this.seizedBy = null; this.walkerMoved = false;
    this.scent = this.W().zone;
    // 1 · RISK ROLL
    this.risk = this.rng.d6();
    this.trapsLive = K.trapLive.includes(this.risk);
    this.say(`— ROUND ${this.round} — Risk Roll ${this.risk}${this.trapsLive ? ": THE TRAPS ARE LIVE" : K.riskEscalate.includes(this.risk) ? ": ESCALATION (Guard +1)" : ": quiet"}.`, "all");
    if (this.expansion) {
      this.weather = this.rng.d6();
      this.say(`Weather: ${WEATHER[this.weather]}.`, "all");
      if (this.weather === 4) this.trapsLive = true;
      if (this.weather === 6) this.bump("spiral", 1, "Still Cold");
      if (this.weather === 5) { const pool = [this.W(), ...this.lawFigs().filter(f => f.role !== "heller")]; const v = this.rng.pick(pool); v.skip = Math.max(v.skip, 1); this.say(`Frostbite: ${v.name} loses an action.`, v.side === "walker" ? "walker" : "all"); }
    }
    // 2 · PRESSURE
    if (K.riskEscalate.includes(this.risk)) this.bump("guard", 1, "escalation");
    if (K.clockEvery && this.round % K.clockEvery === 0) this.bump("spiral", 1, "the sun goes down");
    if (K.guardClockEvery && this.round % K.guardClockEvery === 0) this.bump("guard", 1, "the state is coming");
    if (this.trapsLive) for (const f of [this.W(), ...this.hunters()]) this.trapCheck(f, true);
    if (this.ended) return;
    if (this.figs.sister.zone === null && this.round >= K.sisterArrive) { this.figs.sister.zone = "POST"; this.say(`VERNA ROOK pulls into the feed store lot in a borrowed pickup. She drove all night.`, "all"); if (this.expansion && K.filesOnArrival) { this.figs.sister.filesOpen = K.filesOnArrival === "path" ? "path" : true; this.say(`She has a shoebox of his letters and a lawyer's number. She starts digging the day she gets there.`, "all"); } }
    // the Walker sees every hunter; the Law sees what it has seen
    if (this.checkMeters()) return;
    this.phase = "intent";
    const law = this.lawOrderIds();
    this.queue = ["walker", ...law];
  }
  lawOrderIds() {
    // the declaring order: seat by seat (the bench groups a seat's figures); resolution is by Nerve
    const out = []; for (const s of this.seats) for (const r of s.roles) if (r !== "walker" && this.figs[r] && this.figs[r].alive) out.push(r);
    return out;
  }

  // ----- the options a figure has, from the view its seat has -----
  options(id) {
    const f = this.figs[id], K = this.K, out = [];
    const add = (o) => out.push(o);
    if (id === "walker") {
      const w = f, here = w.zone;
      const huntersHere = this.hunters().filter(h => h.zone === here && h.role !== "dog");
      const killLogic = K.walkerFire !== false && w.rage >= K.killRage && !(this.noAura);
      if (killLogic && huntersHere.length) {
        for (const h of huntersHere) add({ id: `fire:${h.id}:KILL`, act: "FIRE", target: h.id, mode: "KILL", label: `FIRE — ${h.name} (kill logic)`, cost: "1 action · loud if a gun", why: `Rage ${w.rage} ≥ ${K.killRage}: kill logic. A hunter in your zone and you must fire.` });
        return out;
      }
      if (w.transit) add({ id: `move:${w.transit.to}`, act: "MOVE", to: w.transit.to, label: `KEEP GOING → ${ZONE[w.transit.to].name}`, cost: "1 action (finishing a 2-cost move)", why: "Frost and ice: the move takes two actions." });
      for (const l of ADJ[here]) {
        if (!this.canEnter(w, l.to)) continue;
        const c = this.moveCost(l.to);
        add({ id: `move:${l.to}`, act: "MOVE", to: l.to, label: `MOVE → ${ZONE[l.to].name}`, cost: `1 action · quiet${c > 1 ? " · takes 2 actions" : ""}${l.shaft ? " · mineshaft: hazard 1-in-6 (−1 HP)" : ""}`, why: this.walkerMoveWhy(l.to) });
      }
      // RUN: two zones, loud
      const two = new Set();
      if (K.run !== false) for (const l of ADJ[here]) if (this.canEnter(w, l.to) && this.moveCost(l.to) === 1) for (const m of ADJ[l.to]) if (m.to !== here && this.canEnter(w, m.to) && !ADJ[here].some(x => x.to === m.to) && this.moveCost(m.to) === 1 && !two.has(m.to)) { two.add(m.to); add({ id: `run:${l.to}:${m.to}`, act: "MOVE", run: true, to: m.to, via: l.to, label: `RUN → ${ZONE[m.to].name} (via ${ZONE[l.to].name})`, cost: "1 action · LOUD: leaves a blip in both zones", why: this.walkerMoveWhy(m.to) }); }
      add({ id: "stealth", act: "STEALTH", label: "STEALTH — go to ground", cost: "1 action", why: `Hunters must SCAN to see you this round. Psyche −1 if no hunter is in or next to your zone (now ${w.psyche}; clean needs ≤ ${K.cleanPsyche}).` });
      if (K.walkerScan !== false) add({ id: "scan", act: "SCAN", label: "SCAN — listen to the woods", cost: "1 action", why: `Zen +1 and Rage −1 if no hunter is in or next to your zone (Zen ${w.zen}; clean needs ≥ ${K.cleanZen}).` });
      if (K.walkerCallOut === "warning") add({ id: "callout", act: "CALL OUT", label: "CALL OUT — HOLLER", cost: "1 action · REVEALS your zone", why: `Holler down the hill that you're not shooting. Guard −1 (now ${this.guard}/${K.guardMax}: the only way you can lower it) and Zen +1, even with hunters near. If Verna is in voice range she answers: REACH HIM.` });
      else if (K.walkerCallOut !== "none") add({ id: "callout", act: "CALL OUT", label: "CALL OUT — say something into the dark", cost: "1 action · REVEALS your zone", why: `Zen +1 even with hunters near. If Verna is in voice range she answers: REACH HIM.` });
      const targets = K.walkerFire === false ? [] : this.hunters().filter(h => h.role !== "dog" ? true : true).filter(h => h.zone === here || (w.weapon === "RIFLE" && adjacent(here, h.zone) && !this.whiteoutBlocks(here, h.zone)));
      for (const h of targets) {
        const range = h.zone === here ? "same zone" : "next zone";
        add({ id: `fire:${h.id}:WOUND`, act: "FIRE", target: h.id, mode: "WOUND", label: `FIRE — WOUND ${h.name}`, cost: `1 action · ${w.weapon === "RIFLE" ? "LOUD (Guard +1)" : "quiet (the tool)"} · ${range}`, why: K.woundCarry ? `Hit on ${this.walkerHitNeed(h)}+. They're carried out: back to the county jail, and they lose a round. Nobody dies; your Zen holds.` : `Hit on ${this.walkerHitNeed(h)}+. A wound drops them for a round; nobody dies; your Zen holds.` });
        add({ id: `fire:${h.id}:KILL`, act: "FIRE", target: h.id, mode: "KILL", label: `FIRE — KILL ${h.name}`, cost: `1 action · ${w.weapon === "RIFLE" ? "LOUD" : "quiet"} · a death: Spiral +1, Guard +1, a Trauma`, why: `Hit on ${this.walkerHitNeed(h)}+ for ${w.weapon === "RIFLE" ? 2 : 1} damage. Fewer hunters, a darker man.` });
      }
      if (this.traps.filter(t => t.owner === "walker").length < 99 && w.kits > 0 && !this.traps.some(t => t.zone === here) && ZONE[here].tier !== "TOWN" && here !== "COLD") add({ id: "trap", act: "ACTIVATE", sub: "TRAP", label: `ACTIVATE — SET A TRAP here (${w.kits} kit${w.kits > 1 ? "s" : ""} left)`, cost: "1 action · hidden", why: "Springs on a live Risk Roll when a hunter enters or stands here." });
      const cache = this.caches.find(c => c.zone === here && !c.used);
      if (cache) add({ id: "cache", act: "ACTIVATE", sub: "CACHE", label: "ACTIVATE — OPEN THE CACHE", cost: "1 action", why: `+1 HP (Living Rough: ${K.healCap - w.healed} left this game)${this.expansion ? ". Heller may have falsified it." : "."}` });
      if (this.rifles.includes(here) && w.weapon !== "RIFLE") add({ id: "rifle", act: "ACTIVATE", sub: "RIFLE", label: "ACTIVATE — TAKE THE RIFLE", cost: "1 action", why: "Fire into the next zone and hit for 2 — but a rifle in your hands is not a clean evasion." });
      if (w.weapon === "RIFLE") add({ id: "drop", act: "ACTIVATE", sub: "DROP", label: "ACTIVATE — DROP THE RIFLE", cost: "1 action", why: "Clean Evasion needs empty hands." });
      return out;
    }
    if (id === "sister") return [{ id: "auto", act: "AUTO", forced: true, label: "Verna moves on her own" }];
    if (id === "heller") {
      if (this.spiral >= 6 || (K.hellerEvery && this.round % K.hellerEvery === 0)) add({ id: "nightmare", act: "ACTIVATE", sub: "NIGHTMARE", label: "PLAY A NIGHTMARE CARD", cost: "1 action", why: `Jurisdictional Nightmare: overrides, cancels, conflicting orders. Triggers at Spiral 6+${K.hellerEvery ? ` (and every ${K.hellerEvery}rd round, Heller-initiated)` : ""}.` });
      if (f.ordnance.length) for (const z of ZONES.filter(z => z.tier !== "TOWN" && z.id !== "COLD" && !this.traps.some(t => t.zone === z.id && t.owner === "system"))) add({ id: `ord:${z.id}`, act: "ACTIVATE", sub: "ORDNANCE", zone: z.id, label: `PLANT ORDNANCE+ — ${z.name} (${f.ordnance[0]})`, cost: "1 action", why: "Black-ops traps: rarely avoidable. A tripwire that strikes the Walker raises the Spiral." });
      add({ id: "hold", act: "STEALTH", label: "WAIT IN THE TRUCK", cost: "1 action", why: "Mr. Heller can never win. He decides how the others lose." });
      return out;
    }
    if (id === "dog") return [{ id: "auto", act: "AUTO", forced: true, label: "Boone stays with Tolley" }];
    // ----- a Law figure -----
    const here = f.zone, seen = this.W().seenRound >= this.round - 1 ? this.lastSeen.zone : null;
    if (f.transit) add({ id: `move:${f.transit.to}`, act: "MOVE", to: f.transit.to, label: `KEEP GOING → ${ZONE[f.transit.to].name}`, cost: "1 action (finishing a 2-cost move)", why: "Frost and ice." });
    for (const l of ADJ[here]) if (this.canEnter(f, l.to)) add({ id: `move:${l.to}`, act: "MOVE", to: l.to, label: `MOVE → ${ZONE[l.to].name}`, cost: `1 action${this.moveCost(l.to) > 1 ? " · takes 2 actions" : ""}${l.shaft ? " · mineshaft hazard" : ""}`, why: this.lawMoveWhy(l.to) });
    add({ id: "scan", act: "SCAN", label: "SCAN — sweep your zone and the next", cost: "1 action", why: `Finds him on ${this.scanNeed(f, true)}+ in your zone, ${this.scanNeed(f, false)}+ next door (if he's there).` });
    if (K.ambush !== false) add({ id: "ambush", act: "STEALTH", label: "STEALTH — hold an ambush here", cost: "1 action", why: "If he comes into your zone this round he's seen and you get a free shot." });
    const range = (z) => z === here || (f.role !== "sheriff" || f.weapon === "RIFLE") && adjacent(here, z) && !this.whiteoutBlocks(here, z);
    if (K.lawFire !== false && seen && range(seen)) add({ id: `fire:${seen}`, act: "FIRE", zone: seen, label: `FIRE — into ${ZONE[seen].name} (he was seen there)`, cost: `1 action · LOUD (Guard +1)`, why: `Hit on ${this.lawHitNeed(f, seen)}+ if he's still there when you shoot.${f.role === "varner" ? " Nonlethal Stun: he loses an action instead of HP." : ""}` });
    if (K.lawFire !== false && this.kit("pruitt") && f.role === "pruitt" && !seen) for (const b of this.blips.filter(b => b.round >= this.round - 1)) if (range(b.zone)) add({ id: `snap:${b.zone}`, act: "FIRE", zone: b.zone, snap: true, label: `SNAP FIRE — at the noise in ${ZONE[b.zone].name}`, cost: "1 action · LOUD", why: "Loud First: shoot at a blip without seeing him. Hits on a 6." });
    if (f.role !== "heller" && K.lawRadio !== "none" && (!K.callOutLimit || (this.callOuts || 0) < K.callOutLimit)) add({ id: "callout", act: "CALL OUT", label: "CALL OUT — radio the state", cost: `1 action · Spiral +${K.callOutSpiral}${K.callOutLimit ? ` · ${K.callOutLimit - (this.callOuts || 0)} radio call${K.callOutLimit - (this.callOuts || 0) > 1 ? "s" : ""} left this game` : ""}`, why: K.lawRadio === "ground" ? "The state's chopper makes one pass: after he moves, it tells you what ground he's on (town, foothills, deep woods or the Cold Zone). The story gets bigger." : "Every SCAN by the Law this round gets +1. The story gets bigger." });
    if (f.role === "tolley" && this.figs.dog && this.figs.dog.alive) add({ id: "dog", act: "ACTIVATE", sub: "DOG", label: "ACTIVATE — COMMAND DOG", cost: "1 action", why: `Boone runs ${K.dogSteps} toward the scent (where he was at the start of the round). If he's there, he's seen; if not, the scent is.` });
    if (f.role === "crane" && this.kit("crane")) add({ id: "anchor", act: "ACTIVATE", sub: "ANCHOR", label: `ACTIVATE — ANCHOR ${ZONE[here].name}`, cost: "1 action", why: "He's seen if he comes into or out of this zone until you move." });
    if (f.role === "sheriff" && this.spiral >= K.showdownAt && seen === here) add({ id: "showdown", act: "ACTIVATE", sub: "SHOWDOWN", label: "ACTIVATE — COUNTY BUSINESS (the face-off)", cost: "1 action · ends the game if you win", why: `Spiral ${this.spiral} ≥ ${K.showdownAt}. A roll-off, him and you.` });
    if (f.role === "sheriff" && K.sheriffKit !== false) add({ id: "swap", act: "ACTIVATE", sub: "SWAP", label: `ACTIVATE — SWAP TO ${f.weapon === "PISTOL" ? "A RIFLE" : "THE REVOLVER"}`, cost: "1 action", why: f.weapon === "PISTOL" ? "A deer rifle reaches the next zone but loses Coiled Precision (+1)." : "His daddy's revolver alone: Coiled Precision +1, but same zone only." });
    if (this.traps.some(t => t.zone === here && t.known)) add({ id: "disarm", act: "ACTIVATE", sub: "DISARM", label: "ACTIVATE — CLEAR THE TRAP HERE", cost: "1 action", why: "A known trap; clear it before it springs." });
    return out;
  }
  walkerMoveWhy(to) {
    const near = this.hunters().filter(h => h.role !== "dog" && dist(h.zone, to) <= 1).length;
    const bits = [];
    if (near) bits.push(`${near} hunter${near > 1 ? "s" : ""} in or next to it`); else bits.push("no hunter within a zone");
    if (to === "COLD") bits.push("THE COLD ZONE: entering reveals you and draws a Trauma");
    else if (this.coldOpen()) bits.push(`${dist(to, "COLD")} from the Cold Zone`);
    if (this.traps.some(t => t.zone === to && t.owner === "walker")) bits.push("your own trap is here (1-in-6 when live)");
    if (this.traps.some(t => t.zone === to && t.owner === "system" && t.known)) bits.push("a known system trap");
    return bits.join(" · ");
  }
  lawMoveWhy(to) {
    const bits = [];
    const ls = this.lastSeen; if (ls) bits.push(`${dist(to, ls.zone)} from where he was last seen (round ${ls.round})`);
    if (this.traps.some(t => t.zone === to && t.known)) bits.push("A KNOWN TRAP");
    if (this.trapsLive) bits.push("the traps are live this round");
    return bits.join(" · ");
  }
  whiteoutBlocks(a, b) { return this.expansion && a !== b && (OVERLAY.whiteout.includes(a) || OVERLAY.whiteout.includes(b)); }
  walkerHitNeed(h) { const same = h.zone === this.W().zone; let n = same ? this.K.hitSame : this.K.hitAdj; if (this.W().weapon === "RIFLE") n -= 1; if (!same && this.expansion && this.weather === 2) n += 1; return Math.max(2, Math.min(6, n)); }
  lawHitNeed(f, zone) {
    const same = zone === f.zone; let n = same ? this.K.hitSame : this.K.hitAdj;
    const K = this.K;
    if (!this.noAura) { if (f.role === "sheriff" && f.weapon === "PISTOL" && K.sheriffKit !== false) n -= 1; if (f.role === "varner" && !same && this.kit("varner")) n -= 1; if (same && K.walkerAura !== false) n += 1; /* CLOSE COUNTRY: shots in his own zone −1 */ }
    if (f.role === "sheriff" && f.desperate) n -= 1;
    if (this.figs.heller && this.figs.heller.alive && !this.noAura) n -= 1;
    if (!same && this.expansion && this.weather === 2) n += 1;
    return Math.max(2, Math.min(6, n));
  }
  scanNeed(f, same) {
    let n = same ? this.K.scanSame : this.K.scanAdj;
    if (f.role === "crane" && !this.noAura && this.kit("crane")) n -= 1;
    if (this.radio && this.K.lawRadio !== "ground") n -= 1;
    if (this.figs.heller && this.figs.heller.alive && !this.noAura && this.K.hellerScan) n -= 1;
    if (this.expansion && this.weather === 3) n += 1;
    return Math.max(2, Math.min(6, n));
  }

  // ----- 4 · RESOLVE (the Walker first, then the Law by Nerve) -----
  resolve() {
    this.phase = "resolve"; this.radio = Object.values(this.intents).some(o => o.act === "CALL OUT" && o !== this.intents.walker);
    if (this.radio) { this.callOuts = (this.callOuts || 0) + 1; this.bump("spiral", this.K.callOutSpiral, "the Law radios the state"); }
    // Heller's SEIZE etc. are applied when his card resolves; it resolves first among the Law (he plays above them)
    if (this.intents.heller) this.resolveHeller(this.intents.heller);
    if (this.ended) return;
    for (const [id, o] of Object.entries(this.intents)) if (o.act === "STEALTH" && id !== "walker" && id !== "heller") this.ambush[id] = this.figs[id].zone;
    this.resolveWalker(this.intents.walker || { act: "LOST" });
    if (this.ended) return;
    if (this.radio && this.K.lawRadio === "ground" && this.W().alive && this.K.radioStealth && this.intents.walker?.act === "STEALTH") this.say(`The state's chopper makes its pass: nothing. He's gone to ground.`, "all");
    else if (this.radio && this.K.lawRadio === "ground" && this.W().alive) { const t = ZONE[this.W().zone].tier; this.radioGround = { tier: t, round: this.round }; this.say(`The state's chopper makes its pass: he's in ${GROUND[t]}.`, "all"); }
    const order = Object.keys(this.intents).filter(id => id !== "walker" && id !== "heller" && id !== "sister" && this.figs[id] && this.figs[id].alive)
      .sort((a, b) => (this.figs[b].nerve - this.figs[a].nerve) || (a === "sheriff" ? -1 : b === "sheriff" ? 1 : a < b ? -1 : 1));
    for (const id of order) {
      const f = this.figs[id]; if (!f.alive || f.away) continue;
      if (this.seized === id) { this.say(`${f.name}'s orders are overridden by Mr. Heller.`, "all"); continue; }
      this.resolveLaw(f, this.intents[id]); if (this.ended) return;
    }
    this.collapse();
  }
  sight(why) {
    const w = this.W();
    if (w.seenRound !== this.round) this.stats.sightings++;
    w.seenRound = this.round; this.lastSeen = { zone: w.zone, round: this.round };
    this.say(`HE IS SEEN in ${ZONE[w.zone].name} (${why}).`, "all");
    if (ZONE[w.zone].tier === "TOWN" && this.K.townSightGuard) this.bump("guard", this.K.townSightGuard, "seen in town");
  }
  autoSight() { // a hunter in his zone sees him unless he went to ground
    const w = this.W(); if (w.seenRound === this.round) return;
    const hs = this.hunters().filter(h => h.zone === w.zone);
    if (!hs.length) return;
    if (this.intents.walker && this.intents.walker.act === "STEALTH" && !this.ambushHere(w.zone)) return;
    this.sight(`${hs[0].name} is right there`);
  }
  ambushHere(z) { return Object.entries(this.ambush).some(([id, az]) => az === z && this.figs[id].alive); }
  enter(f, to, via = null) {
    const from = f.zone; f.zone = to; f.transit = null;
    if (f.id === "walker") {
      this.walkerMoved = true;
      if (this.anchor && (this.anchor === to || this.anchor === from)) this.sight("Crane's anchor");
      if (to === "COLD" && !f.everCold) { f.everCold = true; }
      if (to === "COLD") { this.sight("he walked into the Cold Zone"); this.trauma("entering the Cold Zone"); }
      for (const [id, az] of Object.entries(this.ambush)) if (az === to && this.figs[id].alive) { this.sight(`${this.figs[id].name}'s ambush`); this.lawShot(this.figs[id], to, true); if (this.ended) return; }
      for (const t of this.traps.filter(t => t.zone === to && t.owner === "system")) this.systemTrap(t);
    }
    if (this.K.shafts !== false && ADJ[from] && ADJ[from].some(l => l.to === to && l.shaft) && this.rng.d6() === 1) this.hurt(f, 1, "the mineshaft", null);
    if (this.trapsLive) this.trapCheck(f, false);
    if (this.expansion && f.id !== "heller") { /* echo zones checked at collapse */ }
  }
  tryMove(f, o) {
    const to = o.to; if (!this.canEnter(f, to)) return;
    const c = this.moveCost(to);
    if (c > 1 && !(f.transit && f.transit.to === to)) { f.transit = { to }; this.say(`${f.name} starts the hard way toward ${ZONE[to].name}.`, f.side === "walker" ? "walker" : "all"); return; }
    this.enter(f, to);
  }
  resolveWalker(o) {
    const w = this.W(), K = this.K, near = () => this.hunters().some(h => h.role !== "dog" && dist(h.zone, w.zone) <= 1);
    switch (o.act) {
      case "MOVE":
        if (o.run) {
          this.say(`You run for ${ZONE[o.to].name}.`, "walker");
          this.enter(w, o.via); if (this.ended) return;
          this.blips.push({ zone: o.via, round: this.round, why: "noise" });
          if (w.alive && w.zone === o.via && !this.ended) { this.enter(w, o.to); this.blips.push({ zone: o.to, round: this.round, why: "noise" }); this.say(`Something big moves through ${ZONE[o.via].name} and ${ZONE[o.to].name}.`, "law"); }
        } else { this.say(`You head for ${ZONE[o.to].name}.`, "walker"); this.tryMove(w, o); }
        break;
      case "STEALTH":
        if (!near()) { w.psyche = Math.max(0, w.psyche - 1); this.say(`You go to ground. Psyche ${w.psyche}.`, "walker"); } else this.say(`You go to ground with them close. Nothing settles.`, "walker");
        break;
      case "SCAN":
        if (!near()) { w.zen = Math.min(6, w.zen + 1); w.rage = Math.max(0, w.rage - 1); this.say(`You listen to the woods. Zen ${w.zen}, Rage ${w.rage}.`, "walker"); } else this.say(`You listen. All you hear is them.`, "walker");
        break;
      case "CALL OUT":
        w.zen = Math.min(6, w.zen + 1);
        this.sight("he called out");
        if (K.walkerCallOut === "warning") { this.stats.warnings = (this.stats.warnings || 0) + 1; this.bump("guard", -1, "HOLLER: he's talking, not shooting"); }
        { const c = this.figs.sister; if (c.alive && c.zone && dist(c.zone, w.zone) <= 1) this.reachHim("he called out and Verna answered"); }
        break;
      case "FIRE": {
        const h = this.figs[o.target]; if (!h || !h.alive || h.away) break;
        const inRange = h.zone === w.zone || (w.weapon === "RIFLE" && adjacent(h.zone, w.zone));
        if (!inRange) { this.say(`${h.name} isn't where you aimed.`, "walker"); break; }
        this.engaged = true; if (w.weapon === "RIFLE") this.loud = true;
        const need = this.walkerHitNeed(h), r = this.rng.d6();
        if (w.weapon === "RIFLE" || h.zone !== w.zone) this.sight("gunfire");
        if (r < need) { this.say(`The Walker attacks ${h.name} — ${r} vs ${need}: miss.`, "all"); break; }
        if (o.mode === "WOUND") { h.skip = Math.max(h.skip, 1); this.stats.wounds++;
          if (K.woundCarry && h.role !== "dog") { h.zone = "STATION"; h.transit = null; delete this.ambush[h.id]; if (h.role === "crane") this.anchor = null; if (h.role === "tolley" && this.figs.dog && this.figs.dog.alive) this.figs.dog.zone = "STATION"; this.say(`The Walker drops ${h.name} (${r} vs ${need}): wounded and hauled back to the county jail. Nobody dies.`, "all"); }
          else this.say(`The Walker drops ${h.name} (${r} vs ${need}): wounded, out for a round. Nobody dies.`, "all"); }
        else this.hurt(h, w.weapon === "RIFLE" ? 2 : 1, "the Walker", w);
        break;
      }
      case "ACTIVATE":
        if (o.sub === "TRAP") { this.traps.push({ zone: w.zone, owner: "walker", kind: "SNARE", known: false }); w.kits--; this.say(`You set a trap in ${ZONE[w.zone].name}.`, "walker"); }
        if (o.sub === "CACHE") {
          const c = this.caches.find(c => c.zone === w.zone && !c.used); if (c) { c.used = true;
            if (w.falsified > 0) { w.falsified--; w.psyche++; this.say(`The cache was found and swapped. Psyche ${w.psyche}.`, "walker"); }
            else if (w.healed < K.healCap && w.hp < w.maxHp) { w.hp++; w.healed++; this.say(`You eat. +1 HP (${w.hp}).`, "walker"); } else this.say(`You eat. It doesn't help.`, "walker"); }
        }
        if (o.sub === "RIFLE") { w.weapon = "RIFLE"; this.rifles = this.rifles.filter(z => z !== w.zone); this.say(`You take the rifle.`, "walker"); }
        if (o.sub === "DROP") { w.weapon = "TOOL"; this.say(`You leave the rifle in the snow.`, "walker"); }
        break;
    }
    this.autoSight();
  }
  resolveLaw(f, o) {
    const w = this.W();
    switch (o.act) {
      case "MOVE": this.say(`${f.name} heads for ${ZONE[o.to].name}.`, "all"); this.tryMove(f, o); if (f.id === "tolley" && this.figs.dog && this.figs.dog.alive && this.figs.dog.zone !== f.zone && !this.dogSent) this.figs.dog.zone = f.zone; break;
      case "SCAN": {
        if (w.seenRound === this.round) { this.say(`${f.name} scans — he's already in plain sight.`, "all"); break; }
        const same = w.zone === f.zone, adj = adjacent(w.zone, f.zone);
        const r = this.rng.d6();
        if ((same || adj) && r >= this.scanNeed(f, same)) this.sight(`${f.name}'s scan, ${r}`);
        else this.say(`${f.name} scans ${ZONE[f.zone].name} and around: nothing (${r}).`, "all");
        break;
      }
      case "STEALTH": this.say(`${f.name} waits in ambush in ${ZONE[f.zone].name}.`, "all"); if (w.zone === f.zone && w.seenRound !== this.round) { this.sight(`${f.name}'s ambush`); this.lawShot(f, f.zone, true); } break;
      case "CALL OUT": this.say(`${f.name} radios the state.${this.K.lawRadio === "ground" ? " The chopper is up." : " Every scan this round +1."}`, "all"); break;
      case "FIRE": this.lawShot(f, o.zone, false, o.snap); break;
      case "ACTIVATE":
        if (o.sub === "DOG") this.commandDog(f);
        if (o.sub === "ANCHOR") { this.anchor = f.zone; this.say(`${f.name} anchors ${ZONE[f.zone].name}.`, "all"); }
        if (o.sub === "SHOWDOWN") this.showdown(f);
        if (o.sub === "SWAP") { f.weapon = f.weapon === "PISTOL" ? "RIFLE" : "PISTOL"; this.say(`${f.name} takes ${f.weapon === "RIFLE" ? "a rifle" : "only his daddy's revolver"}.`, "all"); }
        if (o.sub === "DISARM") { this.traps = this.traps.filter(t => !(t.zone === f.zone && t.known)); this.say(`${f.name} clears the trap in ${ZONE[f.zone].name}.`, "all"); }
        break;
    }
    if (f.id === "crane" && o.act === "MOVE") this.anchor = null;
    if (!this.ended) this.autoSight();
  }
  lawShot(f, zone, ambush = false, snap = false) {
    const w = this.W(); this.loud = true;
    const need = snap ? 6 : Math.max(2, this.lawHitNeed(f, zone) - (ambush ? 1 : 0));
    const r = this.rng.d6();
    if (f.role === "pruitt" && this.kit("pruitt")) this.loudFirst = true;
    if (w.zone !== zone) { this.say(`${f.name} fires into ${ZONE[zone].name} — nobody there.`, "all"); return; }
    this.engaged = true;
    if (r < need) { this.say(`${f.name} fires at him in ${ZONE[zone].name} — ${r} vs ${need}: miss.`, "all"); return; }
    if (!snap) this.sight("gunfire");
    this.stats.hitsOnWalker++;
    if (f.role === "varner" && !this.noAura && this.kit("varner")) { w.skip = Math.max(w.skip, 1); this.say(`${f.name} hits him (${r}): NONLETHAL STUN — he loses his next action.`, "all"); w.rage++; return; }
    this.say(`${f.name} hits him (${r} vs ${need}).`, "all");
    this.hurt(w, 1, f.name, f);
  }
  hurt(t, n, why, by) {
    t.hp -= n;
    if (t.id === "walker") {
      t.rage++;
      if (t.hp <= 0 && t.bravery && this.K.bravery !== false) { t.bravery = false; t.hp = 1; this.say(`LEGENDARY BRAVERY: he gets up. 1 HP.`, "all"); }
      if (t.hp <= 0) { t.alive = false;
        if (by && by.role === "sheriff") return this.end("AT_WHAT_COST", `${by.name} killed him${t.zone === "COLD" ? " in the Cold Zone" : ""}.`);
        return this.end("NET_CLOSES", `${why} brought him down; the state takes custody.`);
      }
      if (this.rng.d6() > t.nerve + (this.expansion && this.weather === 3 ? -1 : 0)) { this.say(`He panics.`, "all"); this.trauma("panic"); }
      return;
    }
    if (t.role === "sheriff" && t.hp <= 2 && t.hp > 0 && !t.desperate && this.K.sheriffKit !== false) { t.desperate = true; this.say(`SHERIFF MABRY is desperate.`, "all"); this.bump("spiral", 1, "the Sheriff comes apart"); }
    if (t.hp <= 0) {
      t.alive = false; t.zone = t.zone; this.stats.kills++;
      this.say(`${t.name} is dead (${why}).`, "all");
      if (t.role === "sister") { this.bump("spiral", 1, "Verna's death"); }
      if (t.role === "dog") { this.say(`Tolley loses his dog.`, "all"); if (this.figs.tolley?.alive) this.figs.tolley.skip = 1; return; }
      this.bump("spiral", 1, "a death"); this.bump("guard", 1, "a dead deputy");
      if (by && by.id === "walker") { const w = this.W(); w.zen = Math.max(0, w.zen - 1); this.trauma("a kill"); if (t.weapon !== "PISTOL" && this.K.rifle !== false) this.rifles.push(t.zone); }
    } else if (t.id !== "sister" && t.id !== "dog" && this.rng.d6() > t.nerve) { t.skip = Math.max(t.skip, 1); this.say(`${t.name} loses their nerve.`, "all"); }
  }
  trapCheck(f, atRisk) {
    for (const t of this.traps.filter(t => t.zone === f.zone && t.owner === "walker")) {
      const live = this.trapsLive || (this.expansion && OVERLAY.frozenSites.includes(t.zone) && this.risk <= 3);
      if (!live) continue;
      if (this.expansion && this.weather === 4 && this.rng.next() < 0.5 && f.id !== "walker") { /* trap surge: auto */ }
      else if (f.id === "walker" && this.rng.d6() !== 1) continue;
      if (f.role === "crane" && !this.noAura && !t.spotted && this.kit("crane")) { t.spotted = true; t.known = true; this.say(`${f.name} spots a trap in ${ZONE[t.zone].name} (Early Warning).`, "all"); continue; }
      this.traps = this.traps.filter(x => x !== t); this.stats.trapsSprung++;
      this.blips.push({ zone: t.zone, round: this.round, why: "a trap" });
      if (f.id === "walker") { this.say(`Your own trap bites you in ${ZONE[t.zone].name}.`, "walker"); this.sight("his own trap"); this.hurt(f, 1, "his own trap", null); this.trauma("his own trap"); }
      else { this.say(`A TRAP springs on ${f.name} in ${ZONE[t.zone].name}.`, "all"); f.skip = Math.max(f.skip, 1); this.hurt(f, 1, "a trap", this.W()); }
      if (this.ended) return;
    }
  }
  systemTrap(t) {
    const w = this.W(); t.known = true;
    if (t.kind === "SENSOR MINE") { this.traps = this.traps.filter(x => x !== t); this.sight("a sensor mine"); return; }
    this.traps = this.traps.filter(x => x !== t);
    this.say(`A TAGGED TRIPWIRE takes the Walker in ${ZONE[w.zone].name}.`, "all"); this.sight("a tripwire");
    this.bump("spiral", 1, "the System's trap struck him");
    this.hurt(w, 1, "a tripwire", null); if (this.ended) return;
    this.trauma("a system trap", true);
  }
  commandDog(f) {
    const d = this.figs.dog; if (!d || !d.alive) return;
    this.dogSent = true;
    let z = d.zone; for (let i = 0; i < this.K.dogSteps && z !== this.scent; i++) { const nx = ADJ[z].filter(l => dist(l.to, this.scent) < dist(z, this.scent) && this.canEnter(d, l.to)); if (!nx.length) break; z = nx[0].to; }
    d.zone = z; if (this.trapsLive) this.trapCheck(d, false);
    if (!d.alive) return;
    if (d.zone === this.W().zone) this.sight("Boone found him");
    else if (d.zone === this.scent) { this.blips.push({ zone: this.scent, round: this.round, why: "scent" }); this.lastSeen = { zone: this.scent, round: this.round - 1 }; this.say(`Boone has the scent in ${ZONE[this.scent].name}. He was there.`, "all"); }
    else this.say(`Boone pulls toward ${ZONE[z].name}.`, "all");
  }
  showdown(f) {
    const w = this.W(); this.stats.showdowns++;
    if (w.zone !== f.zone) { this.say(`${f.name} calls him out — he's gone.`, "all"); return; }
    this.engaged = true;
    const a = this.rng.d6() + (f.weapon === "PISTOL" ? 1 : 0) + (f.desperate ? 1 : 0), b = this.rng.d6() + (w.weapon === "RIFLE" ? 1 : 0) + (w.rage >= this.K.killRage ? 1 : 0);
    this.say(`COUNTY BUSINESS: the Sheriff ${a} vs the Walker ${b}.`, "all");
    if (a >= b) return this.end(w.zone === "COLD" ? "AT_WHAT_COST" : "COUNTY_BUSINESS", "The Sheriff won the face-off.");
    f.hp = 0; f.alive = false; this.stats.kills++; this.say(`The Walker wins the face-off. SHERIFF MABRY is dead.`, "all");
    this.bump("spiral", 1, "the Sheriff's death"); this.bump("guard", 1, "a dead sheriff");
  }
  trauma(why, forcePlus = false) {
    if (this.K.trauma === false) return;
    const w = this.W(); this.stats.traumas++;
    const plus = this.expansion && (forcePlus || this.spiral >= this.K.psychePlusAt);
    const deck = plus ? this.decks.psyche : this.decks.trauma;
    if (!deck.length) { const src = plus ? PSYCHE_PLUS : TRAUMA; deck.push(...this.rng.shuffle(src)); }
    const c = deck.shift();
    this.say(`${plus ? "PSYCHE+" : "TRAUMA"} (${why}): ${c.t} — ${c.d}`, "walker");
    if (c.k === "PSYCHE") w.psyche++; if (c.k === "PSYCHE2") w.psyche += 2; if (c.k === "RAGE") w.rage++;
    if (c.k === "ECHO") { w.psyche++; w.rage++; }
    if (c.k === "ZEN") w.zen = Math.max(0, w.zen - 1); if (c.k === "ZEN2") w.zen = Math.max(0, w.zen - 2); if (c.k === "ZENUP") w.zen++;
    if (c.k === "FLASH") w.skip = Math.max(w.skip, 1);
    if (c.k === "HEAL" && w.healed < this.K.healCap && w.hp < w.maxHp) { w.hp++; w.healed++; }
    w.psyche = Math.min(6, w.psyche); w.rage = Math.min(6, w.rage);
    this.bump("spiral", 1, "trauma", true);
  }
  reachHim(why) {
    const c = this.figs.sister, w = this.W(), K = this.K; this.stats.reachHim++;
    c.spoke = true; if (this.expansion) c.filesOpen = true;
    if (this.engaged) { this.say(`Verna tries to call to him, but there's shooting. She can't reach him.`, "all"); return; }
    if (w.rage >= K.killRage && !this.noAura) {
      const r = this.rng.d6();
      if (r >= K.misreadOn) { c.alive = false; c.hp = 0; this.say(`Somebody's coming up on him fast (${r}). He fires.`, "all"); this.bump("spiral", 2, "Verna's death"); return this.end("FINAL_MISREAD", "The Walker shot his sister."); }
      this.say(`He almost fires on Verna (${r}). He doesn't. He doesn't come in, either.`, "all"); return;
    }
    if (this.expansion && c.files >= 3) return this.end("THE_TRUTH", "Three files and a conversation.");
    let r = this.rng.d6();
    const h = this.figs.heller;
    if (h && h.alive && h.override && r >= K.reachHim) {
      h.override = false; const o = this.rng.d6();
      if (o >= 5) { this.say(`REACH HIM (${r}) — Mr. Heller OVERRIDES it (${o}).`, "all"); return; }
      const r2 = this.rng.d6(); r = Math.max(r, r2); this.say(`Mr. Heller tries to override (${o}) and fails; Verna rolls again with advantage (${r}).`, "all");
      const offs = this.lawFigs().filter(f => f.role !== "sheriff" && f.role !== "heller"); if (offs.length) { const x = this.rng.pick(offs); x.skip = Math.max(x.skip, 1); }
    }
    this.say(`REACH HIM (${why}): ${r} — needs ${K.reachHim}.`, "all");
    if (r >= K.reachHim) return this.end("BROUGHT_HOME", "Verna brought him in.");
  }
  resolveHeller(o) {
    const h = this.figs.heller; if (!h || !h.alive) return;
    if (o.sub === "ORDNANCE") { const k = h.ordnance.shift(); this.traps.push({ zone: o.zone, owner: "system", kind: k, known: false }); this.say(`Mr. Heller plants ${k} somewhere.`, "law"); return; }
    if (o.sub !== "NIGHTMARE") return;
    const d = this.decks.nightmare; if (!d.length) d.push(...this.rng.shuffle(NIGHTMARE));
    const c = d.shift(); this.say(`NIGHTMARE: ${c.t} — ${c.d}`, "all");
    const offs = () => this.lawFigs().filter(f => !["sheriff", "heller"].includes(f.role));
    switch (c.k) {
      case "SEIZE": { const x = offs(); if (x.length) this.seized = this.rng.pick(x).id; break; }
      case "NOAURA": this.noAura = true; break;
      case "CONFLICT": for (const x of this.rng.shuffle(offs()).slice(0, 2)) x.skip = Math.max(x.skip, 1); break;
      case "REASSIGN": { const x = offs(); if (x.length) { const v = this.rng.pick(x); v.away = 2; this.say(`${v.name} is pulled off the mountain.`, "all"); } break; }
      case "SILENCE": { const x = offs(); if (x.length) { const v = this.rng.pick(x); v.alive = false; v.silenced = true; this.say(`${v.name} is silenced.`, "all"); } this.bump("spiral", 1, "a betrayal witnessed"); break; }
      case "FALSIFY": this.W().falsified++; break;
      case "LEAK": this.bump("guard", 1, "press leak"); break;
      case "JURIS": this.bump("guard", -1, "jurisdiction fight"); this.bump("spiral", 1, "jurisdiction fight"); break;
      case "COVER": this.bump("spiral", 1, "cover story"); break;
    }
  }

  // ----- 5 · COLLAPSE -----
  collapse() {
    if (this.ended) return;
    this.phase = "collapse"; const w = this.W(), K = this.K;
    if (this.loud) this.bump("guard", 1, "gunfire");
    if (this.loudFirst) { this.bump("guard", 1, "Pruitt shoots first"); this.loudFirst = false; }
    if (this.expansion) {
      if (OVERLAY.echo.includes(w.zone)) this.bump("guard", 1, "chopper echo");
      if (K.echoWho === "any") for (const f of this.hunters()) if (f.role !== "dog" && OVERLAY.echo.includes(f.zone)) { this.bump("guard", 1, "chopper echo"); break; }
    }
    // the Sister's move (the automa)
    this.sisterMove(); if (this.ended) return;
    // the Sister's aura (PORCH LIGHT)
    const c = this.figs.sister;
    if (c.alive && c.zone && dist(c.zone, w.zone) <= 1 && !this.noAura) w.rage = Math.max(0, w.rage - 1);
    // Heller's aura
    if (this.figs.heller && this.figs.heller.alive && !this.noAura) {
      if (K.hellerZenReset === "reset") w.zen = 0; else if (w.seenRound === this.round && !(K.hellerColdFree && w.zone === "COLD")) w.zen = Math.max(0, w.zen - 1);
    }
    // the Cold Zone hold
    this.holdBefore = w.hold;
    const intruder = K.holdNeedsClear && this.hunters().some(h => h.zone === "COLD" && h.role !== "dog");
    if (w.zone === "COLD" && this.clean() && intruder) { if (w.hold) this.say(`A hunter is standing in the Cold Zone: the hold doesn't count this round.`, "all"); }
    else if (w.zone === "COLD" && this.clean()) { w.hold++; this.say(`He holds the Cold Zone clean: ${w.hold}/${K.holdRounds}.`, "all"); }
    else if (w.hold) { w.hold = 0; this.say(`The hold is broken.`, "all"); }
    if (w.hold >= K.holdRounds) return this.end("CLEAN_EVASION", "He held the Cold Zone.");
    for (const f of Object.values(this.figs)) if (f.away > 0) { f.away--; }
    this.seized = null; this.dogSent = false;
    this.blips = this.blips.filter(b => b.round >= this.round - 1);
    if (this.checkMeters()) return;
    this.phase = "start";
  }
  sisterMove() {
    const c = this.figs.sister, w = this.W(), K = this.K; if (!c.alive || !c.zone) return;
    const known = w.seenRound >= this.round - 1 ? this.lastSeen.zone : null;
    const goal = known || (K.sisterHidden === "LASTSEEN" ? this.lastSeen.zone : (this.coldOpen() ? "COLD" : "RIDGE"));
    let steps = K.sisterMove === "d6" ? this.rng.d6() : K.sisterMove;
    let met = false;
    while (steps-- > 0 && c.zone !== goal) {
      const nx = ADJ[c.zone].filter(l => dist(l.to, goal) < dist(c.zone, goal) && (l.to !== "COLD" || this.coldOpen())); if (!nx.length) break;
      c.zone = nx[0].to;
      if (this.expansion && c.filesOpen && OVERLAY.sisterPath.includes(c.zone)) this.redacted();
      if (c.zone === w.zone) { met = true; break; }
    }
    if (c.zone === "COLD" && this.expansion) c.filesOpen = true;
    if (this.expansion && c.filesOpen === true && !OVERLAY.sisterPath.includes(c.zone) && this.round % 2 === 0) this.redacted();
    if (met || (K.sisterTalksAdjacent && dist(c.zone, w.zone) <= 1 && (w.seenRound >= this.round - 1 || c.zone === w.zone))) this.reachHim(met ? "Verna walked into his zone" : "Verna is in voice range");
  }
  redacted() {
    const c = this.figs.sister, d = this.decks.redacted; if (!d.length || c.files >= 3) return;
    const card = d.shift(); if (card.k === "FILE") { c.files++; this.say(`Verna turns up a Redacted File (${c.files}/3).`, "all"); }
  }
  bump(meter, n, why, fromTrauma = false) {
    const K = this.K;
    if (meter === "spiral") {
      const was = this.spiral;
      this.spiral = Math.max(0, Math.min(K.spiralMax, this.spiral + n));
      if (this.spiral !== was) this.say(`COLLAPSE SPIRAL ${was}→${this.spiral} (${why}).`, "all");
      if (was < K.coldAt && this.spiral >= K.coldAt) this.say(`THE COLD ZONE OPENS.`, "all");
      // trauma at Spiral 6+: one draw each time the Spiral rises (never from a trauma's own +1: L4, no doom loop)
      if (!fromTrauma && this.spiral > was && this.spiral >= K.coldAt && (K.riseDraw === "every" || was < K.coldAt) && this.phase !== "setup" && !this.ended && this.W().alive) this.trauma("the Spiral at " + this.spiral);
    } else {
      const was = this.guard; this.guard = Math.max(0, Math.min(K.guardMax, this.guard + n));
      if (this.guard !== was) this.say(`GUARD ${was}→${this.guard} (${why}).`, "all");
    }
  }
  checkMeters() {
    if (this.ended) return true;
    const w = this.W(), K = this.K;
    if (this.guard >= K.guardMax && w.zone !== "COLD") { this.end("NET_CLOSES", "The Guard meter hit 6 with him outside the Cold Zone."); return true; }
    if (this.spiral >= K.spiralMax) { this.forced(); return true; }
    return false;
  }
  // Spiral 10: the ending is chosen (our order — docs/DESIGN.md §Spiral 10)
  endClean() { // P2 (K.endNeedsHold): may "clean in the Cold Zone" end it at Spiral 10?
    const w = this.W(), m = this.K.endNeedsHold;
    if (!(w.zone === "COLD" && this.clean())) return false;
    if (!m || m === "off") return true;
    if (this.hunters().some(h => h.zone === "COLD" && h.role !== "dog")) return false;
    if (m === "held") return (this.phase === "collapse" ? (this.holdBefore || 0) : w.hold) >= 1;
    return true;
  }
  forced() {
    const w = this.W(), c = this.figs.sister, ch = this.figs.sheriff, h = this.figs.heller;
    this.say(`THE SPIRAL HITS ${this.K.spiralMax}. The ending is chosen.`, "all");
    if (this.K.cleanBeatsOverride && this.endClean()) return this.end("CLEAN_EVASION", "He was in the Cold Zone, clean, when it all came down. No paperwork reaches that far.");
    if (this.expansion && this.K.overrideAt10 && h && h.alive && h.finalOverride && (!this.K.overrideNeedsSight || w.seenRound >= this.round - 1)) {
      if (w.zone === "COLD" && w.weapon === "TOOL") return this.end("DISAPPEARED", "Mr. Heller played FINAL OVERRIDE.");
      return this.end("OVERRIDE_CAUGHT", "Mr. Heller played FINAL OVERRIDE.");
    }
    if (this.endClean()) return this.end("CLEAN_EVASION", "He was in the Cold Zone, clean, when it all came down.");
    if (c.alive && c.zone && dist(c.zone, w.zone) <= 1) { this.engaged = false; this.reachHim("the end of it"); if (this.ended) return; }
    if (ch.alive && this.K.faceoff !== false) {
      ch.zone = w.zone; this.showdown(ch); if (this.ended) return;
    }
    return this.end("NET_CLOSES", "Nobody was left to decide. The state did.");
  }
  end(key, why) {
    if (this.ended) return;
    this.ended = { key, ...ENDINGS[key], why, round: this.round, spiral: this.spiral, guard: this.guard };
    this.phase = "over";
    this.say(`*** ${ENDINGS[key].title} *** ${why} ${ENDINGS[key].line}`, "all");
  }

  // ----- what a seat may see (the PASS screen shows nothing; the Law never sees him unless seen) -----
  view(side) {
    const w = this.W(), seeAll = side === "walker" || side === "all" || this.ended;
    const figs = Object.values(this.figs).filter(f => f.zone || f.id === "walker").map(f => {
      const pub = { id: f.id, name: f.name, title: f.title, glyph: f.glyph, side: f.side, hp: f.hp, maxHp: f.maxHp, alive: f.alive, away: f.away, skip: f.skip, nerve: f.nerve, aura: f.aura, ability: f.ability, weapon: f.weapon, desperate: f.desperate, zone: f.zone };
      if (f.id === "walker") {
        Object.assign(pub, { rage: f.rage, zen: f.zen, psyche: f.psyche, hold: f.hold, kits: seeAll ? f.kits : undefined });
        if (!seeAll) { pub.zone = w.seenRound === this.round ? w.zone : null; pub.lastSeen = this.lastSeen; }
        if (!seeAll && this.K.fogSheet) for (const k of ["rage", "zen", "psyche", "hold", "weapon"]) delete pub[k]; // P1: behind his screen (HP stays public)
      }
      if (f.id === "sister") pub.files = f.files;
      return pub;
    });
    return {
      round: this.round, spiral: this.spiral, guard: this.guard, risk: this.risk, weather: this.weather, trapsLive: this.trapsLive, coldOpen: this.coldOpen(),
      expansion: this.expansion, rules: this.K.name, K: this.K, figs, lastSeen: this.lastSeen, radioGround: this.radioGround || null,
      blips: side === "walker" ? [] : this.blips.filter(b => b.round >= this.round - 1),
      traps: this.traps.filter(t => seeAll ? true : t.known).map(t => ({ zone: t.zone, owner: t.owner, kind: seeAll || t.known ? t.kind : "?" })),
      caches: seeAll ? this.caches : [], rifles: seeAll || !this.K.fogSheet ? this.rifles : undefined, anchor: this.anchor,
      log: this.log.filter(l => l.vis === "all" || l.vis === side || side === "all" || this.ended),
      ended: this.ended,
    };
  }
  digest() { // a compact fingerprint for the golden master
    const e = this.ended || {}; return `${e.key}|${e.round}|${this.spiral}|${this.guard}|${this.W().hp}|${this.W().zone}|${this.stats.decisions}`;
  }
}

// ---------------- THE CPUS (same seam as a human: they read the options and pick one) ----------------
// Bot styles (1123): the same brain with different nerves, so the battery can show that HOW you play changes who wins.
export const WALKER_STYLES = {
  steady: {},                                                                   // the default CPU
  cautious: { threatW: 1.6, runPenalty: 6, wound: 0.3, killBias: 0, warnAt: 3, fixFirst: 0.85, walk: 0.15 },   // stays low, fixes himself first
  bold: { threatW: 0.6, runPenalty: 0, wound: 0.9, killBias: 0.4, warnAt: 5, fixFirst: 0.35, walk: 0.6 },      // runs for it, fights his way through
};
export const LAW_STYLES = {
  steady: {},                                                                   // the default CPU: half sweep, half chase
  sweep: { scanP: 0.85, scanTight: 5 },                                         // each deputy stands where he is and sweeps
  spread: { scanP: 0.1, scanTight: 1, claims: true },                           // fan out: every deputy walks to his own possible zone
  converge: { scanP: 0.1, scanTight: 1, claims: false, radio: 0.8 },            // the pack: everybody runs at the freshest lead
};
export class WalkerBot {
  constructor(seed, style = {}) { if (typeof style === "string") style = WALKER_STYLES[style] || {}; this.rng = makeRng((seed >>> 0) ^ 0x57A1); this.style = { rifle: 0.0, killBias: 0.25, warnAt: 4, wound: 0.6, warnSister: 3, seekTruth: true, threatW: 1.0, runPenalty: 1.5, fixFirst: 0.6, walk: 0.3, ...style }; }
  decide(g, p) {
    const w = g.W(), K = g.K, opts = p.options, by = (pred) => opts.filter(pred);
    if (p.setup) return this.setup(g, opts);
    if (opts.length === 1) return opts[0].id;
    const hunters = g.hunters().filter(h => h.role !== "dog");
    const col = g.figs.sister;
    // THE TRUTH (expansion): once Verna holds three files she's the way out, not a threat
    const truth = g.expansion && col.alive && col.zone && col.files >= 3 && this.style.seekTruth;
    const threat = (z) => hunters.reduce((s, h) => s + (h.zone === z ? 10 : dist(h.zone, z) === 1 ? 4 : dist(h.zone, z) === 2 ? 1 : 0), 0)
      + (col.alive && col.zone && !truth ? (col.zone === z ? 3 : dist(col.zone, z) === 1 ? 1.5 : 0) : 0);
    const near = threat(w.zone) >= 4;
    const fire = by(o => o.act === "FIRE");
    if (fire.every(o => o.mode === "KILL") && fire.length && fire.length === opts.length) return fire[0].id; // kill logic
    const cold = g.coldOpen();
    const moves = by(o => o.act === "MOVE");
    const score = (o) => {
      let s = -threat(o.to) * this.style.threatW;
      if (o.run) s -= this.style.runPenalty;
      if (cold) s += (dist(w.zone, "COLD") - dist(o.to, "COLD")) * (g.clean() ? 4 : 1.5);
      else s += (dist(w.zone, "COLD") - dist(o.to, "COLD")) * 0.3;
      if (ZONE[o.to].tier === "TOWN") s -= 3;
      if (o.to === "COLD" && !g.clean() && hunters.some(h => dist(h.zone, "COLD") <= 1)) s -= 6;
      if (g.traps.some(t => t.zone === o.to && t.owner === "system" && t.known)) s -= 1;
      if (truth) s += (dist(w.zone, col.zone) - dist(o.to, col.zone)) * 3;
      return s + this.rng.next() * 0.6;
    };
    const best = moves.slice().sort((a, b) => score(b) - score(a))[0];
    // a hunter in his zone: fight or flee
    if (threat(w.zone) >= 10) {
      const here = hunters.filter(h => h.zone === w.zone);
      if (here.length === 1 && fire.length) {
        const killing = (w.rage >= 3 || this.rng.next() < this.style.killBias) && !(cold && dist(w.zone, "COLD") <= 2);
        const o = fire.find(o => o.target === here[0].id && o.mode === (killing ? "KILL" : "WOUND")) || fire[0];
        const pFire = K.woundCarry && !killing ? Math.max(this.style.wound, 0.85) : this.style.wound;
        if (this.rng.next() < pFire) return o.id;
      }
      if (best && score(best) > -10) return best.id;
      const st = by(o => o.act === "STEALTH")[0]; return (st || opts[0]).id;
    }
    // in the Cold Zone: keep it clean, keep still
    if (w.zone === "COLD") {
      if (w.weapon === "RIFLE") return by(o => o.sub === "DROP")[0].id;
      if (w.psyche > K.cleanPsyche) return by(o => o.act === "STEALTH")[0].id;
      if (w.zen < K.cleanZen) return (near ? by(o => o.act === "CALL OUT")[0] : by(o => o.act === "SCAN")[0]).id;
      return by(o => o.act === "STEALTH")[0].id;
    }
    const cache = by(o => o.sub === "CACHE")[0]; if (cache && w.hp <= w.maxHp - 2 && !near) return cache.id;
    // CALL OUT: THE TRUTH (expansion) — three files and Verna in voice range: call her in
    const callout = by(o => o.act === "CALL OUT")[0];
    if (callout && g.expansion && col.alive && col.zone && col.files >= 3 && dist(col.zone, w.zone) <= 1 && w.rage < K.killRage) return callout.id;
    // CALL OUT: HOLLER — the Guard is close to closing the net and he's out of the Cold Zone
    const sisterNear = col.alive && col.zone && dist(col.zone, w.zone) <= this.style.warnSister;
    if (callout && K.walkerCallOut === "warning" && g.guard >= this.style.warnAt && !sisterNear && threat(w.zone) < 10) return callout.id;
    const rifle = by(o => o.sub === "RIFLE")[0]; if (rifle && !cold && this.rng.next() < this.style.rifle) return rifle.id;
    const drop = by(o => o.sub === "DROP")[0]; if (drop && cold && dist(w.zone, "COLD") <= 2) return drop.id;
    if (near && best && score(best) > score({ to: w.zone }) - 1) return best.id;
    if (near) return by(o => o.act === "STEALTH")[0].id;
    // quiet: fix the stats, then walk
    const needPsyche = w.psyche > K.cleanPsyche, needZen = w.zen < K.cleanZen;
    const trap = by(o => o.sub === "TRAP")[0];
    if (trap && hunters.some(h => dist(h.zone, w.zone) <= 2) && this.rng.next() < 0.5) return trap.id;
    if (cold) {
      if ((needPsyche || needZen) && dist(w.zone, "COLD") <= 2) return (needPsyche ? by(o => o.act === "STEALTH")[0] : by(o => o.act === "SCAN")[0]).id;
      if (best && this.rng.next() < 0.75) return best.id;
    }
    if (needPsyche && this.rng.next() < this.style.fixFirst) return by(o => o.act === "STEALTH")[0].id;
    if (needZen && this.rng.next() < this.style.fixFirst) return by(o => o.act === "SCAN")[0].id;
    if (trap && this.rng.next() < 0.3) return trap.id;
    // drift toward the deep woods, away from them
    if (best && (score(best) > 0.5 || this.rng.next() < this.style.walk)) return best.id;
    return by(o => o.act === "STEALTH")[0].id;
  }
  setup(g, opts) {
    // traps on the Law's road into the woods, caches deep
    const item = g.pendingSetup[0];
    const pref = item.kind === "trap" ? ["DRAW", "VALLEY", "GRASS", "BLUFF", "TRAIL", "RAVINE", "BEND"] : ["RIDGE", "TRAIL", "RAVINE", "MINE", "SQUEEZE"];
    const ok = opts.filter(o => pref.includes(o.zone));
    return (ok.length ? ok[this.rng.int(Math.min(3, ok.length))] : opts[0]).id;
  }
}
export class LawBot {
  constructor(seed, style = {}) { if (typeof style === "string") style = LAW_STYLES[style] || {}; this.rng = makeRng((seed >>> 0) ^ 0x1A3B); this.style = { callOut: 0.15, radio: 0.5, radioAt: 7, scanP: 0.5, scanTight: 4, claims: true, ...style }; this.claimed = {}; this.claimRound = -1; }
  possible(g) {
    // where could he be? everything within (rounds since seen) of the last sighting; fresh blips narrow it
    const v = g.view("law"), ls = v.lastSeen, age = Math.max(0, g.round - ls.round);
    const fresh = v.blips.filter(b => b.round >= g.round - 1);
    const src = fresh.length ? fresh.map(b => ({ zone: b.zone, age: g.round - b.round })) : [{ zone: ls.zone, age }];
    const set = new Set();
    for (const s of src) for (const z of ZONES) if (dist(s.zone, z.id) <= s.age + (s.age ? 1 : 0) && (z.id !== "COLD" || g.coldOpen())) set.add(z.id);
    // the chopper's pass (lawRadio "ground"): he was on that ground at the end of round rg.round
    const rg = v.radioGround;
    if (rg && g.round - rg.round <= 2 && rg.round >= ls.round) {
      const ground = ZONES.filter(z => z.tier === rg.tier).map(z => z.id), age2 = g.round - rg.round;
      const cut = [...set].filter(z => ground.some(gz => dist(gz, z) <= age2));
      if (cut.length) return cut;
      return ZONES.filter(z => ground.some(gz => dist(gz, z.id) <= age2) && (z.id !== "COLD" || g.coldOpen())).map(z => z.id);
    }
    return [...set];
  }
  decide(g, p) {
    const opts = p.options, f = g.figs[p.fig], by = (pred) => opts.filter(pred);
    if (opts.length === 1) return opts[0].id;
    if (this.claimRound !== g.round) { this.claimed = {}; this.claimRound = g.round; }
    if (p.fig === "heller") {
      const nm = by(o => o.sub === "NIGHTMARE")[0]; if (nm) return nm.id;
      const ord = by(o => o.sub === "ORDNANCE"); if (ord.length && this.rng.next() < 0.6) { const pref = ord.filter(o => ["RIDGE", "SQUEEZE", "TRAIL", "RAVINE"].includes(o.zone)); return (pref.length ? this.rng.pick(pref) : this.rng.pick(ord)).id; }
      return by(o => o.id === "hold")[0].id;
    }
    const show = by(o => o.sub === "SHOWDOWN")[0]; if (show) return show.id;
    const fire = by(o => o.act === "FIRE" && !o.snap)[0]; if (fire) return fire.id;
    const P = this.possible(g);
    const here = f.zone;
    if (p.fig === "tolley") { const dog = by(o => o.sub === "DOG")[0]; if (dog && P.length > 2) return dog.id; }
    const snap = by(o => o.snap)[0]; if (snap && this.rng.next() < 0.5) return snap.id;
    // the hold needs the Cold Zone clear: if he's holding it, walk in
    if (g.K.holdNeedsClear && g.W().seenRound >= g.round - 1 && g.lastSeen.zone === "COLD") { const inn = by(o => o.act === "MOVE" && o.to === "COLD")[0]; if (inn) return inn.id; if (here === "COLD") return (by(o => o.act === "SCAN")[0]).id; }
    // the Cold Zone: once it's near, two of them guard the way in
    const guards = ["sheriff", "crane"];
    if (g.spiral >= g.K.coldAt - 1 && guards.includes(p.fig)) {
      const post = p.fig === "sheriff" ? "RIDGE" : "SQUEEZE";
      const target = g.canEnter(f, post) ? post : "RIDGE";
      if (here !== target) { const mv = this.stepTo(by(o => o.act === "MOVE"), here, target); if (mv) return mv.id; }
      return (by(o => o.sub === "ANCHOR")[0] || by(o => o.act === "STEALTH")[0] || by(o => o.act === "SCAN")[0]).id;
    }
    // can I scan a zone he might be in?
    const scanCovers = P.filter(z => z === here || adjacent(z, here));
    const co = by(o => o.act === "CALL OUT")[0];
    if (co && g.K.lawRadio === "ground") {
      // the chopper is worth a call when he could be anywhere, and only one figure calls a round
      if (!this.claimed.__radio && P.length >= this.style.radioAt && g.spiral < g.K.coldAt - 1 && this.rng.next() < this.style.radio) { this.claimed.__radio = "radio"; return co.id; }
    } else if (co && p.fig === "sheriff" && g.spiral < g.K.coldAt - 2 && P.length >= 6 && this.rng.next() < this.style.callOut) return co.id;
    if (scanCovers.length && (P.length <= this.style.scanTight || this.rng.next() < this.style.scanP)) return by(o => o.act === "SCAN")[0].id;
    // otherwise go to the nearest possible zone nobody's claimed
    const free = this.style.claims ? P.filter(z => !Object.values(this.claimed).includes(z)) : P;
    const pool = free.length ? free : P;
    const target = pool.slice().sort((a, b) => dist(here, a) - dist(here, b) || (a < b ? -1 : 1))[0];
    if (target) { this.claimed[p.fig] = target; const mv = this.stepTo(by(o => o.act === "MOVE"), here, target); if (mv) return mv.id; }
    return by(o => o.act === "SCAN")[0].id;
  }
  stepTo(moves, here, target) {
    const good = moves.filter(o => dist(o.to, target) < dist(here, target));
    return good.length ? good[this.rng.int(good.length)] : null;
  }
}

export class RandomBot { // the floor: any legal option (for "skill pays" checks and fuzzing)
  constructor(seed) { this.rng = makeRng((seed >>> 0) ^ 0xBADD); }
  decide(g, p) { return this.rng.pick(p.options).id; }
}

// ---------------- run a whole game with CPUs (or a mix: ctl[side] = bot | null) ----------------
export function playOut({ seed, players = 2, expansion = false, rules = "TUNED", knobs = null, walkerBot = null, lawBot = null } = {}) {
  const g = new Game({ seed, players, expansion, rules, knobs });
  const wb = walkerBot || new WalkerBot(seed), lb = lawBot || new LawBot(seed);
  let guard = 0, lastRound = 0, seatsThisRound = new Set();
  for (let p = g.pending(); p; p = g.pending()) {
    if (g.round !== lastRound) { g.stats.seatTurns += seatsThisRound.size; seatsThisRound = new Set(); lastRound = g.round; }
    if (!p.setup) seatsThisRound.add(p.seat);
    const side = g.figs[p.fig].side === "walker" ? "walker" : "law";
    g.choose(side === "walker" ? wb.decide(g, p) : lb.decide(g, p));
    if (++guard > 20000) throw new Error("runaway game");
  }
  g.stats.seatTurns += seatsThisRound.size;
  return g;
}
