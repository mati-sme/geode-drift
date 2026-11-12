// Geode Drift v3 — 3D mining shaft: drill rig, destructible asteroids, lasers, bloom, particles.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ORES, zoneHue, ZONE_LEN, WORLDS } from './core.js';

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
    this.buildSky(); this.buildLights(); this.buildWalls(); this.buildRig(); this.buildRocks(); this.buildBeams(); this.buildParticles(); this.buildBoss(); this.buildDust(); this.buildFx(); this.buildCamp();
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
    this.gemGeo = new THREE.OctahedronGeometry(0.16, 0); this.podGeo = new THREE.SphereGeometry(0.42, 16, 10); this.capGeo = new THREE.OctahedronGeometry(0.5, 0);
    this.pool = [];
  }
  makeRock(rk) {
    let m = this.pool.pop();
    if (!m) { m = new THREE.Group();
      const body = new THREE.Mesh(this.rockGeos[0], new THREE.MeshStandardMaterial({ roughness: 0.85, metalness: 0.15, flatShading: true }));
      const gemMat = new THREE.MeshStandardMaterial({ roughness: 0.15, metalness: 0.3, flatShading: true, emissiveIntensity: 0.9 });
      const gems = []; for (let i = 0; i < 3; i++) { const gm = new THREE.Mesh(this.gemGeo, gemMat); gems.push(gm); body.add(gm); }
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dot, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); glow.scale.setScalar(2.6); m.add(glow);
      m.add(body); m.userData = { body, gems, gemMat, glow }; }
    const u = m.userData, c = new THREE.Color(ORES[rk.tier].color);
    u.body.geometry = this.rockGeos[rk.id % 6];
    u.body.material.color.set(0x4a4060).lerp(c, 0.18); u.body.material.emissive.copy(c); u.body.material.emissiveIntensity = 0;
    u.gemMat.color.copy(c); u.gemMat.emissive.copy(c);
    const K = rk.kind, bm = u.body.material; bm.metalness = 0.15; bm.roughness = 0.85;
    let gemN = Math.min(2, rk.tier), gemS = 1, glowC = null;
    if (K === 'iron') { bm.color.set(0x5a5f70); bm.metalness = 0.9; bm.roughness = 0.35; }
    if (K === 'bomb') { bm.color.set(0x5a1a2a); bm.emissive.set(0xff3355); glowC = 0xff3355; gemN = -1; }
    if (K === 'capsule') { bm.color.set(0x1a3a5a); bm.emissive.set(0x5fe7ff); glowC = 0x5fe7ff; gemN = -1; }
    if (K === 'pod') { bm.color.set(0xf2f0ff); bm.metalness = 0.6; bm.roughness = 0.3; bm.emissive.set(0x9fe7ff); glowC = 0x9fe7ff; gemN = -1; }
    if (K === 'geode') { bm.color.set(0x3a2a5a); glowC = 0xd08aff; gemN = 2; gemS = 2.2; u.gemMat.color.set(0xd08aff); u.gemMat.emissive.set(0xd08aff); }
    if (K === 'cluster') { gemN = 2; gemS = rk.split ? 1.6 : 2.4; glowC = ORES[rk.tier].color; }
    if (K === 'frost') { bm.color.set(0xd8f4ff); bm.metalness = 0.4; bm.roughness = 0.1; bm.emissive.set(0x7fd8ff); glowC = 0xaef4ff; }
    if (K === 'magma') { bm.color.set(0x2a1410); bm.emissive.set(0xff5a1a); glowC = 0xff7a2a; gemN = -1; }
    if (K === 'prism') { bm.color.set(0xffc8f4); bm.metalness = 0.2; bm.roughness = 0.05; bm.emissive.set(0xff9ef0); glowC = 0xff9ef0; gemN = 2; gemS = 1.8; }
    if (K === 'well') { bm.color.set(0x05040a); bm.metalness = 1; bm.roughness = 0.2; bm.emissive.set(0x8a5cff); glowC = 0xb08aff; gemN = -1; }
    u.glow.visible = !!glowC; if (glowC) u.glow.material.color.set(glowC); u.glow.material.opacity = K === 'cluster' ? 0.25 : K === 'well' ? 0.8 : 0.55; u.glow.userData.k = K;
    u.gems.forEach((gm, i) => { const d = new THREE.Vector3(hash(rk.id, i, 1) - .5, hash(rk.id, i, 2) - .5, hash(rk.id, i, 3) - .5).normalize(); gm.position.copy(d.multiplyScalar(0.45)); gm.scale.setScalar((0.6 + hash(rk.id, i, 4)) * gemS); gm.visible = i <= gemN; });
    if (K === 'pod' || K === 'capsule') u.body.geometry = K === 'pod' ? this.podGeo : this.capGeo;
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
    if (!run && this.campOn) return this.frameCamp();
    const dt = Math.min(0.05, this.clock.getDelta()); this.t += dt; const t = this.t;
    this.hue.lerp(this.tHue, 0.03); this.skyMat.uniforms.uT.value = t; this.skyMat.uniforms.uHue.value.copy(this.hue);
    const depth = run ? run.depth : (idle || 0), rx = run ? run.x : Math.sin(t * 0.4) * 1.2;
    this.skyMat.uniforms.uD.value = depth; this.scene.fog.color.copy(this.hue).multiplyScalar(0.06); this.dust.position.y = 0;
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
      const bm = m.userData.body.material; bm.emissiveIntensity = rk.hit * 0.6 + (rk.kind === 'bomb' ? 0.5 + Math.sin(t * 8) * 0.4 : rk.kind === 'magma' ? 0.6 + Math.sin(t * 5 + rk.id) * 0.35 : rk.kind === 'capsule' || rk.kind === 'pod' || rk.kind === 'well' ? 0.7 : rk.kind === 'frost' || rk.kind === 'prism' ? 0.3 : 0);
      if (m.userData.glow.visible) m.userData.glow.scale.setScalar(rk.kind === 'well' ? 5 + Math.sin(t * 3 + rk.id) * 0.8 : 2.2 + Math.sin(t * 4 + rk.id) * 0.3);
      rk.hit *= Math.pow(0.001, dt);
    }
    this.meshes.forEach((m, id) => { if (!live.has(id)) { m.visible = false; this.scene.remove(m); this.pool.push(m); this.meshes.delete(id); } });
    // boss
    if (run && run.boss) { const b = run.boss; this.boss.visible = true; this.boss.position.set(0, -b.y - 1.2, 0); this.bossRock.rotation.y += dt * 0.4; this.bossRock.rotation.x = Math.sin(t) * 0.2;
      const c = new THREE.Color(zoneHue(b.zone + 1)); this.bossCrystalMat.color.copy(c); this.bossCrystalMat.emissive.copy(c); this.bossRock.material.emissive.copy(c); this.bossEye.material.color.copy(c);
      this.bossEye.material.opacity = 0.35 + Math.sin(t * 4) * 0.1 + (b.phase || 0) * 0.15; this.bossRock.rotation.y += dt * (b.phase || 0) * 0.8; this.boss.scale.setScalar(1 + Math.sin(t * 20) * 0.01 * (1 - b.hp / b.max)); }
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
    this.updateFx(run, dt);
    // particles
    for (let i = 0; i < this.PMAX; i++) { const d = this.pd[i];
      if (d.l > 0) { d.l -= dt; d.v.multiplyScalar(Math.pow(0.2, dt)); d.v.y -= dt * 3; d.p.addScaledVector(d.v, dt); d.r.x += dt * 6; d.r.y += dt * 4; this._q.setFromEuler(d.r); this._s.setScalar(Math.max(0, Math.min(1, d.l * 1.4)) * d.s); }
      else this._s.setScalar(0);
      this._m.compose(d.p, this._q, this._s); this.parts.setMatrixAt(i, this._m); }
    this.parts.instanceMatrix.needsUpdate = true;
    this.flash = (this.flash || 0) * Math.pow(0.05, dt); this.bloom.strength = 0.42 + this.flash * 1.2 + (run?.od ? 0.25 : 0);
    this.composer.render();
  }

  // ---------- v3 fx: guardian shards, chain lightning, missiles, shield ----------
  buildFx() {
    this.shardMat = new THREE.SpriteMaterial({ map: this.dot, color: 0xff5a8a, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false });
    this.shardGeo = new THREE.OctahedronGeometry(0.16, 0); this.shardCore = new THREE.MeshBasicMaterial({ color: 0xffe0ea });
    this.shards = []; for (let i = 0; i < 160; i++) { const g = new THREE.Group(); const sp = new THREE.Sprite(this.shardMat); sp.scale.setScalar(0.9); g.add(sp, new THREE.Mesh(this.shardGeo, this.shardCore)); g.visible = false; this.scene.add(g); this.shards.push(g); }
    this.bolts = []; for (let i = 0; i < 8; i++) { const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(64 * 3), 3));
      const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xb8f0ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); l.visible = false; l.frustumCulled = false; this.scene.add(l); this.bolts.push({ l, life: 0 }); }
    this.missiles = []; for (let i = 0; i < 24; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dot, color: 0xffb36a, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); sp.scale.setScalar(0.7); sp.visible = false; this.scene.add(sp); this.missiles.push({ sp, life: 0, from: new THREE.Vector3(), to: new THREE.Vector3(), c: new THREE.Vector3() }); }
    this.bubble = new THREE.Mesh(new THREE.SphereGeometry(1.25, 24, 16), new THREE.MeshBasicMaterial({ color: 0x7fd8ff, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })); this.bubble.visible = false; this.scene.add(this.bubble);
  }
  lightning(path) {
    const b = this.bolts.find(x => x.life <= 0) || this.bolts[0]; const pos = b.l.geometry.attributes.position; let n = 0;
    for (let i = 0; i < path.length - 1 && n < 60; i++) { const a = new THREE.Vector3(path[i].x, -path[i].y, path[i].z || 0), c = new THREE.Vector3(path[i + 1].x, -path[i + 1].y, path[i + 1].z || 0);
      for (let k = 0; k <= 6 && n < 63; k++) { const p = a.clone().lerp(c, k / 6); if (k && k < 6) p.add(new THREE.Vector3((Math.random() - .5) * .5, (Math.random() - .5) * .5, (Math.random() - .5) * .3)); pos.setXYZ(n++, p.x, p.y, p.z); } }
    b.l.geometry.setDrawRange(0, n); pos.needsUpdate = true; b.life = 0.18; b.l.visible = true;
    const end = path[path.length - 1]; this.burst(new THREE.Vector3(end.x, -end.y, end.z || 0), 6, 0xb8f0ff, 0.6);
  }
  missile(from, to) {
    const m = this.missiles.find(x => x.life <= 0) || this.missiles[0]; m.from.set(from.x, -from.y + 0.6, 0.4); m.to.set(to.x, -to.y, to.z || 0);
    m.c.copy(m.from).lerp(m.to, 0.5).add(new THREE.Vector3((Math.random() - .5) * 4, 2 + Math.random() * 2, 1)); m.life = 0.35; m.sp.visible = true;
  }
  updateFx(run, dt) {
    const shots = run && !run.ended ? run.shots : [];
    this.shards.forEach((g, i) => { const p = shots[i]; g.visible = !!p; if (p) { g.position.set(p.x, -p.y, 0.3); g.rotation.z += dt * 8; g.children[0].scale.setScalar(0.8 + Math.sin(this.t * 20 + i) * 0.15); } });
    if (run?.boss) this.shardMat.color.set(zoneHue(run.boss.zone + 1)).lerp(new THREE.Color(0xff5a8a), 0.5);
    this.bolts.forEach(b => { if (b.life > 0) { b.life -= dt; b.l.material.opacity = Math.max(0, b.life / 0.18); } else b.l.visible = false; });
    this.missiles.forEach(m => { if (m.life <= 0) return; m.life -= dt; const k = 1 - Math.max(0, m.life) / 0.35, a = m.from.clone().lerp(m.c, k), b = m.c.clone().lerp(m.to, k); m.sp.position.copy(a.lerp(b, k));
      if (Math.random() < 0.6) this.burst(m.sp.position, 1, 0xffb36a, 0.2); if (m.life <= 0) { m.sp.visible = false; this.burst(m.to, 14, 0xffb36a, 1.1); this.shake = Math.max(this.shake, 0.15); } });
    const sh = run && run.st.shield && run.shieldT <= 0; this.bubble.visible = !!sh; if (sh) { this.bubble.position.copy(this.rig.position).add(new THREE.Vector3(0, 0.4, 0)); this.bubble.material.opacity = 0.1 + Math.sin(this.t * 3) * 0.04; }
  }
  // ---------- hub camp: the starship Starling, rebuilt piece by piece ----------
  buildCamp() {
    const g = this.camp = new THREE.Group(); g.position.set(0, 40, 0); g.visible = false; this.scene.add(g); this.campOn = false;
    const ground = new THREE.Mesh(rockGeo(5, 7, 3, 0.25), new THREE.MeshStandardMaterial({ color: 0x2c2446, roughness: 0.95, flatShading: true }));
    ground.scale.set(1.3, 0.28, 1); ground.position.y = -2.4; g.add(ground); this.ground = ground; this.campCrystals = [];
    for (let i = 0; i < 14; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 6), new THREE.MeshStandardMaterial({ color: ZONE_HUE_ARR[i % 7], emissive: ZONE_HUE_ARR[i % 7], emissiveIntensity: 0.7, flatShading: true, roughness: 0.2 }));
      const a = i / 14 * Math.PI * 2; c.position.set(Math.cos(a) * (6 + hash(i, 1, 1) * 1.5), -0.6, Math.sin(a) * (4 + hash(i, 2, 1))); c.rotation.set(hash(i, 3, 1) - .5, 0, hash(i, 4, 1) - .5); c.scale.setScalar(0.7 + hash(i, 5, 1) * 1.2); g.add(c); this.campCrystals.push(c); }
    this.planet = new THREE.Mesh(new THREE.SphereGeometry(9, 40, 24), new THREE.MeshStandardMaterial({ color: 0x9fe7ff, roughness: 0.8, emissive: 0x9fe7ff, emissiveIntensity: 0.25, fog: false })); this.planet.position.set(-24, 6, -42); g.add(this.planet);
    this.pRing = new THREE.Mesh(new THREE.TorusGeometry(14, 0.5, 6, 80), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, fog: false })); this.pRing.rotation.x = 1.2; this.planet.add(this.pRing);
    const holo = this.holoMat = new THREE.MeshBasicMaterial({ color: 0x5fe7ff, wireframe: true, transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false });
    const hull = new THREE.MeshPhysicalMaterial({ color: 0xeef0ff, roughness: 0.3, metalness: 0.6, clearcoat: 1 });
    const purple = new THREE.MeshStandardMaterial({ color: 0x6a4cff, roughness: 0.4, metalness: 0.5, emissive: 0x2a1060, emissiveIntensity: 0.5 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xffd27a, roughness: 0.25, metalness: 0.9, emissive: 0x553300, emissiveIntensity: 0.3 });
    const glow = c => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.6, roughness: 0.2 });
    const mk = (geo, mat, p, r, sc) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(...p); if (r) m.rotation.set(...r); if (sc) m.scale.set(...sc); return m; };
    const ship = this.ship = new THREE.Group(); ship.position.y = 0.2; g.add(ship); this.shipParts = [];
    const part = (...meshes) => { const pg = new THREE.Group(); meshes.forEach(m => { m.userData.mat = m.material; pg.add(m); }); ship.add(pg); this.shipParts.push(pg); return pg; };
    part(mk(new THREE.CapsuleGeometry(0.95, 3.2, 8, 20), hull, [0, 0, 0], [0, 0, Math.PI / 2]), mk(new THREE.TorusGeometry(0.97, 0.06, 8, 32), purple, [-0.6, 0, 0], [0, Math.PI / 2, 0]));
    part(mk(new THREE.CylinderGeometry(0.75, 0.55, 1.0, 20), purple, [-2.6, 0, 0], [0, 0, Math.PI / 2]), mk(new THREE.CircleGeometry(0.5, 20), glow(0x5fe7ff), [-3.12, 0, 0], [0, -Math.PI / 2, 0]));
    part(mk(new THREE.BoxGeometry(1.8, 0.1, 2.0), hull, [-0.6, -0.2, 1.4], [0, 0.35, 0]), mk(new THREE.BoxGeometry(1.8, 0.1, 2.0), hull, [-0.6, -0.2, -1.4], [0, -0.35, 0]));
    part(mk(new THREE.SphereGeometry(0.72, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0x9fe7ff, emissive: 0x3fa7ff, emissiveIntensity: 0.6, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.85 }), [1.7, 0.3, 0], [0, 0, -0.9]));
    part(mk(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 6), gold, [0.3, 1.5, 0]), mk(new THREE.SphereGeometry(0.14, 12, 8), glow(0xff6ad5), [0.3, 2.2, 0]));
    part(mk(new THREE.TorusGeometry(1.15, 0.13, 10, 36), glow(0xffc94a), [0.4, 0, 0], [0, Math.PI / 2, 0]));
    part(mk(new THREE.SphereGeometry(0.3, 14, 10), glow(0x6afff0), [-0.9, -0.15, 2.4]), mk(new THREE.SphereGeometry(0.3, 14, 10), glow(0x6afff0), [-0.9, -0.15, -2.4]));
    part(mk(new THREE.TorusGeometry(0.85, 0.08, 8, 30), glow(0x9a5cff), [-3.4, 0, 0], [0, Math.PI / 2, 0]), mk(new THREE.TorusGeometry(0.65, 0.08, 8, 30), glow(0x9a5cff), [-3.8, 0, 0], [0, Math.PI / 2, 0]));
    part(mk(new THREE.TorusGeometry(0.45, 0.1, 8, 24, Math.PI), gold, [-0.4, 0.95, 0], [0, 0, 0]));
    const heart = mk(new THREE.OctahedronGeometry(0.42, 0), glow(0xfff2a8), [-0.4, 1.2, 0]); const hs = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dot, color: 0xfff2a8, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); hs.scale.setScalar(3); heart.add(hs); part(heart);
    // crew: Bolt floating, campfire light
    this.bolt = mk(new THREE.SphereGeometry(0.3, 18, 12), hull, [3.3, 0.2, 1.6]); const eye = mk(new THREE.SphereGeometry(0.16, 12, 8), glow(0x5fe7ff), [0.12, 0.05, 0.22], null, [1.2, 0.8, 0.6]); this.bolt.add(eye); g.add(this.bolt);
    this.campLight = new THREE.PointLight(0xffb36a, 30, 14, 1.6); this.campLight.position.set(2.5, 0.5, 2.5); g.add(this.campLight);
    const fire = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dot, color: 0xffa64a, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); fire.position.set(2.5, -1.1, 2.6); fire.scale.setScalar(1.4); g.add(fire); this.fire = fire;
  }
  setCamp(on, built = 0, world = 0) {
    const W = WORLDS[world] || WORLDS[0], hues = [0, 1, 2, 3].map(k => zoneHue(W.z0 + k)); this.ground.material.color.set(W.ground);
    this.campCrystals.forEach((c, i) => { c.material.color.set(world ? hues[i % 4] : c.material.color); c.material.emissive.copy(c.material.color); });
    this.planet.visible = world > 0; if (world) { const pc = zoneHue(W.z0 + 1); this.planet.material.color.set(pc); this.planet.material.emissive.set(pc); this.pRing.material.color.set(zoneHue(W.z0 + 2)); }
    if (on) this.setZone(W.z0 + (world ? 1 : 0));
    this.campOn = on; this.camp.visible = on; this.rig.visible = !on; this.rangeRing.visible = !on;
    this.shipParts.forEach((pg, i) => pg.traverse(m => { if (m.isMesh) { m.material = i < built ? m.userData.mat : this.holoMat; } if (m.isSprite) m.visible = i < built; }));
    this.built = built;
  }
  partPop(i) { const pg = this.shipParts[i]; if (!pg) return; const p = new THREE.Vector3(); pg.children[0].getWorldPosition(p); this.burst(p, 80, 0x9fe7ff, 1.6); this.flash = 1; this.shake = 0.5; pg.scale.setScalar(1.3); }
  frameCamp() {
    const dt = Math.min(0.05, this.clock.getDelta()); this.t += dt; const t = this.t;
    this.hue.lerp(this.tHue, 0.03); this.skyMat.uniforms.uT.value = t; this.skyMat.uniforms.uHue.value.copy(this.hue); this.scene.fog.color.copy(this.hue).multiplyScalar(0.06);
    const a = t * 0.08, R = 12.5; this.camY = 40; this.shake *= Math.pow(0.02, dt); const sh = this.shake * 0.3;
    this.camera.position.set(Math.sin(a) * R + (Math.random() - .5) * sh, 43.5 + Math.sin(t * 0.2) * 0.4, Math.cos(a) * R); this.camera.lookAt(-0.3, 40.3, 0);
    this.key.position.set(6, 50, 10); this.key.target.position.set(0, 40, 0);
    this.ship.position.y = 0.25 + Math.sin(t * 1.2) * 0.08; this.ship.rotation.z = Math.sin(t * 0.7) * 0.02;
    this.shipParts.forEach(pg => pg.scale.lerp(new THREE.Vector3(1, 1, 1), 0.08));
    this.holoMat.opacity = 0.2 + Math.sin(t * 3) * 0.08; this.planet.rotation.y += dt * 0.05;
    this.bolt.position.y = 0.4 + Math.sin(t * 2) * 0.15; this.bolt.rotation.y = Math.sin(t * 0.8) * 0.8;
    this.fire.scale.setScalar(1.2 + Math.random() * 0.4); this.campLight.intensity = 26 + Math.random() * 8;
    this.walls.forEach(w => w.position.y = -999); this.dust.position.y = 40;
    const dp = this.dust.geometry.attributes.position; for (let i = 0; i < dp.count; i++) { let y = dp.getY(i) + dt * 0.2; if (y > 15) y -= 30; dp.setY(i, y); } dp.needsUpdate = true;
    for (let i = 0; i < this.PMAX; i++) { const d = this.pd[i];
      if (d.l > 0) { d.l -= dt; d.v.multiplyScalar(Math.pow(0.2, dt)); d.p.addScaledVector(d.v, dt); d.r.x += dt * 6; this._q.setFromEuler(d.r); this._s.setScalar(Math.max(0, Math.min(1, d.l * 1.4)) * d.s); } else this._s.setScalar(0);
      this._m.compose(d.p, this._q, this._s); this.parts.setMatrixAt(i, this._m); }
    this.parts.instanceMatrix.needsUpdate = true;
    this.flash = (this.flash || 0) * Math.pow(0.05, dt); this.bloom.strength = 0.5 + this.flash * 1.0;
    this.composer.render();
  }
}
const ZONE_HUE_ARR = [0x8a7fb8, 0xff8a4a, 0x4a8cff, 0xffc94a, 0xff6ad5, 0x6afff0, 0x9a5cff];
