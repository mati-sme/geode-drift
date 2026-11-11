// Headless pacing sim for Geode Drift v3: autopilot plays timed runs, claims chapters, equips modules, buys greedily, goes Supernova when the story asks (or when stuck).
import * as G from '../src/core.js';
const RUNS = +(process.argv[2] || 400), QUIET = process.argv.includes('-q');
const s = G.newState(0); let wall = 0, dry = 0, maxDry = 0, stuck = 0; const rows = [], marks = [];
const PREF = ['missile', 'chain', 'saw', 'magnet', 'shield'];
for (let i = 1; i <= RUNS; i++) {
  s.loadout = PREF.filter(m => s.mods.includes(m)).slice(0, G.slots(s));
  const run = G.startRun(s, i * 7919, true); while (!run.ended) { G.stepRun(run, s, 0.05); run.ev.length = 0; }
  const sum = run.summary; wall += sum.time + 10;
  let ch = '';
  while (G.chapterDone(s)) { const c = G.claimChapter(s); ch += c.endless ? ' [contract]' : ` [CH${s.chapter} ${c.title}]`; if (!c.endless) marks.push(`chapter ${s.chapter} "${c.title}" done at run ${i}, ${G.fmtTime(wall)}`); if (s.chapter > 12) break; }
  const bought = [];
  for (let k = 0; k < 300; k++) {
    const c = G.TREE.filter(n => G.canBuy(s, n)).sort((a, b) => G.nodeCost(s, a) / (s.ore[a.cost[0]] + 1) - G.nodeCost(s, b) / (s.ore[b.cost[0]] + 1));
    if (!c.length) break; G.buyNode(s, c[0].id); bought.push(c[0].id);
  }
  dry = bought.length ? 0 : dry + 1; maxDry = Math.max(maxDry, dry);
  stuck = sum.record ? 0 : stuck + 1;
  let nv = '';
  const storyNova = s.chapter === 6 && s.novas === 0, later = s.chapter >= 7 && (G.dustFor(s) >= s.dust * 2 + 5 || (stuck >= 3 && G.dustFor(s) >= s.dust * 0.3));
  if (G.canNova(s) && (storyNova || later)) { nv = ` NOVA +${G.nova(s)}`; stuck = 0; marks.push(`supernova #${s.novas} at run ${i}, ${G.fmtTime(wall)}, dust ${s.dust}`); }
  const ore = sum.ore.map((x, t) => x > 0.5 ? `${G.ORES[t].name[0]}${G.fmt(x)}` : '').filter(Boolean).join(' ');
  rows.push(`run ${String(i).padStart(3)} @${G.fmtTime(wall).padStart(7)} | ${sum.time.toFixed(0).padStart(3)}s hits ${sum.hits} | ${sum.startDepth.toFixed(0).padStart(4)}→${sum.depth.toFixed(0).padStart(4)}m ${sum.record ? '★' : ' '} | bosses ${sum.bosses} pods ${sum.pods} arts ${sum.arts.length} combo ${sum.bestCombo} | ${ore.padEnd(30)} | bought ${bought.length}${nv}${ch}`);
  if (s.chapter >= 10 && s.endless >= 3) break;
}
if (!QUIET) console.log(rows.join('\n'));
console.log('\n' + marks.join('\n'));
console.log(`\nbest ${G.fmt(s.bestEver)}m, chapter ${s.chapter}, nodes ${Object.values(s.tree).reduce((a, b) => a + b, 0)}, novas ${s.novas}, dust ${s.dust}, artifacts ${Object.keys(s.artifacts).length}, pods ${s.pods}, longest no-buy streak ${maxDry}`);
