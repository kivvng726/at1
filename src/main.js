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
import { initLeva } from './levaPanel.jsx';

const params = {
  uSwirl: 1.44,
  uPull: 0.56,
  uRise: -0.43,
  uNoiseScale: 0.79,
  uNoiseStrength: 0.99,
  uCoreRadius: 1.06,
  uMaxRadius: 5.12,
  uHeight: 10,
  uTwist: 2.34,
  uSpread: 0.0,
  uSize: 0.56,
  uBrightness: 0.2,
  uHueScale: 0.07,
  uSat: 0.59,
  uFrostAmount: 0.5,
  uGrainScale: 12.0,
  uInk: 0.4,
  uMouseRadius: 1.2,
  uMouseDrag: 1.0,
  uMouseStick: 0.6,
  cameraDist: 4.5,
  cameraFov: 38,
  bokehCount: 90,
  bokehOrbitRadius: 3.0,
  bokehOrbitJitter: 0.8,
  bokehOrbitBand: 1.5,
  bokehOrbitSpeed: 0.15,
  bokehOpacityScale: 1.0,
  uDyeStrength: 1.0,
  uTop: '#0a0d0c',
  uBottom: '#000000',
  uGlow: '#3a1452',
  uGlowPosX: 0.15,
  uGlowPosY: 0.35,
  bloomStrength: 0.3,
  bloomRadius: 0.4,
  bloomThreshold: 0.7,
  vignette: 0.4,
  aberration: 0.001,
  grain: 0.02,
  uFrost: 0,
  uFrostScale: 3.0,
  scrollAngular: 0.5,
  scrollDescent: 1.0,
  scrollDamp: 0.07,
  scrollSens: 0.0015,
  scrollMax: 9,
};

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.autoClear = false;
renderer.toneMapping = THREE.NoToneMapping;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.cssText = 'position:fixed;inset:0;background:#000;';
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0x000000, 1);

const camera = new THREE.PerspectiveCamera(
  params.cameraFov,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.set(0, params.uHeight * 0.45, params.cameraDist);

const scene = new THREE.Scene();
const group = new THREE.Group();
scene.add(group);

const column = new ParticleColumn(renderer, params, 256);
column.loadMatcap('/matcap.png');
column.points.renderOrder = 1;
group.add(column.points);

const bokeh = new BokehLayer(params);
bokeh.setDpr(renderer.getPixelRatio());
bokeh.points.renderOrder = 0;
scene.add(bokeh.points);

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

const COOL = [[0.5, 0.3, 1.0], [0.3, 0.7, 1.0], [0.0, 0.9, 0.9], [0.8, 0.3, 0.9]];
function fluidColor() {
  const c = COOL[(Math.random() * COOL.length) | 0];
  return new THREE.Vector3(c[0] * 0.18, c[1] * 0.18, c[2] * 0.18);
}

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
  },
});
const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat);
bgQuad.frustumCulled = false;
bgQuad.renderOrder = -1;
scene.add(bgQuad);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  params.bloomStrength,
  params.bloomRadius,
  params.bloomThreshold,
);
composer.addPass(bloom);

const postPass = new ShaderPass(PostShader);
postPass.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
composer.addPass(postPass);

composer.addPass(new OutputPass());

const pointer = { nx: 0, ny: 0 };

const mouseWorld = new THREE.Vector3(9999, 9999, 9999);
const mouseTarget = new THREE.Vector3(9999, 9999, 9999);
const mousePrev = new THREE.Vector3();
const mouseVel = new THREE.Vector3();
const _unproj = new THREE.Vector3();
const _rayDir = new THREE.Vector3();
let mouseActive = false;

let scroll = 0;
let scrollTarget = 0;
let touchY = null;

window.addEventListener('wheel', (e) => {
  e.preventDefault();
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
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = params.cameraFov;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  bokeh.setDpr(renderer.getPixelRatio());
  fluid.resize();
  composer.setSize(window.innerWidth, window.innerHeight);
  bloom.setSize(window.innerWidth, window.innerHeight);
  postPass.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
}

initLeva(params, () => {
  syncBackground();
  onResize();
});

syncBackground();

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
  bokeh.points.rotation.y += dt * params.bokehOrbitSpeed;
  bokeh.update(t);
  group.rotation.y += dt * 0.01;

  if (fMoved) {
    fluid.splat(fx, fy, fDx, fDy, fluidColor());
    fMoved = false;
  }
  fluid.step(dt);
  bgMat.uniforms.uDye.value = fluid.dye.read.texture;
  bgMat.uniforms.uDyeStrength.value = params.uDyeStrength;

  scrollTarget = Math.min(scrollTarget, params.scrollMax);
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
