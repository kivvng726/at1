// ===== 3D simplex noise + curl noise(自包含)=====
const noiseGLSL = /* glsl */`
  vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
  vec4 mod289(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy; i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
  vec3 snoiseVec3(vec3 x){ return vec3(snoise(x), snoise(x+vec3(123.4,567.8,901.2)), snoise(x+vec3(-345.6,789.0,-234.5))); }
  vec3 curlNoise(vec3 p){
    const float e=0.1; vec3 dx=vec3(e,0,0),dy=vec3(0,e,0),dz=vec3(0,0,e);
    vec3 px0=snoiseVec3(p-dx),px1=snoiseVec3(p+dx),py0=snoiseVec3(p-dy),py1=snoiseVec3(p+dy),pz0=snoiseVec3(p-dz),pz1=snoiseVec3(p+dz);
    float x=py1.z-py0.z-pz1.y+pz0.y; float y=pz1.x-pz0.x-px1.z+px0.z; float z=px1.y-px0.y-py1.x+py0.x;
    return normalize(vec3(x,y,z)/(2.0*e));
  }
  float rand(vec2 c){ return fract(sin(dot(c, vec2(12.9898,78.233)))*43758.5453); }
`;

// ===== 位置流场 frag(GPUComputationRenderer)=====
export const columnPositionFrag = noiseGLSL + /* glsl */`
  uniform float dt, uTime;
  uniform float uSwirl, uPull, uRise, uNoiseScale, uNoiseStrength;
  uniform float uCoreRadius, uMaxRadius, uHeight, uTwist, uSpread;
  uniform vec3  uMouseWorld;
  uniform vec3  uMouseVel;
  uniform float uMouseRadius, uMouseDrag, uMouseStick;

  vec3 spawn(vec2 uv){
    float y = (rand(uv + uTime) - 0.5) * uHeight;
    float theta = y * uTwist + rand(uv + 3.1 + uTime) * 6.2831853 * uSpread;
    float rr = uCoreRadius * sqrt(rand(uv + 7.7 + uTime)) * (0.3 + 0.7 * rand(uv + 1.3 + uTime));
    return vec3(cos(theta) * rr, y, sin(theta) * rr);
  }
  void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 data = texture2D(texturePosition, uv);
    vec3 pos = data.xyz; float life = data.w;

    float r = length(pos.xz);
    vec3 tangent = r > 0.0001 ? vec3(-pos.z, 0.0, pos.x) / r : vec3(0.0);
    vec3 vel = tangent * uSwirl;
    vec2 inward = r > 0.0001 ? -pos.xz / r : vec2(0.0);
    vel.xz += inward * uPull * smoothstep(uCoreRadius, uMaxRadius, r);
    vel.y += uRise;
    vel += curlNoise(pos * uNoiseScale + vec3(0.0, uTime * 0.05, 0.0)) * uNoiseStrength;

    vec3 toM = uMouseWorld - pos;
    float infl = smoothstep(uMouseRadius, 0.0, length(toM));
    vel += uMouseVel * (infl * uMouseDrag);
    vel += normalize(toM + 1e-4) * (infl * uMouseStick);

    pos += vel * dt;
    life -= dt * 0.25;

    if (life <= 0.0 || r > uMaxRadius || abs(pos.y) > uHeight * 0.7) {
      pos = spawn(uv);
      life = rand(uv - uTime) * 0.5 + 0.6;
    }
    gl_FragColor = vec4(pos, life);
  }
`;

// ===== 透视渲染 vertex =====
export const columnVertex = /* glsl */`
  uniform sampler2D uPositions;
  uniform float uSize, uDpr;
  attribute vec2 reference;
  varying float vLife, vSeed, vHeight, vRadius;
  float rand(vec2 c){ return fract(sin(dot(c, vec2(12.9898,78.233)))*43758.5453); }
  void main(){
    vec4 data = texture2D(uPositions, reference);
    vec3 pos = data.xyz;
    vLife = data.w; vSeed = rand(reference);
    vHeight = pos.y; vRadius = length(pos.xz);
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uDpr * 60.0 / max(-mv.z, 0.1);
  }
`;

// ===== 渲染 fragment:Matcap + 虹彩 + 水墨磨砂点精灵 =====
export const columnFragment = /* glsl */`
  precision highp float;
  varying float vLife, vSeed, vHeight, vRadius;
  uniform sampler2D uMatcap;
  uniform float uHasMatcap, uBrightness, uHueScale, uHueShift, uSat, uCoreRadius;
  uniform float uFrostAmount, uGrainScale, uInk;

  vec3 hsv2rgb(vec3 c){
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  float hash21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash21(i), b = hash21(i+vec2(1,0)), c = hash21(i+vec2(0,1)), d = hash21(i+vec2(1,1));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }

  void main(){
    vec2 pc = gl_PointCoord;
    float dist = length(pc - 0.5);
    float disc = smoothstep(0.5, 0.0, dist);

    float n = vnoise(pc * uGrainScale + vSeed * 37.0);
    float mask = disc - (1.0 - n) * uFrostAmount;
    float alpha = smoothstep(0.0, 0.12, mask);
    if (alpha <= 0.0) discard;

    vec2 uv = pc * 2.0 - 1.0;
    vec3 normal = vec3(uv, sqrt(max(0.0, 1.0 - dot(uv, uv))));
    vec3 matcap;
    if (uHasMatcap > 0.5) { matcap = texture2D(uMatcap, normal.xy * 0.5 + 0.5).rgb; }
    else { float d = clamp(normal.z, 0.0, 1.0); float rim = pow(1.0 - normal.z, 2.0); matcap = vec3(d*0.6 + rim*0.9); }

    float hue = fract(vSeed * 0.7 + vHeight * uHueScale + normal.x * 0.15 + uHueShift);
    vec3 irid = hsv2rgb(vec3(hue, uSat, 1.0));
    float coreBoost = mix(1.4, 0.6, clamp(vRadius / (uCoreRadius * 3.0), 0.0, 1.0));

    vec3 col = irid * (0.3 + matcap) * coreBoost;
    col *= mix(1.0, n, uInk);
    col *= uBrightness;

    gl_FragColor = vec4(col, alpha * clamp(vLife, 0.0, 1.0));
  }
`;

// ===== 深空背景(clip-space 全屏 quad)=====
export const bgVertex = /* glsl */`
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
export const bgFragment = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  uniform vec3 uTop, uBottom, uGlow; uniform vec2 uGlowPos;
  uniform sampler2D uDye; uniform float uDyeStrength;
  void main(){
    vec3 col = mix(uBottom, uTop, vUv.y);
    col += uGlow * smoothstep(0.7, 0.0, distance(vUv, uGlowPos)) * 0.6;
    col += texture2D(uDye, vUv).rgb * uDyeStrength;
    col *= smoothstep(1.15, 0.35, distance(vUv, vec2(0.5)));
    gl_FragColor = vec4(col, 1.0);
  }
`;
