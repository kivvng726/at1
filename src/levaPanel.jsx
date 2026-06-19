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
    Background: folder({
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
