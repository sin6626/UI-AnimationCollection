import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import vertexShader from '../shaders/stageVertex.glsl?raw'
import fragmentShader from '../shaders/stageFragment.glsl?raw'

/**
 * ============================================================================
 * 流星音潮 (Meteor Soundwave) —— 3D 方格舞台与 16 维音频特征可视化系统
 * ============================================================================
 *
 * 核心技术架构：
 * 1. 【16 维音频特征工程 (Web Audio API)】：
 *    - 8 段精准频段：subBass、bass、lowMid、mid、highMid、presence、brilliance、air。
 *    - 8 维衍生音乐特征：warmth、brightness、sharpness、smoothness、density、energy、spectralCentroid。
 *    - 40 帧滑动方差自适应低音节拍检测驱动涟漪；高音突变差分驱动流星雨事件。
 * 2. 【GPU 顶点与片元着色器 (GLSL)】：
 *    - 128 × 128 (16,384) 方块大规模 InstancedMesh 矩阵。
 *    - 原生 GLSL 单形噪声 (Simplex Noise) 与高斯环形扩散涟漪波。
 *    - 双色温调色、顶面边缘发光描边、高频闪烁与径向透明度衰减。
 * 3. 【双层 InstancedMesh 粒子物理特效系统】：
 *    - 12 根垂直坠落流星光柱（触地引爆白色重音涟漪与火花）。
 *    - 100 颗 3D 随机初速度溅射火花光粒（具生命周期与缩放淡出）。
 * 4. 【Raycaster 3D 射线拾取与长按蓄力机制】：
 *    - 鼠标点击舞台任意方块精确求交触发涟漪，长按蓄力增强冲击波。
 */

export interface StageConfig {
  gridSize: number
  spacing: number
  tileSize: number
  cameraPos: { x: number; y: number; z: number }
  height: {
    idle: number
    subBass: number
    bass: number
    lowMid: number
    mid: number
    highMid: number
    energy: number
    ripple: number
  }
  theme: {
    base1: string
    base2: string
    coolCore: string
    coolEdge: string
    warmCore: string
    warmEdge: string
    rippleColor: string
    glowIntensity: number
  }
}

const STAGE_CONFIG: StageConfig = {
  gridSize: 128,
  spacing: 1.05,
  tileSize: 0.9,
  cameraPos: { x: 0, y: 32, z: 52 },
  height: {
    idle: 0.6,
    subBass: 4.0,
    bass: 3.0,
    lowMid: 2.0,
    mid: 2.5,
    highMid: 2.0,
    energy: 4.0,
    ripple: 3.0
  },
  theme: {
    base1: '#050810',
    base2: '#0a0f1a',
    coolCore: '#2255ff',
    coolEdge: '#8844ff',
    warmCore: '#ff4422',
    warmEdge: '#ffaa00',
    rippleColor: '#44ddff',
    glowIntensity: 1.2
  }
}

export interface AudioSmoothedData {
  subBass: number
  bass: number
  lowMid: number
  mid: number
  highMid: number
  presence: number
  brilliance: number
  air: number
  warmth: number
  brightness: number
  sharpness: number
  smoothness: number
  density: number
  energy: number
  spectralCentroid: number
}

export interface AudioAnalyzerEvents {
  onRipple?: (x: number, z: number, strength: number, isAccent: boolean) => void
  onMeteor?: (strength: number) => void
}

/**
 * 16 维音频特征分析器
 */
export class StageAudioAnalyzer {
  audioCtx: AudioContext | null = null
  analyser: AnalyserNode | null = null
  source: MediaElementAudioSourceNode | null = null
  gainNode: GainNode | null = null
  audioElement: HTMLAudioElement | null = null

  dataArray: Uint8Array = new Uint8Array(512)
  prevData: number[] = new Array(512).fill(0)
  prevBrightness: number = 0

  smoothedData: AudioSmoothedData = {
    subBass: 0,
    bass: 0,
    lowMid: 0,
    mid: 0,
    highMid: 0,
    presence: 0,
    brilliance: 0,
    air: 0,
    warmth: 0,
    brightness: 0,
    sharpness: 0,
    smoothness: 0,
    density: 0,
    energy: 0,
    spectralCentroid: 0
  }

  beatHistory: number[] = new Array(40).fill(0)
  beatHistoryIndex: number = 0
  beatCooldown: number = 0
  meteorCooldown: number = 0

  events: AudioAnalyzerEvents = {}

  setEvents(events: AudioAnalyzerEvents) {
    this.events = events
  }

  connect(audioEl: HTMLAudioElement) {
    if (this.audioElement === audioEl && this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume()
      }
      return
    }
    this.audioElement = audioEl

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return

    this.audioCtx = new AudioContextClass()
    this.analyser = this.audioCtx.createAnalyser()
    this.analyser.fftSize = 1024
    this.analyser.smoothingTimeConstant = 0.8
    this.gainNode = this.audioCtx.createGain()
    this.gainNode.gain.value = 1

    try {
      this.source = this.audioCtx.createMediaElementSource(audioEl)
      this.source.connect(this.analyser)
      this.analyser.connect(this.gainNode)
      this.gainNode.connect(this.audioCtx.destination)
    }
    catch (err) {
      console.warn('MediaElementSource connect error:', err)
    }
  }

  disconnect() {
    if (this.source) {
      try {
        this.source.disconnect()
      }
      catch {}
      this.source = null
    }
    if (this.audioCtx) {
      this.audioCtx.close()
      this.audioCtx = null
    }
    this.analyser = null
    this.gainNode = null
    this.audioElement = null
  }

  update(_delta: number): AudioSmoothedData {
    const binCount = 512
    const isPlaying = this.audioElement && !this.audioElement.paused

    let totalEnergy = 0
    let sumSub = 0
    let sumBass = 0
    let sumLowMid = 0
    let sumMid = 0
    let sumHighMid = 0
    let sumPresence = 0
    let sumBrilliance = 0
    let sumAir = 0

    let weightedFreqSum = 0
    let binSum = 0
    let diffSum = 0

    if (this.analyser && isPlaying) {
      this.analyser.getByteFrequencyData(this.dataArray as unknown as Uint8Array<ArrayBuffer>)

      let subBassDiff = 0
      let highMidDiff = 0

      for (let i = 0; i < binCount; i++) {
        const raw = this.dataArray[i] ?? 0
        const val = raw / 255.0
        totalEnergy += val

        const diff = Math.abs(val - (this.prevData[i] ?? 0))
        diffSum += diff
        this.prevData[i] = val

        weightedFreqSum += i * val
        binSum += val

        if (i <= 1) {
          sumSub += val
          subBassDiff += diff
        }
        else if (i <= 3) sumBass += val
        else if (i <= 7) sumLowMid += val
        else if (i <= 18) sumMid += val
        else if (i <= 46) {
          sumHighMid += val
          highMidDiff += diff
        }
        else if (i <= 93) sumPresence += val
        else if (i <= 186) sumBrilliance += val
        else if (i <= 372) sumAir += val
      }

      this.detectBeatsAndMeteors(subBassDiff, highMidDiff)
    }
    else {
      for (let i = 0; i < binCount; i++) {
        this.dataArray[i] = Math.floor((this.dataArray[i] ?? 0) * 0.94)
        this.prevData[i] = 0
      }
    }

    if (this.beatCooldown > 0) this.beatCooldown--
    if (this.meteorCooldown > 0) this.meteorCooldown--

    const energy = totalEnergy / binCount
    const subBass = sumSub / 2
    const bass = sumBass / 2
    const lowMid = sumLowMid / 4
    const mid = sumMid / 11
    const highMid = sumHighMid / 28
    const presence = sumPresence / 47
    const brilliance = sumBrilliance / 93
    const air = sumAir / 186

    const warmth = totalEnergy > 0 ? (sumSub + sumBass + sumLowMid + sumMid) / totalEnergy : 0
    const brightness = totalEnergy > 0 ? (sumPresence + sumBrilliance + sumAir) / totalEnergy : 0
    const sharpness = Math.min(10.0 * Math.max(0, brightness - this.prevBrightness), 3.0)
    this.prevBrightness = brightness

    const smoothness = Math.max(0, 1.0 - (diffSum / binCount) * 2.0)

    const threshold = 1.5 * energy
    let activeBins = 0
    if (subBass > threshold) activeBins++
    if (bass > threshold) activeBins++
    if (lowMid > threshold) activeBins++
    if (mid > threshold) activeBins++
    if (highMid > threshold) activeBins++
    if (presence > threshold) activeBins++
    if (brilliance > threshold) activeBins++
    if (air > threshold) activeBins++
    const density = activeBins / 8.0

    const spectralCentroid = binSum > 0 ? weightedFreqSum / binSum : 0

    const lerpFactor = isPlaying ? 0.15 : 0.05
    this.smoothedData.subBass += (subBass - this.smoothedData.subBass) * lerpFactor
    this.smoothedData.bass += (bass - this.smoothedData.bass) * lerpFactor
    this.smoothedData.lowMid += (lowMid - this.smoothedData.lowMid) * lerpFactor
    this.smoothedData.mid += (mid - this.smoothedData.mid) * lerpFactor
    this.smoothedData.highMid += (highMid - this.smoothedData.highMid) * lerpFactor
    this.smoothedData.presence += (presence - this.smoothedData.presence) * lerpFactor
    this.smoothedData.brilliance += (brilliance - this.smoothedData.brilliance) * lerpFactor
    this.smoothedData.air += (air - this.smoothedData.air) * lerpFactor

    this.smoothedData.warmth += (warmth - this.smoothedData.warmth) * lerpFactor
    this.smoothedData.brightness += (brightness - this.smoothedData.brightness) * lerpFactor
    this.smoothedData.sharpness += (sharpness - this.smoothedData.sharpness) * lerpFactor
    this.smoothedData.smoothness += (smoothness - this.smoothedData.smoothness) * lerpFactor
    this.smoothedData.density += (density - this.smoothedData.density) * lerpFactor
    this.smoothedData.energy += (energy - this.smoothedData.energy) * lerpFactor
    this.smoothedData.spectralCentroid += (spectralCentroid - this.smoothedData.spectralCentroid) * lerpFactor

    return { ...this.smoothedData }
  }

  private detectBeatsAndMeteors(subBassDiff: number, highMidDiff: number) {
    this.beatHistory[this.beatHistoryIndex] = subBassDiff
    this.beatHistoryIndex = (this.beatHistoryIndex + 1) % this.beatHistory.length

    let avg = 0
    for (let i = 0; i < this.beatHistory.length; i++) {
      avg += this.beatHistory[i] ?? 0
    }
    avg /= this.beatHistory.length

    let variance = 0
    for (let i = 0; i < this.beatHistory.length; i++) {
      variance += Math.pow((this.beatHistory[i] ?? 0) - avg, 2)
    }
    variance /= this.beatHistory.length

    const beatThreshold = Math.max(0.05, avg + 1.5 * Math.sqrt(variance))

    if (this.beatCooldown <= 0 && subBassDiff > beatThreshold && subBassDiff > 0.02) {
      const strength = Math.min(3.0 * subBassDiff, 4.0)
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 20
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius

      this.events.onRipple?.(x, z, strength, false)
      this.beatCooldown = 20
    }

    if (this.meteorCooldown <= 0 && highMidDiff > 0.08) {
      const meteorStrength = Math.min(2.0 * highMidDiff, 1.0)
      this.events.onMeteor?.(meteorStrength)
      this.meteorCooldown = 30 + Math.floor(Math.random() * 50)
    }
  }
}

export interface UseMeteorSoundwaveOptions {
  areaRef: Ref<HTMLElement | null>
  isPlaying: Ref<boolean>
  hasAudio: Ref<boolean>
  audioName: Ref<string>
}

const DEFAULT_AUDIO_PATH = '/music/许嵩 - 幻听.mp3'
const DEFAULT_AUDIO_NAME = '许嵩 - 幻听.mp3'

export function useMeteorSoundwave({
  areaRef,
  isPlaying,
  hasAudio,
  audioName
}: UseMeteorSoundwaveOptions) {
  let audio: HTMLAudioElement | null = null
  const audioAnalyzer = new StageAudioAnalyzer()

  let rafId = 0
  let renderer: THREE.WebGLRenderer | null = null
  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let controls: OrbitControls | null = null
  let resizeHandler: (() => void) | null = null
  let clock: THREE.Clock | null = null

  let instancedMesh: THREE.InstancedMesh | null = null
  let customMaterial: THREE.ShaderMaterial | null = null

  const MAX_RIPPLES = 24
  const ripplesData = new Array(MAX_RIPPLES).fill(null).map(() => ({
    pos: new THREE.Vector2(0, 0),
    time: -100.0,
    strength: 0.0,
    isActive: 0.0,
    rippleType: 0.0
  }))

  const MAX_METEORS = 12
  const meteorsData = new Array(MAX_METEORS).fill(null).map(() => ({
    active: false,
    x: 0,
    y: -1000,
    z: 0,
    speed: 0,
    strength: 0
  }))
  let meteorPoolIdx = 0
  let meteorMesh: THREE.InstancedMesh | null = null

  const MAX_PARTICLES = 100
  const particlesData = new Array(MAX_PARTICLES).fill(null).map(() => ({
    active: false,
    x: 0,
    y: -1000,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    life: 0,
    maxLife: 1.0,
    scale: 1.0
  }))
  let particlePoolIdx = 0
  let particleMesh: THREE.InstancedMesh | null = null

  const dummyMatrix = new THREE.Matrix4()
  const dummyPos = new THREE.Vector3()
  const dummyQuat = new THREE.Quaternion()
  const dummyScale = new THREE.Vector3()

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()
  let pointerDownTime = 0

  function spawnRipple(strength = 1.2, x = 0, z = 0, isAccent = false) {
    if (!clock) return
    const curTime = clock.getElapsedTime()

    let targetIdx = -1
    let oldestTime = Infinity

    for (let i = 0; i < MAX_RIPPLES; i++) {
      const r = ripplesData[i]
      if (!r) continue
      if (r.isActive === 0.0) {
        targetIdx = i
        break
      }
      if (curTime - r.time > 3.0) {
        targetIdx = i
        break
      }
      if (r.time < oldestTime) {
        oldestTime = r.time
        targetIdx = i
      }
    }

    if (targetIdx === -1) targetIdx = 0

    ripplesData[targetIdx] = {
      pos: new THREE.Vector2(x, z),
      time: curTime,
      strength,
      isActive: 1.0,
      rippleType: isAccent ? 1.0 : 0.0
    }
  }

  function spawnSplashParticle(x: number, y: number, z: number, baseSpeed = 1.0) {
    const idx = particlePoolIdx
    const p = particlesData[idx]
    if (!p) return
    p.active = true
    p.x = x + (Math.random() - 0.5) * 1.5
    p.y = y + (Math.random() - 0.5) * 1.5
    p.z = z + (Math.random() - 0.5) * 1.5
    p.vx = (Math.random() - 0.5) * 2.0
    p.vy = Math.random() * 2.0 + 10.0 * baseSpeed
    p.vz = (Math.random() - 0.5) * 2.0
    p.life = 0
    p.maxLife = 0.5 + Math.random() * 0.5
    p.scale = 0.2 + Math.random() * 0.6
    particlePoolIdx = (idx + 1) % MAX_PARTICLES
  }

  function spawnMeteor(strength = 1.0) {
    const idx = meteorPoolIdx
    const m = meteorsData[idx]
    if (!m) return
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * 25.0

    m.active = true
    m.x = Math.cos(angle) * dist
    m.z = Math.sin(angle) * dist
    m.y = 30.0 + Math.random() * 10.0
    m.speed = 1.0 + Math.random() * 0.5 + strength * 1.5
    m.strength = strength
    meteorPoolIdx = (idx + 1) % MAX_METEORS
  }

  function initDefaultAudio() {
    if (!audio) {
      audio = new Audio(DEFAULT_AUDIO_PATH)
      audio.loop = true
      audio.crossOrigin = 'anonymous'
      audio.onended = () => {
        isPlaying.value = false
      }
      hasAudio.value = true
      audioName.value = DEFAULT_AUDIO_NAME
    }
  }

  function setAudio(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    if (file.name.toLowerCase().endsWith('.mp3')) {
      if (audio) {
        audio.pause()
      }
      const audioURL = URL.createObjectURL(file)
      audio = new Audio(audioURL)
      audio.loop = true
      hasAudio.value = true
      isPlaying.value = false
      audioName.value = file.name

      audio.onended = () => {
        isPlaying.value = false
      }

      clearScene()
      startVis()
    }
    else {
      alert('请上传 .mp3 格式的音频文件')
    }
  }

  function togglePlay() {
    initDefaultAudio()
    if (!audio) return
    audioAnalyzer.connect(audio)
    if (audio.paused) {
      audio.play().then(() => {
        isPlaying.value = true
      }).catch((err) => {
        console.warn('播放失败或被拦截:', err)
      })
    }
    else {
      audio.pause()
      isPlaying.value = false
    }
  }

  function clearScene() {
    stopVis()
    const area = areaRef.value
    if (!area) return
    const canvas = area.firstElementChild
    if (canvas) {
      area.removeChild(canvas)
    }
  }

  function stopVis() {
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
      resizeHandler = null
    }
    if (controls) {
      controls.dispose()
      controls = null
    }
    if (instancedMesh) {
      instancedMesh.geometry.dispose()
      instancedMesh = null
    }
    if (customMaterial) {
      customMaterial.dispose()
      customMaterial = null
    }
    if (meteorMesh) {
      meteorMesh.geometry.dispose()
      if (Array.isArray(meteorMesh.material)) {
        meteorMesh.material.forEach(m => m.dispose())
      }
      else {
        meteorMesh.material.dispose()
      }
      meteorMesh = null
    }
    if (particleMesh) {
      particleMesh.geometry.dispose()
      if (Array.isArray(particleMesh.material)) {
        particleMesh.material.forEach(m => m.dispose())
      }
      else {
        particleMesh.material.dispose()
      }
      particleMesh = null
    }
    if (renderer) {
      renderer.dispose()
      renderer = null
    }
    audioAnalyzer.disconnect()
  }

  function startVis() {
    const area = areaRef.value
    if (!area) return

    const width = area.clientWidth || 800
    const height = area.clientHeight || 500

    clock = new THREE.Clock()

    initDefaultAudio()

    audioAnalyzer.setEvents({
      onRipple: (x, z, strength, isAccent) => spawnRipple(strength, x, z, isAccent),
      onMeteor: strength => spawnMeteor(strength)
    })
    if (audio) {
      audioAnalyzer.connect(audio)
    }

    scene = new THREE.Scene()
    const bgColor = new THREE.Color(STAGE_CONFIG.theme.base1)
    scene.background = bgColor
    scene.fog = new THREE.Fog(bgColor, 25, 80)

    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200)
    camera.position.set(
      STAGE_CONFIG.cameraPos.x,
      STAGE_CONFIG.cameraPos.y,
      STAGE_CONFIG.cameraPos.z
    )
    camera.lookAt(0, 0, 0)
    scene.add(camera)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    area.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.3
    controls.enablePan = false
    controls.minDistance = 10
    controls.maxDistance = 90
    controls.maxPolarAngle = Math.PI / 2 - 0.08

    customMaterial = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSubBass: { value: 0 },
        uBass: { value: 0 },
        uLowMid: { value: 0 },
        uMid: { value: 0 },
        uHighMid: { value: 0 },
        uPresence: { value: 0 },
        uBrilliance: { value: 0 },
        uAir: { value: 0 },
        uWarmth: { value: 0 },
        uBrightness: { value: 0 },
        uSharpness: { value: 0 },
        uSmoothness: { value: 0.5 },
        uDensity: { value: 0.5 },
        uEnergy: { value: 0 },

        uHeightIdle: { value: STAGE_CONFIG.height.idle },
        uHeightSubBass: { value: STAGE_CONFIG.height.subBass },
        uHeightBass: { value: STAGE_CONFIG.height.bass },
        uHeightLowMid: { value: STAGE_CONFIG.height.lowMid },
        uHeightMid: { value: STAGE_CONFIG.height.mid },
        uHeightHighMid: { value: STAGE_CONFIG.height.highMid },
        uHeightEnergy: { value: STAGE_CONFIG.height.energy },
        uHeightRipple: { value: STAGE_CONFIG.height.ripple },

        uRipples: { value: ripplesData },

        uBaseColor1: { value: new THREE.Color(STAGE_CONFIG.theme.base1) },
        uBaseColor2: { value: new THREE.Color(STAGE_CONFIG.theme.base2) },
        uCoolCore: { value: new THREE.Color(STAGE_CONFIG.theme.coolCore) },
        uCoolEdge: { value: new THREE.Color(STAGE_CONFIG.theme.coolEdge) },
        uWarmCore: { value: new THREE.Color(STAGE_CONFIG.theme.warmCore) },
        uWarmEdge: { value: new THREE.Color(STAGE_CONFIG.theme.warmEdge) },
        uRippleColor: { value: new THREE.Color(STAGE_CONFIG.theme.rippleColor) },
        uGlowIntensity: { value: STAGE_CONFIG.theme.glowIntensity }
      },
      transparent: true,
      side: THREE.DoubleSide
    })

    const GRID_SIZE = STAGE_CONFIG.gridSize
    const TOTAL_COUNT = GRID_SIZE * GRID_SIZE
    const SPACING = STAGE_CONFIG.spacing
    const TILE = STAGE_CONFIG.tileSize

    const boxGeo = new THREE.BoxGeometry(TILE, 1, TILE)
    instancedMesh = new THREE.InstancedMesh(boxGeo, customMaterial, TOTAL_COUNT)
    instancedMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage)

    const tempMatrix = new THREE.Matrix4()
    const halfGrid = (GRID_SIZE - 1) / 2
    let idx = 0

    for (let ix = 0; ix < GRID_SIZE; ix++) {
      for (let iz = 0; iz < GRID_SIZE; iz++) {
        const x = (ix - halfGrid) * SPACING
        const z = (iz - halfGrid) * SPACING
        tempMatrix.makeTranslation(x, 0.5, z)
        instancedMesh.setMatrixAt(idx, tempMatrix)
        idx++
      }
    }
    instancedMesh.instanceMatrix.needsUpdate = true
    scene.add(instancedMesh)

    const meteorGeo = new THREE.BoxGeometry(0.4, 1.2, 0.4)
    const meteorMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })
    meteorMesh = new THREE.InstancedMesh(meteorGeo, meteorMat, MAX_METEORS)
    meteorMesh.frustumCulled = false
    scene.add(meteorMesh)

    const particleGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6)
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: false,
      transparent: true,
      opacity: 0.7
    })
    particleMesh = new THREE.InstancedMesh(particleGeo, particleMat, MAX_PARTICLES)
    particleMesh.frustumCulled = false
    scene.add(particleMesh)

    const domEl = renderer.domElement

    domEl.addEventListener('pointerdown', (e: MouseEvent) => {
      if (e.button === 0) {
        pointerDownTime = performance.now()
      }
    })

    domEl.addEventListener('pointerup', (e: MouseEvent) => {
      if (e.button !== 0 || !camera || !instancedMesh) return
      const rect = domEl.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const hits = raycaster.intersectObject(instancedMesh)

      if (hits.length > 0) {
        const hitPoint = hits[0]?.point
        if (hitPoint) {
          const pressDuration = performance.now() - pointerDownTime
          const rippleStrength = Math.min(0.4 + (pressDuration / 1000) * 2.5, 2.5)
          spawnRipple(rippleStrength, hitPoint.x, hitPoint.z, false)
        }
      }
    })

    resizeHandler = () => {
      if (!areaRef.value || !camera || !renderer) return
      const w = areaRef.value.clientWidth || 800
      const h = areaRef.value.clientHeight || 500
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', resizeHandler)

    function render() {
      rafId = requestAnimationFrame(render)
      if (!clock || !scene || !camera || !renderer || !controls || !meteorMesh || !particleMesh) return

      const delta = clock.getDelta()
      const elapsedTime = clock.getElapsedTime()

      const audioData = audioAnalyzer.update(delta)

      if (customMaterial) {
        const u = customMaterial.uniforms
        u.uTime.value = elapsedTime
        u.uSubBass.value = audioData.subBass
        u.uBass.value = audioData.bass
        u.uLowMid.value = audioData.lowMid
        u.uMid.value = audioData.mid
        u.uHighMid.value = audioData.highMid
        u.uPresence.value = audioData.presence
        u.uBrilliance.value = audioData.brilliance
        u.uAir.value = audioData.air
        u.uWarmth.value = audioData.warmth
        u.uBrightness.value = audioData.brightness
        u.uSharpness.value = audioData.sharpness
        u.uSmoothness.value = audioData.smoothness
        u.uDensity.value = audioData.density
        u.uEnergy.value = audioData.energy

        for (let r = 0; r < MAX_RIPPLES; r++) {
          const item = ripplesData[r]
          if (item && item.isActive > 0.0 && elapsedTime - item.time > 3.5) {
            item.isActive = 0.0
          }
        }

        u.uRipples.value = ripplesData

        if (scene.fog instanceof THREE.Fog) {
          scene.fog.color.lerp(bgColor, 3.0 * delta)
          scene.background = scene.fog.color
        }
      }

      for (let i = 0; i < MAX_METEORS; i++) {
        const m = meteorsData[i]
        if (!m) continue
        if (m.active) {
          m.y -= 50.0 * m.speed * delta

          if (m.y <= 0) {
            m.active = false
            spawnRipple(Math.min(1.0 * m.strength, 1.2), m.x, m.z, true)
            for (let k = 0; k < 8; k++) {
              spawnSplashParticle(m.x, 0.5, m.z, 1.2 * m.speed)
            }
          }

          dummyPos.set(m.x, Math.max(0, m.y), m.z)
          dummyScale.set(1.5, 1.5, 1.5)
          dummyMatrix.compose(dummyPos, dummyQuat, dummyScale)
          meteorMesh.setMatrixAt(i, dummyMatrix)

          if (m.y > 0 && Math.random() > 0.4) {
            spawnSplashParticle(m.x, m.y, m.z, 0.15 * m.speed)
          }
        }
        else {
          dummyPos.set(0, -1000, 0)
          dummyScale.set(0, 0, 0)
          dummyMatrix.compose(dummyPos, dummyQuat, dummyScale)
          meteorMesh.setMatrixAt(i, dummyMatrix)
        }
      }
      meteorMesh.instanceMatrix.needsUpdate = true

      for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = particlesData[i]
        if (!p) continue
        if (p.active) {
          p.life += delta
          if (p.life >= p.maxLife) {
            p.active = false
            dummyScale.set(0, 0, 0)
          }
          else {
            p.x += p.vx * delta * 8.0
            p.y += p.vy * delta * 8.0
            p.z += p.vz * delta * 8.0
            const currentScale = p.scale * (1.0 - p.life / p.maxLife)
            dummyPos.set(p.x, p.y, p.z)
            dummyScale.set(currentScale, currentScale, currentScale)
          }
          dummyMatrix.compose(dummyPos, dummyQuat, dummyScale)
          particleMesh.setMatrixAt(i, dummyMatrix)
        }
        else {
          dummyPos.set(0, -1000, 0)
          dummyScale.set(0, 0, 0)
          dummyMatrix.compose(dummyPos, dummyQuat, dummyScale)
          particleMesh.setMatrixAt(i, dummyMatrix)
        }
      }
      particleMesh.instanceMatrix.needsUpdate = true

      controls.update()
      renderer.render(scene, camera)
    }

    render()
  }

  function destroy() {
    if (audio) {
      audio.pause()
    }
    clearScene()
  }

  return {
    setAudio,
    togglePlay,
    startVis,
    destroy,
    spawnRipple
  }
}
