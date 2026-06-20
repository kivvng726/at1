import * as THREE from 'three';
import { cardVertex, cardFragment, textVertex, textFragment } from './cardShaders.js';

const PLACEHOLDER = new THREE.DataTexture(new Uint8Array([10, 10, 14, 255]), 1, 1, THREE.RGBAFormat);
PLACEHOLDER.colorSpace = THREE.SRGBColorSpace;
PLACEHOLDER.needsUpdate = true;

const CARD_PRESETS = [
  { img: '/work/微信图片_20260620094757_1488_17.jpg', title: 'DEEP\nFIELD', tint: [0.10, 0.14, 0.18], edge: [0.60, 0.72, 0.86] },
  { img: '/work/微信图片_20260620094758_1489_17.jpg', title: 'HARMONIC\nSTATE', tint: [0.12, 0.10, 0.18], edge: [0.70, 0.60, 0.90] },
  { img: '/work/微信图片_20260620094800_1490_17.jpg', title: 'WELCOME TO\nHOGWARTS', tint: [0.10, 0.16, 0.13], edge: [0.60, 0.80, 0.70] },
  { img: '/work/微信图片_20260620094800_1491_17.jpg', title: 'NEURAL\nDRIFT', tint: [0.10, 0.16, 0.13], edge: [0.58, 0.72, 0.78] },
  { img: '/work/微信图片_20260620094801_1492_17.jpg', title: 'VOID\nECHO', tint: [0.15, 0.12, 0.18], edge: [0.62, 0.70, 0.84] },
  { img: '/work/微信图片_20260620094803_1493_17.jpg', title: 'CHROMA\nPULSE', tint: [0.18, 0.12, 0.12], edge: [0.64, 0.68, 0.76] },
  { img: '/work/微信图片_20260620094803_1494_17.jpg', title: 'SILENT\nGRID', tint: [0.11, 0.15, 0.16], edge: [0.58, 0.73, 0.80] },
  { img: '/work/微信图片_20260620094804_1495_17.jpg', title: 'LUMEN\nPATH', tint: [0.14, 0.11, 0.15], edge: [0.61, 0.71, 0.83] },
  { img: '/work/微信图片_20260620094805_1496_17.jpg', title: 'AETHER\nFLOW', tint: [0.12, 0.13, 0.17], edge: [0.59, 0.75, 0.81] },
  { img: '/work/微信图片_20260620094806_1497_17.jpg', title: 'PRISM\nSHIFT', tint: [0.16, 0.13, 0.11], edge: [0.63, 0.69, 0.77] },
  { img: '/work/微信图片_20260620094807_1498_17.jpg', title: 'SIGNAL\nLOST', tint: [0.11, 0.14, 0.20], edge: [0.62, 0.74, 0.85] },
  { img: '/work/微信图片_20260620094808_1499_17.jpg', title: 'DARK\nMATTER', tint: [0.13, 0.11, 0.16], edge: [0.65, 0.68, 0.82] },
];

const _up = new THREE.Vector3(0, 1, 0);
const _camP = new THREE.Vector3();
const _look = new THREE.Vector3();
const _viewDir = new THREE.Vector3();
const _right = new THREE.Vector3();
const _base = new THREE.Vector3();
const _outward = new THREE.Vector3();
const _breath = new THREE.Vector3();
const _ndc = new THREE.Vector2();

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function buildCardGeometry(params) {
  const shape = roundedRectShape(params.cardWidth, params.cardHeight, params.cardRadius);
  const t = Math.max(params.cardThickness, 0.001);
  const bevel = Math.min(0.012, t * 0.12);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: t,
    bevelEnabled: bevel > 0.0003,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 16,
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

function geoKey(params) {
  return `${params.cardWidth}_${params.cardHeight}_${params.cardThickness}_${params.cardRadius}`;
}

function loadCardMedia(mesh, preset, maxAnisotropy) {
  const mat = mesh.material;
  mesh.userData.readyTarget = 0;

  if (preset.video) {
    const video = document.createElement('video');
    Object.assign(video, {
      src: preset.video,
      loop: true,
      muted: true,
      autoplay: true,
      playsInline: true,
      crossOrigin: 'anonymous',
    });
    video.play().catch(() => {});
    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    mat.uniforms.uContent.value = tex;
    mesh.userData.mediaVideo = video;

    const onMeta = () => {
      if (video.videoWidth && video.videoHeight) {
        mat.uniforms.uImgAspect.value = video.videoWidth / video.videoHeight;
      }
      mesh.userData.readyTarget = 1;
    };
    video.addEventListener('loadedmetadata', onMeta);
    if (video.readyState >= 1) onMeta();
    return;
  }

  new THREE.TextureLoader().load(
    preset.img,
    (tex) => {
      if (!mesh.parent) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      mat.uniforms.uContent.value = tex;
      if (tex.image?.width && tex.image?.height) {
        mat.uniforms.uImgAspect.value = tex.image.width / tex.image.height;
      }
      mesh.userData.readyTarget = 1;
    },
    undefined,
    () => console.warn('卡片图加载失败:', preset.img),
  );
}

function drawTextCanvas(canvas, text) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = '600 84px "Space Grotesk", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  text.split('\n').forEach((ln, i) => ctx.fillText(ln, 70, 210 + i * 110));
}

function makeTextPlane(text, cardW, glow) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  drawTextCanvas(canvas, text);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const mat = new THREE.ShaderMaterial({
    vertexShader: textVertex,
    fragmentShader: textFragment,
    uniforms: {
      uMap: { value: tex },
      uGlow: { value: glow },
      uFade: { value: 0 },
    },
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    toneMapped: false,
  });
  const aspect = canvas.width / canvas.height;
  const w = cardW * 0.85;
  const h = w / aspect;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  mesh.userData.textCanvas = canvas;
  mesh.userData.textTitle = text;
  return mesh;
}

function textPlaneZ(params) {
  return Math.max(params.cardThickness, 0.001) * 0.5 + 0.05;
}

function makeCard(params, preset) {
  const { tint, edge, title } = preset;
  const mat = new THREE.ShaderMaterial({
    vertexShader: cardVertex,
    fragmentShader: cardFragment,
    uniforms: {
      uScene: { value: null },
      uContent: { value: PLACEHOLDER },
      uImgAspect: { value: 1.6 },
      uCardAspect: { value: params.cardWidth / params.cardHeight },
      uContentReady: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uHalf: { value: new THREE.Vector2(params.cardWidth / 2, params.cardHeight / 2) },
      uTime: { value: 0 },
      uBlur: { value: 14 },
      uTint: { value: new THREE.Color(...tint) },
      uEdgeColor: { value: new THREE.Color(...edge) },
      uTintStrength: { value: params.cardTintStrength },
      uEdge: { value: params.cardEdge },
      uFresnelPow: { value: params.cardFresnelPow },
      uContentOpacity: { value: params.cardContentOpacity },
      uContentBrightness: { value: params.cardContentBrightness },
      uContentSat: { value: params.cardContentSat },
      uBodySat: { value: params.cardBodySat },
      uGlassDarken: { value: params.cardGlassDarken },
      uGlassAlpha: { value: params.cardOpacity },
      uSheen: { value: params.cardSheen },
      uEmissive: { value: params.cardEmissive },
      uGlitch: { value: 1.0 },
      uFade: { value: 0 },
      uHover: { value: 0 },
    },
    transparent: true,
    depthTest: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(buildCardGeometry(params), mat);
  mesh.frustumCulled = false;
  mesh.userData.phase = Math.random() * Math.PI * 2;
  mesh.userData.hoverV = 0;
  mesh.userData.readyTarget = 0;

  const textMesh = makeTextPlane(title, params.cardWidth, params.cardTextGlow);
  textMesh.position.z = textPlaneZ(params);
  textMesh.renderOrder = 1;
  mesh.add(textMesh);
  mesh.userData.textMesh = textMesh;

  return mesh;
}

function disposeCard(mesh) {
  const tm = mesh.userData.textMesh;
  if (tm) {
    tm.geometry.dispose();
    tm.material.uniforms.uMap.value?.dispose();
    tm.material.dispose();
  }
  const content = mesh.material.uniforms.uContent.value;
  if (content && content !== PLACEHOLDER) content.dispose();
  const video = mesh.userData.mediaVideo;
  if (video) {
    video.pause();
    video.removeAttribute('src');
    video.load();
  }
  mesh.geometry.dispose();
  mesh.material.dispose();
}

function syncCardUniforms(params, mesh) {
  const u = mesh.material.uniforms;
  u.uHalf.value.set(params.cardWidth / 2, params.cardHeight / 2);
  u.uTintStrength.value = params.cardTintStrength;
  u.uEdge.value = params.cardEdge;
  u.uFresnelPow.value = params.cardFresnelPow;
  u.uContentOpacity.value = params.cardContentOpacity;
  u.uContentBrightness.value = params.cardContentBrightness;
  u.uContentSat.value = params.cardContentSat;
  u.uBodySat.value = params.cardBodySat;
  u.uGlassDarken.value = params.cardGlassDarken;
  u.uGlassAlpha.value = params.cardOpacity;
  u.uSheen.value = params.cardSheen;
  u.uEmissive.value = params.cardEmissive;
  u.uCardAspect.value = params.cardWidth / params.cardHeight;

  const tm = mesh.userData.textMesh;
  if (tm) {
    tm.position.z = textPlaneZ(params);
    tm.material.uniforms.uGlow.value = params.cardTextGlow;
  }
}

export function helixPos(params, s, target = _camP) {
  const th = Math.PI * 0.5 + s * params.scrollAngular;
  const y = params.uHeight * 0.45 - s * params.scrollDescent;
  return target.set(
    Math.cos(th) * params.cameraDist,
    y,
    Math.sin(th) * params.cameraDist,
  );
}

export function helixLook(params, s, target = _look) {
  const y = params.uHeight * 0.45 - s * params.scrollDescent;
  return target.set(0, y, 0);
}

export function cardScrollAt(params, index) {
  return params.cardScrollStart + index * params.cardScrollGap;
}

export function computeScrollMax(params) {
  const n = Math.max(0, Math.floor(params.cardCount) - 1);
  return params.cardScrollStart + n * params.cardScrollGap + 1;
}

function layoutWorkCards(params, cards, scrollNow, time, camera, hoveredIndex) {
  cards.forEach((mesh, i) => {
    const s = cardScrollAt(params, i);
    helixPos(params, s, _camP);
    helixLook(params, s, _look);
    _viewDir.subVectors(_look, _camP).normalize();
    _right.crossVectors(_viewDir, _up).normalize();

    const stagger = (i % 2 ? 1 : -1) * params.cardYStagger;
    _base.copy(_camP)
      .addScaledVector(_viewDir, params.cardDist)
      .addScaledVector(_right, (i % 2 ? 1 : -1) * params.cardSide)
      .addScaledVector(_up, params.cardYOffset + stagger);

    mesh.rotation.set(0, 0, 0);
    mesh.lookAt(_camP);
    mesh.rotateZ((i % 2 ? 1 : -1) * params.cardTilt);

    const ph = mesh.userData.phase;
    const a = params.cardBreathAmp;
    _breath.set(
      Math.sin(time * 0.5 + ph),
      Math.sin(time * 0.41 + ph * 1.3),
      Math.sin(time * 0.6 + ph * 0.7) * 0.5,
    ).multiplyScalar(a);
    mesh.rotateZ(Math.sin(time * 0.3 + ph) * 0.012);

    const target = i === hoveredIndex ? 1 : 0;
    mesh.userData.hoverV += (target - mesh.userData.hoverV) * 0.12;
    const hv = mesh.userData.hoverV;

    _outward.subVectors(camera.position, _base).normalize();
    mesh.position.copy(_base).add(_breath).addScaledVector(_outward, params.cardHoverPush * hv);

    mesh.material.uniforms.uHover.value = hv;

    const u = mesh.material.uniforms;
    const rt = mesh.userData.readyTarget ?? 0;
    u.uContentReady.value += (rt - u.uContentReady.value) * 0.05;

    const ds = Math.abs(scrollNow - s);
    let fade = THREE.MathUtils.clamp(1 - ds / params.cardFadeRange, 0, 1);
    fade = fade * fade * (3 - 2 * fade);
    fade = Math.max(fade, hv);
    mesh.material.uniforms.uFade.value = fade;
    mesh.visible = fade > 0.01;
    mesh.renderOrder = 10 + i;

    const tm = mesh.userData.textMesh;
    if (tm) {
      tm.material.uniforms.uFade.value = fade;
      tm.material.uniforms.uGlow.value = params.cardTextGlow;
    }

    syncCardUniforms(params, mesh);
  });
}

export class WorkCardSystem {
  constructor(params, cardScene, renderer) {
    this.params = params;
    this.cardScene = cardScene;
    this.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    this.cards = [];
    this._count = -1;
    this._geoKey = '';
    this.hoveredIndex = -1;
    this.raycaster = new THREE.Raycaster();
    this.syncCount();
  }

  _addCard(index) {
    const preset = CARD_PRESETS[index % CARD_PRESETS.length];
    const mesh = makeCard(this.params, preset);
    loadCardMedia(mesh, preset, this.maxAnisotropy);
    this.cardScene.add(mesh);
    this.cards.push(mesh);
  }

  _removeCard() {
    const mesh = this.cards.pop();
    if (!mesh) return;
    this.cardScene.remove(mesh);
    disposeCard(mesh);
  }

  syncCount() {
    const n = Math.max(0, Math.floor(this.params.cardCount));
    if (n === this._count) return;
    while (this.cards.length < n) this._addCard(this.cards.length);
    while (this.cards.length > n) this._removeCard();
    this._count = n;
    this._geoKey = '';
  }

  syncGeometry() {
    const key = geoKey(this.params);
    if (key === this._geoKey) return;
    const geo = buildCardGeometry(this.params);
    this.cards.forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.geometry = geo.clone();
    });
    geo.dispose();
    this._geoKey = key;
  }

  updateHover(camera, pointer) {
    _ndc.set(pointer.nx, pointer.ny);
    this.raycaster.setFromCamera(_ndc, camera);
    const vis = this.cards.filter((c) => c.visible);
    const hits = this.raycaster.intersectObjects(vis, false);
    this.hoveredIndex = hits.length ? this.cards.indexOf(hits[0].object) : -1;
    document.body.style.cursor = this.hoveredIndex >= 0 ? 'pointer' : '';
  }

  update(sceneTexture, resolution, time, scrollNow, camera, pointer) {
    this.syncCount();
    this.syncGeometry();
    layoutWorkCards(this.params, this.cards, scrollNow, time, camera, this.hoveredIndex);
    this.updateHover(camera, pointer);
    layoutWorkCards(this.params, this.cards, scrollNow, time, camera, this.hoveredIndex);
    this.cards.forEach((mesh) => {
      const u = mesh.material.uniforms;
      u.uScene.value = sceneTexture;
      u.uResolution.value.copy(resolution);
      u.uTime.value = time;
    });
  }
}
