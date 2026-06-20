export const cardVertex = /* glsl */`
  varying vec2 vUv;
  varying vec3 vNl;
  varying vec3 vNv;
  varying vec3 vVv;
  uniform vec2 uHalf;
  void main(){
    vUv = position.xy / (2.0 * uHalf) + 0.5;
    vNl = normal;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNv = normalize(normalMatrix * normal);
    vVv = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const cardFragment = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  varying vec3 vNl, vNv, vVv;
  uniform sampler2D uScene;
  uniform sampler2D uContent;
  uniform vec2 uResolution;
  uniform float uTime, uBlur, uFresnelPow;
  uniform vec3 uTint, uEdgeColor;
  uniform float uTintStrength, uEdge, uContentOpacity, uContentBrightness;
  uniform float uContentSat, uBodySat, uGlassDarken, uGlassAlpha, uSheen, uEmissive, uGlitch, uFade, uHover;
  uniform float uImgAspect, uCardAspect, uContentReady;

  vec3 desat(vec3 c, float s){
    return mix(vec3(dot(c, vec3(0.299, 0.587, 0.114))), c, s);
  }

  vec2 coverUV(vec2 uv, float imgA, float boxA){
    vec2 s = (imgA > boxA) ? vec2(boxA / imgA, 1.0) : vec2(1.0, imgA / boxA);
    return (uv - 0.5) * s + 0.5;
  }

  void main(){
    vec2 suv = vec2(gl_FragCoord.x, uResolution.y - gl_FragCoord.y) / uResolution;
    vec2 t[8];
    t[0] = vec2(1.0, 0.0); t[1] = vec2(-1.0, 0.0); t[2] = vec2(0.0, 1.0); t[3] = vec2(0.0, -1.0);
    t[4] = vec2(0.7, 0.7); t[5] = vec2(-0.7, 0.7); t[6] = vec2(0.7, -0.7); t[7] = vec2(-0.7, -0.7);
    vec3 bg = texture2D(uScene, suv).rgb;
    for (int i = 0; i < 8; i++) {
      bg += texture2D(uScene, suv + t[i] * uBlur / uResolution).rgb;
      bg += texture2D(uScene, suv + t[i] * uBlur * 2.0 / uResolution).rgb;
    }
    bg /= 17.0;

    vec2 cuv = coverUV(vUv, uImgAspect, uCardAspect);

    float band = step(0.5, fract(cuv.y * 18.0 + uTime * 0.3));
    float sh = uGlitch * (0.003 + 0.006 * band) * sin(uTime * 3.0 + cuv.y * 40.0);
    vec3 content = vec3(
      texture2D(uContent, cuv + vec2(sh, 0.0)).r,
      texture2D(uContent, cuv).g,
      texture2D(uContent, cuv - vec2(sh, 0.0)).b
    );
    content = desat(content, uContentSat) * uContentBrightness * (0.9 + 0.1 * band);

    float frontness = smoothstep(0.15, 0.75, vNl.z);
    vec3 col = mix(bg * 0.5, content, frontness * uContentOpacity * uContentReady);

    col = mix(col, col * uTint, uTintStrength);
    col *= uGlassDarken;
    col = desat(col, uBodySat);

    float topLight = pow(1.0 - vUv.y, 2.0);
    col += uEdgeColor * topLight * uSheen;
    float streak = smoothstep(0.32, 0.0, abs(vUv.x * 0.6 + vUv.y * 0.4 - 0.5));
    col += uEdgeColor * streak * uSheen * 0.5;

    float fres = pow(1.0 - abs(dot(normalize(vNv), normalize(vVv))), uFresnelPow);
    col += uEdgeColor * fres * uEdge * (1.0 + uHover * 1.2);

    float flow = smoothstep(0.35, 1.0, 0.5 + 0.5 * sin(vUv.x * 2.2 - vUv.y * 1.3 + uTime * 0.9));
    col += uEdgeColor * flow * uHover * 0.18;
    col *= 1.0 + uHover * 0.18;

    col += mix(uTint, uEdgeColor, 0.35) * uEmissive * (0.2 + 0.8 * frontness);
    col += uEdgeColor * 0.015;

    gl_FragColor = vec4(col, uGlassAlpha * uFade);
  }
`;

export const textVertex = /* glsl */`
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const textFragment = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uMap;
  uniform float uGlow;
  uniform float uFade;

  float sampleAlpha(vec2 uv){
    return texture2D(uMap, uv).a;
  }

  void main(){
    vec4 tex = texture2D(uMap, vUv);
    vec2 px = vec2(1.0 / 1024.0, 1.0 / 512.0);

    float halo = tex.a;
    halo += sampleAlpha(vUv + px * vec2(3.0, 0.0));
    halo += sampleAlpha(vUv - px * vec2(3.0, 0.0));
    halo += sampleAlpha(vUv + px * vec2(0.0, 3.0));
    halo += sampleAlpha(vUv - px * vec2(0.0, 3.0));
    halo += sampleAlpha(vUv + px * vec2(5.0, 4.0));
    halo += sampleAlpha(vUv - px * vec2(5.0, 4.0));
    halo = min(halo / 7.0, 1.0);

    vec3 core = vec3(1.0) * tex.rgb * (1.0 + uGlow * 5.0);
    vec3 bloom = vec3(1.0) * (halo * uGlow * 2.2 + tex.a * uGlow * 1.5);
    vec3 col = core + bloom;

    float alpha = max(tex.a, halo * uGlow * 0.55) * uFade;
    gl_FragColor = vec4(col, alpha);
  }
`;
