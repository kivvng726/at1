import React from 'react';
import { createRoot } from 'react-dom/client';
import { Leva, folder, useControls } from 'leva';

function LevaControls({ params, onResize, spine }) {
  useControls({
    Column: folder({
      uSwirl: {
        value: params.uSwirl,
        min: 0,
        max: 4,
        onChange: (v) => { params.uSwirl = v; },
      },
      uPull: {
        value: params.uPull,
        min: 0,
        max: 4,
        onChange: (v) => { params.uPull = v; },
      },
      uRise: {
        value: params.uRise,
        min: -1,
        max: 1,
        onChange: (v) => { params.uRise = v; },
      },
      uNoiseScale: {
        value: params.uNoiseScale,
        min: 0.05,
        max: 1.5,
        onChange: (v) => { params.uNoiseScale = v; },
      },
      uNoiseStrength: {
        value: params.uNoiseStrength,
        min: 0,
        max: 3,
        onChange: (v) => { params.uNoiseStrength = v; },
      },
      uCoreRadius: {
        value: params.uCoreRadius,
        min: 0.2,
        max: 3,
        onChange: (v) => { params.uCoreRadius = v; },
      },
      uMaxRadius: {
        value: params.uMaxRadius,
        min: 1,
        max: 8,
        onChange: (v) => { params.uMaxRadius = v; },
      },
      uHeight: {
        value: params.uHeight,
        min: 2,
        max: 12,
        onChange: (v) => { params.uHeight = v; },
      },
      uTwist: {
        value: params.uTwist,
        min: 0,
        max: 6,
        onChange: (v) => { params.uTwist = v; },
      },
      uSpread: {
        value: params.uSpread,
        min: 0,
        max: 1,
        onChange: (v) => { params.uSpread = v; },
      },
      uSize: {
        value: params.uSize,
        min: 0.2,
        max: 8,
        onChange: (v) => { params.uSize = v; },
      },
      uBrightness: {
        value: params.uBrightness,
        min: 0.2,
        max: 3,
        onChange: (v) => { params.uBrightness = v; },
      },
      uHueScale: {
        value: params.uHueScale,
        min: 0,
        max: 0.5,
        onChange: (v) => { params.uHueScale = v; },
      },
      uSat: {
        value: params.uSat,
        min: 0,
        max: 1,
        onChange: (v) => { params.uSat = v; },
      },
    }),
    Mouse: folder({
      uMouseRadius: {
        value: params.uMouseRadius,
        min: 0.2,
        max: 4,
        onChange: (v) => { params.uMouseRadius = v; },
      },
      uMouseDrag: {
        value: params.uMouseDrag,
        min: 0,
        max: 4,
        onChange: (v) => { params.uMouseDrag = v; },
      },
      uMouseStick: {
        value: params.uMouseStick,
        min: 0,
        max: 3,
        onChange: (v) => { params.uMouseStick = v; },
      },
    }),
    'Ink / Frost': folder({
      uFrostAmount: {
        value: params.uFrostAmount,
        min: 0,
        max: 1,
        onChange: (v) => { params.uFrostAmount = v; },
      },
      uGrainScale: {
        value: params.uGrainScale,
        min: 3,
        max: 40,
        onChange: (v) => { params.uGrainScale = v; },
      },
      uInk: {
        value: params.uInk,
        min: 0,
        max: 1,
        onChange: (v) => { params.uInk = v; },
      },
    }),
    Camera: folder({
      cameraDist: {
        value: params.cameraDist,
        min: 2.5,
        max: 12,
        onChange: (v) => { params.cameraDist = v; },
      },
      cameraFov: {
        value: params.cameraFov,
        min: 20,
        max: 70,
        onChange: (v) => { params.cameraFov = v; },
      },
    }),
    Scroll: folder({
      scrollAngular: {
        value: params.scrollAngular,
        min: 0,
        max: 2,
        onChange: (v) => { params.scrollAngular = v; },
      },
      scrollDescent: {
        value: params.scrollDescent,
        min: 0.05,
        max: 1.5,
        onChange: (v) => { params.scrollDescent = v; },
      },
      scrollDamp: {
        value: params.scrollDamp,
        min: 0.01,
        max: 0.25,
        onChange: (v) => { params.scrollDamp = v; },
      },
      scrollSens: {
        value: params.scrollSens,
        min: 0.0005,
        max: 0.05,
        onChange: (v) => { params.scrollSens = v; },
      },
      scrollMax: {
        value: params.scrollMax,
        min: 1,
        max: 40,
        onChange: (v) => { params.scrollMax = v; },
      },
    }),
    Cards: folder({
      cardCount: {
        value: params.cardCount,
        min: 0,
        max: 20,
        step: 1,
        onChange: (v) => { params.cardCount = Math.round(v); },
      },
      cardWidth: {
        value: params.cardWidth,
        min: 0.5,
        max: 8,
        step: 0.1,
        onChange: (v) => { params.cardWidth = v; },
      },
      cardHeight: {
        value: params.cardHeight,
        min: 0.5,
        max: 6,
        step: 0.1,
        onChange: (v) => { params.cardHeight = v; },
      },
      cardScrollStart: {
        value: params.cardScrollStart,
        min: 0,
        max: 15,
        step: 0.05,
        onChange: (v) => { params.cardScrollStart = v; },
      },
      cardScrollGap: {
        value: params.cardScrollGap,
        min: 0.5,
        max: 6,
        step: 0.05,
        onChange: (v) => { params.cardScrollGap = v; },
      },
      cardDist: {
        value: params.cardDist,
        min: 1.5,
        max: 5,
        step: 0.1,
        onChange: (v) => { params.cardDist = v; },
      },
      cardSide: {
        value: params.cardSide,
        min: 0,
        max: 2,
        step: 0.05,
        onChange: (v) => { params.cardSide = v; },
      },
      cardYOffset: {
        value: params.cardYOffset,
        min: -3,
        max: 3,
        step: 0.05,
        onChange: (v) => { params.cardYOffset = v; },
      },
      cardYStagger: {
        value: params.cardYStagger,
        min: 0,
        max: 1.5,
        step: 0.05,
        onChange: (v) => { params.cardYStagger = v; },
      },
      cardTilt: {
        value: params.cardTilt,
        min: 0,
        max: 0.5,
        step: 0.01,
        onChange: (v) => { params.cardTilt = v; },
      },
      cardFadeRange: {
        value: params.cardFadeRange,
        min: 0.5,
        max: 6,
        step: 0.05,
        onChange: (v) => { params.cardFadeRange = v; },
      },
      cardSnap: {
        value: params.cardSnap,
        onChange: (v) => { params.cardSnap = v; },
      },
      snapDelay: {
        value: params.snapDelay,
        min: 0.05,
        max: 2,
        step: 0.05,
        onChange: (v) => { params.snapDelay = v; },
      },
      snapEase: {
        value: params.snapEase,
        min: 0.01,
        max: 0.3,
        step: 0.01,
        onChange: (v) => { params.snapEase = v; },
      },
      cardGlassDarken: {
        value: params.cardGlassDarken,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => { params.cardGlassDarken = v; },
      },
      cardSheen: {
        value: params.cardSheen,
        min: 0,
        max: 0.5,
        step: 0.01,
        label: '玻璃反光',
        onChange: (v) => { params.cardSheen = v; },
      },
      cardOpacity: {
        value: params.cardOpacity,
        min: 0,
        max: 1,
        step: 0.01,
        label: '透明度',
        onChange: (v) => { params.cardOpacity = v; },
      },
      cardEmissive: {
        value: params.cardEmissive,
        min: 0,
        max: 2,
        step: 0.01,
        label: '自发光',
        onChange: (v) => { params.cardEmissive = v; },
      },
      cardTextGlow: {
        value: params.cardTextGlow,
        min: 0,
        max: 3,
        step: 0.05,
        label: '文字白光',
        onChange: (v) => { params.cardTextGlow = v; },
      },
      cardContentOpacity: {
        value: params.cardContentOpacity,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => { params.cardContentOpacity = v; },
      },
      cardContentBrightness: {
        value: params.cardContentBrightness,
        min: 0,
        max: 2,
        step: 0.01,
        onChange: (v) => { params.cardContentBrightness = v; },
      },
      cardContentSat: {
        value: params.cardContentSat,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => { params.cardContentSat = v; },
      },
      cardBodySat: {
        value: params.cardBodySat,
        min: 0,
        max: 1,
        step: 0.01,
        onChange: (v) => { params.cardBodySat = v; },
      },
      cardEdge: {
        value: params.cardEdge,
        min: 0,
        max: 0.6,
        step: 0.01,
        onChange: (v) => { params.cardEdge = v; },
      },
      cardFresnelPow: {
        value: params.cardFresnelPow,
        min: 1,
        max: 5,
        step: 0.1,
        onChange: (v) => { params.cardFresnelPow = v; },
      },
      cardThickness: {
        value: params.cardThickness,
        min: 0.001,
        max: 0.5,
        step: 0.001,
        onChange: (v) => { params.cardThickness = v; },
      },
      cardRadius: {
        value: params.cardRadius,
        min: 0.02,
        max: 0.5,
        step: 0.01,
        onChange: (v) => { params.cardRadius = v; },
      },
      cardBreathAmp: {
        value: params.cardBreathAmp,
        min: 0,
        max: 0.2,
        step: 0.005,
        onChange: (v) => { params.cardBreathAmp = v; },
      },
      cardHoverPush: {
        value: params.cardHoverPush,
        min: 0,
        max: 2,
        step: 0.05,
        onChange: (v) => { params.cardHoverPush = v; },
      },
    }),
    Bokeh: folder({
      bokehRingCount: {
        value: params.bokehRingCount,
        min: 1,
        max: 12,
        step: 1,
        onChange: (v) => { params.bokehRingCount = Math.round(v); },
      },
      bokehHeightSpan: {
        value: params.bokehHeightSpan,
        min: 2,
        max: 16,
        step: 0.1,
        onChange: (v) => { params.bokehHeightSpan = v; },
      },
      bokehCount: {
        value: params.bokehCount,
        min: 10,
        max: 200,
        step: 1,
        onChange: (v) => { params.bokehCount = Math.round(v); },
      },
      bokehOrbitRadius: {
        value: params.bokehOrbitRadius,
        min: 1,
        max: 7,
        onChange: (v) => { params.bokehOrbitRadius = v; },
      },
      bokehOrbitSpeed: {
        value: params.bokehOrbitSpeed,
        min: 0,
        max: 1,
        onChange: (v) => { params.bokehOrbitSpeed = v; },
      },
      bokehOrbitBand: {
        value: params.bokehOrbitBand,
        min: 0.1,
        max: 4,
        onChange: (v) => { params.bokehOrbitBand = v; },
      },
      bokehOrbitJitter: {
        value: params.bokehOrbitJitter,
        min: 0,
        max: 3,
        onChange: (v) => { params.bokehOrbitJitter = v; },
      },
      bokehOpacityScale: {
        value: params.bokehOpacityScale,
        min: 0,
        max: 3,
        onChange: (v) => { params.bokehOpacityScale = v; },
      },
    }),
    Background: folder({
      uDyeStrength: {
        value: params.uDyeStrength,
        min: 0,
        max: 3,
        onChange: (v) => { params.uDyeStrength = v; },
      },
      uTop: {
        value: params.uTop,
        onChange: (v) => { params.uTop = v; onResize(); },
      },
      uBottom: {
        value: params.uBottom,
        onChange: (v) => { params.uBottom = v; onResize(); },
      },
      uGlow: {
        value: params.uGlow,
        onChange: (v) => { params.uGlow = v; onResize(); },
      },
      uGlowPosX: {
        value: params.uGlowPosX,
        min: 0,
        max: 1,
        onChange: (v) => { params.uGlowPosX = v; onResize(); },
      },
      uGlowPosY: {
        value: params.uGlowPosY,
        min: 0,
        max: 1,
        onChange: (v) => { params.uGlowPosY = v; onResize(); },
      },
    }),
    Post: folder({
      bloomStrength: {
        value: params.bloomStrength,
        min: 0,
        max: 3,
        onChange: (v) => { params.bloomStrength = v; },
      },
      bloomRadius: {
        value: params.bloomRadius,
        min: 0,
        max: 1.5,
        onChange: (v) => { params.bloomRadius = v; },
      },
      bloomThreshold: {
        value: params.bloomThreshold,
        min: 0,
        max: 1,
        onChange: (v) => { params.bloomThreshold = v; },
      },
      vignette: {
        value: params.vignette,
        min: 0,
        max: 1,
        onChange: (v) => { params.vignette = v; },
      },
      aberration: {
        value: params.aberration,
        min: 0,
        max: 0.01,
        onChange: (v) => { params.aberration = v; },
      },
      grain: {
        value: params.grain,
        min: 0,
        max: 0.2,
        onChange: (v) => { params.grain = v; },
      },
    }),
    脊柱: folder({
      spineRotX: {
        value: params.spineRotX,
        min: -Math.PI,
        max: Math.PI,
        step: 0.01,
        onChange: (v) => { params.spineRotX = v; spine?.refit(); },
      },
      spineRotY: {
        value: params.spineRotY,
        min: -Math.PI,
        max: Math.PI,
        step: 0.01,
        onChange: (v) => { params.spineRotY = v; spine?.refit(); },
      },
      spineRotZ: {
        value: params.spineRotZ,
        min: -Math.PI,
        max: Math.PI,
        step: 0.01,
        onChange: (v) => { params.spineRotZ = v; spine?.refit(); },
      },
      spineYOffset: {
        value: params.spineYOffset,
        min: -3,
        max: 3,
        step: 0.01,
        onChange: (v) => { params.spineYOffset = v; spine?.refit(); },
      },
      spineSpin: {
        value: params.spineSpin,
        min: 0,
        max: 0.4,
        step: 0.01,
        onChange: (v) => { params.spineSpin = v; },
      },
      spineScaleMul: {
        value: params.spineScaleMul,
        min: 0.2,
        max: 1.5,
        step: 0.01,
        onChange: (v) => { params.spineScaleMul = v; spine?.refit(); },
      },
      spineTransmission: {
        value: params.spineTransmission,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'transmission',
        onChange: (v) => { params.spineTransmission = v; if (spine?.mat) spine.mat.transmission = v; },
      },
      spineRoughness: {
        value: params.spineRoughness,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'roughness',
        onChange: (v) => { params.spineRoughness = v; if (spine?.mat) spine.mat.roughness = v; },
      },
      spineThickness: {
        value: params.spineThickness,
        min: 0,
        max: 5,
        step: 0.01,
        label: 'thickness',
        onChange: (v) => { params.spineThickness = v; if (spine?.mat) spine.mat.thickness = v; },
      },
      spineIor: {
        value: params.spineIor,
        min: 1,
        max: 2.333,
        step: 0.01,
        label: 'ior',
        onChange: (v) => { params.spineIor = v; if (spine?.mat) spine.mat.ior = v; },
      },
      spineIridescence: {
        value: params.spineIridescence,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'iridescence',
        onChange: (v) => { params.spineIridescence = v; if (spine?.mat) spine.mat.iridescence = v; },
      },
      spineIridescenceIOR: {
        value: params.spineIridescenceIOR,
        min: 1,
        max: 2.4,
        step: 0.01,
        label: 'iridescenceIOR',
        onChange: (v) => { params.spineIridescenceIOR = v; if (spine?.mat) spine.mat.iridescenceIOR = v; },
      },
      spineClearcoat: {
        value: params.spineClearcoat,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'clearcoat',
        onChange: (v) => { params.spineClearcoat = v; if (spine?.mat) spine.mat.clearcoat = v; },
      },
      spineClearcoatRoughness: {
        value: params.spineClearcoatRoughness,
        min: 0,
        max: 1,
        step: 0.01,
        label: 'clearcoatRoughness',
        onChange: (v) => {
          params.spineClearcoatRoughness = v;
          if (spine?.mat) spine.mat.clearcoatRoughness = v;
        },
      },
      spineEnvIntensity: {
        value: params.spineEnvIntensity,
        min: 0,
        max: 3,
        step: 0.01,
        label: 'envMapIntensity',
        onChange: (v) => {
          params.spineEnvIntensity = v;
          if (spine?.mat) spine.mat.envMapIntensity = v;
        },
      },
      spineAttenuationDistance: {
        value: params.spineAttenuationDistance,
        min: 0.1,
        max: 8,
        step: 0.01,
        label: 'attenuationDistance',
        onChange: (v) => {
          params.spineAttenuationDistance = v;
          if (spine?.mat) spine.mat.attenuationDistance = v;
        },
      },
      spineColor: {
        value: params.spineColor,
        label: 'color',
        onChange: (v) => {
          params.spineColor = v;
          spine?.mat?.color.set(v);
        },
      },
      spineAttenuationColor: {
        value: params.spineAttenuationColor,
        label: 'attenuationColor',
        onChange: (v) => {
          params.spineAttenuationColor = v;
          spine?.mat?.attenuationColor.set(v);
        },
      },
    }),
  });

  return null;
}

export function initLeva(params, onResize, spine) {
  const el = document.createElement('div');
  document.body.appendChild(el);

  createRoot(el).render(
    <>
      <Leva titleBar={{ title: 'Column' }} />
      <LevaControls params={params} onResize={onResize} spine={spine} />
    </>,
  );
}
