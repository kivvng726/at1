import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import { positionFrag, renderVertex, renderFragment } from './particleShaders.js';

export class ParticleSystem {
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
    const arr = tex.image.data;
    for (let i = 0; i < arr.length; i += 4) {
      arr[i] = Math.random();
      arr[i + 1] = Math.random();
      arr[i + 2] = 0.0;
      arr[i + 3] = Math.random();
    }
    this.posVar = this.gpu.addVariable('texturePosition', positionFrag, tex);
    this.gpu.setVariableDependencies(this.posVar, [this.posVar]);
    Object.assign(this.posVar.material.uniforms, {
      uVelocity: { value: null },
      uTexel: { value: new THREE.Vector2(1 / 256, 1 / 256) },
      dt: { value: 0 },
      uTime: { value: 0 },
      uVelocityScale: { value: 1.0 },
      uNoiseScale: { value: 2.0 },
      uNoiseStrength: { value: 0.05 },
      uLifeDecay: { value: 0.3 },
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
      vertexShader: renderVertex,
      fragmentShader: renderFragment,
      uniforms: {
        uPositions: { value: null },
        uVelocity: { value: null },
        uSize: { value: 1.9 },
        uDpr: { value: this.renderer.getPixelRatio() },
        uSpeedScale: { value: 0.02 },
        uMatcap: { value: null },
        uHasMatcap: { value: 0 },
        uBrightness: { value: 1.0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(geo, this.mat);
    this.points.frustumCulled = false;
    this.scene = new THREE.Scene();
    this.scene.add(this.points);
    this.camera = new THREE.Camera();
  }

  update(velocityTexture, simTexel, dt, time) {
    const u = this.posVar.material.uniforms;
    u.uVelocity.value = velocityTexture;
    u.uTexel.value.copy(simTexel);
    u.dt.value = dt;
    u.uTime.value = time;
    u.uVelocityScale.value = this.params.uVelocityScale;
    u.uNoiseScale.value = this.params.uNoiseScale;
    u.uNoiseStrength.value = this.params.uNoiseStrength;
    u.uLifeDecay.value = this.params.uLifeDecay;
    this.gpu.compute();
    this.mat.uniforms.uVelocity.value = velocityTexture;
  }

  loadMatcap(url = '/matcap.png') {
    new THREE.TextureLoader().load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        this.mat.uniforms.uMatcap.value = tex;
        this.mat.uniforms.uHasMatcap.value = 1;
      },
      undefined,
      () => { console.warn('matcap 未找到,使用程序化备用'); },
    );
  }

  syncUniforms() {
    this.mat.uniforms.uPositions.value =
      this.gpu.getCurrentRenderTarget(this.posVar).texture;
    this.mat.uniforms.uSize.value = this.params.uSize;
    this.mat.uniforms.uDpr.value = this.renderer.getPixelRatio();
    this.mat.uniforms.uBrightness.value = this.params.uBrightness;
  }
}
