import * as G from './core.js';
import { Scene3D } from './render.js';
import { Sfx } from './sfx.js';

const KEY = 'geode-drift-save-v3';
const $ = q => document.querySelector(q);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const fmt = G.fmt, hex = c => '#' + c.toString(16).padStart(6, '0');
let s = G.load(localStorage.getItem(KEY) || '');
const sfx = new Sfx(); sfx.muted = !!s.muted;
const scene = new Scene3D($('#scene'));
let mode = 'hub', run = null, sel = null, autoT = 0;
function save() { s.lastSave = Date.now(); s.muted = sfx.muted; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
setInterval(() => { if (mode !== 'run') save(); }, 10000); addEventListener('beforeunload', save);

const CAST = { pip: ['Pip', 'pip.jpg', '#ffb36a'], bolt: ['Bolt', 'bolt.jpg', '#9fe7ff'], nova: ['Captain Nova', 'nova.jpg', '#ffd27a'] };
const LORE = [
  'Starling crashed on a lonely asteroid. Before anything else, the hull needs patching. Dust ore will do for now.',
  'The engine is cold. Bolt detected one of our lost helper drones somewhere below 20m. Find it!',
  'A huge crystal Guardian blocks the way into the Copper Reef. Dodge its shards and shatter it.',
  'Copper glitters everywhere. Bolt wants to rebuild the cockpit, and more drones are out there, lost and beeping.',
  'The Cobalt Caverns hide old artifacts left by ancient miners. Break a glowing purple Artifact Geode.',
  'Captain Nova has something important to tell you once you reach the Heart of Gold.',
  'Time to try Bolt\'s wild idea: fold the rig into a tiny star. Go Supernova, then dive back down even stronger.',
  'The warp coil needs crystal energy. Collect artifacts and bring the lost drones home.',
  'Starsteel is the toughest metal in the Drift. Two Guardians stand guard, and you need more stardust.',
  'The Starheart sleeps in the Void Rift. This is it, Captain. Bring it home to Lumen.',
];

// ---------- helpers ----------
function popup(x, y, text, color = '#fff', cls = '') { const p = el('div', 'pop ' + cls, text); p.style.left = x + 'px'; p.style.top = y + 'px'; p.style.color = color; p.style.setProperty('--dx', (Math.random() * 50 - 25) + 'px'); $('#fx').appendChild(p); setTimeout(() => p.remove(), 1100); }
function toast(html, cls = '') { const t = el('div', 'toast ' + cls, html); $('#toasts').appendChild(t); requestAnimationFrame(() => t.classList.add('in')); setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 500); }, 3600); }
function modal(html, ok = 'OK', onOk, cancel, onCancel, wide) {
  const m = $('#modal'); m.querySelector('.mbody').innerHTML = html; m.querySelector('.mcard').classList.toggle('wide', !!wide); const b = m.querySelector('.mok'), c = m.querySelector('.mcancel');
  b.textContent = ok; c.style.display = cancel ? '' : 'none'; if (cancel) c.textContent = cancel;
  b.onclick = () => { m.classList.remove('show'); sfx.ui(); onOk && onOk(); }; c.onclick = () => { m.classList.remove('show'); sfx.ui(); onCancel && onCancel(); };
  m.classList.add('show');
}
const modalOpen = () => $('#modal').classList.contains('show');
const oreChip = (t, v, plus = '') => `<span class="ore" style="--c:${hex(G.ORES[t].color)}"><i></i>${plus}${fmt(v)} <em>${G.ORES[t].name}</em></span>`;
function vfx(cls) { const v = $('#vignette'); v.className = cls; setTimeout(() => v.className = '', 60); }

// ---------- dialogue ----------
let dq = [], dDone = null, dTyping = null;
function say(lines, done) { dq = lines.slice(); dDone = done; $('#dialog').classList.remove('hide'); nextLine(); }
function nextLine() {
  if (dTyping) { clearInterval(dTyping.iv); $('#dtext').textContent = dTyping.full; dTyping = null; return; }
  const l = dq.shift(); if (!l) { $('#dialog').classList.add('hide'); const d = dDone; dDone = null; d && d(); return; }
  const [who, text] = l, c = CAST[who]; $('#dport').src = c[1]; $('#dport').style.borderColor = c[2]; $('#dname').textContent = c[0]; $('#dname').style.color = c[2];
  const box = $('#dtext'); box.textContent = ''; let i = 0; sfx.tap?.();
  dTyping = { full: text, iv: setInterval(() => { i += 2; box.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(dTyping.iv); dTyping = null; } }, 22) };
}
$('#dialog').onclick = () => { sfx.ui(); nextLine(); };
const dialogOpen = () => !$('#dialog').classList.contains('hide');

// ---------- upgrade web ----------
const GRID = 118, tree = $('#tree'), svg = $('#links'); let view = { x: 0, y: 0, z: 1 };
const ICON = { t: '⏱', d: '✦', r: '⛏', a: '◎', e: '◆', u: '⚙', rig: '★', mods: '🧰', ap: '🧭', mc: '⚡', mm: '🚀', mg: '🧲', ms: '⚙', mh: '🛡', slot3: '🧰', slot4: '🧰' };
const icon = n => ICON[n.id] || ICON[n.id[0]];
const nodeEls = {};
function buildTree() {
  G.TREE.forEach(n => {
    const b = el('button', 'node', `<span class="ic">${icon(n)}</span><span class="lv"></span>`);
    b.style.left = n.x * GRID + 'px'; b.style.top = n.y * GRID + 'px'; b.dataset.id = n.id;
    b.onclick = e => { e.stopPropagation(); if (sel === n.id && G.canBuy(s, n)) buy(n.id); else { sel = n.id; sfx.ui(); refreshTree(); } };
    tree.appendChild(b); nodeEls[n.id] = b;
  });
}
function buy(id) {
  if (!G.buyNode(s, id)) { sfx.deny(); return; }
  const n = G.NODE[id], b = nodeEls[id].getBoundingClientRect(); sfx.upgrade(); popup(b.left + b.width / 2, b.top, `${n.name} ${G.lvl(s, id)}/${n.max}`, '#9fe7ff');
  nodeEls[id].classList.remove('pulse'); void nodeEls[id].offsetWidth; nodeEls[id].classList.add('pulse');
  if (id === 'mods' || id === 'slot3' || id === 'slot4') toast('<b>🧰 New module slot!</b> Equip another module in the Loadout', 'glow');
  save(); refreshTree();
}
const wallet = () => G.ORES.map((o, t) => s.oreEver[t] > 0 || t === 0 ? oreChip(t, s.ore[t]) : '').join('');
function refreshTree() {
  let lines = '';
  G.TREE.forEach(n => {
    const b = nodeEls[n.id], vis = G.nodeVisible(s, n), L = G.lvl(s, n.id), can = G.canBuy(s, n), col = hex(G.ORES[n.cost[0]].color);
    b.style.display = (vis || n.req.some(r => G.nodeVisible(s, G.NODE[r]))) && (!n.mod || s.mods.includes(n.mod)) ? '' : 'none';
    b.className = 'node' + (vis ? '' : ' locked') + (L ? ' owned' : '') + (L >= n.max ? ' maxed' : '') + (can ? ' can' : '') + (sel === n.id ? ' sel' : '');
    b.style.setProperty('--c', col); b.querySelector('.lv').textContent = n.max > 1 ? (n.max > 100 ? `${L}` : `${L}/${n.max}`) : L ? '✓' : '';
    for (const r of n.req) { const p = G.NODE[r]; if (b.style.display === 'none' || nodeEls[r].style.display === 'none') continue;
      lines += `<line x1="${p.x * GRID}" y1="${p.y * GRID}" x2="${n.x * GRID}" y2="${n.y * GRID}" class="${L ? 'on' : vis ? 'vis' : ''}" style="stroke:${L ? col : ''}"/>`; }
  });
  svg.innerHTML = lines; $('#twallet').innerHTML = wallet();
  const c = $('#nodecard');
  if (sel) { const n = G.NODE[sel], L = G.lvl(s, sel), vis = G.nodeVisible(s, n), cost = G.nodeCost(s, n);
    c.classList.remove('hide');
    c.innerHTML = `<div class="nt">${icon(n)} ${n.name} <span>${n.max > 1 ? `Level ${L}${n.max < 100 ? '/' + n.max : ''}` : L ? 'Owned' : ''}</span></div><div class="nd">${n.desc}</div>
      ${!vis ? `<div class="nl">Unlock a connected node first</div>` : L >= n.max ? '<div class="nl good">Maxed out!</div>' : `<button class="nbuy ${G.canBuy(s, n) ? 'can' : ''}">${oreChip(n.cost[0], cost)}<b>${G.canBuy(s, n) ? 'Buy' : 'Need more'}</b></button>`}`;
    const nb = c.querySelector('.nbuy'); if (nb) nb.onclick = () => buy(sel);
  } else c.classList.add('hide');
  refreshHub();
}
function applyView() { tree.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.z})`; }
function centerView() { view = { x: innerWidth * 0.5, y: innerHeight * 0.47, z: Math.min(0.9, innerHeight / 1250) }; applyView(); }
(() => { const w = $('#treewrap'); let drag = null;
  w.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false }; });
  addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; view.x = drag.vx + dx; view.y = drag.vy + dy; applyView(); });
  addEventListener('pointerup', e => { if (drag && !drag.moved && e.target === w) { sel = null; refreshTree(); } drag = null; });
  w.addEventListener('wheel', e => { e.preventDefault(); const z = Math.max(0.35, Math.min(1.6, view.z * (e.deltaY < 0 ? 1.1 : 0.9))); view.x = e.clientX - (e.clientX - view.x) * z / view.z; view.y = e.clientY - (e.clientY - view.y) * z / view.z; view.z = z; applyView(); }, { passive: false });
})();
function openTree() { $('#treeview').classList.remove('hide'); mode = 'tree'; sfx.ui(); refreshTree(); }
function closeTree() { $('#treeview').classList.add('hide'); mode = 'hub'; sel = null; refreshTree(); }
$('#treebtn').onclick = openTree; $('#treeclose').onclick = closeTree; $('#treelaunch').onclick = () => { closeTree(); launch(); };

// ---------- hub: missions + ship ----------
function goalHtml(g) { const [p, m, label] = G.goalProgress(s, g), done = p >= m;
  return `<div class="goal ${done ? 'done' : ''}"><span class="ck">${done ? '✓' : ''}</span><div style="flex:1">${label}${m > 1 ? `<div class="gb"><i style="width:${Math.min(100, p / m * 100)}%"></i></div>` : ''}</div><span class="gp">${m > 1 ? `${fmt(p)}/${fmt(m)}` : ''}</span></div>`; }
function refreshHub() {
  $('#wallet').innerHTML = wallet();
  const c = G.chapter(s), done = G.chapterDone(s);
  let h;
  if (c) { const r = c.reward;
    h = `<div class="mhead">CHAPTER ${s.chapter + 1} OF ${G.CHAPTERS.length}</div><div class="mch">${c.title}</div><div class="mlore">${LORE[s.chapter]}</div>${c.goals.map(goalHtml).join('')}
      <div class="mreward">Reward: 🛠 ${G.PARTS[c.part]}${r.mod ? ` · ${G.MODULES[r.mod].icon} ${G.MODULES[r.mod].name}` : ''}${r.ore ? ` · ${fmt(r.ore[1])} ${G.ORES[r.ore[0]].name}` : ''}</div>`;
  } else { const g = G.endlessGoal(s);
    h = `<div class="mhead">ENDLESS · DEEP RIFT CONTRACT #${s.endless + 1}</div><div class="mch">Explore the Deep Rifts</div><div class="mlore">Starling is whole and Lumen shines again! The Drift keeps going down. Every contract you finish pays out in rare ore.</div>${goalHtml(g)}<div class="mreward">Reward: ${fmt(200 * (1 + s.endless))} ${G.ORES[Math.min(6, s.bossEver)].name}</div>`; }
  if (done) h += `<button id="claim">✓ Claim reward</button>`;
  $('#missions').innerHTML = h; const cb = $('#claim'); if (cb) cb.onclick = claim;
  $('#shipcard').innerHTML = `<div class="mhead">STARSHIP STARLING</div><div class="mch" style="font-size:18px">${s.parts}/${G.PARTS.length} parts rebuilt</div><div class="sbar"><i style="width:${s.parts / G.PARTS.length * 100}%"></i></div>
    <div class="parts">${G.PARTS.map((p, i) => `<span class="${i < s.parts ? 'ok' : ''}">${p}</span>`).join('')}</div>
    <div class="dim" style="margin-top:10px">Drones rescued: <b>${s.pods}</b> · Artifacts: <b>${Object.keys(s.artifacts).length}/${G.ARTIFACTS.length}</b></div>`;
  const st = G.stats(s), aff = G.TREE.filter(n => G.canBuy(s, n)).length;
  $('#treecount').textContent = aff ? aff : '';
  $('#launchsub').textContent = `${Math.round(st.time)}s run${st.launch && s.bestDepth ? ` · start ${Math.min(st.launch, Math.floor(s.bestDepth * 0.6))}m` : ''}`;
  $('#recs').innerHTML = `Record <b>${fmt(s.bestDepth)}m</b> · ${G.zoneName(Math.floor(s.bestDepth / G.ZONE_LEN))} · Runs ${s.runs}${s.dust ? ` · ✨${fmt(s.dust)} stardust (x${fmt(G.starMult(s))})` : ''}`;
  const novaUnlocked = s.chapter >= 5 || s.novas;
  $('#novabtn').style.display = novaUnlocked ? '' : 'none'; $('#novabtn').classList.toggle('ready', G.canNova(s) && (G.dustFor(s) >= s.dust * 2 + 5 || s.noRec >= 3 || (s.chapter === 6 && !s.novas)));
  $('#loadbtn').style.display = s.mods.length ? '' : 'none'; $('#artbtn').style.display = Object.keys(s.artifacts).length ? '' : 'none';
}
function claim() {
  const c = G.claimChapter(s); if (!c) return; sfx.prestige?.(); save();
  if (c.endless) { toast(`<b>Contract complete!</b> ${oreChip(c.ore[0], c.ore[1], '+')}`, 'gold'); refreshTree(); return; }
  scene.setCamp(true, s.parts - 1); refreshTree();
  setTimeout(() => { scene.setCamp(true, s.parts); scene.partPop(s.parts - 1); sfx.nova(); toast(`<b>🛠 ${G.PARTS[c.part]} rebuilt!</b>${c.reward.mod ? `<br>New module: ${G.MODULES[c.reward.mod].icon} ${G.MODULES[c.reward.mod].name}` : ''}`, 'gold');
    setTimeout(() => say(c.talk, () => { if (s.chapter >= G.CHAPTERS.length) toast('<b>🌟 THE END... or is it?</b><br>Endless Deep Rift contracts unlocked', 'gold'); refreshTree(); }), 900); }, 400);
}

// ---------- loadout + artifacts ----------
$('#loadbtn').onclick = () => {
  const n = G.slots(s);
  const draw = () => { $('#lgrid').innerHTML = Object.entries(G.MODULES).map(([id, m]) => { const has = s.mods.includes(id), on = s.loadout.slice(0, n).includes(id);
    return `<div class="lslot ${on ? 'on' : ''} ${has ? '' : 'lock'}" data-id="${id}"><span class="li">${has ? m.icon : '🔒'}</span><b>${has ? m.name : '???'}</b><small>${has ? m.desc : 'Found later in the story'}</small></div>`; }).join('');
    $('#lslots').textContent = `${Math.min(n, s.loadout.length)}/${n} slots used`;
    document.querySelectorAll('.lslot').forEach(d => d.onclick = () => { const id = d.dataset.id; if (!s.mods.includes(id)) return; s.loadout = s.loadout.slice(0, n);
      if (s.loadout.includes(id)) s.loadout = s.loadout.filter(x => x !== id); else if (s.loadout.length < n) s.loadout.push(id); else { s.loadout.shift(); s.loadout.push(id); } sfx.ui(); save(); draw(); }); };
  modal(`<div class="mtitle">🧰 Loadout</div><p class="dim">Pick which modules your rig carries. <b id="lslots"></b>. More slots come from Module Rack nodes in the upgrade web.</p><div class="lgrid" id="lgrid"></div>`, 'Done', () => refreshTree(), null, null, true); draw();
};
$('#artbtn').onclick = () => modal(`<div class="mtitle">🔮 Artifacts</div><p class="dim">Rare treasures from glowing purple Artifact Geodes. Each one works forever, even after a Supernova.</p>
  <div class="lgrid">${G.ARTIFACTS.map(a => s.artifacts[a.id] ? `<div class="lslot on"><span class="li">${a.icon}</span><b>${a.name}</b><small>${a.desc}</small></div>` : `<div class="lslot lock"><span class="li">❔</span><b>???</b><small>Not found yet</small></div>`).join('')}</div>`, 'Close', null, null, null, true);

// ---------- run ----------
const keys = new Set();
function readInput() { if (!run) return; const L = keys.has('KeyA') || keys.has('ArrowLeft'), R = keys.has('KeyD') || keys.has('ArrowRight'), U = keys.has('KeyW') || keys.has('ArrowUp'), D = keys.has('KeyS') || keys.has('ArrowDown');
  run.input.x = (R ? 1 : 0) - (L ? 1 : 0); run.input.y = (D ? 1 : 0) - (U ? 1 : 0); }
function launch() {
  if (dialogOpen()) return;
  sfx.unlock(); sfx.launch(); run = G.startRun(s); mode = 'run'; scene.setCamp(false); scene.clearRun(); scene.setZone(Math.floor(run.depth / G.ZONE_LEN));
  $('#hub').classList.add('hide'); $('#treeview').classList.add('hide'); $('#runhud').classList.remove('hide'); $('#hint').style.opacity = s.runs < 4 ? 1 : 0; lastZone = -1;
  $('#modsbar').innerHTML = s.loadout.slice(0, G.slots(s)).map(m => `<div class="mod" data-m="${m}">${G.MODULES[m].icon}<i></i></div>`).join('');
  readInput();
}
let lastZone = -1, breakSfx = 0;
function runHud() {
  const left = Math.max(0, run.tmax - run.t);
  $('#tsec').textContent = left.toFixed(1); $('#tbar i').style.width = Math.min(100, left / run.tmax * 100) + '%'; $('#timer').classList.toggle('low', left < 5);
  $('#depth').innerHTML = `${Math.floor(run.depth)}<small>m</small>`;
  const z = Math.floor(run.depth / G.ZONE_LEN); if (z !== lastZone) { if (lastZone >= 0 && z > lastZone) { toast(`<b>Entering ${G.zoneName(z)}</b>`, 'glow'); sfx.stratum?.(); } lastZone = z; scene.setZone(z); $('#zone').textContent = G.zoneName(z); $('#zone').style.color = hex(G.zoneHue(z)); }
  $('#gbar i').style.width = ((run.depth % G.ZONE_LEN) / G.ZONE_LEN * 100) + '%'; $('#gnext').textContent = `Guardian at ${(z + 1) * G.ZONE_LEN}m`;
  $('#best').innerHTML = run.depth > s.bestDepth && s.bestDepth > 0 ? '<b class="good">★ New record!</b>' : `Record ${Math.floor(s.bestDepth)}m`;
  const c = G.chapter(s); $('#rmission').innerHTML = c ? `<b>Mission:</b> ${c.goals.map(g => { const [p, m, l] = G.goalProgress(s, g); return (p >= m ? '✓ ' : '· ') + l; }).join('<br>')}` : `<b>Contract:</b> ${G.goalProgress(s, G.endlessGoal(s))[2]}`;
  $('#runore').innerHTML = run.ore.map((v, t) => v > 0 ? oreChip(t, v, '+') : '').join('') + (run.pods ? `<span class="ore" style="--c:#9fe7ff"><i></i>${run.pods} <em>drones</em></span>` : '') + (run.arts.length ? `<span class="ore" style="--c:#d08aff"><i></i>${run.arts.length} <em>artifact</em></span>` : '');
  const cm = $('#combo'); cm.classList.toggle('on', run.combo >= 5); cm.querySelector('b').textContent = `x${run.combo}`; cm.querySelector('.cb i').style.width = Math.max(0, run.comboT / 1.8 * 100) + '%';
  const st = run.st; document.querySelectorAll('.mod').forEach(d => { const m = d.dataset.m; let k = 1;
    if (m === 'chain' && st.chain) k = 1 - Math.max(0, run.chainT) / st.chain.cd; if (m === 'missile' && st.missile) k = 1 - Math.max(0, run.missT) / st.missile.cd; if (m === 'shield') k = run.shieldT <= 0 ? 1 : 1 - run.shieldT / st.shield;
    d.querySelector('i').style.height = (k * 100) + '%'; d.classList.toggle('ready', k >= 1); });
  const bb = $('#bossbar'); if (run.boss) { bb.classList.remove('hide'); $('#bossname').textContent = `${G.zoneName(run.boss.zone)} Guardian`; $('#bossbar i').style.width = Math.max(0, run.boss.hp / run.boss.max * 100) + '%'; $('#bossphase').textContent = ['PHASE 1 · SHARD RING', 'PHASE 2 · AIMED VOLLEYS', 'PHASE 3 · CRYSTAL STORM'][run.boss.phase || 0] + ' · dodge with WASD'; } else bb.classList.add('hide');
}
function at(rk) { return scene.toScreen(scene.rockWorld(rk)); }
function handleEvents() {
  for (const e of run.ev) {
    if (e.type === 'break') { const p = at(e.rock); scene.onBreak(e.rock); if (e.amt > 0) popup(p.x, p.y, '+' + fmt(e.amt), hex(G.ORES[e.rock.tier].color)); if (breakSfx <= 0) { sfx.crack(e.rock.tier); breakSfx = 0.05; } if (e.combo && e.combo % 25 === 0) { popup(innerWidth - 110, innerHeight - 170, `COMBO x${e.combo}!`, '#ffb36a', 'big'); scene.shake = Math.max(scene.shake, 0.25); } }
    if (e.type === 'lucky') { const p = at(e.rock); popup(p.x, p.y - 30, 'x2!', '#ffd27a', 'big'); }
    if (e.type === 'capsule') { const p = at(e.rock); popup(p.x, p.y - 20, `+${e.sec}s`, '#5fe7ff', 'big'); sfx.comet?.(); }
    if (e.type === 'pod') { const p = at(e.rock); popup(p.x, p.y - 20, 'DRONE SAVED!', '#9fe7ff', 'big'); sfx.buy?.(); toast('<b>🤖 Lost drone rescued!</b> It beeps happily and flies home', 'glow'); }
    if (e.type === 'artifact') { const p = at(e.rock); popup(p.x, p.y - 20, e.art.icon + ' ARTIFACT!', '#d08aff', 'big'); sfx.prestige?.(); scene.flash = 0.8; toast(`<b>${e.art.icon} ${e.art.name}</b><br>${e.art.desc}`, 'gold'); }
    if (e.type === 'boom') { scene.burst(scene.rockWorld(e.rock), 40, 0xff3355, 1.6); scene.shake = Math.max(scene.shake, 0.5); scene.flash = 0.4; }
    if (e.type === 'hurt') { scene.shake = Math.max(scene.shake, 0.8); vfx('hurt'); sfx.deny(); popup(innerWidth / 2, 150, `-${e.sec}s`, '#ff6a8a', 'big'); }
    if (e.type === 'shield') { vfx('shield'); popup(innerWidth / 2, 150, '🛡 BLOCKED', '#9fe7ff', 'big'); sfx.ui(); }
    if (e.type === 'chain') { scene.lightning(e.path); sfx.tap?.(); }
    if (e.type === 'missile') { scene.missile({ x: run.x, y: run.depth }, e.to); sfx.whoosh?.(); }
    if (e.type === 'boss') { sfx.boss(); toast(`<b>⚠ ${G.zoneName(e.boss.zone)} Guardian!</b><br>Dodge its crystal shards with WASD`, 'gold'); scene.shake = 0.8; }
    if (e.type === 'bossdown') { sfx.nova(); scene.bossDown(e.boss); toast(`<b>Guardian shattered!</b> ${oreChip(e.tier, e.amt, '+')}<br>${G.zoneName(e.boss.zone + 1)} is open`, 'glow'); }
  }
  run.ev.length = 0;
}
function endRun() {
  const sum = run.summary; mode = 'summary'; sfx.end(); save();
  const pct = sum.prevBest > 0 ? Math.round((sum.depth / sum.prevBest - 1) * 100) : 0;
  const affordable = G.TREE.filter(n => G.canBuy(s, n)).length, ready = G.chapterDone(s);
  const auto = G.lvl(s, 'u1') && s.autoRelaunch && !ready;
  modal(`<div class="mtitle">Run complete</div>
    <div class="sumdepth">${Math.floor(sum.depth)}<small>m</small>${sum.record ? '<span class="rec">★ NEW RECORD' + (pct > 0 ? ` +${pct}%` : '') + '</span>' : ''}</div>
    <div class="sumgrid"><div><small>Zone</small><b>${G.zoneName(sum.zone)}</b></div><div><small>Rocks</small><b>${sum.broken}</b></div><div><small>Guardians</small><b>${sum.bosses}</b></div><div><small>Best combo</small><b>x${sum.bestCombo}</b></div>${sum.pods ? `<div><small>Drones saved</small><b>🤖 ${sum.pods}</b></div>` : ''}${sum.arts.length ? `<div><small>Artifacts</small><b>🔮 ${sum.arts.length}</b></div>` : ''}${sum.hits ? `<div><small>Hits taken</small><b>${sum.hits}</b></div>` : ''}</div>
    <div class="sumore">${sum.ore.map((v, t) => v > 0 ? oreChip(t, v, '+') : '').join('') || '<span class="dim">No ore this time</span>'}</div>
    <p class="dim">${ready ? '<b class="good">✓ Mission complete!</b> Claim your reward at camp. ' : ''}${affordable ? `<b class="good">${affordable} upgrade${affordable > 1 ? 's' : ''} ready</b> in the web.` : 'Save up for your next upgrade, or launch again.'}${auto ? ' Auto-relaunch in <b id="autot">4</b>s…' : ''}</p>`,
    ready ? 'Back to camp' : 'Upgrade web', () => { toHub(); if (!ready && affordable) openTree(); }, 'Launch again ▶', () => { autoT = 0; launch(); });
  autoT = auto ? 4 : 0;
}
function toHub() { mode = 'hub'; run = null; autoT = 0; scene.clearRun(); scene.setCamp(true, s.parts); $('#runhud').classList.add('hide'); $('#hub').classList.remove('hide'); refreshTree(); 
  if (s.noRec === 3 && G.canNova(s) && s.novas) setTimeout(() => say([['bolt', `Beep... we keep hitting the same depth. Time for a Supernova! It would give us +${fmt(G.dustFor(s))} stardust.`]]), 600); }
$('#launch').onclick = () => launch();
addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  keys.add(e.code); readInput();
  if (dialogOpen() && (e.code === 'Space' || e.code === 'Enter')) { nextLine(); return; }
  if (modalOpen()) { if (e.code === 'Enter' || (e.code === 'Space' && mode === 'summary')) $('#modal .mok').click(); return; }
  if (e.code === 'Escape' && mode === 'tree') closeTree();
  if (e.code === 'Space' && (mode === 'hub' || mode === 'tree')) launch();
  if (e.code === 'KeyU' && mode === 'hub') openTree();
});
addEventListener('keyup', e => { keys.delete(e.code); readInput(); });
addEventListener('blur', () => { keys.clear(); readInput(); });

// ---------- supernova + settings ----------
$('#novabtn').onclick = () => {
  const d = G.dustFor(s), ok = G.canNova(s);
  modal(`<div class="mtitle">🌟 Supernova</div><p>Bolt folds your rig into a tiny star. Your upgrade web, ore and depth record reset, but you keep your <b>story progress, modules, artifacts and drones</b>, and gain <b>Stardust</b> forever.</p>
    <p>Stardust boosts <b>damage, drill power and ore</b>. Each Supernova also adds +2s to runs, faster descent and a deeper launch.</p>
    <div class="sumgrid"><div><small>Stardust now</small><b>✨ ${fmt(s.dust)}</b></div><div><small>You'd gain</small><b class="good">+${fmt(d)}</b></div><div><small>Power after</small><b>x${fmt(G.starMult({ dust: s.dust + d }))}</b></div></div>
    <p class="dim">${ok ? 'Stardust grows with your depth record, so going deeper first gives more.' : `Unlocks after you beat the ${G.zoneName(G.NOVA_ZONE - 1)} Guardian (${G.NOVA_ZONE * G.ZONE_LEN}m).`}</p>`,
    ok ? 'Go Supernova!' : 'OK', ok ? () => { const g = G.nova(s); sfx.nova(); scene.flash = 1.4; scene.shake = 1; toast(`<b>🌟 SUPERNOVA! +${fmt(g)} stardust</b> · everything x${fmt(G.starMult(s))}`, 'gold'); sel = null; save(); refreshTree(); } : null, ok ? 'Not yet' : null);
};
$('#setbtn').onclick = () => {
  modal(`<div class="mtitle">Settings</div>
    <label class="toggle"><input type="checkbox" id="optmute" ${sfx.muted ? '' : 'checked'}> Sound</label>
    ${G.lvl(s, 'ap') ? `<label class="toggle"><input type="checkbox" id="optap" ${s.autopilot ? 'checked' : ''}> Autopilot steers when you let go of the keys</label>` : ''}
    ${G.lvl(s, 'u1') ? `<label class="toggle"><input type="checkbox" id="optauto" ${s.autoRelaunch ? 'checked' : ''}> Auto-relaunch runs</label>` : ''}
    <div class="btnrow"><button class="sbtn" id="optstory">Replay intro</button><button class="sbtn" id="optexp">Export save</button><button class="sbtn" id="optimp">Import save</button><button class="sbtn danger" id="optreset">Reset</button></div>
    <p class="dim small">Geode Drift v3.0 · WASD/arrows steer · S dives · Space launches · U opens the upgrade web</p>`, 'Done');
  $('#optmute').onchange = e => { sfx.muted = !e.target.checked; save(); };
  const oa = $('#optauto'); if (oa) oa.onchange = e => { s.autoRelaunch = e.target.checked; save(); };
  const op = $('#optap'); if (op) op.onchange = e => { s.autopilot = e.target.checked; save(); };
  $('#optstory').onclick = () => { $('#modal').classList.remove('show'); say(G.INTRO); };
  $('#optexp').onclick = () => { save(); const code = btoa(unescape(encodeURIComponent(localStorage.getItem(KEY)))); navigator.clipboard?.writeText(code).catch(() => {}); modal(`<div class="mtitle">Your save</div><p class="dim">Copied to the clipboard.</p><textarea readonly>${code}</textarea>`); };
  $('#optimp').onclick = () => modal(`<div class="mtitle">Import save</div><textarea id="imp" placeholder="Paste a save code"></textarea>`, 'Import', () => { try { const n = G.load(decodeURIComponent(escape(atob($('#imp').value.trim())))); if (n.runs || n.bestDepth) { s = n; save(); location.reload(); } else toast('That code did not work'); } catch { toast('That code did not work'); } }, 'Cancel');
  $('#optreset').onclick = () => modal('<div class="mtitle">Reset everything?</div><p>All progress and stardust will be wiped.</p>', 'Reset', () => { localStorage.removeItem(KEY); location.reload(); }, 'Cancel');
};

// ---------- offline ----------
function welcomeBack() {
  const o = G.applyOffline(s); if (!o || mode === 'run') return;
  modal(`<div class="mtitle">Welcome back!</div><p>Your Idle Rig and the rescued drones kept mining for <b>${G.fmtTime(o.seconds)}</b> (${Math.round(G.stats(s).offline * 100)}% speed).</p><div class="sumore">${o.ore.map((v, t) => v >= 1 ? oreChip(t, v, '+') : '').join('')}</div>`, 'Collect', () => refreshTree());
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
  if (mode === 'summary' && autoT > 0) { autoT -= dt; const a = $('#autot'); if (a) a.textContent = Math.ceil(autoT); if (autoT <= 0 && modalOpen()) { $('#modal').classList.remove('show'); launch(); } }
  scene.frame(mode === 'run' || mode === 'summary' ? run : null, 0); requestAnimationFrame(loop);
}
buildTree(); centerView(); addEventListener('resize', centerView); scene.setCamp(true, s.parts); refreshTree(); welcomeBack();
if (!s.seenIntro) { s.seenIntro = true; save(); say(G.INTRO, () => toast('<b>Mission 1: Crash Landing</b><br>Press LAUNCH (or Space) to dive', 'glow')); }
requestAnimationFrame(loop);
window.__gd = { get s() { return s; }, set s(v) { s = v; }, get run() { return run; }, G, scene, launch, toHub, refreshTree, openTree, closeTree, say, claim, keys, set sel(v) { sel = v; } };
