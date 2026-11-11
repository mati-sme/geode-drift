import * as G from './core.js';
import { Scene3D } from './render.js';
import { Sfx } from './sfx.js';

const KEY = 'geode-drift-save-v2';
const $ = q => document.querySelector(q);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const fmt = G.fmt, hex = c => '#' + c.toString(16).padStart(6, '0');
let s = G.load(localStorage.getItem(KEY) || '');
const sfx = new Sfx(); sfx.muted = !!s.muted;
const scene = new Scene3D($('#scene'));
let mode = 'hub', run = null, sel = null, autoT = 0;
function save() { s.lastSave = Date.now(); s.muted = sfx.muted; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
setInterval(() => { if (mode !== 'run') save(); }, 10000); addEventListener('beforeunload', save);

// ---------- helpers ----------
function popup(x, y, text, color = '#fff', cls = '') { const p = el('div', 'pop ' + cls, text); p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.color = color; p.style.setProperty('--dx', (Math.random() * 50 - 25) + 'px'); $('#fx').appendChild(p); setTimeout(() => p.remove(), 1100); }
function toast(html, cls = '') { const t = el('div', 'toast ' + cls, html); $('#toasts').appendChild(t); requestAnimationFrame(() => t.classList.add('in')); setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 500); }, 3600); }
function modal(html, ok = 'OK', onOk, cancel, onCancel) {
  const m = $('#modal'); m.querySelector('.mbody').innerHTML = html; const b = m.querySelector('.mok'), c = m.querySelector('.mcancel');
  b.textContent = ok; c.style.display = cancel ? '' : 'none'; if (cancel) c.textContent = cancel;
  b.onclick = () => { m.classList.remove('show'); sfx.ui(); onOk && onOk(); }; c.onclick = () => { m.classList.remove('show'); sfx.ui(); onCancel && onCancel(); };
  m.classList.add('show');
}
const oreChip = (t, v, plus = '') => `<span class="ore" style="--c:${hex(G.ORES[t].color)}"><i></i>${plus}${fmt(v)} <em>${G.ORES[t].name}</em></span>`;

// ---------- hub / tree ----------
const GRID = 118, tree = $('#tree'), svg = $('#links'); let view = { x: 0, y: 0, z: 1 };
const ICON = { t: '⏱', d: '✦', r: '⛏', a: '◎', e: '◆', u: '⚙', rig: '★' };
const nodeEls = {};
function buildTree() {
  G.TREE.forEach(n => {
    const b = el('button', 'node', `<span class="ic">${ICON[n.id === 'rig' ? 'rig' : n.id[0]]}</span><span class="lv"></span>`);
    b.style.left = n.x * GRID + 'px'; b.style.top = n.y * GRID + 'px'; b.dataset.id = n.id;
    b.onclick = e => { e.stopPropagation(); if (sel === n.id && G.canBuy(s, n)) buy(n.id); else { sel = n.id; sfx.ui(); refreshTree(); } };
    tree.appendChild(b); nodeEls[n.id] = b;
  });
}
function buy(id) {
  if (!G.buyNode(s, id)) { sfx.deny(); return; }
  const n = G.NODE[id], b = nodeEls[id].getBoundingClientRect(); sfx.upgrade(); popup(b.left + b.width / 2, b.top, `${n.name} ${G.lvl(s, id)}/${n.max}`, '#9fe7ff');
  nodeEls[id].classList.remove('pulse'); void nodeEls[id].offsetWidth; nodeEls[id].classList.add('pulse'); save(); refreshTree();
}
function refreshTree() {
  let lines = '';
  G.TREE.forEach(n => {
    const b = nodeEls[n.id], vis = G.nodeVisible(s, n), L = G.lvl(s, n.id), can = G.canBuy(s, n), col = hex(G.ORES[n.cost[0]].color);
    b.style.display = vis || n.req.some(r => G.nodeVisible(s, G.NODE[r])) ? '' : 'none';
    b.className = 'node' + (vis ? '' : ' locked') + (L ? ' owned' : '') + (L >= n.max ? ' maxed' : '') + (can ? ' can' : '') + (sel === n.id ? ' sel' : '');
    b.style.setProperty('--c', col); b.querySelector('.lv').textContent = n.max > 1 ? `${L}/${n.max}` : L ? '✓' : '';
    for (const r of n.req) { const p = G.NODE[r]; if (b.style.display === 'none') continue;
      lines += `<line x1="${p.x * GRID}" y1="${p.y * GRID}" x2="${n.x * GRID}" y2="${n.y * GRID}" class="${L ? 'on' : vis ? 'vis' : ''}" style="stroke:${L ? col : ''}"/>`; }
  });
  svg.innerHTML = lines;
  $('#wallet').innerHTML = G.ORES.map((o, t) => s.oreEver[t] > 0 || t === 0 ? oreChip(t, s.ore[t]) : '').join('');
  const st = G.stats(s);
  $('#launchsub').textContent = `${Math.round(st.time)}s run${st.launch && s.bestDepth ? ` · start ${Math.min(st.launch, Math.floor(s.bestDepth * 0.6))}m` : ''}`;
  $('#recs').innerHTML = `Record <b>${fmt(s.bestDepth)}m</b> · ${G.zoneName(Math.floor(s.bestDepth / G.ZONE_LEN))} · Runs ${s.runs}${s.dust ? ` · ✨${s.dust} stardust (x${fmt(G.starMult(s))})` : ''}`;
  $('#novabtn').style.display = s.zoneMax >= 2 || s.novas ? '' : 'none'; $('#novabtn').classList.toggle('ready', G.canNova(s));
  const c = $('#nodecard');
  if (sel) { const n = G.NODE[sel], L = G.lvl(s, sel), vis = G.nodeVisible(s, n), cost = G.nodeCost(s, n);
    c.classList.remove('hide');
    c.innerHTML = `<div class="nt">${ICON[n.id === 'rig' ? 'rig' : n.id[0]]} ${n.name} <span>${n.max > 1 ? `Level ${L}/${n.max}` : L ? 'Owned' : ''}</span></div><div class="nd">${n.desc}</div>
      ${!vis ? `<div class="nl">Unlock a connected node first</div>` : L >= n.max ? '<div class="nl good">Maxed out!</div>' : `<button class="nbuy ${G.canBuy(s, n) ? 'can' : ''}">${oreChip(n.cost[0], cost)}<b>${G.canBuy(s, n) ? 'Buy' : 'Need more'}</b></button>`}`;
    const nb = c.querySelector('.nbuy'); if (nb) nb.onclick = () => buy(sel);
  } else c.classList.add('hide');
}
function applyView() { tree.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.z})`; }
function centerView() { view = { x: innerWidth * 0.5, y: innerHeight * 0.47, z: Math.min(0.95, innerHeight / 1150) }; applyView(); }
(() => { const w = $('#treewrap'); let drag = null;
  w.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false }; });
  addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; view.x = drag.vx + dx; view.y = drag.vy + dy; applyView(); });
  addEventListener('pointerup', e => { if (drag && !drag.moved && e.target === w) { sel = null; refreshTree(); } drag = null; });
  w.addEventListener('wheel', e => { e.preventDefault(); const z = Math.max(0.4, Math.min(1.6, view.z * (e.deltaY < 0 ? 1.1 : 0.9))); view.x = e.clientX - (e.clientX - view.x) * z / view.z; view.y = e.clientY - (e.clientY - view.y) * z / view.z; view.z = z; applyView(); }, { passive: false });
})();

// ---------- run ----------
function launch() {
  sfx.unlock(); sfx.launch(); run = G.startRun(s); mode = 'run'; scene.clearRun(); scene.setZone(Math.floor(run.depth / G.ZONE_LEN));
  $('#hub').classList.add('hide'); $('#runhud').classList.remove('hide'); $('#hint').style.opacity = s.runs < 3 ? 1 : 0; lastZone = -1;
}
let lastZone = -1, breakSfx = 0;
function runHud() {
  const left = Math.max(0, run.tmax - run.t);
  $('#tsec').textContent = left.toFixed(1); $('#tbar i').style.width = (left / run.tmax * 100) + '%'; $('#timer').classList.toggle('low', left < 5);
  $('#depth').innerHTML = `${Math.floor(run.depth)}<small>m</small>`;
  const z = Math.floor(run.depth / G.ZONE_LEN); if (z !== lastZone) { lastZone = z; scene.setZone(z); $('#zone').textContent = G.zoneName(z); $('#zone').style.color = hex(G.zoneHue(z)); }
  $('#gbar i').style.width = ((run.depth % G.ZONE_LEN) / G.ZONE_LEN * 100) + '%'; $('#gnext').textContent = `Guardian at ${(z + 1) * G.ZONE_LEN}m`;
  $('#best').innerHTML = run.depth > s.bestDepth && s.bestDepth > 0 ? '<b class="good">★ New record!</b>' : `Record ${Math.floor(s.bestDepth)}m`;
  $('#runore').innerHTML = run.ore.map((v, t) => v > 0 ? oreChip(t, v, '+') : '').join('');
  const bb = $('#bossbar'); if (run.boss) { bb.classList.remove('hide'); $('#bossname').textContent = `${G.zoneName(run.boss.zone)} Guardian`; $('#bossbar i').style.width = Math.max(0, run.boss.hp / run.boss.max * 100) + '%'; } else bb.classList.add('hide');
}
function handleEvents() {
  for (const e of run.ev) {
    if (e.type === 'break') { const p = scene.toScreen(scene.rockWorld(e.rock)); scene.onBreak(e.rock); popup(p.x, p.y, '+' + fmt(e.amt), hex(G.ORES[e.rock.tier].color)); if (breakSfx <= 0) { sfx.crack(e.rock.tier); breakSfx = 0.05; } }
    if (e.type === 'lucky') { const p = scene.toScreen(scene.rockWorld(e.rock)); popup(p.x, p.y - 30, 'x2!', '#ffd27a', 'big'); }
    if (e.type === 'boss') { sfx.boss(); toast(`<b>⚠ ${G.zoneName(e.boss.zone)} Guardian!</b><br>Break it to open the next zone`, 'gold'); scene.shake = 0.6; }
    if (e.type === 'bossdown') { sfx.nova(); scene.bossDown(e.boss); toast(`<b>Guardian shattered!</b> ${oreChip(e.tier, e.amt, '+')}<br>${G.zoneName(e.boss.zone + 1)} is open`, 'glow'); }
  }
  run.ev.length = 0;
}
function endRun() {
  const sum = run.summary; mode = 'summary'; sfx.end(); save();
  const pct = sum.prevBest > 0 ? Math.round((sum.depth / sum.prevBest - 1) * 100) : 0;
  const affordable = G.TREE.filter(n => G.canBuy(s, n)).length;
  const auto = G.lvl(s, 'u1') && s.autoRelaunch;
  modal(`<div class="mtitle">Run complete</div>
    <div class="sumdepth">${Math.floor(sum.depth)}<small>m</small>${sum.record ? '<span class="rec">★ NEW RECORD' + (pct > 0 ? ` +${pct}%` : '') + '</span>' : ''}</div>
    <div class="sumgrid"><div><small>Zone</small><b>${G.zoneName(sum.zone)}</b></div><div><small>Rocks broken</small><b>${sum.broken}</b></div><div><small>Guardians</small><b>${sum.bosses}</b></div><div><small>Time</small><b>${sum.time.toFixed(0)}s</b></div></div>
    <div class="sumore">${sum.ore.map((v, t) => v > 0 ? oreChip(t, v, '+') : '').join('') || '<span class="dim">No ore this time</span>'}</div>
    <p class="dim">${affordable ? `<b class="good">${affordable} upgrade${affordable > 1 ? 's' : ''} ready</b> in the web.` : 'Save up for your next upgrade, or launch again.'}${auto ? ' Auto-relaunch in <b id="autot">4</b>s…' : ''}</p>`,
    'Upgrade web', () => toHub(), 'Launch again ▶', () => { autoT = 0; launch(); });
  autoT = auto ? 4 : 0;
}
function toHub() { mode = 'hub'; run = null; autoT = 0; scene.clearRun(); $('#runhud').classList.add('hide'); $('#hub').classList.remove('hide'); refreshTree(); }
$('#launch').onclick = () => launch();
$('#scene').addEventListener('pointerdown', e => { if (mode !== 'run') return; const id = scene.pick(e.clientX, e.clientY); const rk = id && run.rocks.find(r => r.id === id); if (rk) { run.prio = rk; sfx.ui(); popup(e.clientX, e.clientY - 20, '◎ focus', '#9fe7ff'); } });
addEventListener('keydown', e => { if (e.code === 'Space' && mode === 'hub' && !$('#modal').classList.contains('show')) { e.preventDefault(); launch(); } });

// ---------- supernova + settings ----------
$('#novabtn').onclick = () => {
  const d = G.dustFor(s), ok = G.canNova(s);
  modal(`<div class="mtitle">🌟 Supernova</div><p>Collapse your rig into a star. Your upgrade web, ore and depth record reset, but you gain <b>Stardust</b> forever.</p>
    <p>Each Stardust gives <b>+25% damage, drill power and ore</b>, and every Supernova adds +2s to your runs. You'll blast past your old record within a few runs.</p>
    <div class="sumgrid"><div><small>Stardust now</small><b>✨ ${s.dust}</b></div><div><small>You'd gain</small><b class="good">+${d}</b></div><div><small>Power after</small><b>x${fmt(1 + 0.25 * (s.dust + d))}</b></div></div>
    <p class="dim">${ok ? 'Stardust grows with your depth record, so going deeper first gives more.' : `Unlocks after you beat the ${G.zoneName(G.NOVA_ZONE - 1)} Guardian (${G.NOVA_ZONE * G.ZONE_LEN}m).`}</p>`,
    ok ? 'Go Supernova!' : 'OK', ok ? () => { const g = G.nova(s); sfx.nova(); scene.flash = 1.2; toast(`<b>🌟 SUPERNOVA! +${g} stardust</b> · everything x${fmt(G.starMult(s))}`, 'gold'); sel = null; save(); refreshTree(); } : null, ok ? 'Not yet' : null);
};
$('#setbtn').onclick = () => {
  modal(`<div class="mtitle">Settings</div>
    <label class="toggle"><input type="checkbox" id="optmute" ${sfx.muted ? '' : 'checked'}> Sound</label>
    ${G.lvl(s, 'u1') ? `<label class="toggle"><input type="checkbox" id="optauto" ${s.autoRelaunch ? 'checked' : ''}> Auto-relaunch runs</label>` : ''}
    <div class="btnrow"><button class="sbtn" id="optexp">Export save</button><button class="sbtn" id="optimp">Import save</button><button class="sbtn danger" id="optreset">Reset</button></div>
    <p class="dim small">Geode Drift v2.0 · autosaves · Space = launch</p>`, 'Done');
  $('#optmute').onchange = e => { sfx.muted = !e.target.checked; save(); };
  const oa = $('#optauto'); if (oa) oa.onchange = e => { s.autoRelaunch = e.target.checked; save(); };
  $('#optexp').onclick = () => { save(); const code = btoa(unescape(encodeURIComponent(localStorage.getItem(KEY)))); navigator.clipboard?.writeText(code).catch(() => {}); modal(`<div class="mtitle">Your save</div><p class="dim">Copied to the clipboard.</p><textarea readonly>${code}</textarea>`); };
  $('#optimp').onclick = () => modal(`<div class="mtitle">Import save</div><textarea id="imp" placeholder="Paste a save code"></textarea>`, 'Import', () => { try { const n = G.load(decodeURIComponent(escape(atob($('#imp').value.trim())))); if (n.runs || n.bestDepth) { s = n; save(); location.reload(); } else toast('That code did not work'); } catch { toast('That code did not work'); } }, 'Cancel');
  $('#optreset').onclick = () => modal('<div class="mtitle">Reset everything?</div><p>All progress and stardust will be wiped.</p>', 'Reset', () => { localStorage.removeItem(KEY); location.reload(); }, 'Cancel');
};

// ---------- offline ----------
function welcomeBack() {
  const o = G.applyOffline(s); if (!o || mode === 'run') return;
  modal(`<div class="mtitle">Welcome back!</div><p>Your Idle Rig kept mining for <b>${G.fmtTime(o.seconds)}</b> (${Math.round(G.stats(s).offline * 100)}% speed).</p><div class="sumore">${o.ore.map((v, t) => v >= 1 ? oreChip(t, v, '+') : '').join('')}</div>`, 'Collect', () => refreshTree());
}
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else welcomeBack(); });

// ---------- loop ----------
let last = performance.now(), acc = 0, hudT = 0;
function loop(now) {
  const dt = Math.min(0.25, (now - last) / 1000); last = now;
  if (mode === 'run') {
    acc += dt; while (acc >= 1 / 60) { G.stepRun(run, s, 1 / 60); acc -= 1 / 60; if (run.ended) break; }
    handleEvents(); breakSfx -= dt; hudT -= dt; if (hudT <= 0) { hudT = 0.05; runHud(); }
    if (run.ended) endRun();
  }
  if (mode === 'summary' && autoT > 0) { autoT -= dt; const a = $('#autot'); if (a) a.textContent = Math.ceil(autoT); if (autoT <= 0 && $('#modal').classList.contains('show')) { $('#modal').classList.remove('show'); launch(); } }
  scene.frame(mode === 'hub' ? null : run, 0); requestAnimationFrame(loop);
}
buildTree(); centerView(); addEventListener('resize', centerView); refreshTree(); welcomeBack();
if (!s.seenIntro) { s.seenIntro = true; modal(`<div class="mtitle">Geode Drift</div><p>Your little drill rig dives into an asteroid field. It <b>drills and zaps rocks by itself</b> until the timer runs out.</p><p>Spend the ore on the <b>upgrade web</b>: longer runs, stronger lasers, faster drills, richer rocks. Every run goes deeper. Break each zone's <b>Guardian</b> to reach new ores.</p>`, "Let's dig!"); }
requestAnimationFrame(loop);
window.__gd = { get s() { return s; }, get run() { return run; }, G, scene, launch, toHub, refreshTree, set sel(v) { sel = v; } };
