// ============================================================================
// 方格舞台 —— 自定义顶点着色器 (Custom Vertex Shader)
// ============================================================================
// 作用：在 GPU 顶点着色器中，根据音频频谱能量、流动噪声和向外扩散的涟漪，
// 实时计算每个方块的高程（Elevation），并将方块几何体的 Y 轴向上拉伸。

// --- 时间与音频频段 Uniform ---
uniform float uTime;
uniform float uSubBass;
uniform float uBass;
uniform float uLowMid;
uniform float uMid;
uniform float uHighMid;
uniform float uEnergy;
uniform float uSmoothness;
uniform float uDensity;

// --- 高度控制参数 ---
uniform float uHeightIdle;
uniform float uHeightSubBass;
uniform float uHeightBass;
uniform float uHeightLowMid;
uniform float uHeightMid;
uniform float uHeightHighMid;
uniform float uHeightEnergy;
uniform float uHeightRipple;

// --- 涟漪结构体：存储 24 组涟漪的位置、触发时间、强度与激活状态 ---
struct Ripple {
  vec2 pos;
  float time;
  float strength;
  float isActive;
  float rippleType;
};
uniform Ripple uRipples[24];

// --- 传递给片元着色器的 Varying 变量 ---
varying vec2 vUv;
varying vec3 vNormal;
varying float vElevation;
varying float vDistance;
varying vec2 vRippleAnim;
varying float vRelativeY;
varying vec2 vInstancePos;

// --- Simplex Noise 2D 经典单形噪声实现 (原生 GLSL 数学算法) ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// --- 伪随机数哈希函数 ---
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vUv = uv;
  vNormal = normal;

  // 1. 从当前实例的 instanceMatrix 中提取方块在世界网格中的二维坐标 (X, Z)
  vec4 ip = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vec2 pos2D = ip.xz;
  vInstancePos = pos2D;

  // 计算该方块到舞台正中心 (0, 0) 的平面距离
  float centerDist = length(pos2D);
  vDistance = centerDist;

  float rnd = random(pos2D);

  // 2. 【待机有机波浪 (Idle Wave)】：
  // 无音乐时，利用流动单形噪声 + 正弦波产生有机的呼吸起伏
  vec2 movingPos = pos2D * 0.05 + vec2(uTime * 0.1, uTime * 0.05);
  float baseNoise = (snoise(movingPos) + 1.0) * 0.5;
  float wave = sin(pos2D.x * 0.15 + pos2D.y * 0.1 - uTime * 0.6) * 0.5 + 0.5;

  // 全局外围衰减：中心向外平滑衰减，避免边界突兀
  float globalFalloff = smoothstep(50.0, 25.0, centerDist);
  float idleElevation = mix(baseNoise, wave, uSmoothness * 0.5 + 0.2) * uHeightIdle * globalFalloff;

  // 3. 【音频多频段地形构建 (Audio Reactivity)】：
  // (1) 超重低音 (SubBass)：主要集中在中心 20 单位半径内隆起山峰
  float subRegion = smoothstep(20.0, 0.0, centerDist);
  float subLift = uSubBass * subRegion * uHeightSubBass;

  // (2) 低音 (Bass)：中心到中圈的低音脉冲，叠加低频扰动
  float bassNoise = snoise(pos2D * 0.1 - vec2(0.0, uTime * 0.2));
  float bassRegion = smoothstep(30.0, 5.0, centerDist + bassNoise * 5.0);
  float bassLift = uBass * bassRegion * (smoothstep(0.0, 1.0, rnd + uDensity * 0.5)) * uHeightBass;

  // (3) 中低频 (LowMid)：中频流动起伏
  float lowMidNoise = snoise(pos2D * 0.05 + vec2(uTime * 0.1, 0.0));
  float lowMidLift = uLowMid * (lowMidNoise * 0.5 + 0.5) * uHeightLowMid;

  // (4) 中频 (Mid - River Flow)：像对角线河流一样奔涌的动态正弦流动波
  float riverFlow = sin(pos2D.x * 0.2 + pos2D.y * 0.2 + snoise(pos2D * 0.1) * 2.0 - uTime * 2.0);
  float midLift = uMid * max(0.0, riverFlow) * uHeightMid;

  // (5) 中高频 (HighMid)：在外圈 10~35 距离的某些方块上随机产生突刺晶体
  float highMidRegion = smoothstep(10.0, 35.0, centerDist);
  float highMidLift = 0.0;
  if (fract(rnd * 13.3) > 0.8) {
    highMidLift = uHighMid * highMidRegion * fract(rnd * 7.7) * uHeightHighMid;
  }

  float audioElevation = subLift + bassLift + lowMidLift + midLift + highMidLift;
  // 偶发强能量随机爆发
  if (rnd > 0.99) {
    audioElevation += uEnergy * uHeightEnergy;
  }
  audioElevation *= globalFalloff;

  float elevation = idleElevation + audioElevation;

  // 4. 【着色器涟漪系统 (Ripple Wave)】：
  // 遍历 24 组涟漪池，计算高斯环形波：exp(-(d - r)² / w²)
  float rippleElevation = 0.0;
  float rippleIntensityNormal = 0.0;
  float rippleIntensityWhite = 0.0;
  float speed = 15.0; // 扩散速度
  float width = 3.0;  // 涟漪波环宽度

  for (int i = 0; i < 24; i++) {
    if (uRipples[i].isActive > 0.0) {
      float dist = length(pos2D - uRipples[i].pos);
      float timeSince = uTime - uRipples[i].time;

      if (timeSince > 0.0) {
        float curSpeed = (uRipples[i].rippleType > 0.5) ? 20.0 : speed;
        float curWidth = (uRipples[i].rippleType > 0.5) ? 1.2 : width;
        float curFadeDist = (uRipples[i].rippleType > 0.5) ? 10.0 : 18.0;

        float waveRadius = timeSince * curSpeed;
        float d = dist - waveRadius;

        // 高斯波峰公式
        float rippleWave = exp(-d * d / curWidth);
        // 指数距离衰减
        float fade = exp(-waveRadius / curFadeDist);
        // 边缘平滑淡出（扩散超过 35 距离后平滑归零，杜绝突兀截断）
        float edgeSmooth = smoothstep(45.0, 25.0, waveRadius);

        float rPulse = rippleWave * fade * edgeSmooth * uRipples[i].strength;

        rippleElevation += rPulse * uHeightRipple;
        if (uRipples[i].rippleType > 0.5) {
          rippleIntensityWhite += rPulse;
        } else {
          rippleIntensityNormal += rPulse;
        }
      }
    }
  }

  elevation += rippleElevation;
  vRippleAnim = vec2(clamp(rippleIntensityNormal, 0.0, 1.0), clamp(rippleIntensityWhite, 0.0, 1.0));
  vElevation = elevation;

  // 5. 【方块底部贴地、顶部按高度拉伸 (Box Height Extrusion)】：
  // BoxGeometry 原始高度在 [-0.5, 0.5]，yPos = position.y + 0.5 范围在 [0, 1]
  // 0 是底面（保持贴地 y = 0），1 是顶面（拉伸到 1.0 + elevation）
  float yPos = position.y + 0.5;
  vRelativeY = yPos;

  float totalHeight = 1.0 + elevation;
  vec3 pos = position;
  pos.y = -0.5 + yPos * totalHeight;

  // 应用 InstancedMesh 矩阵变换并投影到屏幕
  vec4 worldPosition = instanceMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
