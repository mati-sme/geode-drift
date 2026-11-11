// Geode Drift — pure game logic (no DOM). Shared by the game and the headless pacing sim.
export const VERSION = 1;

export const GENS = [
  { id: 'picker', name: 'Pebble Picker', desc: 'A tiny drone that nibbles loose shards.', cost: 15, rate: 0.15, color: 0x9fe7ff },
  { id: 'chisel', name: 'Laser Chisel', desc: 'Traces glowing lines and pops crystals free.', cost: 150, rate: 1, color: 0xff9ee6 },
  { id: 'drill', name: 'Hover Drill', desc: 'Spins down into the softer layers.', cost: 2000, rate: 6, color: 0xffd27a },
  { id: 'harvest', name: 'Crystal Harvester', desc: 'Scoops whole clusters at once.', cost: 30000, rate: 35, color: 0x8affc1 },
  { id: 'reso', name: 'Sonic Resonator', desc: 'Sings at the exact note that cracks quartz.', cost: 500000, rate: 200, color: 0xb8a4ff },
  { id: 'press', name: 'Gravity Press', desc: 'Squeezes dust back into gems.', cost: 8e+06, rate: 1100, color: 0x7ab8ff },
  { id: 'tug', name: 'Comet Tug', desc: 'Drags fresh comets in to be mined.', cost: 1.4e+08, rate: 6000, color: 0xffb27a },
  { id: 'forge', name: 'Star Forge', desc: 'Grows new crystals from starlight.', cost: 2.5e+09, rate: 33000, color: 0xfff07a },
  { id: 'loom', name: 'Nebula Loom', desc: 'Weaves nebula clouds into geodes.', cost: 4.5e+10, rate: 180000, color: 0xff7ad0 },
  { id: 'prism', name: 'Prism Engine', desc: 'Splits one shard into a rainbow of them.', cost: 8e+11, rate: 1e+06, color: 0x7affef },
  { id: 'lathe', name: 'Galaxy Lathe', desc: 'Turns whole spiral arms into gemstones.', cost: 1.5e+13, rate: 5.5e+06, color: 0xc6ff7a },
  { id: 'sieve', name: 'Aurora Sieve', desc: 'Sifts the northern lights of the cosmos.', cost: 3e+14, rate: 3e+07, color: 0xa0ffb0 },
  { id: 'halo', name: 'Halo Harp', desc: 'Plucks rings of light off distant planets.', cost: 6.6e+15, rate: 1.65e+08, color: 0xffc6f0 },
  { id: 'tide', name: 'Tidal Spinner', desc: 'Rides gravity waves between stars.', cost: 1.45e+17, rate: 9.08e+08, color: 0x9ad0ff },
  { id: 'bloom', name: 'Starbloom Garden', desc: 'Grows crystal flowers the size of moons.', cost: 3.19e+18, rate: 4.99e+09, color: 0xffe08a },
  { id: 'wish', name: 'Wishing Well', desc: 'Every wish across the galaxy drops a gem in.', cost: 7.03e+19, rate: 2.75e+10, color: 0xb0ffd8 },
  { id: 'dream', name: 'Dream Foundry', desc: 'Turns sweet dreams into solid starlight.', cost: 1.55e+21, rate: 1.51e+11, color: 0xd2b0ff },
  { id: 'heart', name: 'Cosmic Heartbeat', desc: 'The universe itself hums along with you.', cost: 3.4e+22, rate: 8.3e+11, color: 0xffffff },
];
export const COST_GROWTH = 1.15;
export const MILESTONES = [10, 25, 50, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000];

export const STRATA = [
  { name: 'Dusty Crust', at: 0, hue: 0x8a7f9e },
  { name: 'Quartz Vein', at: 1e3, hue: 0xdfe8ff },
  { name: 'Amethyst Hollow', at: 1e5, hue: 0xb27aff },
  { name: 'Citrine Seam', at: 1e7, hue: 0xffc94a },
  { name: 'Emerald Grotto', at: 1e9, hue: 0x3dff9a },
  { name: 'Sapphire Deep', at: 1e11, hue: 0x4a8cff },
  { name: 'Ruby Mantle', at: 1e13, hue: 0xff4a6e },
  { name: 'Opal Abyss', at: 1e15, hue: 0xffa6f0 },
  { name: 'Moonstone Core', at: 1e17, hue: 0xc8f4ff },
  { name: 'Starglass Heart', at: 1e19, hue: 0xfff6a6 },
  { name: 'Prismatic Singularity', at: 1e21, hue: 0xffffff },
];
const ECHO = ['Aurora', 'Nebula', 'Comet', 'Halo', 'Rainbow', 'Starlight', 'Moonbeam', 'Sunflare'];
for (let i = 0; i < 60; i++) STRATA.push({ name: `${ECHO[i % ECHO.length]} Echo ${Math.floor(i / ECHO.length) + 1}`, at: 1e23 * Math.pow(100, i), hue: [0x7affef, 0xff7ad0, 0xffd27a, 0xb8a4ff, 0x8affc1, 0xfff07a, 0xc8f4ff, 0xffb27a][i % 8] });
export const STRATUM_MULT = 1.25;

// ---------- Upgrades (generated) ----------
const TIER_REQ = [1, 5, 25, 50, 100, 150, 200, 300, 400, 500, 700, 1000];
const TIER_COST = [10, 50, 500, 5e4, 5e6, 5e8, 5e10, 5e13, 5e16, 5e19, 5e24, 5e30];
const TIER_NAMES = ['Polished', 'Tuned', 'Overclocked', 'Mirror-Plated', 'Star-Fused', 'Quantum', 'Mythic', 'Legendary', 'Celestial', 'Cosmic', 'Eternal', 'Infinite'];
export const UPGRADES = [];
GENS.forEach((g, gi) => TIER_REQ.forEach((req, t) => UPGRADES.push({
  id: `g${gi}t${t}`, kind: 'gen', gen: gi, req, cost: g.cost * TIER_COST[t], mult: 2,
  name: `${TIER_NAMES[t]} ${g.name}s`, desc: `${g.name}s mine twice as fast.`,
})));
const CLICK = [[100, 'Sturdy Gloves'], [600, 'Diamond Fingertips'], [8000, 'Echo Tap'], [9e4, 'Thunder Tap']];
CLICK.forEach(([c, n], i) => UPGRADES.push({ id: `c${i}`, kind: 'click', cost: c, mult: 2, name: n, desc: 'Taps are twice as strong.' }));
const PCT = [[5e4, 'Resonant Touch'], [5e6, 'Harmonic Touch'], [5e8, 'Crystal Song'], [5e10, 'Choir of Gems'], [5e12, 'Cosmic Chord'], [5e14, 'Song of Stars']];
PCT.forEach(([c, n], i) => UPGRADES.push({ id: `p${i}`, kind: 'clickpct', cost: c, pct: 0.01, name: n, desc: 'Each tap also gives +1% of your shards per second.' }));
const GLOBAL = ['Lattice Insight', 'Facet Mapping', 'Lucky Streak', 'Gem Whisperer', 'Crystal Choir', 'Glimmer Grid', 'Shimmer Shield', 'Prism Pact', 'Radiant Rhythm', 'Aurora Accord', 'Starlight Seal', 'Infinity Facet', 'Celestial Cut', 'Wonder Weave', 'Dreamstone Dial', 'Everglow'];
for (let i = 0; GLOBAL.length < 45; i++) GLOBAL.push(`${['Cosmic', 'Radiant', 'Glittering', 'Boundless', 'Dazzling'][i % 5]} ${['Lens', 'Facet', 'Bloom', 'Spiral', 'Crown', 'Lattice'][Math.floor(i / 5) % 6]} ${['II', 'III', 'IV', 'V', 'VI'][Math.floor(i / 30) % 5] || ''}`.trim());
GLOBAL.forEach((n, i) => UPGRADES.push({ id: `w${i}`, kind: 'global', cost: 5000 * Math.pow(60, i), mult: 1.5, name: n, desc: 'All shard production x1.5.' }));
const COMET = [[2e4, 'Comet Lure'], [2e7, 'Tail Catcher'], [2e10, 'Meteor Shower']];
COMET.forEach(([c, n], i) => UPGRADES.push({ id: `k${i}`, kind: 'comet', cost: c, name: n, desc: 'Comets appear 20% more often and boosts last longer.' }));
export const UPG_BY_ID = Object.fromEntries(UPGRADES.map(u => [u.id, u]));

// ---------- Prestige layer 1: Polish -> Gems (milestones unlock perks, nothing is ever spent) ----------
export const GEM_PER = 0.2; // +20% production per gem
// Gems grow with the *depth* (log) of a run, normalised by the Supernova multiplier: steady, never runaway.
export const gemsFor = (runTotal, s) => { const d = Math.log10(Math.max(1, runTotal)) - gemDepth(s); return d > 0 ? Math.floor(2 * d * d) : 0; };
export const POLISH_PERKS = [
  { at: 1, id: 'head1', name: 'Head Start', desc: 'Start every run with 10 Pickers and 5 Chisels.' },
  { at: 3, id: 'tapper1', name: 'Auto-Tapper', desc: 'A helper taps the geode twice a second.' },
  { at: 10, id: 'hands', name: 'Quick Hands', desc: 'Taps are 3x stronger.' },
  { at: 15, id: 'auto', name: 'Drone Autobuyer', desc: 'Automatically buys the best drone you can afford.' },
  { at: 30, id: 'head2', name: 'Bigger Head Start', desc: 'Start runs with 25 Pickers, 15 Chisels and 10 Drills.' },
  { at: 60, id: 'sleep', name: 'Deep Sleep', desc: 'Offline mining at 100% for up to 24 hours.' },
  { at: 120, id: 'autoU', name: 'Upgrade Autobuyer', desc: 'Automatically buys upgrades you can afford.' },
  { at: 250, id: 'magnet', name: 'Comet Magnet', desc: 'Comets come twice as often.' },
  { at: 500, id: 'keepClick', name: 'Muscle Memory', desc: 'Keep tap upgrades after Polish.' },
  { at: 1000, id: 'tapper2', name: 'Tapping Choir', desc: 'Auto-Tapper taps 6 times a second.' },
];

// ---------- Prestige layer 2: Supernova -> Stardust ----------
export const NOVA_MIN_GEMS = 400, NOVA_NEED_GROW = 1;
export const gemDepth = s => 8 + NOVA_DEPTH * Math.log10(s.novaMult); // shards (as a power of ten) needed for the first gem
export const NOVA_DEPTH = 1.5; // each x10 of Supernova power pushes the gem threshold 4 orders of magnitude deeper
export const dustFor = gems => Math.floor(Math.sqrt(gems / 10));
export const NOVA_BONUS = 1.25;
// A Supernova is only allowed when the new Stardust multiplier beats the Gem multiplier you give up, so it always leaves you stronger.
export const NOVA_PERKS = [
  { at: 1, id: 'dkeep', name: 'Stellar Memory', desc: 'Every run starts already at the Quartz Vein layer.' },
  { at: 3, id: 'dauto', name: 'Auto-Polish', desc: 'Optionally Polish automatically when gems would double.' },
  { at: 10, id: 'dhead', name: 'Nova Head Start', desc: 'Start runs with 50 of each of the first four drones.' },
  { at: 25, id: 'dcomet', name: 'Comet Season', desc: 'Comet boosts are twice as strong.' },
];

export function newState(now = Date.now()) {
  return {
    v: VERSION, shards: 0, runTotal: 0, lifetime: 0, clicks: 0,
    gens: GENS.map(() => 0), upg: {}, gems: 0, gemsEver: 0, gemsThisNova: 0, novaGemPeak: 0,
    dust: 0, dustEver: 0, polishes: 0, novas: 0, played: 0, runTime: 0,
    lastSave: now, boost: null, comet: { next: 60 }, autoOn: true, autoUOn: true, autoPolish: false,
    best: { rate: 0 }, stratum: 0, novaMult: 1, reso: 0,
  };
}

export const has = (s, id) => !!s.upg[id];
export const perk = (s, id) => (POLISH_PERKS.find(p => p.id === id)?.at ?? Infinity) <= s.gemsEver
  || (NOVA_PERKS.find(p => p.id === id)?.at ?? Infinity) <= s.dustEver;

export const AFTERGLOW = 240; // seconds of x3 production at the start of each run after your first Polish
export function afterglow(s) { return s.polishes > 0 && s.runTime < AFTERGLOW ? 3 : 1; }
// +20% per gem up to 100 gems, then a gentle square-root softcap so runs can't snowball to infinity
export function gemMult(s) { const g = s.gems; return g <= 100 ? 1 + GEM_PER * g : 21 * Math.pow(g / 100, 0.35); }
export function dustMult(s) { return s.novaMult; }
export function stratumIndex(runTotal) { let i = 0; STRATA.forEach((x, k) => { if (runTotal >= x.at) i = k; }); return i; }

export function genCost(s, gi, n = s.gens[gi]) { return GENS[gi].cost * Math.pow(COST_GROWTH, n); }
export function costOfN(s, gi, k) { const r = COST_GROWTH; return genCost(s, gi) * (Math.pow(r, k) - 1) / (r - 1); }
export function maxAffordable(s, gi) {
  const c = genCost(s, gi), r = COST_GROWTH;
  if (s.shards < c) return 0;
  return Math.floor(Math.log(s.shards * (r - 1) / c + 1) / Math.log(r));
}
export function milestoneMult(n) { let m = 1; for (const x of MILESTONES) if (n >= x) m *= 2; if (n >= 1100) m *= Math.pow(2, Math.floor((n - 1000) / 100)); return m; }
export function nextMilestone(n) { return MILESTONES.find(x => x > n) ?? (Math.floor(n / 100) + 1) * 100; }

export function genMult(s, gi) {
  let m = milestoneMult(s.gens[gi]);
  for (let t = 0; t < TIER_REQ.length; t++) if (s.upg[`g${gi}t${t}`]) m *= 2;
  return m;
}
export const RESO_BASE = 1e4, RESO_GROW = 100, RESO_MULT = 2;
export const resoCost = s => RESO_BASE * Math.pow(RESO_GROW, s.reso || 0);
export function buyReso(s) { const c = resoCost(s); if (s.shards < c || s.runTotal < 5e3) return false; s.shards -= c; s.reso = (s.reso || 0) + 1; return true; }
export function globalMult(s) {
  let m = 1;
  for (let i = 0; i < GLOBAL.length; i++) if (s.upg[`w${i}`]) m *= 1.5;
  m *= Math.pow(STRATUM_MULT, stratumIndex(s.runTotal));
  m *= gemMult(s) * dustMult(s);
  return m;
}
export function boostMult(s) { return (s.boost && s.boost.kind === 'frenzy' ? s.boost.mult : 1) * afterglow(s); }
export function genRate(s, gi) { return GENS[gi].rate * s.gens[gi] * genMult(s, gi); }
export function baseRate(s) { let r = 0; for (let i = 0; i < GENS.length; i++) r += genRate(s, i); return r * globalMult(s); }
export function rate(s) { return baseRate(s) * boostMult(s); }
export function clickValue(s) {
  let c = 1;
  for (let i = 0; i < CLICK.length; i++) if (s.upg[`c${i}`]) c *= 2;
  if (perk(s, 'hands')) c *= 3;
  c *= Math.max(1, gemMult(s) * dustMult(s) * 0.25);
  let pct = 0; for (let i = 0; i < PCT.length; i++) if (s.upg[`p${i}`]) pct += 0.01;
  const tapBoost = s.boost && s.boost.kind === 'tap' ? s.boost.mult : 1;
  return (c + baseRate(s) * pct) * boostMult(s) * tapBoost;
}
export function autoTapsPerSec(s) { return perk(s, 'tapper2') ? 6 : perk(s, 'tapper1') ? 2 : 0; }

export function upgradeVisible(s, u) {
  if (s.upg[u.id]) return false;
  if (u.kind === 'gen') return s.gens[u.gen] >= u.req;
  return s.runTotal >= u.cost * 0.15;
}
export function availableUpgrades(s) { return UPGRADES.filter(u => upgradeVisible(s, u)).sort((a, b) => a.cost - b.cost); }

const CAP = 1e300; // keep numbers finite in extremely long saves
function earn(s, x) { if (!(x > 0)) return; s.shards = Math.min(CAP, s.shards + x); s.runTotal = Math.min(CAP, s.runTotal + x); s.lifetime = Math.min(CAP, s.lifetime + x); }

export function click(s, n = 1) { const v = clickValue(s) * n; earn(s, v); s.clicks += n; return v; }
export function buyGen(s, gi, k = 1) {
  k = Math.max(1, Math.min(k, 1e6)); const c = costOfN(s, gi, k);
  if (s.shards < c) return false;
  s.shards -= c; s.gens[gi] += k; return true;
}
export function buyUpgrade(s, id) {
  const u = UPG_BY_ID[id]; if (!u || s.upg[id] || !upgradeVisible(s, u) || s.shards < u.cost) return false;
  s.shards -= u.cost; s.upg[id] = 1; return true;
}
export function genUnlocked(s, gi) { return gi === 0 || s.gens[gi - 1] > 0 || s.runTotal >= GENS[gi].cost * 0.5; }

// ---------- Comets ----------
export function cometInterval(s) {
  let f = 1; for (let i = 0; i < COMET.length; i++) if (s.upg[`k${i}`]) f *= 1.2;
  if (perk(s, 'magnet')) f *= 2;
  return 90 / f;
}
export function cometDuration(s) { let d = 30; for (let i = 0; i < COMET.length; i++) if (s.upg[`k${i}`]) d += 10; return d; }
export function catchComet(s, roll = Math.random()) {
  const strong = perk(s, 'dcomet') ? 2 : 1;
  if (roll < 0.5) { s.boost = { kind: 'frenzy', mult: 7 * strong, left: cometDuration(s), total: cometDuration(s) }; return { type: 'frenzy', text: `Comet Frenzy! x${7 * strong} for ${cometDuration(s)}s` }; }
  if (roll < 0.75) { s.boost = { kind: 'tap', mult: 50 * strong, left: 15, total: 15 }; return { type: 'tap', text: `Supercharged Taps! x${50 * strong} for 15s` }; }
  const v = baseRate(s) * 120 * strong + 50; earn(s, v); return { type: 'lump', text: 'Comet Haul!', value: v };
}

// ---------- Tick ----------
export function tick(s, dt, events) {
  const r = rate(s); earn(s, r * dt);
  const taps = autoTapsPerSec(s) * dt; if (taps > 0) click(s, taps);
  s.played += dt; s.runTime += dt;
  if (s.boost) { s.boost.left -= dt; if (s.boost.left <= 0) s.boost = null; }
  const si = stratumIndex(s.runTotal);
  if (si > s.stratum) { s.stratum = si; events && events.push({ type: 'stratum', index: si }); }
  if (perk(s, 'auto') && s.autoOn) autoBuyGens(s);
  if (perk(s, 'autoU') && s.autoUOn) { for (const u of availableUpgrades(s)) if (s.shards >= u.cost) buyUpgrade(s, u.id); }
  if (perk(s, 'dauto') && s.autoPolish && s.runTime > 30) { const g = gemsFor(s.runTotal, s); if (g >= Math.max(10, s.gems)) { polish(s); events && events.push({ type: 'autopolish', gems: g }); } }
  const rr = baseRate(s); if (rr > s.best.rate) s.best.rate = rr;
}
export function bestGen(s) {
  // best value drone = lowest cost per extra shard/s among unlocked
  let best = -1, bv = Infinity;
  for (let i = 0; i < GENS.length; i++) {
    if (!genUnlocked(s, i)) continue;
    const c = genCost(s, i), before = genRate(s, i);
    s.gens[i]++; const after = genRate(s, i); s.gens[i]--;
    const v = c / Math.max(1e-9, after - before);
    if (v < bv) { bv = v; best = i; }
  }
  return best;
}
function autoBuyGens(s) { for (let k = 0; k < 20; k++) { const b = bestGen(s); if (b < 0 || !buyGen(s, b)) break; } }

// ---------- Offline ----------
export function offlineGain(s, now = Date.now()) {
  const sec = Math.max(0, (now - s.lastSave) / 1000);
  const cap = (perk(s, 'sleep') ? 24 : 8) * 3600, eff = perk(s, 'sleep') ? 1 : 0.5;
  const t = Math.min(sec, cap);
  if (t < 30) return { seconds: 0, gain: 0 };
  const gain = (baseRate(s) + clickValue(s) * autoTapsPerSec(s) / boostMult(s)) * t * eff;
  return { seconds: t, gain };
}
export function applyOffline(s, now = Date.now()) { const o = offlineGain(s, now); if (o.gain > 0) earn(s, o.gain); s.lastSave = now; return o; }

// ---------- Prestige ----------
function resetRun(s) {
  const keepClick = perk(s, 'keepClick');
  const kept = {}; if (keepClick) for (const k of Object.keys(s.upg)) if (/^[cp]/.test(k)) kept[k] = 1;
  s.shards = 0; s.runTotal = 0; s.gens = GENS.map(() => 0); s.upg = kept; s.reso = 0; s.boost = null; s.runTime = 0; s.stratum = 0;
  if (perk(s, 'head1')) { s.gens[0] = 10; s.gens[1] = 5; }
  if (perk(s, 'head2')) { s.gens[0] = 25; s.gens[1] = 15; s.gens[2] = 10; }
  if (perk(s, 'dhead')) for (let i = 0; i < 4; i++) s.gens[i] = Math.max(s.gens[i], 50);
  if (perk(s, 'dkeep')) { s.runTotal = 1e3; s.stratum = 1; }
}
export function canPolish(s) { return gemsFor(s.runTotal, s) >= 1; }
export function polish(s) {
  const g = gemsFor(s.runTotal, s); if (g < 1) return 0;
  s.gems += g; s.gemsEver += g; s.gemsThisNova += g; s.polishes++; resetRun(s); return g;
}
export function novaNeed(s) { return Math.round(NOVA_MIN_GEMS * Math.pow(NOVA_NEED_GROW, s.novas)); }
export function canNova(s) { return s.gems >= novaNeed(s); }
export function novaPreview(s) {
  const d = dustFor(s.gems); const newDust = s.dust + d;
  // Stardust mult: (1+dust)^2, but never below what you had (guarantees a nova always leaves you stronger)
  // Supernova locks your whole Gem multiplier into Stardust at 125% value, so it ALWAYS leaves you stronger,
  // and new Gems then stack multiplicatively on top.
  const now = gemMult(s) * s.novaMult;
  const mult = now * NOVA_BONUS;
  return { dust: d, mult, now, stronger: true };
}
export function nova(s) {
  if (!canNova(s)) return 0;
  const p = novaPreview(s);
  s.dust += p.dust; s.dustEver += p.dust; s.novaMult = Math.min(1e250, p.mult); s.gems = 0; s.gemsThisNova = 0; s.novas++;
  resetRun(s); return p.dust;
}

// ---------- Format ----------
const SUF = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'Ud', 'Dd', 'Td'];
export function fmt(x, dp = 2) {
  if (!isFinite(x)) return '∞';
  if (x < 1000) return x < 10 && x % 1 ? x.toFixed(1) : Math.floor(x).toString();
  const e = Math.floor(Math.log10(x) / 3);
  if (e < SUF.length) return (x / Math.pow(1000, e)).toFixed(dp) + SUF[e];
  return x.toExponential(2).replace('+', '');
}
export function fmtTime(sec) {
  sec = Math.floor(sec); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s2 = sec % 60;
  return h ? `${h}h ${m}m` : m ? `${m}m ${s2}s` : `${s2}s`;
}
export function load(json, now = Date.now()) {
  const base = newState(now);
  try { const o = JSON.parse(json); if (!o || o.v !== VERSION) return base; return Object.assign(base, o, { gens: GENS.map((_, i) => o.gens?.[i] || 0) }); } catch { return base; }
}
