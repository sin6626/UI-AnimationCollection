import { parser as pythonParser } from '@lezer/python'
import { parser as goParser } from '@lezer/go'

// 只解析语法，不执行用户代码；返回错误在源代码中的字符范围。
export function syntaxErrors(language: string, source: string) {
  const errors: { from: number, to: number }[] = []
  // TS 使用 Monaco 自带诊断；纯文本不检查。
  const parser = language === 'python' ? pythonParser : language === 'go' ? goParser : undefined
  if (!parser || !source.trim()) return errors
  // ponytail: 每次完整解析；大文件输入卡顿时改用增量解析或 Worker。
  parser.parse(source).iterate({
    enter(node) {
      if (node.type.isError) {
        const from = Math.min(node.from, Math.max(0, source.length - 1))
        errors.push({ from, to: Math.max(from + 1, node.to) })
      }
    }
  })
  return errors
}
