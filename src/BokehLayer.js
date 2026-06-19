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
  void main(){
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    a = pow(a, 1.6);
    gl_FragColor = vec4(vColor, a * vOpacity * uOpacityScale);
  }
`;

export class BokehLayer {
  constructor(params) {
    this.params = params;
    const N = params.bokehCount;
    const pos = new Float32Array(N * 3);
    const size = new Float32Array(N);
    const color = new Float32Array(N * 3);
    const phase = new Float32Array(N);
    const opacity = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      const ang = Math.random() * Math.PI * 2;
      const radius = params.bokehOrbitRadius + (Math.random() - 0.5) * params.bokehOrbitJitter;
      const y = (Math.random() - 0.5) * params.bokehOrbitBand;
      pos[i * 3] = Math.cos(ang) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(ang) * radius;
      size[i] = 6 + Math.random() * 20;
      const c = hsl2rgb(0.55 + Math.random() * 0.35, 0.5, 0.65);
      color[i * 3] = c[0];
      color[i * 3 + 1] = c[1];
      color[i * 3 + 2] = c[2];
      phase[i] = Math.random() * Math.PI * 2;
      opacity[i] = 0.06 + Math.random() * 0.14;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacity, 1));

    this.mat = new THREE.ShaderMaterial({
      vertexShader: bokehVertex,
      fragmentShader: bokehFragment,
      uniforms: {
        uTime: { value: 0 },
        uDpr: { value: 1 },
        uOpacityScale: { value: params.bokehOpacityScale },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
  }

  setDpr(dpr) {
    this.mat.uniforms.uDpr.value = dpr;
  }

  update(time) {
    this.mat.uniforms.uTime.value = time;
    this.mat.uniforms.uOpacityScale.value = this.params.bokehOpacityScale;
  }
}
