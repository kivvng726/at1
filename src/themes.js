import * as THREE from 'three';

export const ENV_PRESETS = {
  glass: {
    sky: 0x0a0d14,
    lights: [
      [0x6a5cc0, -7, 2, 2, 8, 8, 0.8],
      [0x4aa8c8, 7, 1, -2, 8, 8, 0.8],
      [0xc070a0, 1, -6, 4, 6, 6, 0.7],
      [0x70c0a0, -3, 6, -4, 5, 5, 0.5],
      [0xdfe6ef, 0, 8, 0, 4, 4, 1.4],
    ],
  },
  mono: {
    sky: 0x10131a,
    lights: [
      [0xffffff, 0, 8, 0, 5, 5, 1.6],
      [0xc4ccd8, -7, 2, 2, 8, 8, 0.9],
      [0x8a96ac, 7, 1, -2, 8, 8, 0.7],
      [0x3a4a6a, 1, -6, 4, 6, 6, 0.4],
    ],
  },
};

const SHARED = {
  uSwirl: 2.2, uPull: 4.0, uRise: -0.31, uNoiseScale: 0.78, uNoiseStrength: 0.72,
  uCoreRadius: 0.85, uMaxRadius: 4.84, uTwist: 3.0, uSpread: 0.0, uSize: 0.72,
  uHueScale: 0.07, uFrostAmount: 0, uGrainScale: 5.6, uInk: 0,
  cameraDist: 4.9, cameraFov: 34,
  bokehCount: 200, bokehHeightSpan: 16,
  bokehOrbitRadius: 3.72, bokehOrbitJitter: 2.66, bokehOrbitBand: 0.22, bokehOrbitSpeed: 0.19,
  uDyeStrength: 1.0, uBottom: '#000000', uGlow: '#000000',
  bloomStrength: 0, bloomRadius: 0,
  uFrost: 0, uFrostScale: 3.0,
  scrollAngular: 0.4, scrollDescent: 0.22, scrollDamp: 0.05, scrollSens: 0.01, scrollMax: 40,
  cardCount: 16, cardWidth: 1.5, cardHeight: 1, cardScrollStart: 0.8, cardScrollGap: 2.9,
  cardDist: 3, cardSide: 0, cardYOffset: 0, cardYStagger: 0, cardTilt: 0, cardFadeRange: 6.0,
  cardSnap: true, snapDelay: 0.85, snapEase: 0.03,
  cardThickness: 0.02, cardRadius: 0.06, cardBreathAmp: 0.05, cardHoverPush: 0.6,
  cardContentBrightness: 2.0,
  spineRotX: 0, spineRotY: 0, spineRotZ: 0, spineYOffset: 0, spineSpin: 0.05,
  spineIridescence: 1.0,
};

export const THEMES = {
  glass: {
    id: 'glass',
    label: 'Glass',
    envPreset: 'glass',
    clearColor: '#000000',
    fluidSplatScale: 0.18,
    gooEnabled: false,
    bokehColorMode: 'hsl',
    bgDyeAdditive: true,
    ...SHARED,
    uHeight: 6.4,
    uBrightness: 0.2,
    uSat: 0.48,
    uMouseRadius: 0.72,
    uMouseDrag: 0.60,
    uMouseStick: 0.30,
    bokehRingCount: 7,
    bokehOpacityScale: 1.0,
    uTop: '#0a0d0c',
    uDyeColor: '#0a0d0c',
    uGlowPosX: 0.15,
    uGlowPosY: 0.35,
    bloomThreshold: 0.08,
    vignette: 1.0,
    aberration: 0.01,
    grain: 0,
    cardTintStrength: 0.05,
    cardGlassDarken: 1.0,
    cardSheen: 0.0,
    cardOpacity: 0.80,
    cardEmissive: 0.0,
    cardTextGlow: 3.0,
    cardContentOpacity: 1.0,
    cardContentSat: 1.0,
    cardBodySat: 1.0,
    cardEdge: 0.08,
    cardFresnelPow: 5.0,
    spineScaleMul: 1,
    spineTransmission: 0.13,
    spineRoughness: 0.26,
    spineThickness: 4.88,
    spineIor: 1.84,
    spineIridescenceIOR: 2.30,
    spineClearcoat: 1.0,
    spineClearcoatRoughness: 0.72,
    spineEnvIntensity: 3.0,
    spineAttenuationDistance: 8.0,
    spineColor: '#ffffff',
    spineAttenuationColor: '#ffffff',
  },
  mono: {
    id: 'mono',
    label: 'Mono',
    envPreset: 'mono',
    clearColor: '#ffffff',
    fluidSplatScale: 0.32,
    gooEnabled: true,
    bokehColorMode: 'mono',
    bgDyeAdditive: false,
    ...SHARED,
    uHeight: 8,
    uBrightness: 1.0,
    uSat: 0,
    uMouseRadius: 0.92,
    uMouseDrag: 0.92,
    uMouseStick: 0.3,
    bokehRingCount: 6,
    bokehOpacityScale: 1.0,
    uTop: '#ffffff',
    uDyeColor: '#ffffff',
    uGlowPosX: 0.0,
    uGlowPosY: 0.18,
    bloomThreshold: 0.08,
    vignette: 1.0,
    aberration: 0.005,
    grain: 0,
    cardFresnelPow: 5.0,
    cardTintStrength: 0.05,
    cardGlassDarken: 1.0,
    cardSheen: 0.0,
    cardOpacity: 0.81,
    cardEmissive: 0.0,
    cardTextGlow: 3.0,
    cardContentOpacity: 1.0,
    cardContentSat: 1.0,
    cardBodySat: 1.0,
    cardEdge: 0.16,
    spineScaleMul: 1,
    spineTransmission: 0.8,
    spineRoughness: 1.0,
    spineThickness: 5.0,
    spineIor: 1.0,
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
  },
};

const META_KEYS = new Set([
  'id', 'label', 'envPreset', 'clearColor', 'fluidSplatScale',
  'gooEnabled', 'bokehColorMode', 'bgDyeAdditive',
]);

export function applyTheme(ctx, themeId) {
  const theme = THEMES[themeId];
  if (!theme) return ctx.currentThemeId;

  const { params } = ctx;
  for (const [k, v] of Object.entries(theme)) {
    if (!META_KEYS.has(k)) params[k] = v;
  }

  params.bokehColorMode = theme.bokehColorMode;
  params.bgDyeAdditive = theme.bgDyeAdditive;

  ctx.currentThemeId = themeId;
  ctx.fluidSplatScale = theme.fluidSplatScale;

  ctx.renderer.setClearColor(new THREE.Color(theme.clearColor));
  ctx.renderer.domElement.style.background = theme.clearColor;

  ctx.syncBackground();

  ctx.bokeh.applyTheme();
  ctx.spine.applyParams();
  ctx.spine.setEnvironment(ctx.baseScene, ctx.renderer, theme.envPreset);
  ctx.goo.group.visible = theme.gooEnabled;

  ctx.bloom.threshold = params.bloomThreshold;

  ctx.onThemeApplied?.(theme);
  return themeId;
}

export function toggleTheme(ctx) {
  const next = ctx.currentThemeId === 'glass' ? 'mono' : 'glass';
  return applyTheme(ctx, next);
}
