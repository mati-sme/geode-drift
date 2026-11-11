// Geode Drift v2 — 3D mining shaft: drill rig, destructible asteroids, lasers, bloom, particles.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ORES, zoneHue, ZONE_LEN } from './core.js';

const hash = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
function rockGeo(seed, r = 0.5, detail = 1, rough = 0.32) {
  const g = new THREE.IcosahedronGeometry(r, detail), p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = v.clone().normalize();
    const k = 1 + (hash(Math.round(n.x * 3) + seed, Math.round(n.y * 3), Math.round(n.z * 3)) - 0.5) * rough + Math.sin(n.x * 4 + seed) * 0.06; v.copy(n).multiplyScalar(r * k); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return g;
}
function dotTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}

export class Scene3D {
  constructor(canvas) {
    this.canvas = canvas;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1; r.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene(); this.scene.fog = new THREE.FogExp2(0x0a0718, 0.028);
    this.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 300); this.scene.add(this.camera);
    this.clock = new THREE.Clock(); this.t = 0; this.dot = dotTex(); this.camY = 0; this.shake = 0;
    this.hue = new THREE.Color(zoneHue(0)); this.tHue = this.hue.clone();
    this.ray = new THREE.Raycaster(); this.ptr = new THREE.Vector2(); this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._s = new THREE.Vector3();
    this.buildSky(); this.buildLights(); this.buildWalls(); this.buildRig(); this.buildRocks(); this.buildBeams(); this.buildParticles(); this.buildBoss(); this.buildDust();
    const comp = this.composer = new EffectComposer(r); comp.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.45, 0.4, 0.9); comp.addPass(this.bloom); comp.addPass(new OutputPass());
    this.resize(); addEventListener('resize', () => this.resize());
    this.run = null; this.meshes = new Map();
  }
  resize() { const w = innerWidth, h = innerHeight; this.renderer.setSize(w, h, false); this.composer.setSize(w, h); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
  buildSky() {
    const m = this.skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { uT: { value: 0 }, uHue: { value: new THREE.Color() }, uD: { value: 0 } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: `varying vec3 vP; uniform float uT; uniform vec3 uHue; uniform float uD;
        float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
        float n(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
        float fbm(vec3 p){ float a=.5,r=0.; for(int i=0;i<5;i++){ r+=a*n(p); p*=2.03; a*=.5; } return r; }
        void main(){ vec3 p = vP*2.4 + vec3(0., uD*0.004, uT*0.003); float c = fbm(p), c2 = fbm(p*1.8+3.);
          vec3 col = vec3(0.012,0.01,0.03) + uHue*0.22*smoothstep(.45,.95,c) + vec3(.05,.02,.12)*smoothstep(.5,1.,c2);
          col += uHue*0.08*pow(max(0., -vP.y), 2.);
          float st = step(0.9985, h(floor(vP*420.))); col += st*0.8;
          gl_FragColor = vec4(col,1.); }` });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(150, 32, 16), m); this.camera.add(sky);
  }
  buildLights() {
    this.scene.add(new THREE.HemisphereLight(0xa8b8ff, 0x140a24, 0.7));
    this.key = new THREE.DirectionalLight(0xfff2e6, 2.0); this.key.position.set(5, 8, 10); this.scene.add(this.key); this.scene.add(this.key.target);
    this.rim = new THREE.DirectionalLight(0x8a6bff, 1.4); this.rim.position.set(-8, -3, -6); this.scene.add(this.rim);
    this.rigLight = new THREE.PointLight(0x9fe7ff, 25, 12, 1.5); this.scene.add(this.rigLight);
  }
  buildWalls() {
    // big faceted cliffs left/right that scroll with depth
    this.wallMat = new THREE.MeshStandardMaterial({ color: 0x2a2140, roughness: 0.9, metalness: 0.1, flatShading: true });
    this.walls = []; const geos = [0, 1, 2, 3].map(i => rockGeo(i * 7, 1.6, 1, 0.5));
    for (let i = 0; i < 44; i++) { const m = new THREE.Mesh(geos[i % 4], this.wallMat); const side = i % 2 ? 1 : -1;
      m.userData = { side, k: Math.floor(i / 2), off: hash(i, 2, 3) }; m.scale.set(1.4 + hash(i, 5, 1), 1.2 + hash(i, 1, 9), 1.2); m.rotation.set(hash(i, 1, 1) * 6, hash(i, 2, 2) * 6, 0); this.scene.add(m); this.walls.push(m); }
  }
  buildRig() {
    const g = this.rig = new THREE.Group(); this.scene.add(g);
    const hull = new THREE.MeshPhysicalMaterial({ color: 0xe8ecff, roughness: 0.3, metalness: 0.6, clearcoat: 1, clearcoatRoughness: 0.2 });
    const accent = new THREE.MeshStandardMaterial({ color: 0x6a4cff, roughness: 0.4, metalness: 0.5, emissive: 0x2a1060, emissiveIntensity: 0.4 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.5, 6, 16), hull); body.position.y = 0.55; g.add(body);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.09, 10, 32), accent); ring.rotation.x = Math.PI / 2; ring.position.y = 0.35; g.add(ring);
    const glass = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 12), new THREE.MeshPhysicalMaterial({ color: 0x9fe7ff, emissive: 0x3fa7ff, emissiveIntensity: 0.6, roughness: 0.05, metalness: 0, clearcoat: 1, transparent: true, opacity: 0.9 }));
    glass.position.set(0, 0.75, 0.3); g.add(glass);
    for (const sx of [-1, 1]) { const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.35, 4, 10), accent); pod.position.set(sx * 0.62, 0.45, 0); pod.rotation.z = sx * 0.3; g.add(pod);
      const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dot, color: 0x9fe7ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); fl.position.set(sx * 0.7, 0.15, 0); fl.scale.setScalar(0.5); g.add(fl); (this.flames ||= []).push(fl); }
    const drill = this.drill = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.9, 7, 3), new THREE.MeshStandardMaterial({ color: 0xffd27a, roughness: 0.25, metalness: 0.85, flatShading: true, emissive: 0x553300, emissiveIntensity: 0.3 }));
    drill.rotation.x = Math.PI; drill.position.y = -0.25; g.add(drill);
    this.emitter = new THREE.Object3D(); this.emitter.position.set(0, 0.2, 0.35); g.add(this.emitter);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dot, color: 0x9fe7ff, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.16, depthWrite: false })); halo.scale.setScalar(2.4); g.add(halo);
    // range ring
    this.rangeRing = new THREE.Mesh(new THREE.RingGeometry(0.98, 1, 96), new THREE.MeshBasicMaterial({ color: 0x9fe7ff, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    this.scene.add(this.rangeRing);
  }
  buildRocks() {
    this.rockGeos = [0, 1, 2, 3, 4, 5].map(i => rockGeo(i * 13 + 1, 0.5, 1, 0.42));
    this.gemGeo = new THREE.OctahedronGeometry(0.16, 0);
    this.pool = [];
  }
  makeRock(rk) {
    let m = this.pool.pop();
    if (!m) { m = new THREE.Group();
      const body = new THREE.Mesh(this.rockGeos[0], new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.15, flatShading: true }));
      const gemMat = new THREE.MeshStandardMaterial({ roughness: 0.15, metalness: 0.3, flatShading: true, emissiveIntensity: 0.9 });
      const gems = []; for (let i = 0; i < 3; i++) { const gm = new THREE.Mesh(this.gemGeo, gemMat); gems.push(gm); body.add(gm); }
      m.add(body); m.userData = { body, gems, gemMat }; }
    const u = m.userData, c = new THREE.Color(ORES[rk.tier].color);
    u.body.geometry = this.rockGeos[rk.id % 6];
    u.body.material.color.set(0x4a4060).lerp(c, 0.18); u.body.material.emissive.copy(c); u.body.material.emissiveIntensity = 0;
    u.gemMat.color.copy(c); u.gemMat.emissive.copy(c);
    u.gems.forEach((gm, i) => { const d = new THREE.Vector3(hash(rk.id, i, 1) - .5, hash(rk.id, i, 2) - .5, hash(rk.id, i, 3) - .5).normalize(); gm.position.copy(d.multiplyScalar(0.45)); gm.scale.setScalar(0.6 + hash(rk.id, i, 4)); gm.visible = i <= Math.min(2, rk.tier); });
    m.rotation.set(rk.id, rk.id * 1.7, 0); m.visible = true; this.scene.add(m); return m;
  }
  buildBeams() {
    this.beams = []; const geo = new THREE.CylinderGeometry(0.035, 0.035, 1, 6, 1, true); geo.translate(0, 0.5, 0); geo.rotateX(Math.PI / 2);
    for (let i = 0; i < 6; i++) { const core = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      const glow = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x9fe7ff, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false })); glow.scale.set(3, 3, 1); core.add(glow);
      const tip = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dot, color: 0x9fe7ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); tip.scale.setScalar(0.9);
      core.visible = false; tip.visible = false; this.scene.add(core, tip); this.beams.push({ core, glow, tip }); }
  }
  buildParticles() {
    this.PMAX = 600; const g = new THREE.OctahedronGeometry(0.06, 0);
    this.parts = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.3, flatShading: true }), this.PMAX);
    this.parts.instanceMatrix.setUsage(THREE.DynamicDrawUsage); this.parts.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(this.PMAX * 3), 3);
    this.pd = Array.from({ length: this.PMAX }, () => ({ l: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Euler(), s: 1 })); this.pi = 0; this.scene.add(this.parts);
    this.parts.frustumCulled = false;
  }
  burst(p, n, color, power = 1) {
    const c = new THREE.Color(color);
    for (let k = 0; k < n; k++) { const i = this.pi; this.pi = (this.pi + 1) % this.PMAX; const d = this.pd[i];
      d.l = 0.7 + Math.random() * 0.7; d.p.copy(p); d.v.randomDirection().multiplyScalar((2 + Math.random() * 4) * power); d.s = 0.5 + Math.random() * 0.8 * power;
      this.parts.setColorAt(i, c.clone().offsetHSL((Math.random() - .5) * .06, 0, (Math.random() - .4) * .25)); }
    this.parts.instanceColor.needsUpdate = true;
  }
  buildBoss() {
    const g = this.boss = new THREE.Group(); g.visible = false; this.scene.add(g);
    this.bossRock = new THREE.Mesh(rockGeo(99, 2.2, 3, 0.35), new THREE.MeshStandardMaterial({ color: 0x3a2f55, roughness: 0.7, metalness: 0.3, flatShading: true, emissiveIntensity: 0.15 })); g.add(this.bossRock);
    const cg = new THREE.ConeGeometry(0.28, 1.6, 6); cg.translate(0, 0.8, 0);
    this.bossCrystalMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5, roughness: 0.1, clearcoat: 1, flatShading: true });
    for (let i = 0; i < 18; i++) { const c = new THREE.Mesh(cg, this.bossCrystalMat); const d = new THREE.Vector3().randomDirection(); c.position.copy(d.clone().multiplyScalar(1.8)); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); c.scale.setScalar(0.6 + Math.random() * 0.8); this.bossRock.add(c); }
    this.bossEye = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dot, color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); this.bossEye.scale.setScalar(5); g.add(this.bossEye);
  }
  buildDust() {
    const N = 500, pos = new Float32Array(N * 3); for (let i = 0; i < N; i++) pos.set([(Math.random() - .5) * 26, (Math.random() - .5) * 30, (Math.random() - .5) * 12 - 2], i * 3);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.dust = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.09, map: this.dot, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff })); this.scene.add(this.dust);
  }
  setZone(z) { this.tHue.set(zoneHue(z)); }
  pick(cx, cy) {
    this.ptr.set(cx / innerWidth * 2 - 1, -cy / innerHeight * 2 + 1); this.ray.setFromCamera(this.ptr, this.camera);
    const objs = []; this.meshes.forEach((m, id) => { m.userData.body.userData.rid = id; objs.push(m.userData.body); });
    const h = this.ray.intersectObjects(objs, false)[0]; return h ? h.object.userData.rid : null;
  }
  toScreen(v) { const p = v.clone().project(this.camera); return { x: (p.x + 1) / 2 * innerWidth, y: (1 - p.y) / 2 * innerHeight }; }
  rockWorld(rk) { return new THREE.Vector3(rk.x, -rk.y, rk.z); }
  onBreak(rk) { const m = this.meshes.get(rk.id); const p = this.rockWorld(rk); this.burst(p, 10 + Math.round(rk.size * 6), ORES[rk.tier].color, 0.8 + rk.size * 0.3); if (m) { m.visible = false; this.scene.remove(m); this.pool.push(m); this.meshes.delete(rk.id); } }
  bossDown(b) { this.burst(new THREE.Vector3(0, -b.y, 0), 160, zoneHue(b.zone + 1), 2.2); this.flash = 1; this.shake = 1; this.boss.visible = false; }
  clearRun() { this.meshes.forEach(m => { m.visible = false; this.scene.remove(m); this.pool.push(m); }); this.meshes.clear(); this.boss.visible = false; }
  frame(run, idle) {
    const dt = Math.min(0.05, this.clock.getDelta()); this.t += dt; const t = this.t;
    this.hue.lerp(this.tHue, 0.03); this.skyMat.uniforms.uT.value = t; this.skyMat.uniforms.uHue.value.copy(this.hue);
    const depth = run ? run.depth : (idle || 0), rx = run ? run.x : Math.sin(t * 0.4) * 1.2;
    this.skyMat.uniforms.uD.value = depth; this.scene.fog.color.copy(this.hue).multiplyScalar(0.06);
    // rig
    this.rig.position.set(rx, -depth + Math.sin(t * 3) * 0.05, 0); this.rig.rotation.z = Math.max(-0.4, Math.min(0.4, ((this._lx ?? rx) - rx) * 6)); this._lx = rx;
    this.drill.rotation.y += dt * (run ? 18 : 4);
    this.flames.forEach((f, i) => { f.scale.setScalar(0.4 + Math.random() * 0.25 + (run?.od ? 0.3 : 0)); f.material.color.set(run?.od ? 0xffb27a : 0x9fe7ff); });
    this.rigLight.position.copy(this.rig.position).add(new THREE.Vector3(0, 0.5, 2)); this.rigLight.color.copy(this.hue).lerp(new THREE.Color(0x9fe7ff), 0.5);
    const R = run ? run.st.range : 3.2; this.rangeRing.position.copy(this.rig.position); this.rangeRing.scale.setScalar(R); this.rangeRing.material.opacity = run ? 0.06 + Math.sin(t * 3) * 0.02 : 0;
    // camera follows
    this.camY += (-depth - this.camY) * Math.min(1, dt * 4);
    this.shake *= Math.pow(0.02, dt); const sh = this.shake * 0.25;
    this.camera.position.set(rx * 0.25 + Math.sin(t * 0.3) * 0.3 + (Math.random() - .5) * sh, this.camY - 3.2 + (Math.random() - .5) * sh, 15.5);
    this.camera.lookAt(rx * 0.2, this.camY - 4.2, 0);
    this.key.position.set(this.rig.position.x + 5, this.camY + 8, 10); this.key.target.position.set(0, this.camY, 0);
    // walls
    this.wallMat.color.set(0x241c38).lerp(this.hue, 0.1);
    const span = 22 * 1.6;
    this.walls.forEach(w => { const u = w.userData; let y = -(u.k * 1.6 + u.off) ; y = ((y - this.camY) % span + span) % span - span / 2 + this.camY; w.position.set(u.side * (8.8 + u.off * 1.2), y, -1.5 + u.off * 2); });
    // dust drift
    const dp = this.dust.geometry.attributes.position; for (let i = 0; i < dp.count; i++) { let y = dp.getY(i); if (y > this.camY + 15) y -= 30; if (y < this.camY - 15) y += 30; dp.setY(i, y); } dp.needsUpdate = true;
    this.dust.material.color.copy(this.hue).lerp(new THREE.Color(0xffffff), 0.6);
    // rocks
    const live = new Set();
    if (run) for (const rk of run.rocks) {
      if (rk.y > depth + 16) continue; live.add(rk.id);
      let m = this.meshes.get(rk.id); if (!m) { m = this.makeRock(rk); this.meshes.set(rk.id, m); }
      const k = rk.hp / rk.max; m.position.set(rk.x, -rk.y, rk.z); m.scale.setScalar(rk.size * (0.82 + 0.18 * k) * (1 + rk.hit * 0.08));
      m.rotation.y += dt * 0.3; m.rotation.x += dt * 0.15;
      m.userData.body.material.emissiveIntensity = rk.hit * 0.6 + (run.prio === rk ? 0.35 + Math.sin(t * 10) * 0.15 : 0);
      rk.hit *= Math.pow(0.001, dt);
    }
    this.meshes.forEach((m, id) => { if (!live.has(id)) { m.visible = false; this.scene.remove(m); this.pool.push(m); this.meshes.delete(id); } });
    // boss
    if (run && run.boss) { const b = run.boss; this.boss.visible = true; this.boss.position.set(0, -b.y - 1.2, 0); this.bossRock.rotation.y += dt * 0.4; this.bossRock.rotation.x = Math.sin(t) * 0.2;
      const c = new THREE.Color(zoneHue(b.zone + 1)); this.bossCrystalMat.color.copy(c); this.bossCrystalMat.emissive.copy(c); this.bossRock.material.emissive.copy(c); this.bossEye.material.color.copy(c);
      this.bossEye.material.opacity = 0.35 + Math.sin(t * 4) * 0.1; this.boss.scale.setScalar(1 + Math.sin(t * 20) * 0.01 * (1 - b.hp / b.max)); }
    else if (!run) this.boss.visible = false;
    // beams
    const ep = new THREE.Vector3(); this.emitter.getWorldPosition(ep);
    this.beams.forEach((b, i) => {
      const tg = run && !run.ended ? run.targets[i] : null;
      if (!tg) { b.core.visible = b.tip.visible = false; return; }
      const to = tg.max && tg.zone !== undefined ? new THREE.Vector3((i - 1) * 0.8, -tg.y - 1.2 + 1.6, 1.2) : this.rockWorld(tg);
      const len = ep.distanceTo(to); b.core.position.copy(ep); b.core.lookAt(to); b.core.scale.set(1 + Math.random() * 0.3, 1 + Math.random() * 0.3, len);
      b.glow.material.color.copy(this.hue).lerp(new THREE.Color(0x9fe7ff), 0.5); b.core.visible = true; b.tip.visible = true; b.tip.position.copy(to); b.tip.scale.setScalar(0.7 + Math.random() * 0.5);
      if (Math.random() < dt * 25) this.burst(to, 1, tg.tier !== undefined ? ORES[tg.tier].color : 0xffffff, 0.4);
    });
    // particles
    for (let i = 0; i < this.PMAX; i++) { const d = this.pd[i];
      if (d.l > 0) { d.l -= dt; d.v.multiplyScalar(Math.pow(0.2, dt)); d.v.y -= dt * 3; d.p.addScaledVector(d.v, dt); d.r.x += dt * 6; d.r.y += dt * 4; this._q.setFromEuler(d.r); this._s.setScalar(Math.max(0, Math.min(1, d.l * 1.4)) * d.s); }
      else this._s.setScalar(0);
      this._m.compose(d.p, this._q, this._s); this.parts.setMatrixAt(i, this._m); }
    this.parts.instanceMatrix.needsUpdate = true;
    this.flash = (this.flash || 0) * Math.pow(0.05, dt); this.bloom.strength = 0.42 + this.flash * 1.2 + (run?.od ? 0.25 : 0);
    this.composer.render();
  }
}
