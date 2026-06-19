import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import { columnPositionFrag, columnVertex, columnFragment } from './particleColumnShaders.js';

export class ParticleColumn {
  constructor(renderer, params, size = 256) {
    this.renderer = renderer;
    this.params = params;
    this.size = size;
    this._initCompute();
    this._initPoints();
  }

  _initCompute() {
    this.gpu = new GPUComputationRenderer(this.size, this.size, this.renderer);
    const tex = this.gpu.createTexture();
    const a = tex.image.data;
    for (let i = 0; i < a.length; i += 4) {
      a[i] = (Math.random() - 0.5) * 2;
      a[i + 1] = (Math.random() - 0.5) * 6;
      a[i + 2] = (Math.random() - 0.5) * 2;
      a[i + 3] = Math.random();
    }
    this.posVar = this.gpu.addVariable('texturePosition', columnPositionFrag, tex);
    this.gpu.setVariableDependencies(this.posVar, [this.posVar]);
    Object.assign(this.posVar.material.uniforms, {
      dt: { value: 0 },
      uTime: { value: 0 },
      uSwirl: { value: 1.2 },
      uPull: { value: 1.0 },
      uRise: { value: 0.15 },
      uNoiseScale: { value: 0.35 },
      uNoiseStrength: { value: 0.6 },
      uCoreRadius: { value: 1.0 },
      uMaxRadius: { value: 4.0 },
      uHeight: { value: 6.0 },
      uTwist: { value: 1.5 },
      uSpread: { value: 0.25 },
    });
    this.posVar.wrapS = THREE.ClampToEdgeWrapping;
    this.posVar.wrapT = THREE.ClampToEdgeWrapping;
    const err = this.gpu.init();
    if (err) console.error('GPUComputationRenderer:', err);
  }

  _initPoints() {
    const N = this.size * this.size;
    const refs = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      refs[i * 2] = (i % this.size + 0.5) / this.size;
      refs[i * 2 + 1] = (Math.floor(i / this.size) + 0.5) / this.size;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    geo.setAttribute('reference', new THREE.BufferAttribute(refs, 2));
    this.mat = new THREE.ShaderMaterial({
      vertexShader: columnVertex,
      fragmentShader: columnFragment,
      uniforms: {
        uPositions: { value: null },
        uSize: { value: 2.0 },
        uDpr: { value: this.renderer.getPixelRatio() },
        uMatcap: { value: null },
        uHasMatcap: { value: 0 },
        uBrightness: { value: 1.0 },
        uHueScale: { value: 0.08 },
        uHueShift: { value: 0 },
        uSat: { value: 0.7 },
        uCoreRadius: { value: 1.0 },
      },
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
  }

  loadMatcap(url = '/matcap.png') {
    new THREE.TextureLoader().load(
      url,
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        this.mat.uniforms.uMatcap.value = t;
        this.mat.uniforms.uHasMatcap.value = 1;
      },
      undefined,
      () => { console.warn('matcap 未找到,程序化备用'); },
    );
  }

  update(dt, time) {
    const u = this.posVar.material.uniforms;
    const p = this.params;
    u.dt.value = dt;
    u.uTime.value = time;
    u.uSwirl.value = p.uSwirl;
    u.uPull.value = p.uPull;
    u.uRise.value = p.uRise;
    u.uNoiseScale.value = p.uNoiseScale;
    u.uNoiseStrength.value = p.uNoiseStrength;
    u.uCoreRadius.value = p.uCoreRadius;
    u.uMaxRadius.value = p.uMaxRadius;
    u.uHeight.value = p.uHeight;
    u.uTwist.value = p.uTwist;
    u.uSpread.value = p.uSpread;
    this.gpu.compute();
    const m = this.mat.uniforms;
    m.uPositions.value = this.gpu.getCurrentRenderTarget(this.posVar).texture;
    m.uSize.value = p.uSize;
    m.uDpr.value = this.renderer.getPixelRatio();
    m.uBrightness.value = p.uBrightness;
    m.uHueScale.value = p.uHueScale;
    m.uSat.value = p.uSat;
    m.uCoreRadius.value = p.uCoreRadius;
    m.uHueShift.value = time * 0.04;
  }
}
