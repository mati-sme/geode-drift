// Headless pacing sim: an engaged player (2 taps/s while playing, catches 70% of comets, buys greedily).
import * as G from '../src/core.js';
const HOURS = +(process.argv[2] || 6), TAPS = 2;
const s = G.newState(0); let t = 0, lastBuy = 0, maxGap = 0, maxGapAt = 0, maxGap1h = 0, buys = 0, buys1h = 0, nextComet = 60, maxEta1h = 0;
const log = [], runs = []; let runStart = 0, prevPeak = 0, recoverAt = null;
const fmt = G.fmt, ft = G.fmtTime;
function buyAll() {
  let any = false;
  for (const u of G.availableUpgrades(s)) if (s.shards >= u.cost && G.buyUpgrade(s, u.id)) { any = true; buys++; }
  for (let k = 0; k < 500; k++) { const b = G.bestGen(s); if (b < 0 || !G.buyGen(s, b)) break; any = true; buys++; }
  return any;
}
function eta() { // seconds until the next thing is affordable
  const r = G.rate(s) + G.clickValue(s) * (TAPS + G.autoTapsPerSec(s)); let m = Infinity;
  for (const u of G.availableUpgrades(s)) m = Math.min(m, Math.max(0, u.cost - s.shards) / r);
  for (let i = 0; i < G.GENS.length; i++) if (G.genUnlocked(s, i)) m = Math.min(m, Math.max(0, G.genCost(s, i) - s.shards) / r);
  return m;
}
const ev = [];
while (t < HOURS * 3600) {
  G.click(s, TAPS); G.tick(s, 1, ev); t++;
  if (t >= nextComet) { if (Math.random() < 0.7) G.catchComet(s); nextComet = t + G.cometInterval(s) * (0.7 + Math.random() * 0.6); }
  for (const e of ev.splice(0)) if (e.type === 'stratum') log.push(`${ft(t).padStart(8)}  stratum -> ${G.STRATA[e.index].name}`);
  if (buyAll()) { const gap = t - lastBuy; if (gap > maxGap) { maxGap = gap; maxGapAt = t; } if (t <= 3600) { maxGap1h = Math.max(maxGap1h, gap); buys1h = buys; } lastBuy = t; }
  if (t <= 3600 && t % 10 === 0) maxEta1h = Math.max(maxEta1h, eta());
  if (recoverAt === null && prevPeak && G.baseRate(s) >= prevPeak) recoverAt = t - runStart;
  const pend = G.gemsFor(s.runTotal, s);
  if (G.canNova(s) && s.runTime > 120) {
    const peak = G.baseRate(s), p = G.novaPreview(s), before = G.gemMult(s) * s.novaMult; G.nova(s);
    runs.push({ type: 'NOVA', at: t, len: t - runStart, peak, detail: `+${p.dust} stardust, mult x${fmt(before)} -> x${fmt(p.mult)}`, rec: recoverAt });
    runStart = t; prevPeak = peak; recoverAt = null; lastBuy = t;
  } else if (s.runTime > 120 && (pend >= Math.max(5, s.gems) || (t - lastBuy > 180 && pend >= Math.max(1, s.gems * 0.25)))) {
    const peak = G.baseRate(s); G.polish(s);
    runs.push({ type: 'Polish', at: t, len: t - runStart, peak, detail: `+${pend} gems (total ${s.gems}, x${fmt(G.gemMult(s))})`, rec: recoverAt });
    runStart = t; prevPeak = peak; recoverAt = null; lastBuy = t;
  }
  if (t % 600 === 0) log.push(`${ft(t).padStart(8)}  rate ${fmt(G.rate(s)).padStart(9)}/s  tap ${fmt(G.clickValue(s)).padStart(8)}  gems ${s.gems} dust ${s.dust}  drones ${s.gens.join(',')}`);
}
console.log(log.slice(0, 80).join('\n'));
console.log('\nPRESTIGES');
runs.forEach((r, i) => console.log(`#${i + 1} ${r.type.padEnd(6)} at ${ft(r.at).padStart(8)} run length ${ft(r.len).padStart(8)} peak ${fmt(r.peak)}/s  ${r.detail}  | prev-peak regained after ${r.rec == null ? 'n/a' : ft(r.rec)}`));
console.log(`\nFirst hour: ${buys1h} purchases, longest gap between purchases ${ft(maxGap1h)}, longest wait to next affordable item ${ft(maxEta1h)}`);
console.log(`Whole sim (${HOURS}h): ${buys} purchases, longest gap ${ft(maxGap)} at ${ft(maxGapAt)}`);
