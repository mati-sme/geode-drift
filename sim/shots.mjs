import { chromium } from 'playwright-core';
import { createServer } from 'http'; import { readFileSync, existsSync } from 'fs'; import { extname, join } from 'path';
const root = new URL('../docs/', import.meta.url).pathname, out = '/workspace/test-artifacts/geode-drift';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png' };
const srv = createServer((q, r) => { let p = join(root, decodeURIComponent(q.url.split('?')[0])); if (p.endsWith('/')) p += 'index.html'; if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); r.end(readFileSync(p)); }).listen(8765);
const exe = process.env.HOME + '/.cache/ms-playwright/chromium-1148/chrome-linux/chrome';
const b = await chromium.launch({ executablePath: exe, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await pg.goto('http://localhost:8765/'); await pg.waitForTimeout(1500);
await pg.click('.mok'); await pg.waitForTimeout(400);
for (let i = 0; i < 12; i++) { await pg.mouse.click(430 + (i % 4) * 14, 470 + (i % 3) * 12); await pg.waitForTimeout(60); }
await pg.waitForTimeout(150); await pg.screenshot({ path: out + '/1-start-tapping.png' });
// mid game: inject a progressed run
await pg.evaluate(() => { const { s, G } = window.__gd; s.shards = 4e9; s.runTotal = 2e10; s.gems = 20; s.gemsEver = 20; s.polishes = 2; s.gens = [80, 72, 60, 48, 33, 20, 9, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; s.runTime = 999; window.__gd.scene.setStratum(G.stratumIndex(s.runTotal)); s.stratum = G.stratumIndex(s.runTotal); window.__gd.full(); });
await pg.waitForTimeout(800);
await pg.evaluate(() => window.__gd.scene.spawnComet()); await pg.waitForTimeout(2500);
for (let i = 0; i < 8; i++) { await pg.mouse.click(420 + i * 9, 450 + (i % 2) * 20); await pg.waitForTimeout(50); }
await pg.screenshot({ path: out + '/2-midgame-drones-comet.png' });
await pg.click('.tab[data-tab=upgrades]'); await pg.waitForTimeout(500); await pg.screenshot({ path: out + '/3-upgrades.png' });
await pg.evaluate(() => { const { s, G } = window.__gd; s.runTotal = 1e17; s.gems = 380; s.gemsEver = 600; s.stratum = G.stratumIndex(s.runTotal); window.__gd.scene.setStratum(s.stratum); });
await pg.click('.tab[data-tab=nova]'); await pg.waitForTimeout(900); await pg.screenshot({ path: out + '/4-deep-layer-supernova.png' });
console.log('errors:', errs.length ? errs.join('\n') : 'none');
await b.close(); srv.close();
