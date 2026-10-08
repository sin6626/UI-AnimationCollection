import assert from 'node:assert/strict'
import { test } from 'node:test'
import { syntaxErrors } from '../app/utils/codeSyntax.ts'

test('Python 语法检查拒绝 TS 代码，接受合法 Python，错误范围有效', () => {
  for (const source of ['', '# 注释\n', 'def binary_search(arr, target):\n    return -1\n', 'x = "😀"\nprint(x)\n']) {
    assert.deepEqual(syntaxErrors('python', source), [])
  }
  for (const source of ['// 写一个二分查找的函数\nfunction binarySearch(arr: number[]): number { return -1; }', 'def fib(n)\n    return n\n', 'x = (']) {
    const errors = syntaxErrors('python', source)
    assert.ok(errors.length > 0)
    assert.ok(errors.every(error => error.from >= 0 && error.to > error.from && error.to <= source.length))
  }
})

test('Go 检查合法程序、错误 Go 及其他语言代码；纯文本不诊断', () => {
  for (const source of ['', '   ', 'package main\nfunc main() {}\n', 'package main\nfunc add(a, b int) int { return a + b }\n']) {
    assert.deepEqual(syntaxErrors('go', source), [])
  }
  for (const source of ['function add(a: number) { return a; }', 'def add(a):\n    return a\n', 'package main\nfunc main( {']) {
    const errors = syntaxErrors('go', source)
    assert.ok(errors.length > 0)
    assert.ok(errors.every(error => error.from >= 0 && error.to > error.from && error.to <= source.length))
  }
  assert.deepEqual(syntaxErrors('plaintext', 'function ??? {'), [])
})
