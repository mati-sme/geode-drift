// Geode Drift — Three.js scene: lit faceted geode, glowing crystals, orbiting drones, bloom, particles.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { GENS, STRATA } from './core.js';

function hash(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
function noise3(p) { // cheap value noise
  const i = p.clone().floor(), f = p.clone().sub(i); const u = f.clone().multiply(f).multiply(new THREE.Vector3(3, 3, 3).sub(f.clone().multiplyScalar(2)));
  let r = 0;
  for (let dx = 0; dx < 2; dx++) for (let dy = 0; dy < 2; dy++) for (let dz = 0; dz < 2; dz++) {
    const w = (dx ? u.x : 1 - u.x) * (dy ? u.y : 1 - u.y) * (dz ? u.z : 1 - u.z);
    r += w * hash(i.x + dx, i.y + dy, i.z + dz);
  }
  return r;
}

export class Scene3D {
  constructor(canvas) {
    this.canvas = canvas;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
    r.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);
    this.camera.position.set(0, 0.6, 9);
    this.clock = new THREE.Clock();
    this.time = 0; this.squash = 0; this.hue = new THREE.Color(STRATA[0].hue); this.targetHue = this.hue.clone();
    this.raycaster = new THREE.Raycaster(); this.pointer = new THREE.Vector2();
    this.buildBackground(); this.buildLights(); this.buildGeode(); this.buildParticles(); this.buildDrones(); this.buildComet(); this.buildShock();
    const comp = this.composer = new EffectComposer(r);
    comp.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.4, 0.82);
    comp.addPass(this.bloom); comp.addPass(new OutputPass());
    this.resize(); addEventListener('resize', () => this.resize());
  }
  resize() {
    const w = this.canvas.clientWidth || innerWidth, h = this.canvas.clientHeight || innerHeight;
    this.renderer.setSize(w, h, false); this.composer.setSize(w, h);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    // keep the geode left of the side panel on wide screens
    this.offsetX = w > 900 ? -1.55 * (w / h) / 1.6 : 0;
  }
  buildBackground() {
    const g = new THREE.SphereGeometry(200, 48, 24);
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { uTime: { value: 0 }, uHue: { value: new THREE.Color(0x6a4cff) } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: `varying vec3 vP; uniform float uTime; uniform vec3 uHue;
        float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
        float n(vec3 p){ vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
          return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
                     mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
        float fbm(vec3 p){ float a=0.5, r=0.0; for(int i=0;i<5;i++){ r+=a*n(p); p*=2.03; a*=0.5; } return r; }
        void main(){ vec3 p = vP*2.2 + vec3(uTime*0.004, 0.0, uTime*0.002);
          float c = fbm(p); float c2 = fbm(p*1.7 + 4.0);
          vec3 deep = vec3(0.015,0.012,0.045);
          vec3 neb = mix(vec3(0.10,0.04,0.22), uHue*0.35, 0.5);
          vec3 col = deep + neb*smoothstep(0.45,0.95,c)*0.9 + vec3(0.02,0.10,0.16)*smoothstep(0.5,1.0,c2);
          col += vec3(0.25,0.12,0.4)*pow(max(0.0, 1.0-abs(vP.y+0.15)*2.2),3.0)*0.25*c;
          gl_FragColor = vec4(col,1.0); }`,
    });
    this.bgMat = m; this.scene.add(new THREE.Mesh(g, m));
    const N = 2600, pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(60 + Math.random() * 120);
      pos.set([v.x, v.y, v.z], i * 3);
      const c = new THREE.Color().setHSL(0.55 + Math.random() * 0.35, 0.6, 0.75 + Math.random() * 0.25);
      col.set([c.r, c.g, c.b], i * 3);
    }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); sg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.7, vertexColors: true, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false, map: this.dotTexture(), blending: THREE.AdditiveBlending }));
    this.scene.add(this.stars);
  }
  dotTexture() {
    if (this._dot) return this._dot;
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); this._dot = new THREE.CanvasTexture(c); return this._dot;
  }
  buildLights() {
    this.scene.add(new THREE.HemisphereLight(0x9fb8ff, 0x1a0b2e, 0.55));
    const key = new THREE.DirectionalLight(0xfff0e0, 2.2); key.position.set(4, 5, 6); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x8a6bff, 1.6); rim.position.set(-6, -2, -4); this.scene.add(rim);
    this.coreLight = new THREE.PointLight(0xffffff, 10, 9, 1.6); this.scene.add(this.coreLight);
  }
  buildGeode() {
    this.root = new THREE.Group(); this.scene.add(this.root);
    const geo = new THREE.IcosahedronGeometry(1.35, 5); const p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i); const n = v.clone().normalize();
      const d = 1 + (noise3(n.clone().multiplyScalar(2.2)) - 0.5) * 0.38 + (noise3(n.clone().multiplyScalar(6.5)) - 0.5) * 0.12;
      v.copy(n).multiplyScalar(1.35 * d); p.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    // vertex colours: dark crevices, lighter ridges and faint mineral veins
    const cols = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const r = v.length() / 1.35; const vein = Math.pow(Math.abs(Math.sin(v.x * 5 + v.y * 3.3 + noise3(v.clone().multiplyScalar(3)) * 6)), 24);
      const k = 0.45 + (r - 0.85) * 1.6 + vein * 0.8; cols.set([k, k * 0.95, k * (1.05 + vein * 0.6)], i * 3); }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    this.rockMat = new THREE.MeshStandardMaterial({ color: 0x5a4f72, roughness: 0.78, metalness: 0.2, flatShading: true, vertexColors: true });
    this.rock = new THREE.Mesh(geo, this.rockMat); this.root.add(this.rock);
    // inner glow shell
    this.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dotTexture(), color: 0xffffff, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })); this.glow.scale.set(6.5, 6.5, 1); this.glow.position.z = -1.2;
    this.root.add(this.glow);
    // crystals
    this.crystalMat = new THREE.MeshPhysicalMaterial({ color: 0xdfe8ff, emissive: 0x8899ff, emissiveIntensity: 0.6, roughness: 0.12, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.1, flatShading: true, transparent: true, opacity: 0.95 });
    const cg = new THREE.ConeGeometry(0.12, 0.7, 6, 1); cg.translate(0, 0.35, 0);
    this.MAXC = 90; this.crystals = new THREE.InstancedMesh(cg, this.crystalMat, this.MAXC); this.crystals.count = 0;
    this.crystalData = [];
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < this.MAXC; i++) {
      const dir = new THREE.Vector3().randomDirection(); const ray = new THREE.Raycaster(dir.clone().multiplyScalar(4), dir.clone().negate());
      const hit = ray.intersectObject(this.rock)[0]; const at = hit ? hit.point : dir.clone().multiplyScalar(1.3);
      const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().lerp(new THREE.Vector3().randomDirection(), 0.25).normalize());
      this.crystalData.push({ at: at.clone().multiplyScalar(0.96), q, s: 0.5 + Math.random() * 1.1, grow: 0 });
    }
    this.root.add(this.crystals);
    this.targetCrystals = 6;
  }
  buildParticles() {
    this.PMAX = 500;
    const g = new THREE.OctahedronGeometry(0.05, 0);
    this.partMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.45, roughness: 0.25, metalness: 0.3, flatShading: true });
    this.parts = new THREE.InstancedMesh(g, this.partMat, this.PMAX); this.parts.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.parts.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(this.PMAX * 3), 3);
    this.pdata = Array.from({ length: this.PMAX }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Euler(), s: 1 }));
    this.pi = 0; this.scene.add(this.parts); this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._s = new THREE.Vector3();
    // sparkle points (soft glints)
    const N = 200; this.spark = { n: N, pos: new Float32Array(N * 3), life: new Float32Array(N), vel: [] };
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(this.spark.pos, 3));
    for (let i = 0; i < N; i++) this.spark.vel.push(new THREE.Vector3());
    this.sparkPts = new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.14, map: this.dotTexture(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff }));
    this.scene.add(this.sparkPts); this.si = 0;
  }
  burst(worldPoint, n = 14, color) {
    const c = new THREE.Color(color ?? this.hue);
    for (let k = 0; k < n; k++) {
      const d = this.pdata[this.pi]; this.pi = (this.pi + 1) % this.PMAX;
      d.life = 0.9 + Math.random() * 0.6; d.p.copy(worldPoint);
      d.v.copy(worldPoint).sub(this.root.position).normalize().multiplyScalar(2 + Math.random() * 3).add(new THREE.Vector3().randomDirection().multiplyScalar(2));
      d.r.set(Math.random() * 6, Math.random() * 6, 0); d.s = 0.5 + Math.random() * 0.9;
      const cc = c.clone().offsetHSL((Math.random() - 0.5) * 0.08, 0, (Math.random() - 0.3) * 0.2);
      this.parts.setColorAt((this.pi + this.PMAX - 1) % this.PMAX, cc);
    }
    this.parts.instanceColor.needsUpdate = true;
    for (let k = 0; k < n; k++) { const i = this.si; this.si = (this.si + 1) % this.spark.n; this.spark.life[i] = 0.6 + Math.random() * 0.5;
      this.spark.pos.set([worldPoint.x, worldPoint.y, worldPoint.z], i * 3); this.spark.vel[i].randomDirection().multiplyScalar(1 + Math.random() * 2.5); }
  }
  buildDrones() {
    this.droneGroups = GENS.map((g, gi) => {
      const shapes = [() => new THREE.OctahedronGeometry(0.09), () => new THREE.CapsuleGeometry(0.05, 0.14, 4, 8), () => new THREE.ConeGeometry(0.08, 0.2, 8), () => new THREE.TorusGeometry(0.08, 0.03, 8, 16), () => new THREE.DodecahedronGeometry(0.09), () => new THREE.BoxGeometry(0.13, 0.13, 0.13), () => new THREE.TetrahedronGeometry(0.11), () => new THREE.IcosahedronGeometry(0.1)];
      const geo = shapes[gi % shapes.length]();
      const mat = new THREE.MeshStandardMaterial({ color: g.color, emissive: g.color, emissiveIntensity: 0.35, roughness: 0.35, metalness: 0.5 });
      const mesh = new THREE.InstancedMesh(geo, mat, 14); mesh.count = 0;
      const ring = { mesh, radius: 2.05 + gi * 0.2, tilt: new THREE.Euler((hash(gi, 1, 2) - 0.5) * 1.3, 0, (hash(gi, 3, 4) - 0.5) * 1.3), speed: 0.35 / (1 + gi * 0.12) * (gi % 2 ? -1 : 1), phase: hash(gi, 9, 9) * 6.28 };
      const orbit = new THREE.Group(); orbit.rotation.copy(ring.tilt); orbit.add(mesh); this.root.add(orbit); ring.orbit = orbit;
      // faint orbit line
      const pts = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(a) * ring.radius, 0, Math.sin(a) * ring.radius)); }
      ring.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: g.color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      orbit.add(ring.line);
      return ring;
    });
    // mining beams
    this.beams = []; for (let i = 0; i < 10; i++) {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      this.scene.add(l); this.beams.push({ l, life: 0 });
    }
  }
  buildComet() {
    const g = new THREE.Group();
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), new THREE.MeshStandardMaterial({ color: 0xfff2b0, emissive: 0xffd36b, emissiveIntensity: 2.2, flatShading: true }));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.dotTexture(), color: 0xffd27a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.set(1.6, 1.6, 1);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
    g.add(head, halo, hit); g.visible = false; this.scene.add(g);
    const N = 60; const tp = new Float32Array(N * 3); const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(tp, 3));
    this.trail = new THREE.Points(tg, new THREE.PointsMaterial({ size: 0.35, map: this.dotTexture(), color: 0xffc46b, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }));
    this.scene.add(this.trail); this.trail.visible = false;
    this.comet = { g, head, hit, active: false, t: 0, from: new THREE.Vector3(), to: new THREE.Vector3(), dur: 12, trail: tp, tn: N };
  }
  spawnComet() {
    const c = this.comet; const side = Math.random() < 0.5 ? -1 : 1;
    c.from.set(side * 9, -2 + Math.random() * 4, -2 + Math.random() * 2).add(this.root.position);
    c.to.set(-side * 9, -2 + Math.random() * 4, 1 + Math.random() * 1.5).add(this.root.position);
    c.t = 0; c.active = true; c.g.visible = true; this.trail.visible = true;
    for (let i = 0; i < c.tn; i++) c.trail.set([c.from.x, c.from.y, c.from.z], i * 3);
  }
  hideComet() { this.comet.active = false; this.comet.g.visible = false; this.trail.visible = false; }
  buildShock() {
    this.shock = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.0, 96), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, depthWrite: false }));
    this.scene.add(this.shock); this.shockT = 1;
  }
  shockwave(color = 0xffffff, big = false) { this.shock.material.color.set(color); this.shockT = 0; this.shockBig = big; this.flash = big ? 1 : 0.4; }
  setStratum(i) { this.targetHue.set(STRATA[Math.min(i, STRATA.length - 1)].hue); this.targetCrystals = Math.min(this.MAXC, 6 + i * 8); this.stratum = i; }
  setDrones(counts) { this.counts = counts; }
  pick(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    if (this.comet.active) { const h = this.raycaster.intersectObject(this.comet.hit)[0]; if (h) return { type: 'comet', point: this.comet.g.position.clone() }; }
    const h = this.raycaster.intersectObjects([this.rock, this.crystals])[0];
    return h ? { type: 'geode', point: h.point } : null;
  }
  toScreen(v) { const p = v.clone().project(this.camera); const r = this.canvas.getBoundingClientRect(); return { x: r.left + (p.x + 1) / 2 * r.width, y: r.top + (1 - p.y) / 2 * r.height }; }
  hitGeode(point) { this.squash = 1; this.burst(point, 7); this.coreFlash = 1; }
  fireBeam(gi) {
    const ring = this.droneGroups[gi]; if (!ring || ring.mesh.count === 0) return;
    const b = this.beams.find(x => x.life <= 0); if (!b) return;
    const idx = Math.floor(Math.random() * ring.mesh.count); const m = new THREE.Matrix4(); ring.mesh.getMatrixAt(idx, m);
    const from = new THREE.Vector3().setFromMatrixPosition(m).applyMatrix4(ring.orbit.matrixWorld);
    const to = this.root.position.clone().add(from.clone().sub(this.root.position).normalize().multiplyScalar(1.25));
    b.l.geometry.setFromPoints([from, to]); b.l.material.color.set(GENS[gi].color); b.life = 0.35;
    if (Math.random() < 0.5) this.burst(to, 2, GENS[gi].color);
  }
  frame() {
    const dt = Math.min(0.05, this.clock.getDelta()); this.time += dt; const t = this.time;
    this.bgMat.uniforms.uTime.value = t; this.hue.lerp(this.targetHue, 0.03); this.bgMat.uniforms.uHue.value.copy(this.hue);
    this.root.position.x += ((this.offsetX || 0) - this.root.position.x) * 0.1;
    // geode
    this.squash *= Math.pow(0.0008, dt); const sq = Math.sin(this.squash * 9) * this.squash * 0.08;
    const baseScale = 1 + Math.min(0.35, (this.stratum || 0) * 0.03);
    this.root.scale.set(baseScale * (1 + sq), baseScale * (1 - sq), baseScale * (1 + sq));
    this.rock.rotation.y += dt * 0.12; this.rock.rotation.x = Math.sin(t * 0.2) * 0.15; this.crystals.rotation.copy(this.rock.rotation);
    this.crystalMat.color.copy(this.hue).lerp(new THREE.Color(0xffffff), 0.15); this.crystalMat.emissive.copy(this.hue);
    this.crystalMat.emissiveIntensity = 0.28 + Math.sin(t * 2) * 0.06 + (this.coreFlash || 0) * 0.35;
    this.coreFlash = (this.coreFlash || 0) * Math.pow(0.02, dt);
    this.glow.material.color.copy(this.hue); this.glow.material.opacity = 0.16 + (this.coreFlash || 0) * 0.08;
    this.coreLight.color.copy(this.hue); this.coreLight.position.copy(this.root.position).add(new THREE.Vector3(0.6, 0.8, 2.2));
    this.rockMat.color.copy(new THREE.Color(0x3e3550).lerp(this.hue, 0.12));
    const want = this.targetCrystals; let shown = 0;
    for (let i = 0; i < this.MAXC; i++) {
      const d = this.crystalData[i]; d.grow += ((i < want ? 1 : 0) - d.grow) * Math.min(1, dt * 3);
      if (d.grow < 0.01) continue;
      this._s.setScalar(d.s * d.grow); this._m.compose(d.at, d.q, this._s); this.crystals.setMatrixAt(shown++, this._m);
    }
    this.crystals.count = shown; this.crystals.instanceMatrix.needsUpdate = true;
    // drones
    const counts = this.counts || [];
    this.droneGroups.forEach((ring, gi) => {
      const n = Math.min(14, counts[gi] ? Math.ceil(Math.log2(counts[gi] + 1) * 2) : 0); ring.mesh.count = n;
      ring.line.material.opacity += ((n ? 0.13 : 0) - ring.line.material.opacity) * 0.05;
      for (let k = 0; k < n; k++) {
        const a = ring.phase + t * ring.speed + k / n * Math.PI * 2;
        this._q.setFromEuler(new THREE.Euler(t * 1.5 + k, t + gi, 0)); this._s.setScalar(1 + 0.15 * Math.sin(t * 4 + k));
        this._m.compose(new THREE.Vector3(Math.cos(a) * ring.radius, Math.sin(t * 2 + k) * 0.05, Math.sin(a) * ring.radius), this._q, this._s); ring.mesh.setMatrixAt(k, this._m);
      }
      ring.mesh.instanceMatrix.needsUpdate = true;
      if (n && Math.random() < dt * (0.6 + gi * 0.15)) this.fireBeam(gi);
    });
    this.beams.forEach(b => { if (b.life > 0) { b.life -= dt; b.l.material.opacity = Math.max(0, b.life / 0.35) * 0.9; } });
    // particles
    for (let i = 0; i < this.PMAX; i++) {
      const d = this.pdata[i];
      if (d.life > 0) { d.life -= dt; d.v.multiplyScalar(Math.pow(0.25, dt)); d.v.y -= dt * 2.5; d.p.addScaledVector(d.v, dt); d.r.x += dt * 5; d.r.y += dt * 3;
        this._q.setFromEuler(d.r); this._s.setScalar(Math.max(0, Math.min(1, d.life * 1.5)) * d.s); }
      else this._s.setScalar(0);
      this._m.compose(d.p, this._q, this._s); this.parts.setMatrixAt(i, this._m);
    }
    this.parts.instanceMatrix.needsUpdate = true;
    const sp = this.spark; for (let i = 0; i < sp.n; i++) { if (sp.life[i] > 0) { sp.life[i] -= dt; const v = sp.vel[i]; sp.pos[i * 3] += v.x * dt; sp.pos[i * 3 + 1] += v.y * dt; sp.pos[i * 3 + 2] += v.z * dt; if (sp.life[i] <= 0) sp.pos[i * 3 + 1] = 9999; } }
    this.sparkPts.geometry.attributes.position.needsUpdate = true; this.sparkPts.material.color.copy(this.hue).lerp(new THREE.Color(0xffffff), 0.5);
    // comet
    const c = this.comet;
    if (c.active) {
      c.t += dt / c.dur; if (c.t >= 1) this.hideComet();
      const pos = c.from.clone().lerp(c.to, c.t); pos.y += Math.sin(c.t * Math.PI) * 1.2; c.g.position.copy(pos); c.head.rotation.x += dt * 3; c.head.rotation.y += dt * 2;
      c.trail.copyWithin(3, 0, (c.tn - 1) * 3); c.trail.set([pos.x + (Math.random() - 0.5) * 0.1, pos.y + (Math.random() - 0.5) * 0.1, pos.z], 0);
      this.trail.geometry.attributes.position.needsUpdate = true;
    }
    // shockwave + flash
    if (this.shockT < 1) { this.shockT += dt / (this.shockBig ? 1.6 : 0.8); const s = 1 + this.shockT * (this.shockBig ? 14 : 4); this.shock.scale.set(s, s, s); this.shock.position.copy(this.root.position); this.shock.lookAt(this.camera.position); this.shock.material.opacity = (1 - this.shockT) * 0.8; }
    this.flash = (this.flash || 0) * Math.pow(0.05, dt);
    this.bloom.strength = 0.45 + this.flash * 1.2 + (this.frenzy ? 0.25 : 0);
    // camera sway
    this.camera.position.x = Math.sin(t * 0.07) * 0.35; this.camera.position.y = 0.6 + Math.sin(t * 0.05) * 0.25;
    this.camera.lookAt(this.root.position.x * 0.35, 0, 0);
    this.stars.rotation.y = t * 0.004;
    this.composer.render();
  }
}
