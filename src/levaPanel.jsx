import React from 'react';
import { createRoot } from 'react-dom/client';
import { Leva, folder, useControls } from 'leva';

function LevaControls({ params, onResize }) {
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
        min: 0,
        max: 4,
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
        max: 0.005,
        onChange: (v) => { params.scrollSens = v; },
      },
      scrollMax: {
        value: params.scrollMax,
        min: 1,
        max: 40,
        onChange: (v) => { params.scrollMax = v; },
      },
    }),
    Bokeh: folder({
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
  });

  return null;
}

export function initLeva(params, onResize) {
  const el = document.createElement('div');
  document.body.appendChild(el);

  createRoot(el).render(
    <>
      <Leva titleBar={{ title: 'Column' }} />
      <LevaControls params={params} onResize={onResize} />
    </>,
  );
}
