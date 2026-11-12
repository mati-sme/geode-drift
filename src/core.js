// Geode Drift v4 — run-based mining. Pure logic shared by the game and the headless sim.
export const VERSION = 4;
export const ORES = [
  { name: 'Dust', color: 0xc9bfe8 }, { name: 'Copper', color: 0xff9a5c }, { name: 'Cobalt', color: 0x5ca8ff },
  { name: 'Gold', color: 0xffd25c }, { name: 'Crystal', color: 0xff7ae0 }, { name: 'Starsteel', color: 0x9ffff0 }, { name: 'Voidglass', color: 0xb07aff },
  { name: 'Frost Opal', color: 0xaef4ff }, { name: 'Ember Ruby', color: 0xff5a3a }, { name: 'Prism Shard', color: 0xff9ef0 }, { name: 'Void Pearl', color: 0xe8dcff },
];
export const ZONE_LEN = 150;
export const WORLDS = [
  { name: 'Geode Drift', kind: null, z0: 0, ground: 0x2c2446, about: 'the asteroid field where Starling crashed' },
  { name: 'Frostveil', kind: 'frost', z0: 7, ground: 0x6f9cc8, about: 'a sparkly ice moon' },
  { name: 'Emberforge', kind: 'magma', z0: 11, ground: 0x5a2418, about: 'a bubbly lava planet' },
  { name: 'Prisma Nebula', kind: 'prism', z0: 15, ground: 0x6a3a7a, about: 'a rainbow crystal nebula' },
  { name: 'Void Core', kind: 'well', z0: 19, ground: 0x181428, about: 'the quiet heart of the galaxy' },
];
export const ZONES = ['Dust Belt', 'Copper Reef', 'Cobalt Caverns', 'Golden Hollow', 'Crystal Heart', 'Starsteel Core', 'Void Rift',
  'Snowglobe Shelf', 'Icicle Maze', 'Aurora Caves', 'Frozen Heart', 'Cinder Fields', 'Lava Falls', 'Obsidian Halls', 'Forge Core',
  'Rainbow Reef', 'Mirror Spires', 'Glimmer Deep', 'Prism Throne', 'Hush Belt', 'Starless Sea', 'Echo Chasm', 'The Core'];
export const ZONE_HUE = [0x8a7fb8, 0xff8a4a, 0x4a8cff, 0xffc94a, 0xff6ad5, 0x6afff0, 0x9a5cff,
  0x9fe7ff, 0x7fc8ff, 0x6affc8, 0xbfe8ff, 0xff7a3a, 0xff4a2a, 0xc04a8a, 0xffa030, 0xff9ef0, 0xc8a0ff, 0x7affe0, 0xffe07a, 0x8a7aff, 0x5a6aff, 0xb08aff, 0xffffff];
export const LAST_ZONE = ZONES.length - 1;
export const zoneName = z => ZONES[z] || `Deep Rift ${z - LAST_ZONE}`;
export const zoneHue = z => ZONE_HUE[z] ?? ZONE_HUE[7 + (z % 16)];
export const worldOf = z => z >= 19 ? 4 : z >= 15 ? 3 : z >= 11 ? 2 : z >= 7 ? 1 : 0;
export const tierOfZone = z => z < 7 ? z : 6 + worldOf(z);
const firstZoneOfTier = t => t < 7 ? t : WORLDS[t - 6].z0;

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
  ...[['Cryo Lens', 'Frost Auger', 'Opal Sieve', 'Glacier Battery', 'Ice Skates'], ['Magma Laser', 'Lava Drill', 'Ruby Furnace', 'Ember Battery', 'Fire Jets'],
    ['Prism Beam', 'Rainbow Drill', 'Shard Loom', 'Crystal Battery', 'Light Sails'], ['Void Lance', 'Null Drill', 'Pearl Diver', 'Echo Battery', 'Warp Fins']].flatMap((nm, i) => {
    const w = i + 1, t = 6 + w, id = k => `w${w}${k}`, y = 3 + w, wn = WORLDS[w].name;
    return [N(id('a'), nm[0], 2, y, [w === 1 ? 'r10' : `w${w - 1}a`], 999, [t, 25, 2.4], `${wn} tech: laser damage x1.25`),
      N(id('b'), nm[1], 3, y, [id('a')], 999, [t, 25, 2.4], `${wn} tech: drill power x1.25`),
      N(id('c'), nm[2], 4, y, [id('b')], 999, [t, 30, 2.6], `${wn} tech: all ore x1.15`),
      N(id('d'), nm[3], 5, y, [id('c')], 5, [t, 40, 2.2], `${wn} tech: +4s run time`),
      N(id('e'), nm[4], 6, y, [id('d')], 10, [t, 30, 2], `${wn} tech: +12% descent and steering speed`)].map(n => (n.world = w, n));
  }),
];
export const NODE = Object.fromEntries(TREE.map(n => [n.id, n]));
export const lvl = (s, id) => s.tree[id] || 0;
export function nodeCost(s, n) { const L = lvl(s, n.id); return Math.ceil(n.cost[1] * Math.pow(n.cost[2], L)); }
export function nodeVisible(s, n) { return n.id === 'rig' || (n.req.some(r => lvl(s, r) > 0) && (!n.mod || s.mods.includes(n.mod)) && (!n.world || s.world >= n.world)); }
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
export const slots = s => 1 + lvl(s, 'mods') + lvl(s, 'slot3') + lvl(s, 'slot4') + chartLvl(s, 'cSlot');
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
  { title: 'Into the Void', goals: [['novas', 3], ['boss', 6]], reward: { ore: [6, 200], world: 1 }, part: 9,
    talk: [['bolt', 'THE STARHEART! It is warm like a hug!'], ['nova', 'Starling is whole again. Lumen will shine. Thank you, Captain Pip.'], ['pip', 'Captain? Me?!'], ['bolt', 'Beep! Incoming message... a tiny penguin on the ice moon Frostveil needs help! The Starheart\'s light showed us the way.'], ['nova', 'Starling can fly again. Buckle up, crew. Our adventure is only beginning!']] },
  // ===== ACT 2: Frostveil (ice moon) =====
  { act: 2, title: 'Ice Moon Landing', goals: [['depth', 1100], ['ore', 7, 60]], reward: { unlock: 'lab', ore: [7, 40] }, upg: 'Snow Skis',
    talk: [['pingo', 'Oh! Real visitors! I am Pingo, the ice engineer. Our snow-lights went dark when the cold Guardians woke up.'], ['bolt', 'I set up a Research Lab in the cargo bay. It keeps working even while you sleep!']] },
  { act: 2, title: 'Snowglobe Shelf', goals: [['boss', 7], ['lab', 3]], reward: { crew: 'pingo', ore: [7, 120] }, upg: 'Heated Hull',
    talk: [['pingo', 'You beat the Snowglobe Guardian! Can I join your crew? I am VERY good with drills.'], ['nova', 'Welcome aboard, Pingo. Every crew member makes us stronger. Train them up in the Crew room.']] },
  { act: 2, title: 'Aurora Caves', goals: [['kind', 'frost', 250], ['depth', 1300]], reward: { unlock: 'daily', ore: [7, 300] }, upg: 'Aurora Lights',
    talk: [['pingo', 'Frost rocks are slippery, they slow the rig. But they are full of Frost Opal!'], ['bolt', 'Space Station Lumen will now send us Daily Contracts. Come back every day for supply drops!']] },
  { act: 2, title: 'Icicle Maze', goals: [['boss', 8], ['crew', 12], ['lab', 8]], reward: { ore: [7, 600] }, upg: 'Ice Plow',
    talk: [['pip', 'The maze is open! Pingo, your drill tips are amazing.'], ['pingo', 'Squeak! Thank you, Captain Pip!']] },
  { act: 2, title: 'Frozen Heart', goals: [['boss', 10], ['lab', 12]], reward: { ore: [7, 1500], world: 2 }, upg: 'Snow-Light Beacon',
    talk: [['pingo', 'The Frozen Heart glows again! All of Frostveil can see the snow-lights.'], ['bolt', 'New signal! It is warm... VERY warm. Lava planet Emberforge is calling.'], ['nova', 'Set course for Emberforge!']] },
  // ===== ACT 2: Emberforge (lava planet) =====
  { act: 2, title: 'Cinder Fields', goals: [['depth', 1700], ['ore', 8, 100]], reward: { unlock: 'const', ore: [8, 60] }, upg: 'Heat Shield',
    talk: [['flare', 'Hello, sparkly travellers! I am Flare. I cook the best lava cookies on Emberforge, but the forge Guardians took our ovens!'], ['nova', 'Pip, look up. The stars here form patterns, Constellations. If we fold all our stardust into one, we can map a Star Chart. It is a bigger reset, but it makes us far stronger.']] },
  { act: 2, title: 'Lava Falls', goals: [['const', 1], ['boss', 11]], reward: { crew: 'flare', ore: [8, 200] }, upg: 'Lava Surfboard',
    talk: [['flare', 'You mapped a Constellation! Wow. Can I come with you? I can make your lasers extra toasty.'], ['pip', 'Welcome to the crew, Flare!']] },
  { act: 2, title: 'Obsidian Halls', goals: [['boss', 12], ['kind', 'magma', 60]], reward: { ore: [8, 600] }, upg: 'Obsidian Armor',
    talk: [['flare', 'Careful, magma rocks are hot! Touching them costs battery time. A Bubble Shield helps.'], ['bolt', 'Our crew is the best crew.']] },
  { act: 2, title: 'Molten Mystery', goals: [['boss', 13], ['lab', 25], ['crew', 20]], reward: { ore: [8, 1500] }, upg: 'Forge Cannon',
    talk: [['nova', 'Our research is paying off. These ancient forge-maps point to a Prism Nebula far away.'], ['flare', 'The ovens are almost free!']] },
  { act: 2, title: 'Forge Core', goals: [['boss', 14], ['const', 2]], reward: { ore: [8, 4000], world: 3 }, upg: 'Starforge Engine',
    talk: [['flare', 'The ovens are warm again! Lava cookies for everyone!'], ['bolt', 'Beep! Rainbow signal detected. The Prisma Nebula needs us.'], ['nova', 'Onward, crew!']] },
  // ===== ACT 3: Prisma Nebula =====
  { act: 3, title: 'Rainbow Reef', goals: [['depth', 2300], ['ore', 9, 100]], reward: { ore: [9, 60] }, upg: 'Rainbow Sails',
    talk: [['lumi', 'Hi hi! I am Lumi, a crystal fox. The Nebula\'s colors are fading into grey. Will you help?'], ['pip', 'Of course! That is what our crew does.']] },
  { act: 3, title: 'Mirror Spires', goals: [['boss', 15], ['ach', 20]], reward: { crew: 'lumi', ore: [9, 200] }, upg: 'Mirror Hull',
    talk: [['lumi', 'Prism rocks split into little pieces when they break. More pieces, more treasure!'], ['nova', 'Welcome aboard, Lumi. Your luck is legendary.']] },
  { act: 3, title: 'Glimmer Deep', goals: [['boss', 16], ['kind', 'prism', 300], ['const', 3]], reward: { ore: [9, 700] }, upg: 'Glimmer Lens',
    talk: [['lumi', 'The colors are coming back! Blue, pink, gold...'], ['bolt', 'My visor has never been this sparkly.']] },
  { act: 3, title: 'Crystal Song', goals: [['boss', 17], ['lab', 50], ['crew', 45]], reward: { ore: [9, 2000] }, upg: 'Song Crystal',
    talk: [['lumi', 'Do you hear it? The crystals are singing again!'], ['nova', 'There is one more voice in the song... a sad one, from the Void Core.']] },
  { act: 3, title: 'Prism Throne', goals: [['boss', 18], ['const', 3], ['crew', 42]], reward: { ore: [9, 6000], world: 4 }, upg: 'Prism Drive',
    talk: [['lumi', 'The Nebula shines in every color!'], ['bolt', 'The sad voice is coming from the very center of the galaxy. The Void Core.'], ['pip', 'Then that is where we go. Together.']] },
  // ===== ACT 3: Void Core =====
  { act: 3, title: 'Hush Belt', goals: [['depth', 2900], ['ore', 10, 100]], reward: { ore: [10, 60] }, upg: 'Quiet Engines',
    talk: [['echo', '...hello? I am Echo, a space whale. I sing the stars awake. But I lost my voice in the Void Core.'], ['nova', 'Then we will find it for you, Echo.']] },
  { act: 3, title: 'Starless Sea', goals: [['boss', 19], ['lab', 65]], reward: { crew: 'echo', ore: [10, 200] }, upg: 'Whale Song Radio',
    talk: [['echo', 'Your ship hums a nice tune. May I swim beside you?'], ['pip', 'Welcome to the crew, Echo!']] },
  { act: 3, title: 'Echo Chasm', goals: [['boss', 20], ['kind', 'well', 150], ['const', 4]], reward: { ore: [10, 800] }, upg: 'Gravity Anchor',
    talk: [['echo', 'Gravity wells pull you in. Steer away with your keys, or break them for big Void Pearls.'], ['bolt', 'I can hear a little song in the deep!']] },
  { act: 3, title: 'The Lost Light', goals: [['boss', 21], ['crew', 62], ['ach', 35]], reward: { ore: [10, 2500] }, upg: 'Starlight Wings',
    talk: [['nova', 'Pip, I am so proud of you. You started with a wobbly hull patch, and now look at this crew.'], ['pip', 'We did it together, Captain.']] },
  { act: 3, title: 'The Core', goals: [['boss', 22], ['const', 5]], reward: { ore: [10, 10000] }, upg: 'Galaxy Heart',
    talk: [['echo', 'My voice! I can sing again! ♪ ♪ ♪'], ['lumi', 'Look! Every star in the galaxy is twinkling!'], ['nova', 'Lumen, Frostveil, Emberforge, the Nebula... all shining. Thank you, Captain Pip.'], ['bolt', 'Beep boop! THE END. But the Deep Rifts still go down forever... want to keep exploring?']] },
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
  if (k === 'const') return [Math.min(s.consts, a), a, `Map ${a} Constellation${a > 1 ? 's' : ''}`];
  if (k === 'lab') return [Math.min(labLevels(s), a), a, `Finish ${a} research levels`];
  if (k === 'crew') return [Math.min(crewLevels(s), a), a, `Train the crew to ${a} total levels`];
  if (k === 'ach') return [Math.min(achCount(s), a), a, `Earn ${a} achievements`];
  if (k === 'kind') return [Math.min(s.kindsEver[a] || 0, b), b, `Break ${b} ${KINDS[a].name}s`];
  return [0, 1, '?'];
}
export const chapter = s => CHAPTERS[s.chapter] || null;
export function chapterDone(s) { const c = chapter(s); return c ? c.goals.every(g => { const [p, m] = goalProgress(s, g); return p >= m; }) : goalProgress(s, endlessGoal(s))[0] >= endlessGoal(s)[1]; }
export function claimChapter(s) {
  if (!chapterDone(s)) return null; const c = chapter(s);
  if (!c) { const t = Math.min(ORES.length - 1, tierOfZone(Math.max(0, s.bossEver))); const amt = 200 * (1 + s.endless); s.ore[t] += amt; s.oreEver[t] += amt; s.endless++; s.chapter++; return { endless: true, ore: [t, amt] }; }
  if (c.reward.ore) { s.ore[c.reward.ore[0]] += c.reward.ore[1]; s.oreEver[c.reward.ore[0]] += c.reward.ore[1]; }
  if (c.reward.world) s.world = Math.max(s.world, c.reward.world);
  if (c.reward.unlock) s.unlocks[c.reward.unlock] = true;
  if (c.reward.crew) s.crew[c.reward.crew] = Math.max(1, s.crew[c.reward.crew] || 0);
  if (c.upg) s.upgrades++;
  if (c.reward.mod && !s.mods.includes(c.reward.mod)) { s.mods.push(c.reward.mod); if (s.loadout.length < slots(s) || !s.loadout.length) s.loadout.push(c.reward.mod); }
  if (c.part != null) s.parts = Math.max(s.parts, c.part + 1); s.chapter++;
  return c;
}

// ---------- Prestige: Supernova -> Stardust ----------
export const NOVA_ZONE = 3;
export const dustFor = s => Math.floor(Math.pow(Math.max(0, s.bestDepth) / 100, 1.8) * meta(s).dust);
export const starMult = s => (1 + 0.25 * s.dust) * Math.pow(1 + s.dust / 40, 1.2);
export const canNova = s => s.zoneMax >= NOVA_ZONE && dustFor(s) >= 1;
export function nova(s) {
  if (!canNova(s)) return 0; const d = dustFor(s);
  s.dust += d; s.dustCycle += d; s.novas++; const keep = 0.1 * chartLvl(s, 'cKeep'), old = s.tree; s.tree = { rig: 1 }; if (keep) for (const k in old) { const v = Math.floor(old[k] * keep); if (v > 0) s.tree[k] = v; } s.ore = ORES.map(() => 0); s.bestDepth = 0; s.zoneMax = 0; s.lastRun = null; s.noRec = 0;
  s.loadout = s.loadout.slice(0, 1);
  return d;
}

export function newState(now = Date.now()) {
  return { v: VERSION, ore: ORES.map(() => 0), oreEver: ORES.map(() => 0), tree: { rig: 1 }, bestDepth: 0, bestEver: 0, zoneMax: 0, bossEver: 0, runs: 0, dust: 0, novas: 0,
    played: 0, lastSave: now, lastRun: null, autoRelaunch: false, autopilot: true, muted: false, seenIntro: false,
    chapter: 0, parts: 0, endless: 0, pods: 0, artifacts: {}, mods: [], loadout: [],
    world: 0, upgrades: 0, unlocks: {}, crew: {}, drones: 0, lab: {}, labQ: [], consts: 0, charts: 0, chartsEver: 0, chartTree: {}, dustCycle: 0,
    kindsEver: {}, bestCombo: 0, achs: {}, daily: null, bossKills: 0 };
}

// ---------- Stats ----------
export function stats(s) {
  const L = id => lvl(s, id), M = meta(s), sm = starMult(s), pw = (id, b) => Math.pow(b, L(id));
  const W4 = (k, b) => [1, 2, 3, 4].reduce((a, w) => a * Math.pow(b, L(`w${w}${k}`)), 1);
  const eq = m => equipped(s, m);
  const T = (
    25 + 3 * L('t1') + 4 * L('t3') + 5 * L('t5') + 5 * L('t6') + 2 * Math.min(10, s.novas) + (art(s, 'hourglass') ? 3 : 0) + 4 * [1, 2, 3, 4].reduce((a, w) => a + L(`w${w}d`), 0) + M.time);
  return {
    time: T < 120 ? T : 120 + (T - 120) * 0.4,
    chrono: 0.12 * L('t2'), bossTime: 8 * L('t4'),
    dps: 5 * (1 + 0.35 * L('d1')) * pw('d4', 1.4) * pw('d6', 1.4) * pw('d8', 1.5) * pw('d10', 1.6) * pw('d11', 1.7) * pw('d12', 1.8) * sm * (art(s, 'lens') ? 1.25 : 1) * W4('a', 1.25) * M.dps,
    beams: 1 + L('d2') + L('d5') + L('d9'),
    crit: 0.08 * L('d3') + (art(s, 'eye') ? 0.1 : 0), bossMult: pw('d7', 1.6),
    drill: pw('r1', 1.3) * pw('r3', 1.35) * pw('r5', 1.4) * pw('r7', 1.45) * pw('r8', 1.5) * pw('r9', 1.6) * pw('r11', 1.7) * sm * (art(s, 'tooth') ? 1.3 : 1) * (eq('saw') ? 1.4 : 1) * W4('b', 1.25) * M.drill,
    speed: 1.1 * (1 + 0.15 * L('r2') + 0.15 * L('r6')) * (1 + 0.05 * Math.min(40, s.novas)) * (1 + 0.12 * [1, 2, 3, 4].reduce((a, w) => a + L(`w${w}e`), 0)),
    steer: 5 * (1 + 0.08 * L('r2') + 0.08 * L('r6')) * (1 + 0.04 * [1, 2, 3, 4].reduce((a, w) => a + L(`w${w}e`), 0)),
    launch: 15 * L('r4') + 40 * L('r10') + 60 * s.novas + M.launch,
    range: 3.2 + 0.5 * L('a1') + 0.5 * L('a4') + 0.6 * L('a7') + (art(s, 'horn') ? 0.6 : 0),
    density: 1.1 * (1 + 0.2 * L('a2') + 0.2 * L('a5')),
    blast: 0.3 * Math.min(1, L('a3')) + 0.1 * Math.max(0, L('a3') - 1), blastR: 1.6 + 0.5 * L('a6'),
    oreMult: ORES.map((_, t) => (1 + 0.3 * L(['e1', 'e2', 'e3', 'e4', 'e5', 'e10'][t] || 'none')) * W4('c', 1.15) * M.ore * pw('e7', 1.2) * pw('e8', 1.25) * pw('e9', 1.3) * sm
      * (art(s, 'clover') ? 1.25 : 1) * (eq('magnet') ? 1.2 + 0.1 * L('mg') : 1)),
    lucky: 0.06 * L('e6') + (art(s, 'bell') ? 0.08 : 0), scanner: L('u3') > 0, overdrive: L('u4') ? 4 + L('u4') : 0,
    offline: 0.1 + 0.15 * L('u2') + (art(s, 'lantern') ? 0.2 : 0) + M.offline, podMult: M.pods, geoMult: 1 + 0.5 * chartLvl(s, 'cLuck'),
    comboCap: art(s, 'feather') ? 0.8 : 0.5, capsule: 2.5 + (art(s, 'shell') ? 1.5 : 0), magnet: eq('magnet'),
    chain: eq('chain') ? { dmg: 1.2 * pw('mc', 1.5), jumps: 3 + Math.floor(L('mc') / 4) + (art(s, 'spark') ? 2 : 0), cd: 1.3 } : null,
    missile: eq('missile') ? { dmg: 2 * pw('mm', 1.5), n: 2 + Math.floor(L('mm') / 5) + (art(s, 'rocket') ? 1 : 0), cd: 1.6 } : null,
    saw: eq('saw') ? 4 * pw('ms', 1.5) : 1,
    shield: eq('shield') ? 8 - L('mh') : 0, world: s.world,
    autopilot: L('ap') > 0,
  };
}

// ---------- RNG ----------
export function rng(seed) { let a = seed >>> 0 || 1; return () => { a ^= a << 13; a >>>= 0; a ^= a >> 17; a ^= a << 5; a >>>= 0; return a / 4294967296; }; }

// ---------- Rocks ----------
const ENV = globalThis.process?.env || {};
export const HP_GROW = +(ENV.HPG || 1.03), Q = +(ENV.Q || 3e-5);
export const K2 = +(ENV.K2 || 0.015);
const curve = y => Math.pow(HP_GROW, y) * Math.exp(Q * y * Math.min(y, 1000) + K2 * Math.max(0, y - 1050));
export const rockHP = (y, size) => 3 * size * curve(y);
export const hardness = y => Math.pow(+(ENV.HRD || 1.026), y) * Math.exp(Q * 0.8 * y * Math.min(y, 1000) + K2 * 0.8 * Math.max(0, y - 1050));
export const bossHP = B => 40 * curve(B);
export const W = 6.5;
export const KINDS = {
  rock: { name: 'Rock' }, iron: { name: 'Iron Rock', hp: 3, ore: 1.8 }, bomb: { name: 'Bomb Rock', hp: 0.8, ore: 0.5 },
  capsule: { name: 'Time Capsule', hp: 1, ore: 0 }, pod: { name: 'Lost Drone', hp: 1.5, ore: 0 }, geode: { name: 'Artifact Geode', hp: 5, ore: 4 }, cluster: { name: 'Crystal Cluster', hp: 1.5, ore: 3 },
  frost: { name: 'Frost Rock', hp: 2, ore: 2 }, magma: { name: 'Magma Rock', hp: 1.5, ore: 2.5 }, prism: { name: 'Prism Rock', hp: 1.5, ore: 1.5 }, well: { name: 'Gravity Well', hp: 4, ore: 5 },
};
function pickKind(r, y, pm = 1, gm = 1) {
  const x = r(), wk = WORLDS[worldOf(Math.floor(y / ZONE_LEN))].kind;
  if (wk && r() < (wk === 'well' ? 0.05 : 0.12)) return wk;
  if (y > 90 && x < 0.0017 * gm) return 'geode';
  if (y > 20 && x < 0.0017 + 0.0038 * pm) return 'pod';
  if (x < 0.035) return 'capsule';
  if (x < 0.05) return 'cluster';
  if (y > 55 && x < 0.15) return 'bomb';
  if (y > 25 && x < 0.27) return 'iron';
  return 'rock';
}
function oreTier(run, y) { const z = Math.floor(y / ZONE_LEN), f = y / ZONE_LEN - z, t = tierOfZone(z), tn = tierOfZone(z + 1), tp = z ? tierOfZone(z - 1) : 0;
  if (tn > t && f > 0.4 && run.r() < 0.12 + (f - 0.4) / 0.6 * 0.5) return tn; return run.r() < 0.65 || tp === t ? t : tp; }
function spawnRock(run, y) {
  const kind = pickKind(run.r, y, run.st.podMult, run.st.geoMult), K = KINDS[kind];
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
  const st = run.st, yz = Math.max(0, Math.min(600, rk.y - ZONE_LEN * firstZoneOfTier(rk.tier)));
  run.combo = run.comboT > 0 ? run.combo + 1 : 1; run.comboT = 1.8; run.bestCombo = Math.max(run.bestCombo, run.combo);
  const cm = 1 + Math.min(st.comboCap, run.combo * 0.01), K = KINDS[rk.kind];
  let amt = rk.size * (1 + yz / 40) * st.oreMult[rk.tier] * cm * (K.ore ?? 1);
  if (amt > 0 && run.r() < st.lucky) { amt *= 2; run.ev.push({ type: 'lucky', rock: rk }); }
  run.ore[rk.tier] += amt; run.broken++; rk.hp = 0; run.kinds[rk.kind] = (run.kinds[rk.kind] || 0) + 1;
  if (st.chrono) { const add = Math.min(st.chrono, Math.max(0, st.time * 0.4 - run.bonusTime)); run.tmax += add; run.bonusTime += add; }
  if (rk.kind === 'capsule') { run.tmax = Math.min(Math.max(run.tmax, st.time * 1.8), run.tmax + st.capsule); run.ev.push({ type: 'capsule', rock: rk, sec: st.capsule }); }
  if (rk.kind === 'frost' && Math.hypot(run.x - rk.x, run.depth - rk.y) < 2.6) { run.slowT = 1.5; run.ev.push({ type: 'frost' }); }
  if (rk.kind === 'prism' && !rk.split) for (let k = 0; k < 3; k++) { const h = rk.max * 0.15; run.rocks.push({ id: run.nid++, kind: 'cluster', split: 1, x: rk.x + (run.r() - 0.5) * 2, y: rk.y + (run.r() - 0.5) * 1.5, z: rk.z, size: 0.5, hp: h, max: h, tier: rk.tier, hit: 0 }); }
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
  for (const rk of run.rocks) { if (rk.hp <= 0 || rk.y < run.depth - 1) continue; if ((rk.kind === 'bomb' || rk.kind === 'magma') && rk.y - run.depth < 2.5) continue;
    const val = (rk.kind === 'pod' || rk.kind === 'geode' || rk.kind === 'capsule' ? 4 : 0) + (run.st.scanner ? rk.tier * 2 : 0);
    const sc = Math.abs(rk.x - run.x) * 0.6 + (rk.y - run.depth) - val; if (sc < best) { best = sc; tx = rk.x; } }
  for (const rk of run.rocks) if ((rk.kind === 'bomb' || rk.kind === 'magma') && rk.hp > 0 && Math.abs(rk.y - run.depth - 1) < 2 && Math.abs(rk.x - run.x) < 1.6) tx = run.x + (run.x > rk.x ? 2 : -2);
  return { x: Math.max(-1, Math.min(1, (tx - run.x) * 1.5)), y: 0 };
}
function bossAttack(run, dt) {
  const b = run.boss, ph = b.hp / b.max > 0.66 ? 0 : b.hp / b.max > 0.33 ? 1 : 2; b.phase = ph; b.at -= dt;
  const shoot = (ang, sp) => run.shots.push({ x: 0, y: b.y - 0.2, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 4 });
  if (b.at <= 0) {
    const wd = worldOf(b.zone), sp = 3.2 + Math.min(b.zone, 8) * 0.15 + wd * 0.2;
    if (ph === 0) { const n = 8 + wd * 2; for (let i = 0; i < n; i++) shoot(Math.PI + (i + 0.5) / n * Math.PI, sp); b.at = 2.2; }
    else if (ph === 1) { const n = 12 + wd * 2, o = run.r() * 0.5; for (let i = 0; i < n; i++) shoot(Math.PI + (i + o) / n * Math.PI, sp * 1.1); const a = Math.atan2(run.depth - b.y, run.x); for (const k of [-0.18, 0, 0.18]) shoot(a + k, sp * 1.4); b.at = 1.7; }
    else { b.spin = (b.spin || 0) + 0.55; const arms = 3 + (wd >> 1); for (let k = 0; k < arms; k++) shoot(Math.PI + ((b.spin + k * Math.PI / arms) % Math.PI), sp * 1.2); b.at = 0.28; }
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
  run.slowT = (run.slowT || 0) - dt; const slow = run.slowT > 0 ? 0.45 : 1;
  let pull = 0; for (const rk of run.rocks) if (rk.kind === 'well' && rk.hp > 0) { const dx = rk.x - run.x, dd = Math.hypot(dx, rk.y - run.depth); if (dd < 4.5 && dd > 0.3) pull += dx / dd * 1.6; }
  run.x = Math.max(-W, Math.min(W, run.x + (inp.x * st.steer * slow + pull) * dt)); run.vx = inp.x;
  const ratio = st.drill / hardness(run.depth), v = st.speed * od * slow * (ratio >= 1 ? Math.min(3, 1 + 0.5 * Math.log10(ratio)) : Math.max(0.04, ratio));
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
  for (const rk of run.rocks) if (rk.kind === 'magma' && rk.hp > 0 && !rk.burnt && Math.abs(rk.x - run.x) < 0.7 + rk.size * 0.4 && Math.abs(rk.y - run.depth) < 0.6 + rk.size * 0.3) { rk.burnt = 1; loseTime(run, 1, 'magma'); }
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
    const b = run.boss, t = tierOfZone(b.zone + 1); const bonus = (25 + 10 * b.zone) * st.oreMult[t];
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
  for (let i = 0; i < ORES.length; i++) { const a = isFinite(run.ore[i]) ? Math.min(run.ore[i], 1e300) : 0; s.ore[i] = Math.min(1e305, s.ore[i] + a); s.oreEver[i] = Math.min(1e305, s.oreEver[i] + a); }
  s.noRec = run.depth > prevBest ? 0 : (s.noRec || 0) + 1;
  s.bestDepth = Math.max(s.bestDepth, run.depth); s.bestEver = Math.max(s.bestEver || 0, run.depth); s.runs++; s.played += run.t; s.pods += run.pods; s.drones += run.pods; s.bestCombo = Math.max(s.bestCombo, run.bestCombo); s.bossKills += run.bossesKilled;
  for (const k in run.kinds) s.kindsEver[k] = (s.kindsEver[k] || 0) + run.kinds[k];
  for (const a of run.arts) s.artifacts[a] = true;
  run.summary = { depth: run.depth, startDepth: run.startDepth, prevBest, record: run.depth > prevBest, ore: run.ore.slice(), broken: run.broken, bosses: run.bossesKilled, time: run.t,
    zone: Math.floor(run.depth / ZONE_LEN), bestCombo: run.bestCombo, pods: run.pods, arts: run.arts.slice(), hits: run.hits, kinds: run.kinds };
  s.lastRun = { ore: run.ore.slice(), time: run.t };
  dailyProgress(s, run.summary); checkAchs(s);
  return run.summary;
}

// ---------- Offline ----------
export function offlineGain(s, now = Date.now()) {
  const sec = Math.min((8 + meta(s).offCap) * 3600, Math.max(0, (now - s.lastSave) / 1000));
  if (sec < 60 || !s.lastRun) return null;
  const k = sec / Math.max(20, s.lastRun.time) * stats(s).offline;
  return { seconds: sec, ore: s.lastRun.ore.map(x => x * k), drones: Math.floor(sec / 600 * crewLvl(s, 'echo')) };
}
export function applyOffline(s, now = Date.now()) { const o = offlineGain(s, now); if (o) { o.ore.forEach((x, i) => { s.ore[i] += x; s.oreEver[i] += x; }); s.drones += o.drones; } s.lastSave = now; return o; }

// ---------- Format ----------
const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
export function fmt(x) {
  if (!isFinite(x)) return '∞'; if (x < 1000) return x < 10 && x % 1 ? x.toFixed(1) : Math.floor(x).toString();
  const e = Math.floor(Math.log10(x) / 3); return e < SUF.length ? (x / Math.pow(1000, e)).toFixed(2) + SUF[e] : x.toExponential(2).replace('+', '');
}
export const fmtTime = sec => { sec = Math.floor(sec); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60); return h ? `${h}h ${m}m` : m ? `${m}m ${sec % 60}s` : `${sec}s`; };
export function load(json, now = Date.now()) {
  const b = newState(now);
  try { const o = JSON.parse(json); if (!o || (o.v !== VERSION && o.v !== 3)) return b; const mig = o.v === 3;
    const r = Object.assign(b, o, { v: VERSION, ore: ORES.map((_, i) => o.ore?.[i] || 0), oreEver: ORES.map((_, i) => o.oreEver?.[i] || 0) });
    if (mig) { r.migrated = true; if (r.chapter >= 10) { r.chapter = 10; r.world = 1; r.endless = 0; } r.drones = r.pods || 0; r.bossKills = r.runs * 2; }
    return r; } catch { return b; }
}

// =====================================================================
// v4 long-term systems: Research Lab, Crew, Constellations (2nd prestige), Achievements, Daily contracts
// =====================================================================
export const LAB = [
  { id: 'rL', name: 'Laser Optics', icon: '🔆', desc: 'Laser damage x1.35', base: 3, max: 40 },
  { id: 'rD', name: 'Drill Science', icon: '🔩', desc: 'Drill power x1.35', base: 3, max: 40 },
  { id: 'rO', name: 'Refinery', icon: '⚗️', desc: 'All ore x1.3', base: 4, max: 40 },
  { id: 'rT', name: 'Battery Chemistry', icon: '🔋', desc: '+1s run time', base: 5, max: 20 },
  { id: 'rS', name: 'Stellar Physics', icon: '✨', desc: 'Stardust gain x1.15', base: 10, max: 30 },
  { id: 'rN', name: 'Drone Network', icon: '📡', desc: '+4% offline mining, +1h offline limit', base: 8, max: 12 },
  { id: 'rR', name: 'Drone Radar', icon: '🛰', desc: 'Lost drones appear 10% more often', base: 6, max: 20 },
  { id: 'rW', name: 'Warp Theory', icon: '🌀', desc: 'Runs can start 40m deeper', base: 6, max: 20 },
];
export const LABN = Object.fromEntries(LAB.map(x => [x.id, x]));
export const labLvl = (s, id) => s.lab[id] || 0;
export const labLevels = s => Object.values(s.lab).reduce((a, b) => a + b, 0);
export const labSlots = s => s.unlocks.lab ? 1 + (crewLevels(s) >= 10 ? 1 : 0) + (crewLevels(s) >= 60 ? 1 : 0) : 0;
export const labDur = (s, id) => LABN[id].base * 60 * Math.pow(1.45, labLvl(s, id)) / meta(s).labSpeed;
export function labStart(s, id, now = Date.now()) {
  const p = LABN[id]; if (!p || s.labQ.length >= labSlots(s) || s.labQ.some(q => q.id === id) || labLvl(s, id) >= p.max) return false;
  s.labQ.push({ id, start: now, end: now + labDur(s, id) * 1000 }); return true;
}
export function labTick(s, now = Date.now()) {
  const done = []; s.labQ = s.labQ.filter(q => { if (q.end <= now) { s.lab[q.id] = labLvl(s, q.id) + 1; done.push(q.id); return false; } return true; }); return done;
}
export const labBoost = (s, sec) => s.labQ.forEach(q => q.end -= sec * 1000);

export const CREW = {
  pingo: { name: 'Pingo', role: 'Ice engineer', desc: 'Drill power x1.15 per level', img: 'pingo.jpg' },
  flare: { name: 'Flare', role: 'Lava chef', desc: 'Laser damage x1.15 per level', img: 'flare.jpg' },
  lumi: { name: 'Lumi', role: 'Crystal fox', desc: 'All ore x1.15 per level', img: 'lumi.jpg' },
  echo: { name: 'Echo', role: 'Space whale', desc: '+0.5s run time and +4% research speed per level; finds drones while you are away', img: 'echo.jpg' },
};
export const crewLvl = (s, id) => s.crew[id] || 0;
export const crewLevels = s => Object.values(s.crew).reduce((a, b) => a + b, 0);
export const crewCost = (s, id) => Math.ceil(8 * Math.pow(1.28, crewLvl(s, id) - 1));
export function crewUp(s, id) { if (!s.crew[id] || s.crew[id] >= 99) return false; const c = crewCost(s, id); if (s.drones < c) return false; s.drones -= c; s.crew[id]++; return true; }

export const CHARTS = [
  { id: 'cPow', name: 'Nebula Engines', icon: '🌠', desc: 'Laser damage and drill power x2', max: 99, cost: [1, 1.6] },
  { id: 'cOre', name: 'Star Harvest', icon: '🌾', desc: 'All ore x2', max: 99, cost: [1, 1.6] },
  { id: 'cDust', name: 'Dust Lens', icon: '🔭', desc: 'Stardust gain x1.5', max: 30, cost: [2, 1.7] },
  { id: 'cWarp', name: 'Warp Gate', icon: '🌀', desc: 'Runs can start 150m deeper', max: 20, cost: [1, 1.5] },
  { id: 'cTime', name: 'Long Battery', icon: '🔋', desc: '+5s run time', max: 6, cost: [2, 2] },
  { id: 'cLab', name: 'Quick Research', icon: '🔬', desc: 'Research runs 30% faster', max: 10, cost: [2, 1.8] },
  { id: 'cKeep', name: 'Starseed', icon: '🌱', desc: 'After a Supernova, keep 10% of every upgrade level', max: 5, cost: [3, 2] },
  { id: 'cCrew', name: 'Crew Quarters', icon: '🛏', desc: 'Crew bonuses +50%', max: 10, cost: [2, 1.8] },
  { id: 'cLuck', name: 'Lucky Stars', icon: '🍀', desc: 'Lost drones and Artifact Geodes 50% more common', max: 5, cost: [2, 2] },
  { id: 'cSlot', name: 'Extra Rack', icon: '🧰', desc: '+1 module slot', max: 1, cost: [5, 1] },
];
export const CHARTN = Object.fromEntries(CHARTS.map(c => [c.id, c]));
export const chartLvl = (s, id) => (s.chartTree && s.chartTree[id]) || 0;
export const chartCost = (s, id) => Math.ceil(CHARTN[id].cost[0] * Math.pow(CHARTN[id].cost[1], chartLvl(s, id)));
export function chartBuy(s, id) { const c = CHARTN[id]; if (chartLvl(s, id) >= c.max || s.charts < chartCost(s, id)) return false; s.charts -= chartCost(s, id); s.chartTree[id] = chartLvl(s, id) + 1; return true; }
export const chartsFor = s => Math.floor(Math.sqrt((s.dustCycle + 0) / 60));
export const canConst = s => !!s.unlocks.const && chartsFor(s) >= 1;
export function constellation(s) {
  if (!canConst(s)) return 0; const g = chartsFor(s);
  s.charts += g; s.chartsEver += g; s.consts++; s.dust = Math.floor(s.dust * 0.1); s.dustCycle = 0; s.tree = { rig: 1 }; s.ore = ORES.map(() => 0); s.bestDepth = 0; s.zoneMax = 0; s.lastRun = null; s.noRec = 0;
  return g;
}

// achievements: [id, name, value fn, threshold]
const ACH_DEF = [['depth', 'Deep Diver', s => s.bestEver, [100, 300, 600, 1000, 1500, 2000, 2500, 3000, 3500, 4000], 'm deep'],
  ['runs', 'Frequent Flyer', s => s.runs, [10, 50, 100, 200, 350, 500, 800], ' runs'], ['nova', 'Star Maker', s => s.novas, [1, 3, 6, 10, 15, 25, 40], ' Supernovas'],
  ['const', 'Stargazer', s => s.consts, [1, 2, 4, 6, 9], ' Constellations'], ['drone', 'Drone Hero', s => s.pods, [50, 250, 1000, 3000, 8000, 20000], ' drones rescued'],
  ['boss', 'Guardian Breaker', s => s.bossEver, [3, 7, 11, 15, 19, 23], ' Guardian types'], ['lab', 'Scientist', s => labLevels(s), [5, 20, 40, 70, 100], ' research levels'],
  ['crew', 'Team Spirit', s => crewLevels(s), [5, 20, 50, 100, 160], ' crew levels'], ['combo', 'Combo King', s => s.bestCombo, [100, 300, 700, 1500, 3000], ' combo'],
  ['art', 'Collector', s => Object.keys(s.artifacts).length, [3, 6, 12], ' artifacts']];
export const ACHS = ACH_DEF.flatMap(([id, name, fn, th, unit]) => th.map((t, i) => ({ id: `${id}${i}`, name: `${name} ${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][i]}`, fn, t, label: `${fmtN(t)}${unit}` })));
function fmtN(x) { return x >= 1000 ? (x / 1000) + 'K' : '' + x; }
export const achCount = s => Object.keys(s.achs).length;
export function checkAchs(s) { const got = []; for (const a of ACHS) if (!s.achs[a.id] && a.fn(s) >= a.t) { s.achs[a.id] = 1; got.push(a); } return got; }

// daily contracts (rotate every local day) + daily supply drop
export const dayKey = now => Math.floor((now - new Date(now).getTimezoneOffset() * 60000) / 864e5);
const DAILY_T = [['runs', n => `Finish ${n} runs`, 6], ['pods', n => `Rescue ${n} drones`, 15], ['bosses', n => `Shatter ${n} Guardians`, 6], ['combo', n => `Reach a x${n} combo`, 200], ['kind', n => `Break ${n} special rocks`, 60], ['rocks', n => `Break ${n} rocks`, 800]];
export function ensureDaily(s, now = Date.now()) {
  if (!s.unlocks.daily) return null; const d = dayKey(now); if (s.daily && s.daily.day === d) return s.daily;
  const r = rng(d * 7 + 3), pool = DAILY_T.slice(), list = [];
  for (let i = 0; i < 3; i++) { const t = pool.splice(Math.floor(r() * pool.length), 1)[0]; list.push({ type: t[0], n: t[2], prog: 0, claimed: false }); }
  s.daily = { day: d, list, supply: false }; return s.daily;
}
export const dailyLabel = c => DAILY_T.find(t => t[0] === c.type)[1](c.n);
function dailyProgress(s, sum) {
  if (!s.daily) return; const special = ['frost', 'magma', 'prism', 'well', 'bomb', 'iron'].reduce((a, k) => a + (sum.kinds[k] || 0), 0);
  for (const c of s.daily.list) { const add = { runs: 1, pods: sum.pods, bosses: sum.bosses, rocks: sum.broken, kind: special }[c.type];
    if (c.type === 'combo') c.prog = Math.max(c.prog, sum.bestCombo); else c.prog += add || 0; }
}
const topTier = s => { let t = 0; s.oreEver.forEach((x, i) => { if (x > 0) t = i; }); return t; };
export function dailyReward(s, big) { const t = topTier(s), per = s.lastRun ? s.lastRun.ore[t] : 0; return { tier: t, ore: Math.max(50, per * (big ? 6 : 3)), lab: big ? 3600 : 1200, drones: big ? 25 : 8 }; }
function grant(s, r) { s.ore[r.tier] += r.ore; s.oreEver[r.tier] += r.ore; labBoost(s, r.lab); s.drones += r.drones; }
export function claimDaily(s, i, now = Date.now()) {
  const d = ensureDaily(s, now); if (!d) return null;
  if (i === 'supply') { if (d.supply) return null; d.supply = true; const r = dailyReward(s, true); grant(s, r); return r; }
  const c = d.list[i]; if (!c || c.claimed || c.prog < c.n) return null; c.claimed = true; const r = dailyReward(s, false); grant(s, r); return r;
}

// one place that folds every permanent system into the run stats
export function meta(s) {
  const lab = id => labLvl(s, id), cl = id => chartLvl(s, id), crewK = 1 + 0.5 * cl('cCrew'), cw = id => Math.pow(1 + 0.15 * crewK, crewLvl(s, id));
  const ach = Math.pow(1.04, achCount(s)), charts = 1 + 0.5 * (s.chartsEver || 0);
  return {
    dps: Math.pow(1.35, lab('rL')) * Math.pow(2, cl('cPow')) * cw('flare') * ach * charts,
    drill: Math.pow(1.35, lab('rD')) * Math.pow(2, cl('cPow')) * cw('pingo') * ach * charts,
    ore: Math.pow(1.3, lab('rO')) * Math.pow(2, cl('cOre')) * cw('lumi') * ach * charts,
    time: lab('rT') + 5 * cl('cTime') + 0.5 * crewK * crewLvl(s, 'echo'),
    launch: 40 * lab('rW') + 150 * cl('cWarp'),
    offline: 0.04 * lab('rN'), offCap: lab('rN'),
    dust: Math.pow(1.15, lab('rS')) * Math.pow(1.5, cl('cDust')),
    pods: (1 + 0.1 * lab('rR')) * (1 + 0.5 * cl('cLuck')),
    labSpeed: Math.pow(1.3, cl('cLab')) * (1 + 0.04 * crewLvl(s, 'echo')),
  };
}
