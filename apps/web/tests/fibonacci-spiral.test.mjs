import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'

const component = readFileSync(new URL('../app/pages/AiLaboratory.vue', import.meta.url), 'utf8')
const script = component.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)?.[1]
assert.ok(script, '实验室页应包含生成螺旋的脚本')

const js = ts.transpileModule(`${script}\nglobalThis.spiralSquares = squares\nglobalThis.cameraFrames = cameraFrames`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None }
}).outputText
const context = {
  useSeoMeta() {},
  ref(value) { return { value } },
  computed(getter) {
    return {
      get value() {
        return getter()
      }
    }
  },
  onMounted() {},
  onBeforeUnmount() {}
}
vm.runInNewContext(js, context)

function arcGeometry(path) {
  const numbers = [...path.matchAll(/-?\d+(?:\.\d+)?/g)].map(match => Number(match[0]))
  const [x0, y0, radiusX, radiusY, rotation, largeArc, sweep, x1, y1] = numbers
  assert.equal(radiusX, radiusY)
  assert.equal(rotation, 0)
  assert.equal(largeArc, 0)

  const start = [x0, y0]
  const end = [x1, y1]
  const centers = [[x0, y1], [x1, y0]]
  const center = centers.find(([cx, cy]) => {
    const a0 = Math.atan2(y0 - cy, x0 - cx)
    const a1 = Math.atan2(y1 - cy, x1 - cx)
    const clockwise = ((a1 - a0) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
    return Math.abs(clockwise - (sweep ? Math.PI / 2 : 3 * Math.PI / 2)) < 1e-8
  })
  assert.ok(center, `无法确定圆弧圆心：${path}`)

  const tangent = ([x, y]) => sweep
    ? [-(y - center[1]), x - center[0]]
    : [y - center[1], -(x - center[0])]

  return { start, end, startTangent: tangent(start), endTangent: tangent(end) }
}

test('相邻圆弧在同一端点平滑相接', () => {
  const arcs = context.spiralSquares.map(square => arcGeometry(square.arc))
  for (let index = 1; index < arcs.length; index++) {
    const previous = arcs[index - 1]
    const current = arcs[index]
    assert.deepEqual(previous.end, current.start, `第 ${index} 段圆弧起点必须等于上一段终点`)
    const [ax, ay] = previous.endTangent
    const [bx, by] = current.startTangent
    const cosine = (ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by))
    assert.ok(cosine > 0.999, `第 ${index} 段圆弧在接点折返：切线余弦 ${cosine}`)
  }
})

test('每一帧方形视窗都容纳已出现的方块', () => {
  const squares = context.spiralSquares
  const frames = context.cameraFrames
  assert.equal(frames.length, squares.length)
  assert.equal(squares.length, 11, '应在原有七格后继续完成一圈螺旋')

  for (const [index, frame] of frames.entries()) {
    for (const square of squares.slice(0, index + 1)) {
      assert.ok(square.x >= frame.x && square.y >= frame.y, `第 ${index} 帧漏掉方块左上角`)
      assert.ok(square.x + square.size <= frame.x + frame.size, `第 ${index} 帧漏掉方块右边`)
      assert.ok(square.y + square.size <= frame.y + frame.size, `第 ${index} 帧漏掉方块底边`)
    }
  }

  const ratios = frames.slice(2).map((frame, index) => frame.size / frames[index + 1].size)
  assert.ok(new Set(ratios.map(ratio => ratio.toFixed(3))).size > 1, '各次缩放不应使用固定比例')
  assert.ok(Math.abs(ratios.at(-1) - (1 + Math.sqrt(5)) / 2) < 0.01)
})

test('新增方块也必须有有效的描边颜色', () => {
  for (const [index, square] of context.spiralSquares.entries()) {
    assert.match(square.color ?? '', /^#[\da-f]{6}$/i, `第 ${index + 1} 个方块缺少描边颜色`)
  }
})
