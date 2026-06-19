import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
// import { FluidSimulation } from './FluidSimulation.js'; // 停用,后续可作背景层
import { ParticleColumn } from './ParticleColumn.js';
import { bgVertex, bgFragment } from './particleColumnShaders.js';
import { PostShader } from './postShader.js';
import { initLeva } from './levaPanel.jsx';

const params = {
  uSwirl: 1.2,
  uPull: 1.0,
  uRise: 0.15,
  uNoiseScale: 0.35,
  uNoiseStrength: 0.6,
  uCoreRadius: 1.0,
  uMaxRadius: 4.0,
  uHeight: 6.0,
  uTwist: 1.5,
  uSpread: 0.25,
  uSize: 2.0,
  uBrightness: 1.0,
  uHueScale: 0.08,
  uSat: 0.7,
  uTop: '#0a0d0c',
  uBottom: '#000000',
  uGlow: '#3a1452',
  uGlowPosX: 0.15,
  uGlowPosY: 0.35,
  bloomStrength: 0.9,
  bloomRadius: 0.7,
  bloomThreshold: 0.0,
  vignette: 0.4,
  aberration: 0.002,
  grain: 0.04,
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
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100,
);
camera.position.set(0, 0, 9);

const scene = new THREE.Scene();
const group = new THREE.Group();
scene.add(group);

const column = new ParticleColumn(renderer, params, 256);
column.loadMatcap('/matcap.png');
column.points.renderOrder = 1;
group.add(column.points);

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

window.addEventListener('pointermove', (e) => {
  pointer.nx = (e.clientX / window.innerWidth - 0.5) * 2;
  pointer.ny = -(e.clientY / window.innerHeight - 0.5) * 2;
});

function syncBackground() {
  bgMat.uniforms.uTop.value.set(params.uTop);
  bgMat.uniforms.uBottom.value.set(params.uBottom);
  bgMat.uniforms.uGlow.value.set(params.uGlow);
  bgMat.uniforms.uGlowPos.value.set(params.uGlowPosX, params.uGlowPosY);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
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

function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - last) / 1000, 0.0166);
  last = now;
  const t = now * 0.001;

  column.update(dt, t);
  group.rotation.y += dt * 0.05;

  camera.position.x += (pointer.nx * 1.2 - camera.position.x) * 0.04;
  camera.position.y += (pointer.ny * 0.8 - camera.position.y) * 0.04;
  camera.position.z = 9;
  camera.lookAt(0, 0, 0);

  bloom.strength = params.bloomStrength;
  bloom.radius = params.bloomRadius;
  bloom.threshold = params.bloomThreshold;
  postPass.uniforms.uTime.value = t;
  postPass.uniforms.uVignette.value = params.vignette;
  postPass.uniforms.uAberration.value = params.aberration;
  postPass.uniforms.uGrain.value = params.grain;

  composer.render();
}

requestAnimationFrame(loop);
