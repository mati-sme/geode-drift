// Headless screenshots for v4: Frostveil camp + crew dialogue, Research Lab, an Emberforge run.
import { chromium } from 'playwright-core';
import { createServer } from 'http'; import { readFileSync, existsSync } from 'fs'; import { extname, join } from 'path';
const root = new URL('../docs/', import.meta.url).pathname, out = '/workspace/test-artifacts/geode-drift/v4';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = createServer((q, r) => { let p = join(root, decodeURIComponent(q.url.split('?')[0])); if (p.endsWith('/')) p += 'index.html'; if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); r.end(readFileSync(p)); }).listen(8770);
const b = await chromium.launch({ executablePath: process.env.HOME + '/.cache/ms-playwright/chromium-1148/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage({ viewport: { width: 1440, height: 900 } }); pg.setDefaultTimeout(10000);
const errs = []; pg.on('pageerror', e => errs.push(e.message));
await pg.addInitScript(() => { if (localStorage.getItem('geode-drift-save-v4')) return; const t = {}; ['t1', 't3', 'd1', 'd4', 'd6', 'd8', 'r1', 'r3', 'r5', 'r7', 'e1', 'e2', 'e3', 'e7', 'a1', 'a2', 'a4'].forEach(k => t[k] = 8); Object.assign(t, { rig: 1, u1: 1, u3: 1, mods: 1, ap: 1, mc: 5, mm: 5, d2: 1, d5: 1, r2: 5, r4: 4, r10: 5, w1a: 12, w1b: 12, w1c: 6, d10: 10, d11: 10, r8: 10, r9: 10, e8: 10, d12: 15, r11: 15 });
  localStorage.setItem('geode-drift-save-v4', JSON.stringify({ v: 4, seenIntro: true, ore: [9e9, 9e9, 9e9, 9e9, 9e9, 9e9, 9e8, 4.2e6, 1.8e4, 0, 0], oreEver: [1e11, 1e11, 1e11, 1e11, 1e11, 1e11, 1e10, 5e6, 2e4, 0, 0], tree: t, bestDepth: 1520, bestEver: 1690, zoneMax: 10, bossEver: 10, runs: 140, dust: 640, dustCycle: 900, novas: 9,
    chapter: 15, world: 2, parts: 10, upgrades: 5, unlocks: { lab: true, daily: true, const: true }, crew: { pingo: 14 }, drones: 2600, pods: 3100, lab: { rL: 7, rD: 6, rO: 5, rT: 3 }, labQ: [{ id: 'rO', start: Date.now() - 2400e3, end: Date.now() + 1500e3 }, { id: 'rS', start: Date.now() - 300e3, end: Date.now() + 2100e3 }],
    artifacts: { lens: 1, clover: 1, eye: 1, hourglass: 1, tooth: 1 }, mods: ['chain', 'missile', 'magnet', 'saw', 'shield'], loadout: ['chain', 'missile'], achs: {}, kindsEver: { frost: 300 }, lastSave: Date.now(), lastRun: { ore: [0, 0, 0, 0, 0, 0, 1e7, 3e5, 2e3, 0, 0], time: 120 } })); });
await pg.goto('http://localhost:8770/'); await pg.waitForTimeout(2500);
await pg.evaluate(() => { document.querySelectorAll('.toast').forEach(t => t.remove()); window.__gd.say([['flare', 'Hello, sparkly travellers! I am Flare. I cook the best lava cookies on Emberforge, but the forge Guardians took our ovens!']]); });
await pg.waitForTimeout(3000); await pg.screenshot({ path: out + '/1-emberforge-camp-new-crew.png' });
await pg.evaluate(() => { const d = document.querySelector('#dialog'); for (let i = 0; i < 4 && !d.classList.contains('hide'); i++) d.click(); document.querySelector('#modal').classList.remove('show'); }); await pg.waitForTimeout(400);
await pg.click('#labbtn'); await pg.waitForTimeout(1200); await pg.screenshot({ path: out + '/2-research-lab.png' });
await pg.click('.mok'); await pg.evaluate(() => { const g = window.__gd; g.launch(); const r = g.run; r.depth = 1660; r.spawnedTo = 1661; r.rocks = []; r.tmax = 999; });
await pg.keyboard.down('KeyS'); await pg.waitForTimeout(5000); await pg.keyboard.up('KeyS'); await pg.keyboard.down('KeyA'); await pg.waitForTimeout(1200); await pg.keyboard.up('KeyA'); await pg.waitForTimeout(1500);
await pg.screenshot({ path: out + '/3-emberforge-run.png' });
console.log('errors:', errs.length ? errs.join('\n') : 'none'); await b.close(); srv.close();
