import * as G from './core.js';
import { Scene3D } from './render.js';
import { Sfx } from './sfx.js';

const KEY = 'geode-drift-save-v1';
const $ = s => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const fmt = G.fmt;
let s = G.load(localStorage.getItem(KEY) || '');
const sfx = new Sfx(); sfx.muted = !!s.muted;
const scene = new Scene3D($('#scene'));
let buyAmt = s.buyAmt || 1, tab = 'drones', lastFull = 0, toastQ = [];

function save() { s.lastSave = Date.now(); s.buyAmt = buyAmt; s.muted = sfx.muted; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
setInterval(save, 10000); addEventListener('beforeunload', save);

// ---------- offline ----------
function welcomeBack() {
  const o = G.applyOffline(s); if (o.seconds <= 0) return;
  modal(`<div class="mtitle">Welcome back!</div><p>Your drones kept mining for <b>${G.fmtTime(o.seconds)}</b>.</p>
    <div class="bigglow">+${fmt(o.gain)} shards</div>
    <p class="dim">${G.perk(s, 'sleep') ? 'Deep Sleep: 100% offline mining, up to 24h.' : 'Offline mining runs at 50% for up to 8h. The Deep Sleep perk (60 gems) makes it 100% / 24h.'}</p>`, 'Collect');
}
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else welcomeBack(); });

// ---------- HUD ----------
const ui = {
  shards: $('#shards'), rate: $('#rate'), stratum: $('#stratum'), sbar: $('#sbar i'), snext: $('#snext'), boost: $('#boost'),
  list: $('#list'), tabs: document.querySelectorAll('.tab'), amt: document.querySelectorAll('.amt button'), tap: $('#tapval'),
};
ui.tabs.forEach(b => b.onclick = () => { tab = b.dataset.tab; ui.tabs.forEach(x => x.classList.toggle('on', x === b)); sfx.ui(); full(); });
ui.amt.forEach(b => { b.classList.toggle('on', +b.dataset.n === buyAmt); b.onclick = () => { buyAmt = +b.dataset.n; ui.amt.forEach(x => x.classList.toggle('on', x === b)); sfx.ui(); full(); }; });
$('#mute').onclick = () => { sfx.muted = !sfx.muted; $('#mute').classList.toggle('off', sfx.muted); save(); };
$('#mute').classList.toggle('off', sfx.muted);

function popup(x, y, text, cls = '') {
  const p = el('div', 'pop ' + cls, text); p.style.left = x + 'px'; p.style.top = y + 'px';
  p.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px'); $('#fx').appendChild(p); setTimeout(() => p.remove(), 1100);
}
function toast(html, cls = '') {
  const t = el('div', 'toast ' + cls, html); $('#toasts').appendChild(t);
  requestAnimationFrame(() => t.classList.add('in')); setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 500); }, 4200);
}
function modal(html, ok = 'OK', onOk, cancel) {
  const m = $('#modal'); m.querySelector('.mbody').innerHTML = html; const b = m.querySelector('.mok'); b.textContent = ok;
  const c = m.querySelector('.mcancel'); c.style.display = cancel ? '' : 'none'; if (cancel) c.textContent = cancel;
  b.onclick = () => { m.classList.remove('show'); onOk && onOk(); sfx.ui(); }; c.onclick = () => { m.classList.remove('show'); sfx.ui(); };
  m.classList.add('show');
}

// ---------- tapping ----------
let tapCombo = 0, lastTap = 0;
$('#scene').addEventListener('pointerdown', e => {
  sfx.unlock();
  const h = scene.pick(e.clientX, e.clientY); if (!h) return;
  if (h.type === 'comet') return catchComet(h.point);
  const v = G.click(s, 1); scene.hitGeode(h.point);
  const now = performance.now(); tapCombo = now - lastTap < 450 ? Math.min(tapCombo + 1, 30) : 0; lastTap = now;
  popup(e.clientX, e.clientY - 10, '+' + fmt(v), tapCombo > 12 ? 'hot' : ''); sfx.tap(tapCombo);
});
addEventListener('keydown', e => { if (e.code === 'Space' && e.target === document.body) { e.preventDefault(); const v = G.click(s, 1); const r = scene.toScreen(scene.root.position); scene.hitGeode(scene.root.position.clone().add({ x: 0, y: 0.8, z: 1.2 })); popup(r.x, r.y - 80, '+' + fmt(v)); sfx.tap(0); } });

// ---------- comets ----------
let cometTimer = 45;
function catchComet(point) {
  const r = G.catchComet(s); scene.hideComet(); scene.burst(point, 40, 0xffd27a); scene.shockwave(0xffd27a); sfx.comet();
  const sp = scene.toScreen(point); popup(sp.x, sp.y, r.type === 'lump' ? '+' + fmt(r.value) : '★', 'gold big');
  toast(`<b>☄ ${r.text}</b>${r.type === 'lump' ? ' +' + fmt(r.value) + ' shards' : ''}`, 'gold');
}

// ---------- panel ----------
function droneIcon(g, gi) { const c = '#' + g.color.toString(16).padStart(6, '0'); return `<div class="dicon" style="--c:${c}"><span>${gi + 1}</span></div>`; }
function full() {
  lastFull = performance.now(); const L = ui.list; L.innerHTML = ''; L.dataset.tab = tab;
  document.querySelector('.amt').style.display = tab === 'drones' ? '' : 'none';
  if (tab === 'drones') {
    G.GENS.forEach((g, gi) => {
      if (!G.genUnlocked(s, gi)) { if (gi === 0 || G.genUnlocked(s, gi - 1)) L.appendChild(el('div', 'card locked', `<div class="dicon q"><span>?</span></div><div class="ctext"><div class="cname">Undiscovered drone</div><div class="cdesc">Mine ${fmt(g.cost * 0.5)} shards in this run to discover it.</div></div>`)); return; }
      const c = el('div', 'card drone'); c.dataset.gi = gi;
      c.innerHTML = `${droneIcon(g, gi)}<div class="ctext"><div class="cname">${g.name} <em class="own"></em></div><div class="cdesc">${g.desc}</div>
        <div class="mile"><i></i></div><div class="cstat"></div></div><button class="buy"><span class="bl"></span><b class="bc"></b></button>`;
      c.querySelector('.buy').onclick = ev => { const k = buyAmt === -1 ? G.maxAffordable(s, gi) : buyAmt; if (k > 0 && G.buyGen(s, gi, k)) { sfx.buy(); const r = ev.currentTarget.getBoundingClientRect(); popup(r.left + r.width / 2, r.top, '+' + k, 'cyan'); scene.shockwave(g.color); quick(); } else sfx.deny(); };
      L.appendChild(c);
    });
  } else if (tab === 'upgrades') {
    const av = G.availableUpgrades(s);
    const res = el('div', 'card reso'); L.appendChild(res);
    if (!av.length) L.appendChild(el('div', 'empty', 'New upgrades appear as you buy drones and mine deeper.'));
    const grid = el('div', 'ugrid'); L.appendChild(grid);
    av.slice(0, 40).forEach(u => {
      const b = el('button', 'upg k-' + u.kind); b.dataset.id = u.id;
      const col = u.kind === 'gen' ? '#' + G.GENS[u.gen].color.toString(16).padStart(6, '0') : u.kind === 'global' ? '#ffd27a' : u.kind === 'comet' ? '#ffb27a' : '#9fe7ff';
      b.style.setProperty('--c', col);
      b.innerHTML = `<div class="ug">${u.kind === 'gen' ? '×2' : u.kind === 'global' ? '×1.5' : u.kind === 'comet' ? '☄' : u.kind === 'click' ? '✦' : '%'}</div><div class="un">${u.name}</div><div class="ud">${u.desc}</div><div class="uc">${fmt(u.cost)}</div>`;
      b.onclick = () => { if (G.buyUpgrade(s, u.id)) { sfx.upgrade(); scene.shockwave(col); toast(`<b>${u.name}</b> unlocked`); full(); } else sfx.deny(); };
      grid.appendChild(b);
    });
    res.remove();
  } else if (tab === 'polish') {
    const g = G.gemsFor(s.runTotal, s);
    const hint = g >= Math.max(5, s.gems) ? '<span class="good">Great time to Polish — this at least doubles your gems!</span>' : g >= 1 ? 'You can Polish now. It gets better the deeper you mine.' : `Reach <b>${fmt(Math.pow(10, G.gemDepth(s) + 0.71))}</b> shards in a run to earn your first gem.`;
    L.appendChild(el('div', 'card prest', `<div class="ptitle">💎 Polish</div>
      <p>Polish the geode to reset this run's shards, drones and upgrades. You keep <b>Gems</b> forever: each one adds <b>+20%</b> to everything.</p>
      <div class="prow"><div><small>Gems</small><b>${fmt(s.gems)}</b></div><div><small>Multiplier</small><b>x${fmt(G.gemMult(s))}</b></div><div><small>On Polish</small><b class="glow">+${fmt(g)}</b></div></div>
      <p class="dim">${hint}</p><p class="dim">After every Polish you get <b>Afterglow</b>: x3 mining for the first 4 minutes.</p>
      <button class="pbtn" ${g < 1 ? 'disabled' : ''} id="dopolish">Polish for ${fmt(g)} gems</button>`));
    L.appendChild(el('div', 'sub', 'Gem milestones (never spent, never lost)'));
    G.POLISH_PERKS.forEach(p => L.appendChild(el('div', 'perk ' + (s.gemsEver >= p.at ? 'got' : ''), `<div class="pat">${p.at}💎</div><div><b>${p.name}</b><br><span>${p.desc}</span></div>`)));
    const b = $('#dopolish'); if (b) b.onclick = () => modal(`<div class="mtitle">Polish the geode?</div><p>You'll restart with <b>${fmt(s.gems + g)} gems</b> (x${fmt(G.gemMult({ ...s, gems: s.gems + g }))} to everything).</p>`, 'Polish!', doPolish, 'Not yet');
  } else if (tab === 'nova') {
    const need = G.novaNeed(s), p = G.novaPreview(s), ok = G.canNova(s);
    L.appendChild(el('div', 'card prest nova', `<div class="ptitle">🌟 Supernova</div>
      <p>Collapse everything into a star. Your Gem multiplier is locked in as <b>Stardust power at 125%</b>, then gems restart from zero and stack on top. A Supernova <b>always</b> leaves you stronger.</p>
      <div class="prow"><div><small>Stardust</small><b>${fmt(s.dust)}</b></div><div><small>Star power</small><b>x${fmt(s.novaMult)}</b></div><div><small>After Nova</small><b class="glow">x${fmt(p.mult)}</b></div></div>
      <p class="dim">Needs <b>${fmt(need)}</b> gems (you have ${fmt(s.gems)}). Gives +${fmt(p.dust)} Stardust for star perks.</p>
      <button class="pbtn nova" ${ok ? '' : 'disabled'} id="donova">${ok ? 'Go Supernova!' : `Need ${fmt(need)} gems`}</button>`));
    L.appendChild(el('div', 'sub', 'Stardust milestones'));
    G.NOVA_PERKS.forEach(q => L.appendChild(el('div', 'perk ' + (s.dustEver >= q.at ? 'got' : ''), `<div class="pat">${q.at}✨</div><div><b>${q.name}</b><br><span>${q.desc}</span></div>`)));
    if (G.perk(s, 'dauto')) { const t = el('label', 'toggle', `<input type="checkbox" ${s.autoPolish ? 'checked' : ''}> Auto-Polish when gems would double`); t.querySelector('input').onchange = e => { s.autoPolish = e.target.checked; }; L.appendChild(t); }
    const b = $('#donova'); if (b) b.onclick = () => modal(`<div class="mtitle">Go Supernova?</div><p>Gems reset to 0, but your star power becomes <b>x${fmt(p.mult)}</b> (now x${fmt(p.now)}).</p>`, 'Supernova!', doNova, 'Not yet');
  } else if (tab === 'stats') {
    const st = [['Shards this run', fmt(s.runTotal)], ['Shards all time', fmt(s.lifetime)], ['Taps', fmt(s.clicks)], ['Time played', G.fmtTime(s.played)], ['This run', G.fmtTime(s.runTime)], ['Polishes', s.polishes], ['Supernovas', s.novas], ['Best rate', fmt(s.best.rate) + '/s'], ['Tap power', fmt(G.clickValue(s))], ['Deepest layer', G.STRATA[s.stratum].name]];
    L.appendChild(el('div', 'card stats', st.map(([a, b]) => `<div><small>${a}</small><b>${b}</b></div>`).join('')));
    const tg = (label, key, perkId) => { if (!G.perk(s, perkId)) return; const t = el('label', 'toggle', `<input type="checkbox" ${s[key] ? 'checked' : ''}> ${label}`); t.querySelector('input').onchange = e => { s[key] = e.target.checked; }; L.appendChild(t); };
    tg('Drone autobuyer', 'autoOn', 'auto'); tg('Upgrade autobuyer', 'autoUOn', 'autoU');
    const row = el('div', 'btnrow'); L.appendChild(row);
    const mk = (t, f, cls = '') => { const b = el('button', 'sbtn ' + cls, t); b.onclick = f; row.appendChild(b); };
    mk('Export save', () => { save(); const code = btoa(unescape(encodeURIComponent(localStorage.getItem(KEY)))); navigator.clipboard?.writeText(code).catch(() => {}); modal(`<div class="mtitle">Your save</div><p class="dim">Copied to the clipboard. Keep it somewhere safe.</p><textarea readonly>${code}</textarea>`); });
    mk('Import save', () => { modal(`<div class="mtitle">Import save</div><textarea id="imp" placeholder="Paste a save code"></textarea>`, 'Import', () => { try { const j = decodeURIComponent(escape(atob($('#imp').value.trim()))); const n = G.load(j); if (n.v) { s = n; save(); location.reload(); } } catch { toast('That code did not work'); } }, 'Cancel'); });
    mk('Reset everything', () => modal('<div class="mtitle">Reset everything?</div><p>This wipes all progress, gems and stardust.</p>', 'Reset', () => { localStorage.removeItem(KEY); s = G.newState(); location.reload(); }, 'Cancel'), 'danger');
    L.appendChild(el('div', 'dim small', 'Geode Drift v1.0 · autosaves every 10s · Space bar taps too'));
  }
  quick();
}
function quick() {
  ui.shards.textContent = fmt(s.shards); ui.rate.textContent = fmt(G.rate(s)) + ' / sec'; ui.tap.textContent = fmt(G.clickValue(s));
  const si = G.stratumIndex(s.runTotal), cur = G.STRATA[si], nx = G.STRATA[si + 1];
  ui.stratum.textContent = cur.name; ui.stratum.style.setProperty('--c', '#' + cur.hue.toString(16).padStart(6, '0'));
  if (nx) { const a = Math.log10(Math.max(1, cur.at)), b = Math.log10(nx.at), c = Math.log10(Math.max(1, s.runTotal)); ui.sbar.style.width = Math.max(0, Math.min(100, (c - a) / (b - a) * 100)) + '%'; ui.snext.textContent = `Next: ${nx.name} at ${fmt(nx.at)} (x${G.STRATUM_MULT} all)`; }
  const bm = s.boost, ag = G.afterglow(s) > 1;
  ui.boost.innerHTML = (bm ? `<div class="chip gold">${bm.kind === 'frenzy' ? '☄ Frenzy x' + bm.mult : '✦ Taps x' + bm.mult} · ${Math.ceil(bm.left)}s<i style="width:${bm.left / bm.total * 100}%"></i></div>` : '') + (ag ? `<div class="chip glow">✨ Afterglow x3 · ${Math.ceil(G.AFTERGLOW - s.runTime)}s</div>` : '');
  scene.frenzy = !!(bm && bm.kind === 'frenzy');
  // badge for prestige tabs
  document.querySelector('.tab[data-tab=polish]').classList.toggle('ping', G.gemsFor(s.runTotal, s) >= Math.max(5, s.gems));
  document.querySelector('.tab[data-tab=nova]').classList.toggle('ping', G.canNova(s));
  document.querySelector('.tab[data-tab=upgrades]').classList.toggle('ping', G.availableUpgrades(s).some(u => s.shards >= u.cost));
  if (tab === 'drones') ui.list.querySelectorAll('.drone').forEach(c => {
    const gi = +c.dataset.gi, g = G.GENS[gi], n = s.gens[gi];
    const k = buyAmt === -1 ? Math.max(1, G.maxAffordable(s, gi)) : buyAmt, cost = G.costOfN(s, gi, k);
    c.querySelector('.own').textContent = n; c.querySelector('.bc').textContent = fmt(cost); c.querySelector('.bl').textContent = 'Buy ' + (buyAmt === -1 ? 'max ' + k : 'x' + k);
    c.querySelector('.buy').classList.toggle('can', s.shards >= cost);
    const nm = G.nextMilestone(n), pm = [...G.MILESTONES].reverse().find(x => x <= n) || 0;
    c.querySelector('.mile i').style.width = nm ? ((n - pm) / (nm - pm) * 100) + '%' : '100%';
    const r = G.genRate(s, gi) * G.globalMult(s) * G.boostMult(s);
    c.querySelector('.cstat').innerHTML = `<span>${fmt(r)}/s</span><span class="dim">${nm ? `x2 at ${nm} owned` : 'max milestones'}</span>`;
  });
  if (tab === 'upgrades') ui.list.querySelectorAll('.upg').forEach(b => b.classList.toggle('can', s.shards >= G.UPG_BY_ID[b.dataset.id].cost));
  if (tab === 'polish') { const b = $('#dopolish'); if (b) { const g = G.gemsFor(s.runTotal, s); b.textContent = `Polish for ${fmt(g)} gems`; b.disabled = g < 1; } }
}
function doPolish() {
  const g = G.polish(s); scene.shockwave(0x9fe7ff, true); sfx.prestige(); toast(`<b>💎 Polished! +${fmt(g)} gems</b> · x${fmt(G.gemMult(s))} to everything`, 'glow');
  const p = G.POLISH_PERKS.filter(q => q.at <= s.gemsEver && q.at > s.gemsEver - g); p.forEach(q => toast(`<b>New perk: ${q.name}</b><br>${q.desc}`, 'glow'));
  scene.setStratum(s.stratum); save(); full();
}
function doNova() { const d = G.nova(s); scene.shockwave(0xffe08a, true); sfx.nova(); toast(`<b>🌟 SUPERNOVA! +${d} stardust</b> · star power x${fmt(s.novaMult)}`, 'gold'); scene.setStratum(s.stratum); save(); full(); }

// ---------- loop ----------
let acc = 0, last = performance.now(), beat = 0;
const evs = [];
function loop(now) {
  const dt = Math.min(1, (now - last) / 1000); last = now; acc += dt;
  if (acc >= 0.1) {
    const step = acc; acc = 0; const before = s.polishes; G.tick(s, step, evs);
    cometTimer -= step;
    if (cometTimer <= 0) { scene.spawnComet(); cometTimer = G.cometInterval(s) * (0.7 + Math.random() * 0.6); sfx.whoosh(); }
    for (const e of evs.splice(0)) {
      if (e.type === 'stratum') { scene.setStratum(e.index); scene.shockwave(G.STRATA[e.index].hue, true); sfx.stratum(); toast(`<b>⛏ New layer: ${G.STRATA[e.index].name}</b><br>All mining x${G.STRATUM_MULT}!`, 'glow'); }
      if (e.type === 'autopolish') { toast(`<b>Auto-Polish</b> +${e.gems} gems`); scene.setStratum(s.stratum); }
    }
    if (s.polishes !== before) full();
    scene.setDrones(s.gens);
    beat += step; if (beat > 0.25) { beat = 0; quick(); if (performance.now() - lastFull > 3000 && tab !== 'stats') full(); }
    const at = G.autoTapsPerSec(s); if (at && Math.random() < step * at) scene.hitGeode(scene.root.position.clone().add({ x: (Math.random() - .5) * 2, y: (Math.random() - .5) * 2, z: 1.2 }));
  }
  scene.frame(); requestAnimationFrame(loop);
}
// first boot
scene.setStratum(G.stratumIndex(s.runTotal)); scene.setDrones(s.gens); s.stratum = Math.max(s.stratum, G.stratumIndex(s.runTotal));
full(); welcomeBack();
if (s.played < 1 && !s.seenIntro) { s.seenIntro = true; modal(`<div class="mtitle">Geode Drift</div><p>A tiny geode is drifting through space, full of crystals.</p><p><b>Tap the geode</b> to chip off shards, build drones that mine for you, and dig through glowing layers all the way to its starry heart.</p>`, "Let's mine!"); }
requestAnimationFrame(loop);
window.__gd = { get s() { return s; }, G, scene, full };
