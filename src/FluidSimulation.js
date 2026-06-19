import * as THREE from 'three';
import * as S from './fluidShaders.js';

function makeFBO(w, h) {
  return new THREE.WebGLRenderTarget(w, h, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    wrapS: THREE.ClampToEdgeWrapping,
    wrapT: THREE.ClampToEdgeWrapping,
    depthBuffer: false,
    stencilBuffer: false,
  });
}

function makeDoubleFBO(w, h) {
  let r = makeFBO(w, h);
  let w2 = makeFBO(w, h);
  return {
    get read() { return r; },
    get write() { return w2; },
    swap() { const t = r; r = w2; w2 = t; },
    setSize(nw, nh) { r.setSize(nw, nh); w2.setSize(nw, nh); },
  };
}

export class FluidSimulation {
  constructor(renderer, params) {
    this.renderer = renderer;
    this.params = params;

    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
    this.scene.add(this.quad);

    this._buildMaterials();
    this.resize();
  }

  _mat(fragment, uniforms) {
    return new THREE.ShaderMaterial({
      vertexShader: S.baseVertex,
      fragmentShader: fragment,
      uniforms,
      depthTest: false,
      depthWrite: false,
    });
  }

  _buildMaterials() {
    const tex = { value: new THREE.Vector2() };
    this.mat = {
      splat: this._mat(S.splatFrag, {
        texelSize: tex,
        uTarget: { value: null },
        aspectRatio: { value: 1 },
        color: { value: new THREE.Vector3() },
        point: { value: new THREE.Vector2() },
        radius: { value: 0.0025 },
      }),
      advection: this._mat(S.advectionFrag, {
        texelSize: { value: new THREE.Vector2() },
        uVelocity: { value: null },
        uSource: { value: null },
        dt: { value: 0 },
        dissipation: { value: 1 },
      }),
      divergence: this._mat(S.divergenceFrag, {
        texelSize: { value: new THREE.Vector2() },
        uVelocity: { value: null },
      }),
      curl: this._mat(S.curlFrag, {
        texelSize: { value: new THREE.Vector2() },
        uVelocity: { value: null },
      }),
      vorticity: this._mat(S.vorticityFrag, {
        texelSize: { value: new THREE.Vector2() },
        uVelocity: { value: null },
        uCurl: { value: null },
        curl: { value: 30 },
        dt: { value: 0 },
      }),
      pressure: this._mat(S.pressureFrag, {
        texelSize: { value: new THREE.Vector2() },
        uPressure: { value: null },
        uDivergence: { value: null },
      }),
      gradient: this._mat(S.gradientSubtractFrag, {
        texelSize: { value: new THREE.Vector2() },
        uPressure: { value: null },
        uVelocity: { value: null },
      }),
      clear: this._mat(S.clearFrag, {
        uTexture: { value: null },
        value: { value: 0 },
      }),
      display: this._mat(S.displayFrag, {
        uTexture: { value: null },
      }),
    };
  }

  _getRes(res) {
    const gl = this.renderer.getContext();
    let aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspect < 1) aspect = 1 / aspect;
    const min = Math.round(res);
    const max = Math.round(res * aspect);
    return gl.drawingBufferWidth > gl.drawingBufferHeight
      ? { width: max, height: min }
      : { width: min, height: max };
  }

  resize() {
    const sim = this._getRes(this.params.simRes);
    const dye = this._getRes(this.params.dyeRes);
    this.simTexel = new THREE.Vector2(1 / sim.width, 1 / sim.height);
    this.dyeTexel = new THREE.Vector2(1 / dye.width, 1 / dye.height);

    if (!this.velocity) {
      this.velocity = makeDoubleFBO(sim.width, sim.height);
      this.dye = makeDoubleFBO(dye.width, dye.height);
      this.pressure = makeDoubleFBO(sim.width, sim.height);
      this.divergence = makeFBO(sim.width, sim.height);
      this.curlFbo = makeFBO(sim.width, sim.height);
    } else {
      this.velocity.setSize(sim.width, sim.height);
      this.dye.setSize(dye.width, dye.height);
      this.pressure.setSize(sim.width, sim.height);
      this.divergence.setSize(sim.width, sim.height);
      this.curlFbo.setSize(sim.width, sim.height);
    }
  }

  _blit(material, target) {
    this.quad.material = material;
    this.renderer.setRenderTarget(target);
    this.renderer.render(this.scene, this.camera);
  }

  splat(x, y, dx, dy, color) {
    const aspect = this.renderer.domElement.width / this.renderer.domElement.height;
    const radius = (this.params.splatRadius / 100.0) * aspect;

    const sp = this.mat.splat.uniforms;
    sp.texelSize.value.copy(this.simTexel);
    sp.uTarget.value = this.velocity.read.texture;
    sp.aspectRatio.value = aspect;
    sp.point.value.set(x, y);
    sp.color.value.set(dx, dy, 0);
    sp.radius.value = radius;
    this._blit(this.mat.splat, this.velocity.write);
    this.velocity.swap();

    sp.uTarget.value = this.dye.read.texture;
    sp.color.value.set(color.x, color.y, color.z);
    this._blit(this.mat.splat, this.dye.write);
    this.dye.swap();
  }

  step(dt) {
    const p = this.params;
    const setTexel = (u) => u.texelSize.value.copy(this.simTexel);

    setTexel(this.mat.curl.uniforms);
    this.mat.curl.uniforms.uVelocity.value = this.velocity.read.texture;
    this._blit(this.mat.curl, this.curlFbo);

    setTexel(this.mat.vorticity.uniforms);
    this.mat.vorticity.uniforms.uVelocity.value = this.velocity.read.texture;
    this.mat.vorticity.uniforms.uCurl.value = this.curlFbo.texture;
    this.mat.vorticity.uniforms.curl.value = p.curl;
    this.mat.vorticity.uniforms.dt.value = dt;
    this._blit(this.mat.vorticity, this.velocity.write);
    this.velocity.swap();

    setTexel(this.mat.divergence.uniforms);
    this.mat.divergence.uniforms.uVelocity.value = this.velocity.read.texture;
    this._blit(this.mat.divergence, this.divergence);

    this.mat.clear.uniforms.uTexture.value = this.pressure.read.texture;
    this.mat.clear.uniforms.value.value = p.pressure;
    this._blit(this.mat.clear, this.pressure.write);
    this.pressure.swap();

    setTexel(this.mat.pressure.uniforms);
    this.mat.pressure.uniforms.uDivergence.value = this.divergence.texture;
    for (let i = 0; i < p.pressureIterations; i++) {
      this.mat.pressure.uniforms.uPressure.value = this.pressure.read.texture;
      this._blit(this.mat.pressure, this.pressure.write);
      this.pressure.swap();
    }

    setTexel(this.mat.gradient.uniforms);
    this.mat.gradient.uniforms.uPressure.value = this.pressure.read.texture;
    this.mat.gradient.uniforms.uVelocity.value = this.velocity.read.texture;
    this._blit(this.mat.gradient, this.velocity.write);
    this.velocity.swap();

    const adv = this.mat.advection.uniforms;
    adv.texelSize.value.copy(this.simTexel);
    adv.uVelocity.value = this.velocity.read.texture;
    adv.uSource.value = this.velocity.read.texture;
    adv.dt.value = dt;
    adv.dissipation.value = p.velocityDissipation;
    this._blit(this.mat.advection, this.velocity.write);
    this.velocity.swap();

    adv.texelSize.value.copy(this.dyeTexel);
    adv.uVelocity.value = this.velocity.read.texture;
    adv.uSource.value = this.dye.read.texture;
    adv.dissipation.value = p.densityDissipation;
    this._blit(this.mat.advection, this.dye.write);
    this.dye.swap();
  }

  render() {
    this.mat.display.uniforms.uTexture.value = this.dye.read.texture;
    this._blit(this.mat.display, null);
  }
}
