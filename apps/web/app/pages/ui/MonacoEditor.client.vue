<script setup lang="ts">
import * as monaco from 'monaco-editor'
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
  }>(),
  {
    modelValue: '',
    language: 'typescript'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const container = ref<HTMLDivElement>()
// 编辑器实例不需要响应式代理，卸载时会手动释放。
let editor: monaco.editor.IStandaloneCodeEditor | undefined

// 此文件只在客户端渲染；按语言分配 Worker，让语法检查在后台线程执行。
self.MonacoEnvironment = {
  getWorker(_, label) {
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

  editor = monaco.editor.create(container.value, {
    value: props.modelValue,
    language: props.language,
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: {
      enabled: false
    },
    fontSize: 14
  })

  // 用户编辑后通知父页面，更新 v-model。
  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor?.getValue() ?? '')
  })
})

// 父页面更新代码时同步到编辑器；内容相同则跳过，避免重复触发更新。
watch(
  () => props.modelValue,
  value => {
    if (editor && editor.getValue() !== value) {
      editor.setValue(value)
    }
  }
)

// language 改变时更新当前文本模型的语言。
watch(() => props.language, (language) => {
  const model = editor?.getModel()
  if (model) monaco.editor.setModelLanguage(model, language)
})

// 离开页面时释放编辑器及其自动创建的文本模型，避免重复进入后积累资源。
onBeforeUnmount(() => {
  const model = editor?.getModel()
  editor?.dispose()
  model?.dispose()
})
</script>

<template>
  <div
    ref="container"
    class="h-[500px] w-full"
  />
</template>
