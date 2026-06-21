import * as THREE from 'three';

function hsl2rgb(h, s, l) {
  const k = (n) => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
}

const bokehVertex = /* glsl */`
  uniform float uTime, uDpr;
  attribute float aSize, aPhase, aOpacity;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vOpacity;
  void main(){
    vColor = aColor; vOpacity = aOpacity;
    vec3 p = position;
    p.y += sin(uTime * 0.3 + aPhase) * 0.12;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uDpr;
  }
`;

const bokehFragment = /* glsl */`
  precision highp float;
  varying vec3 vColor;
  varying float vOpacity;
  uniform float uOpacityScale;
  uniform float uEdgePow;
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    a = pow(a, uEdgePow);
    gl_FragColor = vec4(vColor, a * vOpacity * uOpacityScale);
  }
`;

function buildRingGeometry(params, ringIndex, ringCount, colorMode) {
  const N = params.bokehCount;
  const pos = new Float32Array(N * 3);
  const size = new Float32Array(N);
  const color = new Float32Array(N * 3);
  const phase = new Float32Array(N);
  const opacity = new Float32Array(N);

  const hueShift = (ringIndex / Math.max(ringCount, 1)) * 0.12;
  const hsl = colorMode === 'hsl';

  for (let i = 0; i < N; i++) {
    const ang = Math.random() * Math.PI * 2;
    const radius = params.bokehOrbitRadius + (Math.random() - 0.5) * params.bokehOrbitJitter;
    const y = (Math.random() - 0.5) * params.bokehOrbitBand;
    pos[i * 3] = Math.cos(ang) * radius;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(ang) * radius;
    if (hsl) {
      size[i] = 6 + Math.random() * 20;
      const c = hsl2rgb(0.55 + Math.random() * 0.35 + hueShift, 0.5, 0.65);
      color[i * 3] = c[0];
      color[i * 3 + 1] = c[1];
      color[i * 3 + 2] = c[2];
      opacity[i] = 0.06 + Math.random() * 0.14;
    } else {
      size[i] = THREE.MathUtils.lerp(6, 28, Math.random());
      const lum = Math.random();
      color[i * 3] = lum;
      color[i * 3 + 1] = lum;
      color[i * 3 + 2] = lum;
      opacity[i] = THREE.MathUtils.lerp(0.06, 0.28, Math.random());
    }
    phase[i] = Math.random() * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacity, 1));
  return geo;
}

function ringCenterY(params, ringIndex, ringCount) {
  if (ringCount <= 1) return 0;
  const t = ringIndex / (ringCount - 1);
  return (t - 0.5) * params.bokehHeightSpan;
}

export class BokehLayer {
  constructor(params) {
    this.params = params;
    this.root = new THREE.Group();
    this.rings = [];
    this._ringCount = -1;
    this._perRing = -1;
    this._colorMode = params.bokehColorMode ?? 'mono';

    this.mat = new THREE.ShaderMaterial({
      vertexShader: bokehVertex,
      fragmentShader: bokehFragment,
      uniforms: {
        uTime: { value: 0 },
        uDpr: { value: 1 },
        uOpacityScale: { value: params.bokehOpacityScale },
        uEdgePow: { value: 1.0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.syncRings();
  }

  applyTheme() {
    const mode = this.params.bokehColorMode ?? 'mono';
    this.mat.blending = mode === 'hsl' ? THREE.AdditiveBlending : THREE.NormalBlending;
    this.mat.uniforms.uEdgePow.value = mode === 'hsl' ? 1.6 : 1.0;
    if (mode !== this._colorMode) {
      this._colorMode = mode;
      this._ringCount = -1;
    }
    this.syncRings();
  }

  syncRings() {
    const p = this.params;
    const ringCount = Math.max(1, Math.floor(p.bokehRingCount));
    const perRing = Math.max(1, Math.floor(p.bokehCount));
    const colorMode = p.bokehColorMode ?? 'mono';
    if (ringCount === this._ringCount && perRing === this._perRing && colorMode === this._colorMode) return;

    this.rings.forEach((ring) => {
      this.root.remove(ring);
      ring.geometry.dispose();
    });
    this.rings = [];

    for (let r = 0; r < ringCount; r++) {
      const geo = buildRingGeometry(p, r, ringCount, colorMode);
      const points = new THREE.Points(geo, this.mat);
      points.frustumCulled = false;
      points.position.y = ringCenterY(p, r, ringCount);
      this.root.add(points);
      this.rings.push(points);
    }

    this._ringCount = ringCount;
    this._perRing = perRing;
    this._colorMode = colorMode;
  }

  layoutRings() {
    const ringCount = this.rings.length;
    this.rings.forEach((ring, r) => {
      ring.position.y = ringCenterY(this.params, r, ringCount);
    });
  }

  setDpr(dpr) {
    this.mat.uniforms.uDpr.value = dpr;
  }

  update(time) {
    this.syncRings();
    this.layoutRings();
    this.mat.uniforms.uTime.value = time;
    this.mat.uniforms.uOpacityScale.value = this.params.bokehOpacityScale;
  }

  dispose() {
    this.rings.forEach((ring) => ring.geometry.dispose());
    this.mat.dispose();
  }
}
