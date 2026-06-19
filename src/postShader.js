import * as THREE from 'three';

export const PostShader = {
  uniforms: {
    tDiffuse: { value: null },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uVignette: { value: 0.4 },
    uAberration: { value: 0.001 },
    uGrain: { value: 0.04 },
    uFrost: { value: 0.06 },
    uFrostScale: { value: 3.0 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */`
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform vec2  uResolution;
    uniform float uTime, uVignette, uAberration, uGrain, uFrost, uFrostScale;
    float hash21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
    void main(){
      vec2 uv = vUv, dir = uv - 0.5;
      vec2 off = dir * uAberration;
      vec3 col = vec3(
        texture2D(tDiffuse, uv + off).r,
        texture2D(tDiffuse, uv).g,
        texture2D(tDiffuse, uv - off).b
      );

      vec2 px = uv * uResolution;
      float coarse = hash21(floor(px / uFrostScale) + floor(uTime * 6.0));
      float fine   = hash21(px + uTime * 60.0);
      col += (mix(coarse, fine, 0.5) - 0.5) * uFrost;

      col += (hash21(px + uTime) - 0.5) * uGrain;

      col *= 1.0 - smoothstep(0.4, 0.95, length(dir)) * uVignette;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};
