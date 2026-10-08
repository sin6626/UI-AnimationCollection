<script setup lang="ts">
// ？worker是Vite提供的特殊的导入语法，它告诉 Vite：将这个文件作为 Web Worker 处理，导入一个可以创建 Worker 的构造器。
// Web Worker是浏览器提供的一种多线程的机制，让js在后台的线程中执行任务，而不去堵塞主线程，不可操作DOM元素，没有window这个对象，本意就是让你并发计算一些东西
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

  // 创建一个编辑器的实例
  editor = monaco.editor.create(container.value, {
    // value：默认展示的内容，有点像placeholder
    value: props.modelValue,
    language: props.language,
    theme: 'vs-dark',
    // 容器大小变化自动调整布局
    automaticLayout: true,
    // 是否显示右侧的代码缩略图
    minimap: {
      enabled: true
    },
    fontSize: 14
  })

  // 用户编辑后通知父页面，更新 v-model。
  editor.onDidChangeModelContent(() => {
    emit('update:modelValue', editor?.getValue() ?? '')
  })
})

// 父页面更新代码时同步到编辑器；内容相同则跳过，避免重复触发更新。
// 因为Monaco并不是一个真正的Vue组建，不是数据改变UI也响应式的变化，所以必须使用watch去监听变化
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
  // 这里的model是Monaco中一个很重要的概念，数据源：文本模型，下面的editor是视图层
  // model可以获取getVersionId()，也就是版本号，Monaco 在文档发生变更时会递增版本号，包括撤销和重做。
  // todo：做copilot类似的代码补全的时候可以利用版本信息判断补全结果是否已经过期。
  const model = editor?.getModel()
  editor?.dispose()
  model?.dispose()
})
</script>

<template>
  <div
    ref="container"
    class="h-[800px] w-full"
  />
</template>
