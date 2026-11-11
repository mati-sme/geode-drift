// Geode Drift v2 — run-based mining. Pure logic shared by the game and the headless sim.
export const VERSION = 3;
export const ORES = [
  { name: 'Dust', color: 0xc9bfe8 }, { name: 'Copper', color: 0xff9a5c }, { name: 'Cobalt', color: 0x5ca8ff },
  { name: 'Gold', color: 0xffd25c }, { name: 'Crystal', color: 0xff7ae0 }, { name: 'Starsteel', color: 0x9ffff0 }, { name: 'Voidglass', color: 0xb07aff },
];
export const ZONE_LEN = 150;
export const ZONES = ['Dust Belt', 'Copper Reef', 'Cobalt Caverns', 'Golden Hollow', 'Crystal Heart', 'Starsteel Core', 'Void Rift'];
export const ZONE_HUE = [0x8a7fb8, 0xff8a4a, 0x4a8cff, 0xffc94a, 0xff6ad5, 0x6afff0, 0x9a5cff];
export const zoneName = z => ZONES[z] || `Deep Rift ${z - ZONES.length + 2}`;
export const zoneHue = z => ZONE_HUE[z % ZONE_HUE.length];

// ---------- Upgrade tree ----------
// x,y = grid position in the web; req = parents (any one owned unlocks it); cost = [oreTier, base, growth]
const N = (id, name, x, y, req, max, cost, desc, mod) => ({ id, name, x, y, req, max, cost, desc, mod });
export const TREE = [
  N('rig', 'Drift Rig', 0, 0, [], 1, [0, 0, 1], 'Your trusty mining rig.'),
  // time (up)
  N('t1', 'Bigger Battery', 0, -1, ['rig'], 5, [0, 14, 1.6], '+3s run time'),
  N('t2', 'Chrono Shards', -1, -2, ['t1'], 5, [0, 70, 1.8], '+0.12s for every rock broken'),
  N('t3', 'Fusion Cell', 0, -2, ['t1'], 5, [1, 18, 1.8], '+4s run time'),
  N('t4', 'Boss Clock', 1, -3, ['t3'], 3, [2, 25, 2.4], '+8s whenever a Guardian falls'),
  N('t5', 'Time Crystal', 0, -3, ['t3'], 5, [3, 20, 2], '+5s run time'),
  N('t6', 'Eternity Coil', 0, -4, ['t5'], 5, [4, 18, 2.1], '+5s run time'),
  // damage (right)
  N('d1', 'Sharper Laser', 1, 0, ['rig'], 15, [0, 8, 1.45], '+35% laser damage'),
  N('d2', 'Twin Beam', 2, -1, ['d1'], 1, [0, 140, 1], '+1 laser beam'),
  N('d4', 'Plasma Coils', 2, 0, ['d1'], 25, [1, 14, 2], 'Laser damage x1.4'),
  N('d3', 'Crit Lens', 2, 1, ['d1'], 5, [1, 16, 1.8], '+8% chance to crit for x3'),
  N('d5', 'Triple Beam', 3, -1, ['d2', 'd4'], 1, [2, 40, 1], '+1 laser beam'),
  N('d6', 'Ion Furnace', 3, 0, ['d4'], 25, [2, 18, 2], 'Laser damage x1.4'),
  N('d7', 'Boss Breaker', 3, 1, ['d3'], 5, [2, 30, 1.8], 'x1.6 damage to Guardians'),
  N('d8', 'Star Lance', 4, 0, ['d6'], 25, [3, 18, 2], 'Laser damage x1.5'),
  N('d9', 'Quad Beam', 4, -1, ['d5', 'd8'], 1, [4, 40, 1], '+1 laser beam'),
  N('d10', 'Nova Lance', 5, 0, ['d8'], 25, [4, 18, 2], 'Laser damage x1.6'),
  N('d11', 'Void Laser', 6, 0, ['d10'], 25, [5, 18, 2], 'Laser damage x1.7'),
  N('d12', 'Rift Cannon', 7, 0, ['d11'], 999, [6, 15, 1.9], 'Laser damage x1.8'),
  // drill (down)
  N('r1', 'Drill Bit', 0, 1, ['rig'], 15, [0, 10, 1.5], 'Drill power x1.3 (dig through harder rock)'),
  N('r2', 'Thrusters', -1, 2, ['r1'], 8, [0, 30, 1.6], '+15% descent speed'),
  N('r3', 'Diamond Bit', 0, 2, ['r1'], 25, [1, 14, 2], 'Drill power x1.35'),
  N('r4', 'Launch Pad', 1, 2, ['r1'], 10, [1, 25, 1.7], 'Start each run 15m deeper (up to 60% of your record)'),
  N('r6', 'Afterburner', -1, 3, ['r2'], 8, [2, 22, 1.7], '+15% descent speed'),
  N('r5', 'Tungsten Head', 0, 3, ['r3'], 25, [2, 16, 2], 'Drill power x1.4'),
  N('r10', 'Sky Cannon', 1, 3, ['r4'], 10, [3, 20, 1.7], 'Start each run 40m deeper'),
  N('r7', 'Gold Auger', 0, 4, ['r5'], 25, [3, 16, 2], 'Drill power x1.45'),
  N('r8', 'Crystal Auger', 0, 5, ['r7'], 25, [4, 16, 2], 'Drill power x1.5'),
  N('r9', 'Star Auger', 0, 6, ['r8'], 25, [5, 16, 2], 'Drill power x1.6'),
  N('r11', 'Rift Auger', 0, 7, ['r9'], 999, [6, 14, 1.9], 'Drill power x1.7'),
  // area (left)
  N('a1', 'Wide Lens', -1, 0, ['rig'], 6, [0, 18, 1.6], '+0.5m laser range'),
  N('a2', 'Rich Field', -2, -1, ['a1'], 8, [0, 40, 1.6], '+20% more rocks'),
  N('a4', 'Long Lens', -2, 0, ['a1'], 6, [1, 22, 1.7], '+0.5m laser range'),
  N('a3', 'Shatter', -2, 1, ['a1'], 5, [1, 20, 1.8], 'Broken rocks blast neighbours for 30% of their health'),
  N('a5', 'Dense Field', -3, -1, ['a2'], 8, [2, 25, 1.7], '+20% more rocks'),
  N('a7', 'Gravity Lens', -3, 0, ['a4'], 6, [3, 25, 1.8], '+0.6m laser range'),
  N('a6', 'Chain Blast', -3, 1, ['a3'], 5, [3, 25, 1.9], '+0.5m blast radius'),
  // economy (diagonals)
  N('e1', 'Dust Sifter', 1, -1, ['rig'], 10, [0, 12, 1.5], '+30% Dust'),
  N('e2', 'Copper Sieve', 2, -2, ['e1'], 10, [1, 12, 1.5], '+30% Copper'),
  N('e3', 'Cobalt Sieve', 3, -3, ['e2'], 10, [2, 12, 1.5], '+30% Cobalt'),
  N('e4', 'Gold Sieve', 4, -4, ['e3'], 10, [3, 12, 1.5], '+30% Gold'),
  N('e5', 'Crystal Sieve', 5, -5, ['e4'], 10, [4, 12, 1.5], '+30% Crystal'),
  N('e10', 'Star Sieve', 6, -6, ['e5'], 10, [5, 12, 1.5], '+30% Starsteel'),
  N('e6', 'Lucky Veins', -1, -1, ['rig'], 10, [0, 22, 1.6], '+6% chance for double ore'),
  N('e7', 'Motherlode', -2, -2, ['e6'], 5, [2, 30, 2.4], 'All ore x1.2'),
  N('e8', 'Star Market', -3, -3, ['e7'], 5, [4, 25, 2.4], 'All ore x1.25'),
  N('e9', 'Void Bazaar', -4, -4, ['e8'], 999, [6, 15, 2.2], 'All ore x1.3'),
  // automation (lower diagonals)
  N('u1', 'Auto-Relaunch', -1, 1, ['rig'], 1, [1, 30, 1], 'Next run launches by itself after the summary'),
  N('u2', 'Idle Rig', -2, 2, ['u1'], 5, [2, 25, 2], '+15% offline mining (base 10%)'),
  N('u3', 'Ore Scanner', 1, 1, ['rig'], 1, [1, 20, 1], 'Lasers prefer the richest rocks'),
  N('u4', 'Overdrive', 2, 2, ['u3'], 5, [2, 30, 2], 'Last 5s of a run: x2 damage and speed (+1s per level)'),
  // modules (bottom-left)
  N('mods', 'Module Rack', -2, 3, ['u1'], 1, [1, 40, 1], '+1 module slot'),
  N('ap', 'Autopilot', -4, 2, ['mods'], 1, [1, 60, 1], 'When you let go of the keys, the rig steers itself'),
  N('mc', 'Storm Coil', -3, 2, ['mods'], 20, [2, 20, 1.8], 'Chain Lightning: damage x1.5, +1 jump every 4 levels', 'chain'),
  N('mm', 'Seeker Pods', -3, 3, ['mods'], 20, [3, 20, 1.8], 'Missiles: damage x1.5, +1 missile every 5 levels', 'missile'),
  N('mg', 'Super Magnet', -3, 4, ['mods'], 10, [1, 40, 1.8], 'Ore Magnet: +10% ore', 'magnet'),
  N('ms', 'Saw Teeth', -2, 4, ['mods'], 15, [3, 25, 1.8], 'Drill Saw: contact damage x1.5', 'saw'),
  N('mh', 'Shield Cells', -1, 4, ['mods'], 5, [4, 20, 2], 'Bubble Shield recharges 1s faster', 'shield'),
  N('slot3', 'Module Rack II', -4, 3, ['mc', 'mm'], 1, [4, 50, 1], '+1 module slot'),
  N('slot4', 'Module Rack III', -5, 3, ['slot3'], 1, [6, 40, 1], '+1 module slot'),
];
export const NODE = Object.fromEntries(TREE.map(n => [n.id, n]));
export const lvl = (s, id) => s.tree[id] || 0;
export function nodeCost(s, n) { const L = lvl(s, n.id); return Math.ceil(n.cost[1] * Math.pow(n.cost[2], L)); }
export function nodeVisible(s, n) { return n.id === 'rig' || (n.req.some(r => lvl(s, r) > 0) && (!n.mod || s.mods.includes(n.mod))); }
export function canBuy(s, n) { return nodeVisible(s, n) && lvl(s, n.id) < n.max && s.ore[n.cost[0]] >= nodeCost(s, n); }
export function buyNode(s, id) { const n = NODE[id]; if (!canBuy(s, n)) return false; s.ore[n.cost[0]] -= nodeCost(s, n); s.tree[id] = lvl(s, id) + 1; return true; }

// ---------- Modules (weapons / gadgets) ----------
export const MODULES = {
  chain: { name: 'Chain Lightning', icon: '⚡', desc: 'Every 1.3s a bolt jumps between 3 nearby rocks.' },
  missile: { name: 'Seeker Missiles', icon: '🚀', desc: 'Every 1.6s fires 2 homing missiles that blast an area.' },
  magnet: { name: 'Ore Magnet', icon: '🧲', desc: '+20% ore from everything, and pulls Time Capsules in.' },
  saw: { name: 'Drill Saw', icon: '⚙', desc: 'Drilling hits 4x harder and you dig 40% faster.' },
  shield: { name: 'Bubble Shield', icon: '🛡', desc: 'Blocks one hit every 8s (Guardian shards, bomb rocks).' },
};
export const slots = s => 1 + lvl(s, 'mods') + lvl(s, 'slot3') + lvl(s, 'slot4');
export const equipped = (s, m) => s.loadout.slice(0, slots(s)).includes(m);

// ---------- Artifacts (rare drops from Artifact Geodes) ----------
export const ARTIFACTS = [
  { id: 'lens', name: 'Prism Lens', desc: '+25% laser damage', icon: '🔷' },
  { id: 'hourglass', name: 'Comet Hourglass', desc: '+3s every run', icon: '⏳' },
  { id: 'clover', name: 'Star Clover', desc: '+25% ore', icon: '🍀' },
  { id: 'eye', name: 'Owl Eye', desc: '+10% crit chance', icon: '🦉' },
  { id: 'horn', name: 'Echo Horn', desc: '+0.6m laser range', icon: '📯' },
  { id: 'tooth', name: 'Moon Tooth', desc: 'Drill power x1.3', icon: '🦷' },
  { id: 'feather', name: 'Phoenix Feather', desc: 'Combo can reach x1.8 ore', icon: '🪶' },
  { id: 'shell', name: 'Time Shell', desc: 'Time Capsules give +1.5s more', icon: '🐚' },
  { id: 'spark', name: 'Spark Seed', desc: 'Chain Lightning +2 jumps', icon: '✨' },
  { id: 'rocket', name: 'Toy Rocket', desc: '+1 missile', icon: '🎈' },
  { id: 'bell', name: 'Lucky Bell', desc: '+8% double-ore chance', icon: '🔔' },
  { id: 'lantern', name: 'Dream Lantern', desc: '+20% offline mining', icon: '🏮' },
];
const art = (s, id) => !!s.artifacts[id];

// ---------- Story: chapters, goals, ship parts ----------
export const PARTS = ['Hull', 'Engine', 'Wings', 'Cockpit', 'Antenna', 'Reactor', 'Shields', 'Warp Coil', 'Starheart Socket', 'Starheart'];
export const CHAPTERS = [
  { title: 'Crash Landing', goals: [['depth', 30], ['ore', 0, 120]], reward: { ore: [0, 80] }, part: 0,
    talk: [['bolt', 'Hull patch complete! It is a bit wobbly, but it holds air. Good work, Pip!'], ['nova', 'Well done, little miner. Next we need power for the engine. The rocks deeper down glow with it.']] },
  { title: 'Sparks in the Dark', goals: [['depth', 80], ['pods', 1]], reward: { mod: 'chain', ore: [0, 150] }, part: 1,
    talk: [['bolt', 'You found one of our lost drones! It was carrying a Chain Lightning coil. Equip it in the Loadout!'], ['pip', 'Zap zap! The engine is humming again!']] },
  { title: 'The First Guardian', goals: [['boss', 0], ['ore', 1, 150]], reward: { mod: 'missile', ore: [1, 60] }, part: 2,
    talk: [['nova', 'That crystal Guardian has been blocking the tunnel for a hundred years. And you shattered it!'], ['bolt', 'I built Seeker Missiles from its shards. Boom, but friendly boom.']] },
  { title: 'Copper Skies', goals: [['depth', 260], ['pods', 4]], reward: { mod: 'magnet', ore: [1, 200] }, part: 3,
    talk: [['pip', 'The cockpit window is back! I can see the whole Drift from here.'], ['bolt', 'The drones you rescued built an Ore Magnet. More ore for everyone!']] },
  { title: 'Cobalt Caverns', goals: [['boss', 1], ['arts', 1]], reward: { mod: 'saw', ore: [2, 80] }, part: 4,
    talk: [['nova', 'An artifact! Ancient miners left these behind. Keep collecting them, they are full of old magic... I mean, science.'], ['bolt', 'Antenna online! I picked up a faint signal from home planet Lumen.']] },
  { title: 'Heart of Gold', goals: [['boss', 2], ['depth', 500]], reward: { ore: [3, 120] }, part: 5,
    talk: [['nova', 'Lumen\'s great light-crystal is fading. Only a Starheart from the bottom of the Drift can relight it.'], ['bolt', 'Our reactor is warm again. And I have an idea: we could fold our rig into a tiny star, a Supernova, and come back far stronger!']] },
  { title: 'Starborn', goals: [['novas', 1], ['depth', 450]], reward: { mod: 'shield', ore: [2, 300] }, part: 6,
    talk: [['pip', 'That was the biggest boom ever! And I feel super strong now.'], ['bolt', 'Stardust makes everything better. I also made you a Bubble Shield!']] },
  { title: 'Crystal Heart', goals: [['boss', 3], ['arts', 4], ['pods', 20]], reward: { ore: [4, 150] }, part: 7,
    talk: [['nova', 'The warp coil sings again. We are so close, Pip.'], ['bolt', 'Twenty drones home safe! They are throwing a tiny party in the cargo bay.']] },
  { title: 'Starsteel Depths', goals: [['novas', 2], ['boss', 4], ['boss', 5]], reward: { ore: [5, 150] }, part: 8,
    talk: [['pip', 'The Starheart socket is ready. Now we just need the Starheart itself.'], ['nova', 'It sleeps in the Void Rift, guarded by the oldest Guardian of all. Be brave, and be clever.']] },
  { title: 'Into the Void', goals: [['novas', 3], ['boss', 6]], reward: { ore: [6, 200] }, part: 9,
    talk: [['bolt', 'THE STARHEART! It is warm like a hug!'], ['nova', 'Starling is whole again. Lumen will shine. Thank you, Captain Pip.'], ['pip', 'Captain? Me?! ...But the Drift goes even deeper. Let\'s keep exploring the Deep Rifts!']] },
];
export const INTRO = [
  ['nova', 'Mayday, mayday... Starling has crash-landed in the Geode Drift. Is anyone awake?'],
  ['pip', 'I\'m here, Captain Nova! The ship is in pieces, but I\'m okay. Bolt too!'],
  ['bolt', 'Beep! Good news: the Drift is full of ore. Bad news: we need A LOT of it to rebuild Starling.'],
  ['nova', 'Our home planet Lumen is waiting for us. Take the little drill rig, dive into the asteroids and bring back ore.'],
  ['bolt', 'Steer with W A S D or the arrow keys. The lasers fire by themselves. Watch the timer, the battery is small for now!'],
  ['pip', 'Rebuild the ship, find our lost drones, and get home. Let\'s dig!'],
];
export const endlessGoal = s => ['depth', Math.ceil((s.bestEver + 60) / 50) * 50];
export function goalProgress(s, g) {
  const [k, a, b] = g;
  if (k === 'depth') return [Math.min(s.bestDepth, a), a, `Reach ${a}m deep`];
  if (k === 'ore') return [Math.min(s.oreEver[a], b), b, `Collect ${b} ${ORES[a].name}`];
  if (k === 'boss') return [s.bossEver > a ? 1 : 0, 1, `Shatter the ${zoneName(a)} Guardian (${(a + 1) * ZONE_LEN}m)`];
  if (k === 'pods') return [Math.min(s.pods, a), a, `Rescue ${a} lost drone${a > 1 ? 's' : ''}`];
  if (k === 'arts') return [Math.min(Object.keys(s.artifacts).length, a), a, `Find ${a} artifact${a > 1 ? 's' : ''}`];
  if (k === 'novas') return [Math.min(s.novas, a), a, `Go Supernova ${a}x`];
  return [0, 1, '?'];
}
export const chapter = s => CHAPTERS[s.chapter] || null;
export function chapterDone(s) { const c = chapter(s); return c ? c.goals.every(g => { const [p, m] = goalProgress(s, g); return p >= m; }) : goalProgress(s, endlessGoal(s))[0] >= endlessGoal(s)[1]; }
export function claimChapter(s) {
  if (!chapterDone(s)) return null; const c = chapter(s);
  if (!c) { const t = Math.min(6, Math.max(0, s.bossEver)); const amt = 200 * (1 + s.endless); s.ore[t] += amt; s.oreEver[t] += amt; s.endless++; s.chapter++; return { endless: true, ore: [t, amt] }; }
  if (c.reward.ore) { s.ore[c.reward.ore[0]] += c.reward.ore[1]; s.oreEver[c.reward.ore[0]] += c.reward.ore[1]; }
  if (c.reward.mod && !s.mods.includes(c.reward.mod)) { s.mods.push(c.reward.mod); if (s.loadout.length < slots(s) || !s.loadout.length) s.loadout.push(c.reward.mod); }
  s.parts = Math.max(s.parts, c.part + 1); s.chapter++;
  return c;
}

// ---------- Prestige: Supernova -> Stardust ----------
export const NOVA_ZONE = 3;
export const dustFor = s => Math.floor(Math.pow(Math.max(0, s.bestDepth) / 100, 1.8));
export const starMult = s => (1 + 0.25 * s.dust) * Math.pow(1.02, s.dust);
export const canNova = s => s.zoneMax >= NOVA_ZONE && dustFor(s) >= 1;
export function nova(s) {
  if (!canNova(s)) return 0; const d = dustFor(s);
  s.dust += d; s.novas++; s.tree = { rig: 1 }; s.ore = ORES.map(() => 0); s.bestDepth = 0; s.zoneMax = 0; s.lastRun = null; s.noRec = 0;
  s.loadout = s.loadout.slice(0, 1);
  return d;
}

export function newState(now = Date.now()) {
  return { v: VERSION, ore: ORES.map(() => 0), oreEver: ORES.map(() => 0), tree: { rig: 1 }, bestDepth: 0, bestEver: 0, zoneMax: 0, bossEver: 0, runs: 0, dust: 0, novas: 0,
    played: 0, lastSave: now, lastRun: null, autoRelaunch: false, autopilot: true, muted: false, seenIntro: false,
    chapter: 0, parts: 0, endless: 0, pods: 0, artifacts: {}, mods: [], loadout: [] };
}

// ---------- Stats ----------
export function stats(s) {
  const L = id => lvl(s, id), sm = starMult(s), pw = (id, b) => Math.pow(b, L(id));
  const eq = m => equipped(s, m);
  return {
    time: 25 + 3 * L('t1') + 4 * L('t3') + 5 * L('t5') + 5 * L('t6') + 2 * Math.min(10, s.novas) + (art(s, 'hourglass') ? 3 : 0),
    chrono: 0.12 * L('t2'), bossTime: 8 * L('t4'),
    dps: 5 * (1 + 0.35 * L('d1')) * pw('d4', 1.4) * pw('d6', 1.4) * pw('d8', 1.5) * pw('d10', 1.6) * pw('d11', 1.7) * pw('d12', 1.8) * sm * (art(s, 'lens') ? 1.25 : 1),
    beams: 1 + L('d2') + L('d5') + L('d9'),
    crit: 0.08 * L('d3') + (art(s, 'eye') ? 0.1 : 0), bossMult: pw('d7', 1.6),
    drill: pw('r1', 1.3) * pw('r3', 1.35) * pw('r5', 1.4) * pw('r7', 1.45) * pw('r8', 1.5) * pw('r9', 1.6) * pw('r11', 1.7) * sm * (art(s, 'tooth') ? 1.3 : 1) * (eq('saw') ? 1.4 : 1),
    speed: 1.1 * (1 + 0.15 * L('r2') + 0.15 * L('r6')) * (1 + 0.05 * Math.min(40, s.novas)),
    steer: 5 * (1 + 0.08 * L('r2') + 0.08 * L('r6')),
    launch: 15 * L('r4') + 40 * L('r10') + 60 * s.novas,
    range: 3.2 + 0.5 * L('a1') + 0.5 * L('a4') + 0.6 * L('a7') + (art(s, 'horn') ? 0.6 : 0),
    density: 1.1 * (1 + 0.2 * L('a2') + 0.2 * L('a5')),
    blast: 0.3 * Math.min(1, L('a3')) + 0.1 * Math.max(0, L('a3') - 1), blastR: 1.6 + 0.5 * L('a6'),
    oreMult: ORES.map((_, t) => (1 + 0.3 * L(['e1', 'e2', 'e3', 'e4', 'e5', 'e10', 'none'][t])) * pw('e7', 1.2) * pw('e8', 1.25) * pw('e9', 1.3) * sm
      * (art(s, 'clover') ? 1.25 : 1) * (eq('magnet') ? 1.2 + 0.1 * L('mg') : 1)),
    lucky: 0.06 * L('e6') + (art(s, 'bell') ? 0.08 : 0), scanner: L('u3') > 0, overdrive: L('u4') ? 4 + L('u4') : 0,
    offline: 0.1 + 0.15 * L('u2') + (art(s, 'lantern') ? 0.2 : 0),
    comboCap: art(s, 'feather') ? 0.8 : 0.5, capsule: 2.5 + (art(s, 'shell') ? 1.5 : 0), magnet: eq('magnet'),
    chain: eq('chain') ? { dmg: 1.2 * pw('mc', 1.5), jumps: 3 + Math.floor(L('mc') / 4) + (art(s, 'spark') ? 2 : 0), cd: 1.3 } : null,
    missile: eq('missile') ? { dmg: 2 * pw('mm', 1.5), n: 2 + Math.floor(L('mm') / 5) + (art(s, 'rocket') ? 1 : 0), cd: 1.6 } : null,
    saw: eq('saw') ? 4 * pw('ms', 1.5) : 1,
    shield: eq('shield') ? 8 - L('mh') : 0,
    autopilot: L('ap') > 0,
  };
}

// ---------- RNG ----------
export function rng(seed) { let a = seed >>> 0 || 1; return () => { a ^= a << 13; a >>>= 0; a ^= a >> 17; a ^= a << 5; a >>>= 0; return a / 4294967296; }; }

// ---------- Rocks ----------
const ENV = globalThis.process?.env || {};
export const HP_GROW = +(ENV.HPG || 1.03), Q = +(ENV.Q || 3e-5);
const curve = y => Math.pow(HP_GROW, y) * Math.exp(Q * y * Math.min(y, 1000));
export const rockHP = (y, size) => 3 * size * curve(y);
export const hardness = y => Math.pow(+(ENV.HRD || 1.026), y) * Math.exp(Q * 0.8 * y * Math.min(y, 1000));
export const bossHP = B => 40 * curve(B);
export const W = 6.5;
export const KINDS = {
  rock: { name: 'Rock' }, iron: { name: 'Iron Rock', hp: 3, ore: 1.8 }, bomb: { name: 'Bomb Rock', hp: 0.8, ore: 0.5 },
  capsule: { name: 'Time Capsule', hp: 1, ore: 0 }, pod: { name: 'Lost Drone', hp: 1.5, ore: 0 }, geode: { name: 'Artifact Geode', hp: 5, ore: 4 }, cluster: { name: 'Crystal Cluster', hp: 1.5, ore: 3 },
};
function pickKind(r, y) {
  const x = r();
  if (y > 90 && x < 0.0017) return 'geode';
  if (y > 20 && x < 0.0055) return 'pod';
  if (x < 0.035) return 'capsule';
  if (x < 0.05) return 'cluster';
  if (y > 55 && x < 0.15) return 'bomb';
  if (y > 25 && x < 0.27) return 'iron';
  return 'rock';
}
function oreTier(run, y) { const zz = (y + 90) / ZONE_LEN, top = Math.min(Math.floor(zz), ORES.length - 1); if (top === 0) return 0; const f = zz - Math.floor(zz); const p = top > Math.floor(y / ZONE_LEN) ? 0.12 + f * 0.5 : 0.65; return run.r() < p ? top : top - 1; }
function spawnRock(run, y) {
  const kind = pickKind(run.r, y), K = KINDS[kind];
  const size = kind === 'geode' ? 1.5 : kind === 'capsule' || kind === 'pod' ? 0.8 : 0.6 + run.r() * 0.9 + (run.r() < 0.08 ? 0.8 : 0);
  const hp = rockHP(y, size) * (K.hp || 1), tier = oreTier(run, y);
  run.rocks.push({ id: run.nid++, kind, x: (run.r() * 2 - 1) * W, y, z: (run.r() - 0.5) * 2, size, hp, max: hp, tier, hit: 0 });
}

// ---------- Run ----------
export function startRun(s, seed = (Math.random() * 1e9) | 0, auto = false) {
  const st = stats(s); const start = Math.min(st.launch, Math.floor(s.bestDepth * 0.6));
  return { st, r: rng(seed), auto, t: 0, tmax: st.time, depth: start, startDepth: start, x: 0, vx: 0, input: { x: 0, y: 0 }, rocks: [], nid: 1, spawnedTo: start + 1, ore: ORES.map(() => 0),
    broken: 0, boss: null, bossesKilled: 0, ended: false, ev: [], bonusTime: 0, targets: [], shots: [], combo: 0, comboT: 0, bestCombo: 0, pods: 0, arts: [], hits: 0,
    chainT: 0.6, missT: 0.8, shieldT: 0, kinds: {} };
}
function loseTime(run, sec, why) {
  if (run.st.shield && run.shieldT <= 0) { run.shieldT = run.st.shield; run.ev.push({ type: 'shield' }); return; }
  run.tmax -= sec; run.hits++; run.ev.push({ type: 'hurt', sec, why });
}
function breakRock(run, rk, s) {
  const st = run.st, yz = rk.tier >= ORES.length - 1 ? Math.min(600, rk.y - ZONE_LEN * (ORES.length - 1)) : rk.y - Math.floor(rk.y / ZONE_LEN) * ZONE_LEN;
  run.combo = run.comboT > 0 ? run.combo + 1 : 1; run.comboT = 1.8; run.bestCombo = Math.max(run.bestCombo, run.combo);
  const cm = 1 + Math.min(st.comboCap, run.combo * 0.01), K = KINDS[rk.kind];
  let amt = rk.size * (1 + yz / 40) * st.oreMult[rk.tier] * cm * (K.ore ?? 1);
  if (amt > 0 && run.r() < st.lucky) { amt *= 2; run.ev.push({ type: 'lucky', rock: rk }); }
  run.ore[rk.tier] += amt; run.broken++; rk.hp = 0; run.kinds[rk.kind] = (run.kinds[rk.kind] || 0) + 1;
  if (st.chrono) { const add = Math.min(st.chrono, Math.max(0, st.time * 0.4 - run.bonusTime)); run.tmax += add; run.bonusTime += add; }
  if (rk.kind === 'capsule') { run.tmax = Math.min(Math.max(run.tmax, st.time * 1.8), run.tmax + st.capsule); run.ev.push({ type: 'capsule', rock: rk, sec: st.capsule }); }
  if (rk.kind === 'pod') { run.pods++; run.ev.push({ type: 'pod', rock: rk }); }
  if (rk.kind === 'geode') { const left = ARTIFACTS.filter(a => !s.artifacts[a.id] && !run.arts.includes(a.id));
    if (left.length && run.r() < 0.3) { const a = left[Math.floor(run.r() * left.length)]; run.arts.push(a.id); run.ev.push({ type: 'artifact', rock: rk, art: a }); } }
  run.ev.push({ type: 'break', rock: rk, amt, combo: run.combo });
  const blastAll = (r, frac) => { for (const o of run.rocks) if (o.hp > 0 && o !== rk && Math.hypot(o.x - rk.x, o.y - rk.y) < r) { o.hp -= Math.max(rk.max, o.max * 0.6) * frac; o.hit = 1; } };
  if (rk.kind === 'bomb') { blastAll(2.6, 1); run.ev.push({ type: 'boom', rock: rk }); if (Math.hypot(run.x - rk.x, run.depth - rk.y) < 2.1) loseTime(run, 2, 'bomb'); }
  else if (st.blast) blastAll(st.blastR, st.blast);
}
function dmgRock(run, rk, d) { rk.hp -= d; rk.hit = 1; }
export function autoSteer(run) {
  // dodge Guardian shards first, then head for the best rock
  let dx = 0, dy = 0;
  for (const p of run.shots) { const ex = run.x - p.x, ey = run.depth - p.y, d = Math.hypot(ex, ey); if (d < 2.4) { dx += ex / (d * d + 0.1); dy += ey / (d * d + 0.1); } }
  if (Math.abs(dx) + Math.abs(dy) > 0.05) return { x: Math.max(-1, Math.min(1, dx * 3)), y: Math.max(-1, Math.min(1, dy * 3)) };
  if (run.boss) return { x: Math.max(-1, Math.min(1, (Math.sin(run.t * 0.9) * 2.5 - run.x))), y: 0 };
  let tx = run.x, best = Infinity;
  for (const rk of run.rocks) { if (rk.hp <= 0 || rk.y < run.depth - 1) continue; if (rk.kind === 'bomb' && rk.y - run.depth < 2.5) continue;
    const val = (rk.kind === 'pod' || rk.kind === 'geode' || rk.kind === 'capsule' ? 4 : 0) + (run.st.scanner ? rk.tier * 2 : 0);
    const sc = Math.abs(rk.x - run.x) * 0.6 + (rk.y - run.depth) - val; if (sc < best) { best = sc; tx = rk.x; } }
  for (const rk of run.rocks) if (rk.kind === 'bomb' && rk.hp > 0 && Math.abs(rk.y - run.depth - 1) < 2 && Math.abs(rk.x - run.x) < 1.6) tx = run.x + (run.x > rk.x ? 2 : -2);
  return { x: Math.max(-1, Math.min(1, (tx - run.x) * 1.5)), y: 0 };
}
function bossAttack(run, dt) {
  const b = run.boss, ph = b.hp / b.max > 0.66 ? 0 : b.hp / b.max > 0.33 ? 1 : 2; b.phase = ph; b.at -= dt;
  const shoot = (ang, sp) => run.shots.push({ x: 0, y: b.y - 0.2, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 4 });
  if (b.at <= 0) {
    const sp = 3.2 + b.zone * 0.15;
    if (ph === 0) { const n = 8; for (let i = 0; i < n; i++) shoot(Math.PI + (i + 0.5) / n * Math.PI, sp); b.at = 2.2; }
    else if (ph === 1) { const n = 12, o = run.r() * 0.5; for (let i = 0; i < n; i++) shoot(Math.PI + (i + o) / n * Math.PI, sp * 1.1); const a = Math.atan2(run.depth - b.y, run.x); for (const k of [-0.18, 0, 0.18]) shoot(a + k, sp * 1.4); b.at = 1.7; }
    else { b.spin = (b.spin || 0) + 0.55; for (let k = 0; k < 3; k++) shoot(Math.PI + ((b.spin + k * 1.05) % Math.PI), sp * 1.2); b.at = 0.28; }
    run.ev.push({ type: 'bossfire', phase: ph });
  }
}
export function stepRun(run, s, dt) {
  if (run.ended) return;
  const st = run.st; run.t += dt;
  const od = st.overdrive && run.tmax - run.t < st.overdrive ? 2 : 1; run.od = od > 1;
  if (run.t >= run.tmax) return endRun(run, s);
  run.comboT -= dt; if (run.comboT <= 0) run.combo = 0;
  run.shieldT -= dt;
  const nextBoss = (Math.floor(run.depth / ZONE_LEN) + 1) * ZONE_LEN;
  while (run.spawnedTo < run.depth + 16) { run.spawnedTo += 1 / (st.density * 2); if (Math.abs(run.spawnedTo - nextBoss) > 3.5) spawnRock(run, run.spawnedTo); }
  if (!run.boss && run.depth >= nextBoss - 6.5) { const z = Math.floor(nextBoss / ZONE_LEN) - 1; run.boss = { hp: bossHP(nextBoss), max: bossHP(nextBoss), y: nextBoss, zone: z, at: 1.5, phase: 0 }; run.ev.push({ type: 'boss', boss: run.boss }); }
  // input: player keys, or autopilot when idle (or in the sim)
  let inp = run.input; const idle = !inp.x && !inp.y;
  if (run.auto || (idle && st.autopilot && s.autopilot)) inp = autoSteer(run);
  run.x = Math.max(-W, Math.min(W, run.x + inp.x * st.steer * dt)); run.vx = inp.x;
  const ratio = st.drill / hardness(run.depth), v = st.speed * od * (ratio >= 1 ? Math.min(3, 1 + 0.5 * Math.log10(ratio)) : Math.max(0.04, ratio));
  run.v = v;
  if (run.boss) { const vy = inp.y || Math.max(-0.5, Math.min(0.5, (run.boss.y - 5.2 - run.depth) * 0.4)); run.depth = Math.max(run.boss.y - 9, Math.min(run.boss.y - 3.2, run.depth + vy * st.steer * 0.8 * dt)); }
  else run.depth = Math.min(run.depth + v * dt * (inp.y > 0 ? 1.6 : inp.y < 0 ? 0.15 : 1), nextBoss - 6);
  const dmg = st.dps * od * (1 + st.crit * 2) * dt; run.targets = [];
  // guardian
  if (run.boss) {
    const b = run.boss, dist = Math.hypot(run.x, run.depth - b.y) - 2.2;
    if (dist < st.range + 1.5) { b.hp -= dmg * st.beams * st.bossMult; run.targets.push(b); }
    bossAttack(run, dt);
  }
  // shards
  for (const p of run.shots) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; if (p.life > 0 && Math.hypot(p.x - run.x, p.y - run.depth) < 0.55) { p.life = 0; loseTime(run, 1.5, 'shard'); } }
  run.shots = run.shots.filter(p => p.life > 0);
  // rocks in range
  const R = st.range, cand = [];
  for (const rk of run.rocks) { if (rk.hp <= 0) continue; const d = Math.hypot(rk.x - run.x, rk.y - run.depth); if (d < R + rk.size * 0.4) cand.push([st.scanner ? d - rk.tier * 3 - rk.size : d, rk]); }
  cand.sort((a, b) => a[0] - b[0]);
  const freeBeams = run.targets.length ? 0 : st.beams;
  for (let i = 0; i < Math.min(freeBeams, cand.length); i++) { dmgRock(run, cand[i][1], dmg); run.targets.push(cand[i][1]); }
  // drill contact
  for (const rk of run.rocks) if (rk.hp > 0 && Math.abs(rk.x - run.x) < 0.9 + rk.size * 0.4 && Math.abs(rk.y - run.depth) < 0.8 + rk.size * 0.3) dmgRock(run, rk, (st.dps * 0.5 * st.drill / Math.max(1, hardness(rk.y)) + st.dps * 0.25) * st.saw * dt);
  // magnet pulls capsules
  if (st.magnet) for (const rk of run.rocks) if (rk.kind === 'capsule' && rk.hp > 0 && Math.hypot(rk.x - run.x, rk.y - run.depth) < R + 2) { rk.x += (run.x - rk.x) * dt * 2; rk.y += (run.depth - rk.y) * dt * 2; }
  // chain lightning
  if (st.chain) { run.chainT -= dt; if (run.chainT <= 0 && (cand.length || run.boss)) { run.chainT = st.chain.cd; const d = st.dps * st.chain.dmg * od;
    if (run.boss && !cand.length) { run.boss.hp -= d * st.chain.jumps * 0.6 * st.bossMult; run.ev.push({ type: 'chain', path: [{ x: run.x, y: run.depth }, { x: 0, y: run.boss.y }] }); }
    else { const path = [{ x: run.x, y: run.depth }]; let cur = { x: run.x, y: run.depth }; const hit = new Set();
      for (let j = 0; j < st.chain.jumps; j++) { let nb = null, nd = j ? 3.2 : R + 1; for (const rk of run.rocks) { if (rk.hp <= 0 || hit.has(rk)) continue; const dd = Math.hypot(rk.x - cur.x, rk.y - cur.y); if (dd < nd) { nd = dd; nb = rk; } }
        if (!nb) break; hit.add(nb); dmgRock(run, nb, d); path.push({ x: nb.x, y: nb.y, z: nb.z }); cur = nb; }
      run.ev.push({ type: 'chain', path }); } } }
  // missiles
  if (st.missile) { run.missT -= dt; if (run.missT <= 0 && (cand.length || run.boss)) { run.missT = st.missile.cd; const d = st.dps * st.missile.dmg * od;
    const tg = run.boss && !cand.length ? null : cand.map(c => c[1]).sort((a, b) => b.max - a.max);
    for (let k = 0; k < st.missile.n; k++) {
      if (!tg) { run.boss.hp -= d * st.bossMult; run.ev.push({ type: 'missile', to: { x: (k - 0.5) * 1.5, y: run.boss.y - 1.5 } }); continue; }
      const t0 = tg[k % tg.length]; for (const o of run.rocks) if (o.hp > 0 && Math.hypot(o.x - t0.x, o.y - t0.y) < 1.5) dmgRock(run, o, d);
      run.ev.push({ type: 'missile', to: { x: t0.x, y: t0.y, z: t0.z } }); } } }
  // guardian down?
  if (run.boss && run.boss.hp <= 0) {
    const b = run.boss, t = Math.min(b.zone + 1, ORES.length - 1); const bonus = (25 + 10 * b.zone) * st.oreMult[t];
    run.ore[t] += bonus; run.bossesKilled++; run.tmax = Math.min(st.time * 1.6, run.tmax + st.bossTime + 3);
    s.zoneMax = Math.max(s.zoneMax, b.zone + 1); s.bossEver = Math.max(s.bossEver, b.zone + 1); run.ev.push({ type: 'bossdown', boss: b, tier: t, amt: bonus });
    run.boss = null; run.shots = []; run.depth = b.y + 0.5; run.spawnedTo = Math.max(run.spawnedTo, run.depth + 1);
  }
  for (const rk of run.rocks) if (rk.hp <= 0 && !rk.done) { rk.done = true; breakRock(run, rk, s); }
  run.rocks = run.rocks.filter(rk => !rk.done && rk.y > run.depth - 6);
}
export function endRun(run, s) {
  if (run.ended) return run.summary;
  run.ended = true; const prevBest = s.bestDepth;
  for (let i = 0; i < ORES.length; i++) { s.ore[i] += run.ore[i]; s.oreEver[i] += run.ore[i]; }
  s.noRec = run.depth > prevBest ? 0 : (s.noRec || 0) + 1;
  s.bestDepth = Math.max(s.bestDepth, run.depth); s.bestEver = Math.max(s.bestEver || 0, run.depth); s.runs++; s.played += run.t; s.pods += run.pods;
  for (const a of run.arts) s.artifacts[a] = true;
  run.summary = { depth: run.depth, startDepth: run.startDepth, prevBest, record: run.depth > prevBest, ore: run.ore.slice(), broken: run.broken, bosses: run.bossesKilled, time: run.t,
    zone: Math.floor(run.depth / ZONE_LEN), bestCombo: run.bestCombo, pods: run.pods, arts: run.arts.slice(), hits: run.hits, kinds: run.kinds };
  s.lastRun = { ore: run.ore.slice(), time: run.t };
  return run.summary;
}

// ---------- Offline ----------
export function offlineGain(s, now = Date.now()) {
  const sec = Math.min(8 * 3600, Math.max(0, (now - s.lastSave) / 1000));
  if (sec < 60 || !s.lastRun) return null;
  const k = sec / Math.max(20, s.lastRun.time) * stats(s).offline;
  return { seconds: sec, ore: s.lastRun.ore.map(x => x * k) };
}
export function applyOffline(s, now = Date.now()) { const o = offlineGain(s, now); if (o) o.ore.forEach((x, i) => { s.ore[i] += x; s.oreEver[i] += x; }); s.lastSave = now; return o; }

// ---------- Format ----------
const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
export function fmt(x) {
  if (!isFinite(x)) return '∞'; if (x < 1000) return x < 10 && x % 1 ? x.toFixed(1) : Math.floor(x).toString();
  const e = Math.floor(Math.log10(x) / 3); return e < SUF.length ? (x / Math.pow(1000, e)).toFixed(2) + SUF[e] : x.toExponential(2).replace('+', '');
}
export const fmtTime = sec => { sec = Math.floor(sec); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60); return h ? `${h}h ${m}m` : m ? `${m}m ${sec % 60}s` : `${sec}s`; };
export function load(json, now = Date.now()) {
  const b = newState(now);
  try { const o = JSON.parse(json); if (!o || o.v !== VERSION) return b; return Object.assign(b, o, { ore: ORES.map((_, i) => o.ore?.[i] || 0), oreEver: ORES.map((_, i) => o.oreEver?.[i] || 0) }); } catch { return b; }
}
