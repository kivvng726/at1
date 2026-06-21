import * as THREE from 'three';

const gooVert = /* glsl */`
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const gooFrag = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform float uTime, uSeed, uStretchAmt, uGrain, uBaseR, uWobble;
  uniform vec2 uStretchDir;
  uniform vec3 uColor;

  float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }
  float fbm(vec2 p){
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main(){
    vec2 p = vUv - 0.5;
    float r = length(p);
    float ang = atan(p.y, p.x);
    float wob = fbm(vec2(cos(ang), sin(ang)) * 1.8 + uSeed + uTime * 0.35) - 0.5;
    float edge = uBaseR + wob * uWobble;
    float dir = dot(normalize(p + 1e-5), uStretchDir);
    edge += max(dir, 0.0) * uStretchAmt;

    float soft = 0.04;
    float a = smoothstep(edge + soft, edge - soft, r);

    float g = hash(gl_FragCoord.xy + floor(uTime * 2.0));
    a += (g - 0.5) * uGrain;
    float mask = smoothstep(0.42, 0.58, a);

    if (mask < 0.01) discard;
    gl_FragColor = vec4(uColor, mask);
  }
`;

function spawnHome() {
  let hx;
  let hy;
  let hz;
  do {
    const ang = Math.random() * Math.PI * 2;
    const rad = 2.2 + Math.random() * 3.0;
    hx = Math.cos(ang) * rad;
    hz = Math.sin(ang) * rad;
    hy = (Math.random() * 2 - 1) * 4.0;
  } while (Math.hypot(hx, hz) < 1.8 && Math.abs(hy) < 2.5);
  return new THREE.Vector3(hx, hy, hz);
}

function makeBlob(geo) {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: Math.random() * 10 },
      uSeed: { value: Math.random() * 10 },
      uStretchDir: { value: new THREE.Vector2(1, 0) },
      uStretchAmt: { value: 0 },
      uGrain: { value: 0.4 },
      uColor: { value: new THREE.Color(0x040406) },
      uBaseR: { value: 0.30 },
      uWobble: { value: 0.13 },
    },
    vertexShader: gooVert,
    fragmentShader: gooFrag,
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
    depthTest: true,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  const home = spawnHome();
  const size = 1.2 + Math.random() * 2.2;
  mesh.scale.setScalar(size);
  mesh.position.copy(home);
  return {
    mesh, mat, home, pos: home.clone(), vel: new THREE.Vector3(), size,
  };
}

export class GooLayer {
  constructor(params) {
    this.params = params;
    this.group = new THREE.Group();
    this.blobs = [];
    this._geo = new THREE.PlaneGeometry(1, 1);
    this._right = new THREE.Vector3();
    this._up = new THREE.Vector3();
    this._target = new THREE.Vector3();
    this._delta = new THREE.Vector3();
    this._to = new THREE.Vector3();
    this._stretch = new THREE.Vector2();
    this._count = -1;
    this.syncCount();
  }

  syncCount() {
    const n = Math.max(1, Math.floor(this.params.gooCount ?? 6));
    if (n === this._count) return;
    while (this.blobs.length < n) {
      const b = makeBlob(this._geo);
      this.group.add(b.mesh);
      this.blobs.push(b);
    }
    while (this.blobs.length > n) {
      const b = this.blobs.pop();
      this.group.remove(b.mesh);
      b.mat.dispose();
    }
    this._count = n;
  }

  update(dt, camera, mouseWorld, mouseActive) {
    this.syncCount();
    dt = Math.min(dt, 0.05);
    const p = this.params;
    const influence = p.gooInfluence ?? 2.2;
    const pull = p.gooPull ?? 0.8;
    const stiffness = p.gooStiffness ?? 4;
    const damping = p.gooDamping ?? 4;
    const stretchMax = p.gooStretch ?? 0.18;
    const baseR = p.gooBaseR ?? 0.30;
    const wobble = p.gooWobble ?? 0.13;
    const grain = p.gooGrain ?? 0.4;

    this._right.setFromMatrixColumn(camera.matrixWorld, 0);
    this._up.setFromMatrixColumn(camera.matrixWorld, 1);

    for (const b of this.blobs) {
      b.mesh.quaternion.copy(camera.quaternion);

      this._target.copy(b.home);
      let amt = 0;

      if (mouseActive) {
        const d = b.pos.distanceTo(mouseWorld);
        if (d < influence) {
          const k = 1 - d / influence;
          this._target.lerp(mouseWorld, k * pull);
          amt = k * stretchMax;
          this._to.copy(mouseWorld).sub(b.pos);
          const sx = this._to.dot(this._right);
          const sy = this._to.dot(this._up);
          const sl = Math.hypot(sx, sy);
          if (sl > 1e-4) this._stretch.set(sx / sl, sy / sl);
          else this._stretch.set(1, 0);
          b.mat.uniforms.uStretchDir.value.copy(this._stretch);
        }
      }

      const curAmt = b.mat.uniforms.uStretchAmt.value;
      b.mat.uniforms.uStretchAmt.value = curAmt + (amt - curAmt) * Math.min(8 * dt, 1);

      this._delta.copy(this._target).sub(b.pos).multiplyScalar(stiffness * dt);
      b.vel.add(this._delta);
      b.vel.multiplyScalar(Math.exp(-damping * dt));
      b.pos.addScaledVector(b.vel, dt);
      b.mesh.position.copy(b.pos);

      b.mat.uniforms.uBaseR.value = baseR;
      b.mat.uniforms.uWobble.value = wobble;
      b.mat.uniforms.uGrain.value = grain;
      b.mat.uniforms.uColor.value.set(p.gooColor ?? '#040406');
      b.mat.uniforms.uTime.value += dt;
    }
  }

  dispose() {
    this.blobs.forEach((b) => b.mat.dispose());
    this._geo.dispose();
  }
}
