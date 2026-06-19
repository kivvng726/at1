// ---- 3D simplex noise(Gustavson 经典实现,公共可用)+ curl noise ----
const noiseGLSL = /* glsl */`
  vec3 mod289(vec3 x){ return x - floor(x*(1.0/289.0))*289.0; }
  vec4 mod289(vec4 x){ return x - floor(x*(1.0/289.0))*289.0; }
  vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314*r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  vec3 snoiseVec3(vec3 x){
    return vec3(snoise(x),
                snoise(x + vec3(123.4, 567.8, 901.2)),
                snoise(x + vec3(-345.6, 789.0, -234.5)));
  }
  vec3 curlNoise(vec3 p){
    const float e = 0.1;
    vec3 dx = vec3(e,0.0,0.0), dy = vec3(0.0,e,0.0), dz = vec3(0.0,0.0,e);
    vec3 px0=snoiseVec3(p-dx), px1=snoiseVec3(p+dx);
    vec3 py0=snoiseVec3(p-dy), py1=snoiseVec3(p+dy);
    vec3 pz0=snoiseVec3(p-dz), pz1=snoiseVec3(p+dz);
    float x = py1.z - py0.z - pz1.y + pz0.y;
    float y = pz1.x - pz0.x - px1.z + px0.z;
    float z = px1.y - px0.y - py1.x + py0.x;
    return normalize(vec3(x, y, z) / (2.0 * e));
  }
  float rand(vec2 co){ return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
`;

// ---- 位置更新 frag(GPUComputationRenderer 用;不要声明 texturePosition / resolution) ----
export const positionFrag = noiseGLSL + /* glsl */`
  uniform sampler2D uVelocity;
  uniform vec2  uTexel;
  uniform float dt;
  uniform float uTime;
  uniform float uVelocityScale;
  uniform float uNoiseScale;
  uniform float uNoiseStrength;
  uniform float uLifeDecay;
  void main(){
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 data = texture2D(texturePosition, uv);
    vec2 pos = data.xy;
    float life = data.w;

    // 1) 跟随流体速度场
    vec2 fv = texture2D(uVelocity, pos).xy;
    pos += fv * uTexel * uVelocityScale * dt;

    // 2) curl noise 扰动
    vec3 cn = curlNoise(vec3(pos * uNoiseScale, uTime * 0.1));
    pos += cn.xy * uNoiseStrength * dt;

    // 3) 寿命
    life -= uLifeDecay * dt;

    // 4) 越界 / 死亡 → 随机重生
    if (life <= 0.0 || pos.x < 0.0 || pos.x > 1.0 || pos.y < 0.0 || pos.y > 1.0) {
      pos  = vec2(rand(uv + uTime), rand(uv + uTime + 7.77));
      life = rand(uv - uTime) * 0.5 + 0.5;
    }

    gl_FragColor = vec4(pos, 0.0, life);
  }
`;

// ---- 渲染 vertex:取位置 + 采样速度算 speed + 算渐变种子 ----
export const renderVertex = /* glsl */`
  uniform sampler2D uPositions;
  uniform sampler2D uVelocity;
  uniform float uSize;
  uniform float uDpr;
  uniform float uSpeedScale;
  attribute vec2 reference;
  varying float vLife;
  varying float vT;
  varying float vSpeed;
  float rand(vec2 c){ return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453); }
  void main(){
    vec4 data = texture2D(uPositions, reference);
    vec2 pos = data.xy;
    vLife = data.w;

    float seed = rand(reference);
    vec2 fv = texture2D(uVelocity, pos).xy;
    float speed = clamp(length(fv) * uSpeedScale, 0.0, 1.0);
    vSpeed = speed;

    vT = clamp(seed * 0.8 + speed * 0.4, 0.0, 1.0);

    vec2 clip = pos * 2.0 - 1.0;
    gl_Position = vec4(clip, 0.0, 1.0);
    gl_PointSize = uSize * uDpr * (0.6 + speed);
  }
`;

// ---- 渲染 fragment:伪球面法线 + Matcap + 三色渐变芯 ----
export const renderFragment = /* glsl */`
  precision highp float;
  varying float vLife;
  varying float vT;
  varying float vSpeed;
  uniform sampler2D uMatcap;
  uniform float uHasMatcap;
  uniform float uBrightness;

  vec3 gradientCore(float t){
    vec3 c0 = vec3(0.776, 0.302, 1.000); // #C64DFF 亮紫
    vec3 c1 = vec3(0.259, 0.180, 0.639); // #422EA3 深靛
    vec3 c2 = vec3(0.518, 0.784, 0.765); // #84C8C3 青瓷
    vec3 a = mix(c0, c1, smoothstep(0.0, 0.5, t));
    vec3 b = mix(c1, c2, smoothstep(0.5, 1.0, t));
    return mix(a, b, step(0.5, t));
  }

  void main(){
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(uv, uv);
    if (r2 > 1.0) discard;

    vec3 normal = vec3(uv, sqrt(1.0 - r2));

    vec3 matcap;
    if (uHasMatcap > 0.5) {
      vec2 muv = normal.xy * 0.5 + 0.5;
      matcap = texture2D(uMatcap, muv).rgb;
    } else {
      float diff = clamp(normal.z, 0.0, 1.0);
      float rim  = pow(1.0 - normal.z, 2.0);
      matcap = vec3(diff * 0.6 + rim * 0.9);
    }

    vec3 grad = gradientCore(vT);
    vec3 col = grad * (0.25 + matcap) * uBrightness;

    float edge = smoothstep(1.0, 0.55, r2);
    float a = edge * clamp(vLife, 0.0, 1.0) * (0.4 + vSpeed);
    gl_FragColor = vec4(col, a);
  }
`;
