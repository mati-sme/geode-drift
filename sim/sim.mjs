// Geode Drift v4 pacing sim: an autopilot plays the whole 30-chapter story over real days.
// Each day = 2 play sessions (SESS active minutes) with offline gaps; research, offline mining and daily contracts tick on the wall clock.
import * as G from '../src/core.js';
const DAYS = +(process.argv[2] || 12), SESS = +(process.argv[3] || 80), QUIET = process.argv.includes('-q');
const s = G.newState(0); const H = 3600e3; let now = 0, active = 0, dry = 0, maxDry = 0, stuck = 0, runs = 0, noBuy = 0, storyRuns = 0, storyNoBuy = 0;
const rows = [], marks = [], PREF = ['missile', 'chain', 'saw', 'magnet', 'shield'];
let lastPrestigeBest = 0, sincePrestige = -1, recov = [];
const fmtH = ms => (ms / H).toFixed(1) + 'h';
function hub() {
  G.labTick(s, now);
  while (G.labSlots(s) > s.labQ.length) { const c = G.LAB.filter(p => G.labLvl(s, p.id) < p.max && !s.labQ.some(q => q.id === p.id)).sort((a, b) => G.labDur(s, a.id) - G.labDur(s, b.id))[0]; if (!c || !G.labStart(s, c.id, now)) break; }
  for (let k = 0; k < 200; k++) { const c = Object.keys(s.crew).sort((a, b) => G.crewCost(s, a) - G.crewCost(s, b))[0]; if (!c || !G.crewUp(s, c)) break; }
  for (let k = 0; k < 200; k++) { const c = G.CHARTS.filter(c => G.chartLvl(s, c.id) < c.max && s.charts >= G.chartCost(s, c.id)).sort((a, b) => G.chartCost(s, a.id) - G.chartCost(s, b.id))[0]; if (!c) break; G.chartBuy(s, c.id); }
  const d = G.ensureDaily(s, now); if (d) { G.claimDaily(s, 'supply', now); d.list.forEach((c, i) => G.claimDaily(s, i, now)); }
}
for (let day = 0; day < DAYS && !(s.chapter >= 30 && s.endless >= 2); day++) {
  for (const [sessStart, gapAfter] of [[day * 24 * H + 9 * H, 0], [day * 24 * H + 17 * H, 0]]) {
    now = Math.max(now, sessStart); G.applyOffline(s, now); hub(); const end = now + SESS * 60e3;
    while (now < end) {
      s.loadout = PREF.filter(m => s.mods.includes(m)).slice(0, G.slots(s));
      const run = G.startRun(s, ++runs * 7919, true); while (!run.ended) { G.stepRun(run, s, 0.05); run.ev.length = 0; }
      const sum = run.summary; now += (sum.time + 10) * 1000; active += (sum.time + 10) * 1000;
      let ch = ''; while (G.chapterDone(s)) { const c = G.claimChapter(s); if (!c.endless) { marks.push(`ch ${String(s.chapter).padStart(2)} ${c.title.padEnd(20)} day ${day + 1}, active ${fmtH(active)}, runs ${runs}`); ch += ` [CH${s.chapter}]`; } else ch += ' [contract]'; }
      hub(); const bought = [];
      for (let k = 0; k < 400; k++) { const c = G.TREE.filter(n => G.canBuy(s, n)).sort((a, b) => G.nodeCost(s, a) / (s.ore[a.cost[0]] + 1) - G.nodeCost(s, b) / (s.ore[b.cost[0]] + 1)); if (!c.length) break; G.buyNode(s, c[0].id); bought.push(c[0].id); }
      if (!bought.length) { noBuy++; if (s.chapter < 30) storyNoBuy++; } if (s.chapter < 30) storyRuns++;
      dry = bought.length ? 0 : dry + 1; maxDry = Math.max(maxDry, dry); stuck = sum.record ? 0 : stuck + 1;
      if (sincePrestige >= 0) { sincePrestige++; if (s.bestDepth > lastPrestigeBest) { recov.push(sincePrestige); sincePrestige = -1; } }
      const c = G.chapter(s), need = k => c && c.goals.some(g => g[0] === k && (g[0] === 'const' ? s.consts : s.novas) < g[1]);
      let nv = '';
      const cf = G.chartsFor(s);
      if (G.canConst(s) && ((need('const') && stuck >= 2) || (cf >= Math.max(2, s.chartsEver * 0.6) && stuck >= 3))) { lastPrestigeBest = s.bestDepth; const g = G.constellation(s); sincePrestige = 0; stuck = 0; nv = ` CONST +${g}`; marks.push(`   constellation #${s.consts} +${g} charts, day ${day + 1}, active ${fmtH(active)}`); hub(); }
      else if (G.canNova(s) && ((need('novas') && stuck >= 1) || (s.chapter === 6 && !s.novas) || (s.chapter >= 7 && (G.dustFor(s) >= s.dust * 2 + 5 || (stuck >= 3 && G.dustFor(s) >= s.dust * 0.3))))) { lastPrestigeBest = s.bestDepth; nv = ` NOVA +${G.fmt(G.nova(s))}`; sincePrestige = 0; stuck = 0; }
      const ore = sum.ore.map((x, t) => x > 0.5 ? `${G.ORES[t].name.slice(0, 2)}${G.fmt(x)}` : '').filter(Boolean).slice(-3).join(' ');
      rows.push(`d${day + 1} r${String(runs).padStart(4)} ${fmtH(active).padStart(6)} | ${sum.time.toFixed(0).padStart(3)}s | ${sum.startDepth.toFixed(0).padStart(4)}→${sum.depth.toFixed(0).padStart(4)}m ${sum.record ? '★' : ' '} | ${ore.padEnd(28)} | buy ${String(bought.length).padStart(3)} | dust ${G.fmt(s.dust)} ch ${s.consts}/${s.chartsEver} lab ${G.labLevels(s)} crew ${G.crewLevels(s)} ach ${G.achCount(s)}${nv}${ch}`);
    }
  }
}
if (!QUIET) console.log(rows.join('\n'));
console.log('\n' + marks.join('\n'));
const avg = recov.length ? (recov.reduce((a, b) => a + b, 0) / recov.length).toFixed(1) : '-';
console.log(`\nstory chapter ${s.chapter}/30 | runs ${runs} | active ${fmtH(active)} | best ${G.fmt(s.bestEver)}m | novas ${s.novas} | constellations ${s.consts} | lab ${G.labLevels(s)} | crew ${G.crewLevels(s)} | achievements ${G.achCount(s)}`);
console.log(`runs with nothing to buy: ${storyNoBuy}/${storyRuns} during story, ${noBuy}/${runs} total; longest streak ${maxDry}; after a prestige, runs to beat the old record: avg ${avg}, max ${Math.max(0, ...recov)}`);
