<script setup lang="ts">
// ？worker是Vite提供的特殊的导入语法，它告诉 Vite：将这个文件作为 Web Worker 处理，导入一个可以创建 Worker 的构造器。
// Web Worker是浏览器提供的一种多线程的机制，让js在后台的线程中执行任务，而不去堵塞主线程，不可操作DOM元素，没有window这个对象，本意就是让你并发计算一些东西
import * as monaco from 'monaco-editor'
import { syntaxErrors } from '~/utils/codeSyntax'
import editorWorker from 'monaco-editor/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/language/typescript/ts.worker?worker'

// 外部通过 v-model 传入代码，通过 language 指定语言。
const props = withDefaults(
  defineProps<{
    modelValue?: string
    language?: string
    apiKey?: string
  }>(),
  {
    modelValue: '',
    language: 'typescript',
    apiKey: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const container = ref<HTMLDivElement>()
// 编辑器实例不需要响应式代理，卸载时会手动释放。
let editor: monaco.editor.IStandaloneCodeEditor | undefined
// 每种语言保存自己的文本模型（包含撤销记录）与视图状态（光标、滚动位置）。
const documents = new Map<string, {
  model: monaco.editor.ITextModel
  viewState: monaco.editor.ICodeEditorViewState | null
}>()
const { t } = useI18n()
const status = ref('idle')
let requestCompletion = () => {}
let cancelCompletion = () => {}
let disposeCompletion = () => {}
let disposeDiagnostics = () => {}

// 此文件只在客户端渲染；按语言分配 Worker，让语法检查在后台线程执行。
//Monaco Editor 约定使用的全局配置对象。
// self是js执行环境中的全局对象的引用，在浏览器主线程中，他跟window一样，没有区别，，但是在worker中就不是window，因为worker中没有
self.MonacoEnvironment = {
  getWorker(_, label) {
    // 不同的语言返回不同的Worker
    if (label === 'json') {
      return new jsonWorker()
    }

    if (['css', 'scss', 'less'].includes(label)) {
      return new cssWorker()
    }

    if (['html', 'handlebars', 'razor'].includes(label)) {
      return new htmlWorker()
    }

    if (['typescript', 'javascript'].includes(label)) {
      return new tsWorker()
    }

    return new editorWorker()
  }
}

// DOM 挂载后才能创建编辑器，容器必须有明确高度。
onMounted(() => {
  if (!container.value) return

  const model = monaco.editor.createModel(props.modelValue, props.language)
  documents.set(props.language, { model, viewState: null })
  // 创建一个编辑器的实例
  editor = monaco.editor.create(container.value, {
    // 显式传入模型；切换文档用 setModel，不覆盖其他语言的代码。
    model,
    theme: 'vs-dark',
    // 容器大小变化自动调整布局
    automaticLayout: true,
    // 是否显示右侧的代码缩略图
    minimap: {
      enabled: true
    },
    inlineSuggest: { enabled: true },
    fontSize: 14,

    // 高亮显示，有时候打中文逗号会高亮显示，所以我打算关闭
    unicodeHighlight: {
      ambiguousCharacters: false,
      invisibleCharacters: false,
      nonBasicASCII: false,
    },

  })

  // 网络请求与 provider 分开：provider 同步返回候选，避免 Monaco 重复询问时重复付费请求。
  const instance = editor
  // TS 的语法与类型检查由 tsWorker 提供；Python/Go 用解析器补齐语法错误标记，不执行代码。
  let diagnosticTimer: ReturnType<typeof setTimeout> | undefined
  const validateSyntax = () => {
    const model = instance.getModel()
    if (!model) return
    const language = model.getLanguageId()
    const name = language === 'python' ? 'Python' : 'Go'
    const markers = syntaxErrors(language, model.getValue()).map(({ from, to }) => {
      const start = model.getPositionAt(from)
      const end = model.getPositionAt(to)
      return {
        startLineNumber: start.lineNumber, startColumn: start.column,
        endLineNumber: end.lineNumber, endColumn: end.column,
        severity: monaco.MarkerSeverity.Error,
        message: t('aiLaboratory.syntaxError', { language: name }),
        source: name
      }
    })
    monaco.editor.setModelMarkers(model, 'syntax-check', markers)
  }
  const diagnosticListeners = [
    instance.onDidChangeModelContent(() => {
      clearTimeout(diagnosticTimer)
      diagnosticTimer = setTimeout(validateSyntax, 200)
    }),
    instance.onDidChangeModel(() => { clearTimeout(diagnosticTimer); validateSyntax() })
  ]
  validateSyntax()
  disposeDiagnostics = () => {
    clearTimeout(diagnosticTimer)
    diagnosticListeners.forEach(listener => listener.dispose())
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  let pending: AbortController | undefined
  let composing = false
  let candidate: {
    model: monaco.editor.ITextModel
    version: number
    cursor: monaco.Position
    text: string
    range: monaco.Range
    isInlineEdit: boolean
  } | undefined
  const cancel = () => {
    clearTimeout(timer)
    pending?.abort()
    pending = undefined
    candidate = undefined
    status.value = 'idle'
  }
  const hide = () => instance.trigger('fim', 'editor.action.inlineSuggest.hide', {})
  cancelCompletion = () => { cancel(); hide() }
  const fetchCompletion = async () => {
    cancel()
    const model = instance.getModel()
    const cursor = instance.getPosition()
    const key = props.apiKey.trim()
    if (!key || !model || !cursor || composing || !instance.hasTextFocus() || !instance.getSelection()?.isEmpty()) return
    const version = model.getVersionId()
    const value = model.getValue()
    const offset = model.getOffsetAt(cursor)
    // 空白行末尾从行首生成，让模型决定缩进；普通代码位置只在光标处插入。
    const line = model.getLineContent(cursor.lineNumber)
    const startColumn = /^[\t ]*$/.test(line) && cursor.column === line.length + 1 ? 1 : cursor.column
    const range = new monaco.Range(cursor.lineNumber, startColumn, cursor.lineNumber, cursor.column)
    const startOffset = offset - (cursor.column - startColumn)
    const prefix = value.slice(Math.max(0, startOffset - 24000), startOffset)
    if (!prefix.trim()) return
    // 高亮不会告诉模型使用什么语言，必须同时将语言 ID 传给 Nuxt 服务。
    const body = { prefix, suffix: value.slice(offset, offset + 12000), language: model.getLanguageId() }
    const controller = new AbortController()
    pending = controller
    status.value = 'loading'
    // 响应拦截器记录请求和返回值，Authorization 必须脱敏。
    const logResponse = (response: { status: number | null, _data?: unknown }) => {
      console.info('[FIM]', { statusCode: response.status, method: 'POST', url: '/api/completion', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer [REDACTED]' }, params: body, response: response._data })
    }
    try {
      const data = await $fetch<{ completion: string }>('/api/completion', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body,
        signal: controller.signal,
        retry: 0,
        onResponse({ response }) { logResponse(response) },
        onRequestError() { logResponse({ status: null, _data: { error: controller.signal.aborted ? 'canceled' : 'networkError' } }) }
      })
      // 内容、光标、语言或 Key 改变后，旧响应不能显示到新位置。
      if (controller.signal.aborted || composing || model.isDisposed() || instance.getModel() !== model
        || model.getVersionId() !== version || !instance.getPosition()?.equals(cursor)) return
      candidate = { model, version, cursor, range, text: data.completion, isInlineEdit: !data.completion.startsWith(model.getValueInRange(range)) }
      status.value = data.completion ? 'ready' : 'empty'
      if (data.completion) await instance.getAction('editor.action.inlineSuggest.trigger')?.run()
    } catch (error) {
      if (!controller.signal.aborted) {
        // 服务端只返回固定错误代码；界面通过 i18n 展示，不泄露上游错误或 Key。
        const code = (error as { data?: { error?: string } }).data?.error
        const errors = ['invalidInput', 'missingKey', 'invalidKey', 'insufficientBalance', 'rateLimited', 'upstreamError', 'invalidResponse', 'timeout', 'networkError']
        status.value = code && errors.includes(code) ? code : 'networkError'
      }
    } finally {
      if (pending === controller) pending = undefined
    }
  }
  requestCompletion = () => { instance.focus(); void fetchCompletion() }
  const provider = monaco.languages.registerInlineCompletionsProvider('*', {
    provideInlineCompletions(model, cursor) {
      if (!candidate || composing || candidate.model !== model || candidate.version !== model.getVersionId() || !candidate.cursor.equals(cursor)) return { items: [] }
      return { items: [{ insertText: candidate.text, range: candidate.range, isInlineEdit: candidate.isInlineEdit }] }
    },
    disposeInlineCompletions() {}
  })
  // 有建议时 Tab 接受；无建议时保留原来的缩进，不提前修改用户代码。
  const accept = instance.addAction({
    id: 'fim.acceptSuggestion',
    label: t('aiLaboratory.accept'),
    keybindings: [monaco.KeyCode.Tab],
    precondition: '(inlineSuggestionVisible || inlineEditIsVisible) && editorTextFocus && !editorTabMovesFocus && !suggestWidgetVisible && !editorHasSelection && !inSnippetMode',
    run: () => instance.getAction('editor.action.inlineSuggest.commit')?.run()
  })
  const manual = instance.addAction({
    id: 'fim.requestCompletion',
    label: t('aiLaboratory.generate'),
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    run: () => requestCompletion()
  })
  const schedule = () => {
    clearTimeout(timer)
    if (props.apiKey.trim() && !composing) timer = setTimeout(() => void fetchCompletion(), 450)
  }
  const listeners = [
    instance.onDidChangeModelContent(() => { cancel(); schedule() }),
    instance.onDidChangeCursorPosition(event => {
      pending?.abort()
      pending = undefined
      candidate = undefined
      if (event.reason === monaco.editor.CursorChangeReason.Explicit) clearTimeout(timer)
      status.value = 'idle'
    }),
    instance.onDidChangeModel(() => { composing = false; cancelCompletion() }),
    instance.onDidChangeModelLanguage(() => cancelCompletion()),
    instance.onKeyDown(event => { if (event.keyCode === monaco.KeyCode.Escape) cancelCompletion() }),
    instance.onDidBlurEditorText(() => cancelCompletion()),
    // 中文输入法组字时不请求；组字结束后再防抖请求。
    instance.onDidCompositionStart(() => { composing = true; cancelCompletion() }),
    instance.onDidCompositionEnd(() => { composing = false; schedule() })
  ]
  disposeCompletion = () => {
    cancel()
    provider.dispose()
    accept.dispose()
    manual.dispose()
    listeners.forEach(listener => listener.dispose())
  }

  // 用户编辑后通知父页面，更新 v-model。
  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor?.getValue() ?? '')
  })
})

// 一起监听语言与 v-model，避免切换时把上一种语言的值写进新模型。
watch([() => props.language, () => props.modelValue], ([language, value]) => {
  if (!editor) return
  const current = editor.getModel()
  if (current?.getLanguageId() !== language) {
    cancelCompletion()
    const previous = current && documents.get(current.getLanguageId())
    if (previous) previous.viewState = editor.saveViewState()
    let document = documents.get(language)
    if (!document) {
      // 第一次打开此语言时创建空白模型；已有模型直接复用，保留撤销历史。
      document = { model: monaco.editor.createModel('', language), viewState: null }
      documents.set(language, document)
    }
    editor.setModel(document.model)
    if (document.viewState) editor.restoreViewState(document.viewState)
    emit('update:modelValue', document.model.getValue())
  } else if (current.getValue() !== value) {
    // 父页面主动修改当前文档时，才同步 v-model；语言切换不走 setValue。
    current.setValue(value)
  }
})

// 切换或清空 Key 时取消旧请求与建议。
watch(() => props.apiKey, () => cancelCompletion())

// 离开页面时释放编辑器及所有语言的文本模型，避免重复进入后积累资源。
onBeforeUnmount(() => {
  disposeCompletion()
  disposeDiagnostics()
  // 这里的model是Monaco中一个很重要的概念，数据源：文本模型，下面的editor是视图层
  // model可以获取getVersionId()，也就是版本号，Monaco 在文档发生变更时会递增版本号，包括撤销和重做。
  // todo：做copilot类似的代码补全的时候可以利用版本信息判断补全结果是否已经过期。
  editor?.dispose()
  documents.forEach(document => document.model.dispose())
  documents.clear()
})
</script>

<template>
  <div ref="container" class="h-[800px] w-full" />
  <div class="flex items-center justify-between gap-3 border-t border-white/10 px-3 py-2 text-xs text-zinc-400">
    <span role="status" aria-live="polite">{{ t(`aiLaboratory.${props.apiKey.trim() ? status : 'missingKey'}`) }}</span>
    <button
      type="button"
      class="shrink-0 rounded-md px-2 py-1 text-sky-400 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="!props.apiKey.trim() || status === 'loading'"
      @click="requestCompletion()"
    >
      {{ t('aiLaboratory.generate') }}
    </button>
  </div>
</template>
