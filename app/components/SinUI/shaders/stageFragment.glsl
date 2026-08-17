// ============================================================================
// 方格舞台 —— 自定义片元着色器 (Custom Fragment Shader)
// ============================================================================
// 作用：在 GPU 像素阶段，根据 16 维音频特征实现方块顶面/侧面分层渲染、
// 顶面 UV 边缘高亮发光描边、高频火花相位闪烁、边缘火花迸发、侧面光柱锐度动态衰减、
// 双色温渐变调色、涟漪冲击波高光与最外围径向透明度淡出。

uniform float uTime;
// --- 16 维音频质感特征 Uniform ---
uniform float uPresence;     // 临场感/高频能量（2.5k-5kHz）
uniform float uBrilliance;   // 明亮高音（5k-10kHz）
uniform float uAir;          // 空气感超高频（10k-20kHz）
uniform float uWarmth;       // 温暖度（低频占比，控制冷暖色温偏向）
uniform float uBrightness;   // 亮度（高频占比，控制高光提亮）
uniform float uSharpness;    // 锐度（高频突变斜率，控制侧面能量柱陡峭度）

// --- 色彩系统 Uniform ---
uniform vec3 uBaseColor1;
uniform vec3 uBaseColor2;
uniform vec3 uCoolCore;
uniform vec3 uCoolEdge;
uniform vec3 uWarmCore;
uniform vec3 uWarmEdge;
uniform vec3 uRippleColor;
uniform float uGlowIntensity;

// 接收来自顶点着色器的 Varying 变量
varying vec2 vUv;
varying vec3 vNormal;
varying float vElevation;
varying float vDistance;
varying vec2 vRippleAnim;
varying float vRelativeY;
varying vec2 vInstancePos;

// 伪随机数哈希函数
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  // 1. 判定是否为方块顶面（法线向上 vNormal.y > 0.5）
  bool isTop = vNormal.y > 0.5;
  float distFromTop = 1.0 - vRelativeY;

  float rnd = random(vInstancePos);
  float centerDist = length(vInstancePos);

  // 归一化高程 [0, 1]（假设最大抬升高度约为 6.0）
  float normElevation = clamp(vElevation / 6.0, 0.0, 1.0);

  // 2. 【双色温动态融合调色系统】：
  vec3 cBase1 = uBaseColor1;
  vec3 cBase2 = uBaseColor2;
  vec3 coolCore = uCoolCore;
  vec3 coolEdge = uCoolEdge;
  vec3 warmCore = uWarmCore;
  vec3 warmEdge = uWarmEdge;

  // 结合音频暖度 uWarmth 与中心距离，动态计算冷暖融合因子
  float warmBlend = smoothstep(0.0, 1.0, uWarmth * 1.5 + (0.5 - centerDist / 70.0));
  vec3 zoneCore = mix(coolCore, warmCore, warmBlend);
  vec3 zoneEdge = mix(coolEdge, warmEdge, warmBlend);

  // 随机在核心色与边缘色之间微调，增加视觉丰富度
  vec3 targetGlow = mix(zoneCore, zoneEdge, fract(rnd * 11.0));

  // 中心向外围的光效衰减
  float distFade = 1.0 - smoothstep(30.0, 65.0, centerDist);

  // 根据音频亮度 uBrightness 叠加高光提亮
  targetGlow = mix(targetGlow, vec3(0.4, 0.8, 1.0), uBrightness * 0.5);

  // 当前发光基础颜色
  vec3 currentGlow = mix(cBase2, targetGlow, normElevation) * uGlowIntensity * distFade;

  // 叠加普通涟漪（冰青蓝）与流星触地白色重音涟漪
  currentGlow = mix(currentGlow, uRippleColor, vRippleAnim.x);
  currentGlow = mix(currentGlow, vec3(1.0, 1.0, 1.0), vRippleAnim.y);

  // 侧面底座暗色
  vec3 bodyColor = mix(cBase1, cBase2, vRelativeY * distFade);
  vec3 finalColor;

  if (isTop) {
    // ========================================================================
    // 【顶面渲染逻辑 (Top Face)】
    // ========================================================================
    float topIntensity = smoothstep(0.0, 0.4, normElevation);

    // 闪烁随距离与高度的衰减系数
    float twinkleDistFalloff = smoothstep(50.0, 25.0, centerDist);
    float twinkleMultiplier = mix(twinkleDistFalloff, 1.0, smoothstep(0.01, 0.1, normElevation));

    // (1) 空气感超高频火花：在平静的低高度方块顶面随机闪烁微光
    bool isSparkleTarget = fract(rnd * 31.0) > 0.95;
    if (isSparkleTarget && normElevation < 0.1) {
      topIntensity += uAir * 1.5 * twinkleMultiplier;
    }

    finalColor = mix(cBase2, currentGlow, topIntensity);

    // (2) 【顶面边缘高亮发光描边 (Edge Glow)】：
    // 利用 UV 在接近 0 或 1 时产生 1~2px 的科技感发光边框
    float edgeX = smoothstep(0.05, 0.01, vUv.x) + smoothstep(0.95, 0.99, vUv.x);
    float edgeY = smoothstep(0.05, 0.01, vUv.y) + smoothstep(0.95, 0.99, vUv.y);
    float edge = min(edgeX + edgeY, 1.0);
    finalColor += currentGlow * edge * 0.6 * (topIntensity + 0.3);

    // (3) 【高频临场感繁星相位闪烁 (Flash Sync)】：
    // 当高频音乐激动时（uPresence 增高），随机选中的方块顶面以 40Hz 超高频正弦波同步闪烁
    float flashChance = smoothstep(0.3, 1.0, uPresence);
    if (fract(rnd * 53.0) > 0.98 - flashChance * 0.1) {
      float flashSync = sin(uTime * 40.0 + rnd * 100.0) * 0.5 + 0.5;
      finalColor += mix(vec3(1.0), vec3(0.5, 1.0, 1.0), rnd) * flashSync * uPresence * (1.0 + uSharpness * 2.0) * twinkleMultiplier;
    }

    // (4) 【高音边缘爆闪 (Brilliance Sparkles)】：
    // 在边框位置偶尔爆发出强烈的亮白火花
    if (edge > 0.5 && fract(rnd * 89.0 + uTime * 2.0) > 0.98) {
      finalColor += vec3(1.0) * uBrilliance * 2.0 * twinkleMultiplier;
    }

  } else {
    // ========================================================================
    // 【侧面渲染逻辑 (Side Faces)】
    // ========================================================================
    // 侧面能量柱垂直衰减陡峭度：受 uSharpness 驱动
    float verticalFalloff = mix(1.0, 3.0, uSharpness);
    float sideGlow = smoothstep(0.5 / verticalFalloff, 0.0, distFromTop) * normElevation;

    // 高度极低时不发光，保持暗底座整洁
    if (normElevation < 0.02) sideGlow = 0.0;

    finalColor = mix(bodyColor, currentGlow, sideGlow * 1.2);

    // 顶边缘微光轮廓线（Rim Glow）
    float rimGlow = smoothstep(0.03, 0.0, distFromTop) * normElevation;
    finalColor += currentGlow * rimGlow;
  }

  // 叠加涟漪扫过时的脉冲增强光
  finalColor += uRippleColor * vRippleAnim.x * 0.5;
  finalColor += vec3(1.0, 1.0, 1.0) * vRippleAnim.y * 1.0;

  // 大气雾效柔化
  float aerialFog = smoothstep(25.0, 55.0, vDistance);
  vec3 atmosphericColor = mix(cBase1, cBase2, 0.4);
  finalColor = mix(finalColor, atmosphericColor, aerialFog * 0.4);

  // 舞台最外围径向透明度渐隐（Alpha Fade），避免矩形生硬切口
  float alphaFade = 1.0 - smoothstep(45.0, 65.0, vDistance);

  gl_FragColor = vec4(finalColor, alphaFade);
}
