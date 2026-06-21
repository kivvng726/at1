import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { ENV_PRESETS } from './themes.js';

function makeFrostNormal(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    img.data[i * 4] = 128 + (Math.random() - 0.5) * 60;
    img.data[i * 4 + 1] = 128 + (Math.random() - 0.5) * 60;
    img.data[i * 4 + 2] = 255;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

export class Spine {
  constructor(params) {
    this.params = params;
    this.group = new THREE.Group();
    this.model = null;
    this.env = null;
    this.frostNormal = makeFrostNormal();
    this.mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(params.spineColor ?? 0x000000),
      metalness: 0.0,
      roughness: params.spineRoughness ?? 1.0,
      transmission: params.spineTransmission ?? 0.8,
      thickness: params.spineThickness ?? 5.0,
      ior: params.spineIor ?? 1.0,
      attenuationColor: new THREE.Color(params.spineAttenuationColor ?? 0xffffff),
      attenuationDistance: params.spineAttenuationDistance ?? 8.0,
      iridescence: params.spineIridescence ?? 1.0,
      iridescenceIOR: params.spineIridescenceIOR ?? 1.0,
      iridescenceThicknessRange: [200, 900],
      clearcoat: params.spineClearcoat ?? 1.0,
      clearcoatRoughness: params.spineClearcoatRoughness ?? 1.0,
      envMapIntensity: params.spineEnvIntensity ?? 3.0,
      normalMap: this.frostNormal,
      normalScale: new THREE.Vector2(0.15, 0.15),
      transparent: true,
      side: THREE.DoubleSide,
    });
  }

  setEnvironment(scene, renderer, preset = 'mono') {
    if (this.env) this.env.dispose();

    const cfg = ENV_PRESETS[preset] ?? ENV_PRESETS.mono;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = new THREE.Scene();

    env.add(new THREE.Mesh(
      new THREE.SphereGeometry(12, 24, 24),
      new THREE.MeshBasicMaterial({ color: cfg.sky, side: THREE.BackSide }),
    ));

    const light = (hex, x, y, z, w, h, mul = 1) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(mul) }),
      );
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    for (const [hex, x, y, z, w, h, mul] of cfg.lights) {
      light(hex, x, y, z, w, h, mul);
    }

    this.env = pmrem.fromScene(env, 0.04).texture;
    scene.environment = this.env;
    this.mat.envMap = this.env;
    this.mat.needsUpdate = true;
    pmrem.dispose();
  }

  applyParams() {
    const p = this.params;
    this.mat.color.set(p.spineColor);
    this.mat.roughness = p.spineRoughness ?? 1.0;
    this.mat.transmission = p.spineTransmission ?? 0.8;
    this.mat.thickness = p.spineThickness ?? 5.0;
    this.mat.ior = p.spineIor ?? 1.0;
    this.mat.attenuationColor.set(p.spineAttenuationColor);
    this.mat.attenuationDistance = p.spineAttenuationDistance ?? 8.0;
    this.mat.iridescence = p.spineIridescence ?? 1.0;
    this.mat.iridescenceIOR = p.spineIridescenceIOR ?? 1.0;
    this.mat.clearcoat = p.spineClearcoat ?? 1.0;
    this.mat.clearcoatRoughness = p.spineClearcoatRoughness ?? 1.0;
    this.mat.envMapIntensity = p.spineEnvIntensity ?? 3.0;
    this.refit();
  }

  load(url, onReady) {
    const loader = new GLTFLoader();
    const draco = new DRACOLoader();
    draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    loader.setDRACOLoader(draco);

    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((o) => {
          if (o.isMesh) {
            o.material = this.mat;
            o.geometry.computeVertexNormals();
            o.frustumCulled = false;
            o.castShadow = false;
            o.receiveShadow = false;
          }
        });
        this.model = model;
        this.group.add(model);
        this._fit();
        console.log('✅ 脊椎已加载');
        onReady?.();
      },
      (xhr) => {
        if (xhr.total) console.log(`脊椎 ${(xhr.loaded / xhr.total * 100) | 0}%`);
      },
      (e) => console.error('❌ 脊椎加载失败(检查路径/decoder):', e),
    );
  }

  _fit() {
    if (!this.model) return;
    const p = this.params;
    const H = p.uHeight || 6;
    const mul = p.spineScaleMul ?? 1;

    this.model.position.set(0, 0, 0);
    this.model.rotation.set(p.spineRotX || 0, p.spineRotY || 0, p.spineRotZ || 0);
    this.model.scale.setScalar(1);
    this.model.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(this.model);
    const size = new THREE.Vector3();
    box.getSize(size);
    if (size.y > 1e-6) this.model.scale.setScalar((H / size.y) * mul);
    this.model.updateMatrixWorld(true);

    const box2 = new THREE.Box3().setFromObject(this.model);
    const center = new THREE.Vector3();
    box2.getCenter(center);
    this.model.position.sub(center);
    this.model.position.y += p.spineYOffset || 0;
  }

  refit() {
    this._fit();
  }

  update(dt) {
    this.group.rotation.y += dt * (this.params.spineSpin || 0);
  }
}
