// Geode Drift v2 — run-based mining. Pure logic shared by the game and the headless sim.
export const VERSION = 2;
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
const N = (id, name, x, y, req, max, cost, desc) => ({ id, name, x, y, req, max, cost, desc });
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
  N('d12', 'Rift Cannon', 7, 0, ['d11'], 99, [6, 15, 1.9], 'Laser damage x1.8'),
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
  N('r11', 'Rift Auger', 0, 7, ['r9'], 99, [6, 14, 1.9], 'Drill power x1.7'),
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
  N('e9', 'Void Bazaar', -4, -4, ['e8'], 25, [6, 15, 2.2], 'All ore x1.3'),
  // automation (lower diagonals)
  N('u1', 'Auto-Relaunch', -1, 1, ['rig'], 1, [1, 30, 1], 'Next run launches by itself after the summary'),
  N('u2', 'Idle Rig', -2, 2, ['u1'], 5, [2, 25, 2], '+15% offline mining (base 10%)'),
  N('u3', 'Ore Scanner', 1, 1, ['rig'], 1, [1, 20, 1], 'Lasers prefer the richest rocks'),
  N('u4', 'Overdrive', 2, 2, ['u3'], 5, [2, 30, 2], 'Last 5s of a run: x2 damage and speed (+1s per level)'),
];
export const NODE = Object.fromEntries(TREE.map(n => [n.id, n]));
export const lvl = (s, id) => s.tree[id] || 0;
export function nodeCost(s, n) { const L = lvl(s, n.id); return Math.ceil(n.cost[1] * Math.pow(n.cost[2], L)); }
export function nodeVisible(s, n) { return n.id === 'rig' || n.req.some(r => lvl(s, r) > 0); }
export function canBuy(s, n) { return nodeVisible(s, n) && lvl(s, n.id) < n.max && s.ore[n.cost[0]] >= nodeCost(s, n); }
export function buyNode(s, id) { const n = NODE[id]; if (!canBuy(s, n)) return false; s.ore[n.cost[0]] -= nodeCost(s, n); s.tree[id] = lvl(s, id) + 1; return true; }

// ---------- Prestige: Supernova -> Stardust ----------
export const NOVA_ZONE = 3; // beat the Cobalt Caverns Guardian (450m) to unlock
export const dustFor = s => Math.floor(Math.pow(Math.max(0, s.bestDepth) / 100, 1.6));
export const starMult = s => 1 + 0.25 * s.dust;
export const canNova = s => s.zoneMax >= NOVA_ZONE && dustFor(s) >= 1;
export function nova(s) {
  if (!canNova(s)) return 0; const d = dustFor(s);
  s.dust += d; s.novas++; s.tree = { rig: 1 }; s.ore = ORES.map(() => 0); s.bestDepth = 0; s.zoneMax = 0; s.lastRun = null;
  return d;
}

export function newState(now = Date.now()) {
  return { v: VERSION, ore: ORES.map(() => 0), oreEver: ORES.map(() => 0), tree: { rig: 1 }, bestDepth: 0, zoneMax: 0, runs: 0, dust: 0, novas: 0,
    played: 0, lastSave: now, lastRun: null, autoRelaunch: true, muted: false, seenIntro: false };
}

// ---------- Stats ----------
export function stats(s) {
  const L = id => lvl(s, id), sm = starMult(s);
  const pw = (id, b) => Math.pow(b, L(id));
  return {
    time: 25 + 3 * L('t1') + 4 * L('t3') + 5 * L('t5') + 5 * L('t6') + 2 * Math.min(10, s.novas),
    chrono: 0.12 * L('t2'), bossTime: 8 * L('t4'),
    dps: 5 * (1 + 0.35 * L('d1')) * pw('d4', 1.4) * pw('d6', 1.4) * pw('d8', 1.5) * pw('d10', 1.6) * pw('d11', 1.7) * pw('d12', 1.8) * sm,
    beams: 1 + L('d2') + L('d5') + L('d9'),
    crit: 0.08 * L('d3'), bossMult: pw('d7', 1.6),
    drill: pw('r1', 1.3) * pw('r3', 1.35) * pw('r5', 1.4) * pw('r7', 1.45) * pw('r8', 1.5) * pw('r9', 1.6) * pw('r11', 1.7) * sm,
    speed: 1.1 * (1 + 0.15 * L('r2') + 0.15 * L('r6')),
    launch: 15 * L('r4') + 40 * L('r10'),
    range: 3.2 + 0.5 * L('a1') + 0.5 * L('a4') + 0.6 * L('a7'),
    density: 1.1 * (1 + 0.2 * L('a2') + 0.2 * L('a5')),
    blast: 0.3 * Math.min(1, L('a3')) + 0.1 * Math.max(0, L('a3') - 1), blastR: 1.6 + 0.5 * L('a6'),
    oreMult: ORES.map((_, t) => (1 + 0.3 * L(['e1', 'e2', 'e3', 'e4', 'e5', 'e10', 'none'][t])) * pw('e7', 1.2) * pw('e8', 1.25) * pw('e9', 1.3) * sm),
    lucky: 0.06 * L('e6'), scanner: L('u3') > 0, overdrive: L('u4') ? 4 + L('u4') : 0,
    offline: 0.1 + 0.15 * L('u2'),
  };
}

// ---------- RNG ----------
export function rng(seed) { let a = seed >>> 0 || 1; return () => { a ^= a << 13; a >>>= 0; a ^= a >> 17; a ^= a << 5; a >>>= 0; return a / 4294967296; }; }

// ---------- Run ----------
export const HP_GROW = 1.03;
export const rockHP = (y, size) => 3 * size * Math.pow(HP_GROW, y);
export const hardness = y => Math.pow(1.026, y);
export const bossHP = B => 40 * Math.pow(HP_GROW, B);
export const W = 6.5; // half width of the field

export function startRun(s, seed = (Math.random() * 1e9) | 0) {
  const st = stats(s);
  const start = Math.min(st.launch, Math.floor(s.bestDepth * 0.6));
  return { st, r: rng(seed), t: 0, tmax: st.time, depth: start, startDepth: start, x: 0, rocks: [], nid: 1, spawnedTo: start + 1, ore: ORES.map(() => 0),
    broken: 0, boss: null, bossesKilled: 0, ended: false, ev: [], bonusTime: 0, prio: null, targets: [] };
}
// the next ore tier starts showing up 90m before its zone, so you can start saving for it
function oreTier(run, y) { const zz = (y + 90) / ZONE_LEN, top = Math.min(Math.floor(zz), ORES.length - 1); if (top === 0) return 0; const f = zz - Math.floor(zz); const p = top > Math.floor(y / ZONE_LEN) ? 0.12 + f * 0.5 : 0.65; return run.r() < p ? top : top - 1; }
function spawnRock(run, y) {
  const size = 0.6 + run.r() * 0.9 + (run.r() < 0.08 ? 0.8 : 0);
  const hp = rockHP(y, size), tier = oreTier(run, y);
  run.rocks.push({ id: run.nid++, x: (run.r() * 2 - 1) * W, y, z: (run.r() - 0.5) * 2.2, size, hp, max: hp, tier, hit: 0, rich: tier });
}
function breakRock(run, rk, s) {
  const st = run.st, yz = rk.y - Math.floor(rk.y / ZONE_LEN) * ZONE_LEN;
  let amt = rk.size * (1 + yz / 40) * st.oreMult[rk.tier];
  if (run.r() < st.lucky) { amt *= 2; run.ev.push({ type: 'lucky', rock: rk }); }
  run.ore[rk.tier] += amt; run.broken++; rk.hp = 0;
  if (st.chrono) { const add = Math.min(st.chrono, Math.max(0, run.st.time * 0.4 - run.bonusTime)); run.tmax += add; run.bonusTime += add; }
  run.ev.push({ type: 'break', rock: rk, amt });
  if (st.blast) for (const o of run.rocks) if (o.hp > 0 && o !== rk && Math.hypot(o.x - rk.x, o.y - rk.y) < st.blastR) { o.hp -= rk.max * st.blast; o.hit = 1; }
}
export function stepRun(run, s, dt) {
  if (run.ended) return;
  const st = run.st; run.t += dt;
  const od = st.overdrive && run.tmax - run.t < st.overdrive ? 2 : 1; run.od = od > 1;
  if (run.t >= run.tmax) return endRun(run, s);
  // spawn rows ahead
  const nextBoss = (Math.floor(run.depth / ZONE_LEN) + 1) * ZONE_LEN;
  while (run.spawnedTo < run.depth + 16) { run.spawnedTo += 1 / (st.density * 2); if (Math.abs(run.spawnedTo - nextBoss) > 2.5) spawnRock(run, run.spawnedTo); }
  // boss gate at the end of each zone
  if (!run.boss && run.depth >= nextBoss - 2.01) { const z = Math.floor(nextBoss / ZONE_LEN) - 1; run.boss = { hp: bossHP(nextBoss), max: bossHP(nextBoss), y: nextBoss, zone: z }; run.ev.push({ type: 'boss', boss: run.boss }); }
  // descend
  const v = st.speed * od * Math.max(0.04, Math.min(1, st.drill / hardness(run.depth)));
  run.v = v;
  if (!run.boss) run.depth = Math.min(run.depth + v * dt, nextBoss - 2);
  // targets
  const dmg = st.dps * od * (1 + st.crit * 2) * dt;
  run.targets = [];
  if (run.boss) {
    run.boss.hp -= dmg * st.beams * st.bossMult * 1.0; run.targets.push(run.boss);
    if (run.boss.hp <= 0) {
      const b = run.boss, t = Math.min(b.zone + 1, ORES.length - 1);
      const bonus = (25 + 10 * b.zone) * st.oreMult[t]; run.ore[t] += bonus; run.bossesKilled++; run.tmax = Math.min(run.st.time * 1.6, run.tmax + st.bossTime);
      s.zoneMax = Math.max(s.zoneMax, b.zone + 1); run.ev.push({ type: 'bossdown', boss: b, tier: t, amt: bonus });
      run.boss = null; run.depth = b.y + 0.5; run.spawnedTo = Math.max(run.spawnedTo, run.depth + 1);
    }
  } else {
    const R = st.range, cand = [];
    for (const rk of run.rocks) { if (rk.hp <= 0) continue; const d = Math.hypot(rk.x - run.x, rk.y - run.depth); if (d < R + rk.size * 0.4) cand.push([st.scanner ? d - rk.tier * 3 - rk.size : d, rk]); }
    cand.sort((a, b) => a[0] - b[0]);
    if (run.prio && run.prio.hp > 0 && cand.some(c => c[1] === run.prio)) { cand.unshift([0, run.prio]); }
    const used = new Set();
    for (const [, rk] of cand) { if (used.size >= st.beams) break; if (used.has(rk)) continue; used.add(rk); rk.hp -= dmg; rk.hit = 1; run.targets.push(rk); }
    // drill contact
    for (const rk of run.rocks) if (rk.hp > 0 && Math.abs(rk.x - run.x) < 0.9 + rk.size * 0.4 && Math.abs(rk.y - run.depth) < 0.8 + rk.size * 0.3) { rk.hp -= st.dps * 0.5 * st.drill / Math.max(1, hardness(rk.y)) * dt + dmg * 0.25; rk.hit = 1; }
    // steer toward the best nearby rock
    let tx = run.x, best = Infinity;
    for (const rk of run.rocks) { if (rk.hp <= 0 || rk.y < run.depth - 1) continue; const sc = Math.abs(rk.x - run.x) * 0.6 + (rk.y - run.depth) - (st.scanner ? rk.tier * 2 : 0); if (sc < best) { best = sc; tx = rk.x; } }
    run.x += Math.max(-1, Math.min(1, tx - run.x)) * Math.min(1, dt * 2.2) * 1.2;
  }
  for (const rk of run.rocks) if (rk.hp <= 0 && rk.max > 0 && !rk.done) { rk.done = true; breakRock(run, rk, s); }
  run.rocks = run.rocks.filter(rk => !rk.done && rk.y > run.depth - 5);
}
export function endRun(run, s) {
  if (run.ended) return run.summary;
  run.ended = true;
  const prevBest = s.bestDepth;
  for (let i = 0; i < ORES.length; i++) { s.ore[i] += run.ore[i]; s.oreEver[i] += run.ore[i]; }
  s.bestDepth = Math.max(s.bestDepth, run.depth); s.runs++; s.played += run.t;
  run.summary = { depth: run.depth, startDepth: run.startDepth, prevBest, record: run.depth > prevBest, ore: run.ore.slice(), broken: run.broken, bosses: run.bossesKilled, time: run.t, zone: Math.floor(run.depth / ZONE_LEN) };
  s.lastRun = { ore: run.ore.slice(), time: run.t };
  return run.summary;
}

// ---------- Offline ----------
export function offlineGain(s, now = Date.now()) {
  const sec = Math.min(8 * 3600, Math.max(0, (now - s.lastSave) / 1000));
  if (sec < 60 || !s.lastRun) return null;
  const eff = stats(s).offline, k = sec / Math.max(20, s.lastRun.time) * eff;
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
