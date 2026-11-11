// Tiny synthesized sound kit (WebAudio, no files).
export class Sfx {
  constructor() { this.ctx = null; this.muted = false; }
  unlock() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); this.master = this.ctx.createGain(); this.master.gain.value = 0.35; this.master.connect(this.ctx.destination); } catch {} } this.ctx?.resume?.(); }
  tone(freq, dur = 0.12, type = 'sine', vol = 0.3, slide = 0, delay = 0) {
    if (this.muted || !this.ctx) return; const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02);
  }
  tap(combo = 0) { const scale = [0, 2, 4, 7, 9, 12, 14, 16]; const n = scale[combo % scale.length] + 12 * Math.floor(combo / 16); this.tone(660 * Math.pow(2, n / 12), 0.09, 'triangle', 0.18); this.tone(1320 * Math.pow(2, n / 12), 0.05, 'sine', 0.06); }
  buy() { this.tone(523, 0.08, 'triangle', 0.2); this.tone(784, 0.12, 'triangle', 0.18, 0, 0.06); }
  upgrade() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'sine', 0.2, 0, i * 0.06)); }
  deny() { this.tone(180, 0.12, 'square', 0.06, 0.7); }
  ui() { this.tone(900, 0.04, 'sine', 0.08); }
  comet() { [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.18, 0, i * 0.05)); }
  whoosh() { this.tone(300, 0.6, 'sine', 0.05, 2.5); }
  stratum() { [392, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.4, 'sine', 0.16, 0, i * 0.08)); }
  prestige() { [262, 392, 523, 784, 1047, 1568].forEach((f, i) => this.tone(f, 0.6, 'triangle', 0.16, 0, i * 0.09)); }
  nova() { this.tone(80, 1.6, 'sawtooth', 0.12, 0.5); [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => this.tone(f, 0.8, 'sine', 0.14, 0, 0.3 + i * 0.08)); }
}
Sfx.prototype.crack = function (tier) { this.tone(220 + tier * 70 + Math.random() * 40, 0.08, 'triangle', 0.14, 0.5); this.tone(880 + tier * 140, 0.06, 'sine', 0.05); };
Sfx.prototype.launch = function () { this.tone(120, 0.7, 'sawtooth', 0.06, 3); [392, 523, 659].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.12, 0, i * 0.07)); };
Sfx.prototype.boss = function () { this.tone(90, 0.9, 'square', 0.07, 0.6); this.tone(70, 0.9, 'sawtooth', 0.06, 0.7, 0.2); };
Sfx.prototype.end = function () { [784, 659, 523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.12, 0, i * 0.07)); };
