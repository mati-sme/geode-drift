// Headless pacing sim for Geode Drift v2: plays N timed runs, buys tree nodes greedily between runs.
import * as G from '../src/core.js';
const RUNS = +(process.argv[2] || 60), NOVA_AT = +(process.argv[3] || 0);
const s = G.newState(0); let wall = 0, dry = 0, maxDry = 0; const rows = [];
for (let i = 1; i <= RUNS; i++) {
  const run = G.startRun(s, i * 7919); while (!run.ended) { G.stepRun(run, s, 0.05); run.ev.length = 0; }
  const sum = run.summary; wall += sum.time + 8; // + ~8s in the tree/summary
  let bought = [];
  for (let k = 0; k < 200; k++) {
    const c = G.TREE.filter(n => G.canBuy(s, n)).sort((a, b) => G.nodeCost(s, a) / (s.ore[a.cost[0]] + 1) - G.nodeCost(s, b) / (s.ore[b.cost[0]] + 1));
    if (!c.length) break; G.buyNode(s, c[0].id); bought.push(c[0].id);
  }
  dry = bought.length ? 0 : dry + 1; maxDry = Math.max(maxDry, dry);
  let nv = '';
  if (NOVA_AT && G.canNova(s) && G.dustFor(s) >= NOVA_AT) { nv = ` NOVA +${G.nova(s)} dust`; }
  const ore = sum.ore.map((x, t) => x > 0.5 ? `${G.ORES[t].name[0]}${G.fmt(x)}` : '').filter(Boolean).join(' ');
  rows.push(`run ${String(i).padStart(3)} @${G.fmtTime(wall).padStart(7)} | ${sum.time.toFixed(0).padStart(3)}s | ${sum.startDepth.toFixed(0).padStart(4)}→${sum.depth.toFixed(0).padStart(4)}m ${sum.record ? '★' : ' '} | rocks ${String(sum.broken).padStart(3)} bosses ${sum.bosses} | ${ore.padEnd(34)} | bought ${bought.length}${nv}`);
}
console.log(rows.join('\n'));
console.log(`\nbest depth ${G.fmt(s.bestDepth)}m, zone ${s.zoneMax} (${G.zoneName(s.zoneMax)}), nodes ${Object.values(s.tree).reduce((a, b) => a + b, 0)}, novas ${s.novas}, dust ${s.dust}, longest streak of runs with nothing to buy: ${maxDry}`);
