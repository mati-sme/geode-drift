// Headless screenshots for v3: intro dialogue, camp hub, mid-run, Guardian fight.
import { chromium } from 'playwright-core';
import { createServer } from 'http'; import { readFileSync, existsSync } from 'fs'; import { extname, join } from 'path';
const root = new URL('../docs/', import.meta.url).pathname, out = '/workspace/test-artifacts/geode-drift/v3';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = createServer((q, r) => { let p = join(root, decodeURIComponent(q.url.split('?')[0])); if (p.endsWith('/')) p += 'index.html'; if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); r.end(readFileSync(p)); }).listen(8767);
const b = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1148/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await pg.goto('http://localhost:8767/'); await pg.waitForTimeout(2500);
await pg.click('#dialog'); await pg.waitForTimeout(200); await pg.click('#dialog'); await pg.waitForTimeout(1800);
await pg.screenshot({ path: out + '/1-intro-story.png' });
// mid-story save: chapter 5, 4 ship parts, chain + missiles equipped
await pg.evaluate(() => { const { s } = window.__gd; window.__gd.say([]);
  Object.assign(s.tree, { t1: 5, t2: 2, t3: 3, t4: 1, d1: 10, d2: 1, d4: 6, d3: 3, d5: 1, d6: 2, r1: 9, r2: 4, r3: 5, r4: 4, a1: 4, a2: 3, a4: 2, a3: 1, e1: 8, e2: 5, e6: 3, u1: 1, u3: 1, mods: 1, ap: 1, mc: 3, mm: 2 });
  s.ore = [8420, 5880, 364, 0, 0, 0, 0]; s.oreEver = [9e4, 2e4, 900, 0, 0, 0, 0]; s.bestDepth = 263; s.bestEver = 263; s.zoneMax = 1; s.bossEver = 1; s.runs = 24; s.pods = 5;
  s.chapter = 4; s.parts = 4; s.mods = ['chain', 'missile', 'magnet']; s.loadout = ['chain', 'missile']; s.artifacts = {}; window.__gd.scene.setCamp(true, 4); window.__gd.refreshTree(); });
await pg.waitForTimeout(2500);
await pg.screenshot({ path: out + '/2-camp-hub.png' });
await pg.evaluate(() => window.__gd.launch()); await pg.keyboard.down('KeyD'); await pg.waitForTimeout(1500); await pg.keyboard.up('KeyD'); await pg.keyboard.down('KeyS'); await pg.waitForTimeout(6000); await pg.keyboard.up('KeyS'); await pg.waitForTimeout(1500);
await pg.screenshot({ path: out + '/3-mid-run.png' });
await pg.evaluate(() => { const r = window.__gd.run; r.tmax = r.t + 0.05; }); await pg.waitForTimeout(1500); await pg.click('.mcancel').catch(() => {});
await pg.waitForTimeout(300);
await pg.evaluate(() => { const r = window.__gd.run; r.depth = 294; r.rocks = []; r.spawnedTo = 294; r.tmax = 999; }); await pg.waitForTimeout(3000);
await pg.evaluate(() => { const r = window.__gd.run; if (r.boss) r.boss.hp = r.boss.max * 0.55; }); await pg.keyboard.down('KeyA'); await pg.waitForTimeout(1200); await pg.keyboard.up('KeyA'); await pg.waitForTimeout(2200);
await pg.screenshot({ path: out + '/4-guardian.png' });
console.log('errors:', errs.length ? errs.join('\n') : 'none'); await b.close(); srv.close();
