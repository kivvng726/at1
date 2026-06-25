import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { FluidSimulation } from './FluidSimulation.js';
import { ParticleColumn } from './ParticleColumn.js';
import { BokehLayer } from './BokehLayer.js';
import { bgVertex, bgFragment } from './particleColumnShaders.js';
import { PostShader } from './postShader.js';
import { TexturePass } from './TexturePass.js';
import { WorkCardSystem } from './WorkCards.js';
import { Spine } from './Spine.js';
import { GooLayer } from './GooLayer.js';
import { initLeva } from './levaPanel.jsx';
import { applyTheme } from './themes.js';
import { initThemePill, reflectTheme } from './themePill.js';
import { initAtMenu } from './atMenu.js';
import { getSpineModelPath } from './spineModels.js';

const params = {
  uSwirl: 2.2,
  uPull: 4.0,
  uRise: -0.31,
  uNoiseScale: 0.78,
  uNoiseStrength: 0.72,
  uCoreRadius: 0.85,
  uMaxRadius: 4.84,
  uHeight: 8,
  uTwist: 3.0,
  uSpread: 0.0,
  uSize: 0.72,
  uBrightness: 1.0,
  uHueScale: 0.07,
  uSat: 0,
  uFrostAmount: 0,
  uGrainScale: 5.6,
  uInk: 0,
  uMouseRadius: 0.92,
  uMouseDrag: 0.92,
  uMouseStick: 0.3,
  cameraDist: 4.9,
  cameraFov: 34,
  bokehCount: 200,
  bokehRingCount: 6,
  bokehHeightSpan: 16,
  bokehOrbitRadius: 3.72,
  bokehOrbitJitter: 2.66,
  bokehOrbitBand: 0.22,
  bokehOrbitSpeed: 0.19,
  bokehOpacityScale: 1.0,
  uDyeStrength: 1.0,
  uDyeColor: '#ffffff',
  uTop: '#ffffff',
  uBottom: '#000000',
  uGlow: '#000000',
  uGlowPosX: 0.0,
  uGlowPosY: 0.18,
  bloomStrength: 0,
  bloomRadius: 0,
  bloomThreshold: 0.08,
  vignette: 1.0,
  aberration: 0.005,
  grain: 0,
  uFrost: 0,
  uFrostScale: 3.0,
  scrollAngular: 0.4,
  scrollDescent: 0.22,
  scrollDamp: 0.05,
  scrollSens: 0.01,
  scrollMax: 40,
  cardCount: 16,
  cardWidth: 1.5,
  cardHeight: 1,
  cardScrollStart: 0.8,
  cardScrollGap: 2.9,
  cardDist: 3,
  cardSide: 0,
  cardYOffset: 0,
  cardYStagger: 0,
  cardTilt: 0,
  cardFadeRange: 6.0,
  cardSnap: true,
  snapDelay: 0.85,
  snapEase: 0.03,
  cardTintStrength: 0.05,
  cardEdge: 0.16,
  cardFresnelPow: 5.0,
  cardContentOpacity: 1.0,
  cardContentBrightness: 2.0,
  cardContentSat: 1.0,
  cardBodySat: 1.0,
  cardGlassDarken: 1.0,
  cardSheen: 0.0,
  cardOpacity: 0.81,
  cardEmissive: 0.0,
  cardTextGlow: 3.0,
  cardThickness: 0.02,
  cardRadius: 0.06,
  cardBreathAmp: 0.05,
  cardHoverPush: 0.6,
  spineRotX: 0,
  spineRotY: 0,
  spineRotZ: 0,
  spineYOffset: 0,
  spineSpin: 0.05,
  spineScaleMul: 1,
  spineTransmission: 0.8,
  spineRoughness: 1.0,
  spineThickness: 5.0,
  spineIor: 1.0,
  spineIridescence: 1.0,
  spineIridescenceIOR: 1.0,
  spineClearcoat: 1.0,
  spineClearcoatRoughness: 1.0,
  spineEnvIntensity: 3.0,
  spineAttenuationDistance: 8.0,
  spineColor: '#000000',
  spineAttenuationColor: '#ffffff',
  gooCount: 2,
  gooBaseR: 0.15,
  gooWobble: 0.03,
  gooGrain: 0,
  gooInfluence: 2.2,
  gooPull: 0.8,
  gooStiffness: 4,
  gooDamping: 4,
  gooStretch: 0.18,
  gooColor: '#040406',
  bokehColorMode: 'mono',
  bgDyeAdditive: false,
};

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.autoClear = false;
renderer.toneMapping = THREE.NoToneMapping;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.cssText = 'position:fixed;inset:0;background:#ffffff;';
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xffffff, 1);

const camera = new THREE.PerspectiveCamera(
  params.cameraFov,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.set(0, params.uHeight * 0.45, params.cameraDist);

const baseScene = new THREE.Scene();
const cardScene = new THREE.Scene();
const group = new THREE.Group();
baseScene.add(group);

const column = new ParticleColumn(renderer, params, 256);
column.loadMatcap('/matcap.png');
column.points.renderOrder = 1;
group.add(column.points);

const bokeh = new BokehLayer(params);
bokeh.setDpr(renderer.getPixelRatio());
bokeh.root.renderOrder = 0;
baseScene.add(bokeh.root);

const goo = new GooLayer(params);
goo.group.renderOrder = 2;
baseScene.add(goo.group);

const fluidParams = {
  simRes: 128,
  dyeRes: 256,
  densityDissipation: 0.97,
  velocityDissipation: 0.98,
  pressure: 0.8,
  pressureIterations: 4,
  curl: 30,
  splatRadius: 0.25,
  splatForce: 6000,
};
const fluid = new FluidSimulation(renderer, fluidParams);

let fx = 0.5;
let fy = 0.5;
let fLX = 0.5;
let fLY = 0.5;
let fDx = 0;
let fDy = 0;
let fMoved = false;

const bgMat = new THREE.ShaderMaterial({
  vertexShader: bgVertex,
  fragmentShader: bgFragment,
  depthTest: false,
  depthWrite: false,
  uniforms: {
    uTop: { value: new THREE.Color(params.uTop) },
    uBottom: { value: new THREE.Color(params.uBottom) },
    uGlow: { value: new THREE.Color(params.uGlow) },
    uGlowPos: { value: new THREE.Vector2(params.uGlowPosX, params.uGlowPosY) },
    uDye: { value: null },
    uDyeStrength: { value: params.uDyeStrength },
    uDyeColor: { value: new THREE.Color(params.uDyeColor) },
    uDyeAdditive: { value: params.bgDyeAdditive ? 1 : 0 },
  },
});
const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
bgQuad.frustumCulled = false;
bgQuad.renderOrder = -1;
baseScene.add(bgQuad);

const spine = new Spine(params);
baseScene.add(spine.group);
spine.load(getSpineModelPath());

const cardSystem = new WorkCardSystem(params, cardScene, renderer);

const sceneRT = new THREE.WebGLRenderTarget(1, 1, {
  type: THREE.HalfFloatType,
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  depthBuffer: true,
  stencilBuffer: false,
});
const sceneRes = new THREE.Vector2();

function resizeSceneRT() {
  const w = renderer.domElement.width;
  const h = renderer.domElement.height;
  sceneRT.setSize(w, h);
  sceneRes.set(w, h);
}

resizeSceneRT();

const composer = new EffectComposer(renderer);
const texturePass = new TexturePass(sceneRT.texture);
composer.addPass(texturePass);

const cardPass = new RenderPass(cardScene, camera);
cardPass.clear = false;
cardPass.clearDepth = true;
composer.addPass(cardPass);

const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  params.bloomStrength,
  params.bloomRadius,
  params.bloomThreshold,
);
const postPass = new ShaderPass(PostShader);
postPass.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);

composer.addPass(bloom);
composer.addPass(postPass);

composer.addPass(new OutputPass());

const pointer = { nx: 0, ny: 0 };

const mouseWorld = new THREE.Vector3(9999, 9999, 9999);
const mouseTarget = new THREE.Vector3(9999, 9999, 9999);
const mousePrev = new THREE.Vector3();
const mouseVel = new THREE.Vector3();
const _unproj = new THREE.Vector3();
const _rayDir = new THREE.Vector3();
const _gooRay = new THREE.Raycaster();
const _gooPlane = new THREE.Plane();
const _camDir = new THREE.Vector3();
const _origin = new THREE.Vector3(0, 0, 0);
const _gooMouse = new THREE.Vector3();
const _ndc = new THREE.Vector2();
let mouseActive = false;

let scroll = 0;
let scrollTarget = 0;
let touchY = null;
let lastWheel = -1e9;

window.addEventListener('wheel', (e) => {
  e.preventDefault();
  lastWheel = performance.now();
  scrollTarget = Math.min(
    Math.max(scrollTarget + e.deltaY * params.scrollSens, 0),
    params.scrollMax,
  );
}, { passive: false });

window.addEventListener('touchstart', (e) => {
  touchY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (touchY === null) return;
  const dy = touchY - e.touches[0].clientY;
  lastWheel = performance.now();
  scrollTarget = Math.min(
    Math.max(scrollTarget + dy * params.scrollSens * 2.0, 0),
    params.scrollMax,
  );
  touchY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', () => {
  touchY = null;
});

window.addEventListener('pointermove', (e) => {
  const nx = (e.clientX / window.innerWidth) * 2 - 1;
  const ny = -((e.clientY / window.innerHeight) * 2 - 1);
  pointer.nx = nx;
  pointer.ny = ny;

  fx = e.clientX / window.innerWidth;
  fy = 1 - e.clientY / window.innerHeight;
  fDx = (fx - fLX) * fluidParams.splatForce;
  fDy = (fy - fLY) * fluidParams.splatForce;
  fLX = fx;
  fLY = fy;
  fMoved = true;

  _unproj.set(nx, ny, 0.5).unproject(camera);
  _rayDir.copy(_unproj).sub(camera.position).normalize();
  const tt = -camera.position.z / _rayDir.z;
  mouseTarget.copy(camera.position).add(_rayDir.multiplyScalar(tt));
  mouseActive = true;
});

function syncBackground() {
  bgMat.uniforms.uTop.value.set(params.uTop);
  bgMat.uniforms.uBottom.value.set(params.uBottom);
  bgMat.uniforms.uGlow.value.set(params.uGlow);
  bgMat.uniforms.uGlowPos.value.set(params.uGlowPosX, params.uGlowPosY);
  bgMat.uniforms.uDyeStrength.value = params.uDyeStrength;
  bgMat.uniforms.uDyeColor.value.set(params.uDyeColor);
  bgMat.uniforms.uDyeAdditive.value = params.bgDyeAdditive ? 1 : 0;
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = params.cameraFov;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  bokeh.setDpr(renderer.getPixelRatio());
  fluid.resize();
  resizeSceneRT();
  texturePass.texture = sceneRT.texture;
  composer.setSize(window.innerWidth, window.innerHeight);
  bloom.setSize(window.innerWidth, window.innerHeight);
  postPass.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
}

initLeva(params, () => {
  syncBackground();
  onResize();
}, spine, goo);

const themeCtx = {
  params,
  renderer,
  baseScene,
  bokeh,
  spine,
  goo,
  bloom,
  syncBackground,
  currentThemeId: 'mono',
  fluidSplatScale: 0.32,
};

initThemePill(themeCtx);

initAtMenu({
  defaultId: 'xr',
  onSelect(id) {
    console.log('nav:', id);
  },
  onAsk(q) {
    console.log('ASK:', q);
  },
});

const COOL = [[0.5, 0.3, 1.0], [0.3, 0.7, 1.0], [0.0, 0.9, 0.9], [0.8, 0.3, 0.9]];
function fluidColor() {
  const c = COOL[(Math.random() * COOL.length) | 0];
  const k = themeCtx.fluidSplatScale;
  return new THREE.Vector3(c[0] * k, c[1] * k, c[2] * k);
}

applyTheme(themeCtx, 'mono');
reflectTheme('mono');

window.addEventListener('resize', onResize);

let last = performance.now();
let lastFov = params.cameraFov;

function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - last) / 1000, 0.0166);
  last = now;
  const t = now * 0.001;

  if (mouseActive) {
    mousePrev.copy(mouseWorld);
    if (mouseWorld.x > 9000) mouseWorld.copy(mouseTarget);
    mouseWorld.lerp(mouseTarget, 0.2);
    mouseVel.subVectors(mouseWorld, mousePrev).multiplyScalar(1 / Math.max(dt, 1e-3));
    mouseVel.clampLength(0, 8);
  }
  column.setMouse(mouseWorld, mouseVel);

  column.update(dt, t);
  bokeh.root.rotation.y += dt * params.bokehOrbitSpeed;
  bokeh.update(t);
  group.rotation.y += dt * 0.01;
  spine.update(dt);

  if (fMoved) {
    fluid.splat(fx, fy, fDx, fDy, fluidColor());
    fMoved = false;
  }
  fluid.step(dt);
  bgMat.uniforms.uDye.value = fluid.dye.read.texture;

  scrollTarget = Math.min(scrollTarget, params.scrollMax);

  if (params.cardSnap && now - lastWheel > params.snapDelay * 1000) {
    const n = Math.round((scrollTarget - params.cardScrollStart) / params.cardScrollGap);
    const snapTo = params.cardScrollStart
      + THREE.MathUtils.clamp(n, 0, Math.max(0, params.cardCount - 1)) * params.cardScrollGap;
    scrollTarget += (snapTo - scrollTarget) * params.snapEase;
  }

  scroll += (scrollTarget - scroll) * params.scrollDamp;
  const startY = params.uHeight * 0.45;
  const theta = Math.PI * 0.5 + scroll * params.scrollAngular;
  const camY = startY - scroll * params.scrollDescent;
  const R = params.cameraDist;

  const tx = Math.cos(theta) * R + pointer.nx * 0.4;
  const ty = camY + pointer.ny * 0.3;
  const tz = Math.sin(theta) * R;
  camera.position.x += (tx - camera.position.x) * 0.1;
  camera.position.y += (ty - camera.position.y) * 0.1;
  camera.position.z += (tz - camera.position.z) * 0.1;
  if (params.cameraFov !== lastFov) {
    camera.fov = params.cameraFov;
    camera.updateProjectionMatrix();
    lastFov = params.cameraFov;
  }
  camera.lookAt(0, camY, 0);

  camera.getWorldDirection(_camDir);
  _gooPlane.setFromNormalAndCoplanarPoint(_camDir, _origin);
  _ndc.set(pointer.nx, pointer.ny);
  _gooRay.setFromCamera(_ndc, camera);
  _gooRay.ray.intersectPlane(_gooPlane, _gooMouse);
  goo.update(dt, camera, _gooMouse, mouseActive);

  renderer.setRenderTarget(sceneRT);
  renderer.clear();
  renderer.render(baseScene, camera);
  renderer.setRenderTarget(null);

  cardSystem.update(sceneRT.texture, sceneRes, t, scroll, camera, pointer);

  bloom.strength = params.bloomStrength;
  bloom.radius = params.bloomRadius;
  bloom.threshold = params.bloomThreshold;
  postPass.uniforms.uTime.value = t;
  postPass.uniforms.uVignette.value = params.vignette;
  postPass.uniforms.uAberration.value = params.aberration;
  postPass.uniforms.uGrain.value = params.grain;
  postPass.uniforms.uFrost.value = params.uFrost;
  postPass.uniforms.uFrostScale.value = params.uFrostScale;

  composer.render();
}

requestAnimationFrame(loop);
