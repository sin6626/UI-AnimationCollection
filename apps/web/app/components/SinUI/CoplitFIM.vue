<script setup lang="ts">
const { t } = useI18n()
// 页面同步当前语言的代码；每种语言的独立模型由编辑器保存，切回时恢复。
const code = ref('')
const language = ref('typescript')
const languageMenuOpen = ref(false)
// Key 仅保存在当前页面内存中，通过同源 Nuxt 服务调用 FIM，不写入本地存储。
const apiKey = ref('')
const languages = computed(() => [
  { value: 'typescript', label: 'TypeScript', extension: 'ts' },
  { value: 'python', label: 'Python', extension: 'py' },
  { value: 'go', label: 'Go', extension: 'go' },
  { value: 'plaintext', label: t('aiLaboratory.plainText'), extension: 'txt' }
])
const selectedLanguage = computed(() => languages.value.find(item => item.value === language.value)!)
</script>

<template>
  <section class="overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e] shadow-xl">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-3 py-2.5">
      <!-- 悬停展开；点击和键盘也能打开，方便触屏与键盘操作。 -->
      <UPopover
        v-model:open="languageMenuOpen"
        mode="hover"
        :close-delay="150"
        :content="{ align: 'start', sideOffset: 8 }"
        :ui="{ content: 'w-44 rounded-lg border border-white/10 bg-[#252526] p-1 shadow-xl' }"
      >
        <button
          type="button"
          class="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-zinc-300 transition hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-sky-400"
          :aria-label="t('aiLaboratory.language')"
          :aria-expanded="languageMenuOpen"
          @click="languageMenuOpen = true"
          @keydown.esc="languageMenuOpen = false"
        >
          <span class="font-mono text-sky-400">{{ selectedLanguage.extension.toUpperCase() }}</span>
          <span>{{ selectedLanguage.label }}</span>
          <UIcon name="i-lucide-chevron-down" class="size-3.5 text-zinc-500" />
        </button>
        <template #content>
          <button
            v-for="item in languages"
            :key="item.value"
            type="button"
            class="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs text-zinc-300 transition hover:bg-white/5 focus-visible:bg-white/10 focus-visible:outline-2 focus-visible:outline-sky-400"
            :aria-pressed="language === item.value"
            @click="language = item.value; languageMenuOpen = false"
          >
            <span>{{ item.label }}</span>
            <span class="font-mono" :class="language === item.value ? 'text-sky-400' : 'text-zinc-500'">.{{ item.extension }}</span>
          </button>
        </template>
      </UPopover>

      <label class="flex w-full items-center gap-2 rounded-md border border-white/10 bg-black/15 px-2.5 py-1.5 focus-within:border-sky-400/50 sm:w-64">
        <UIcon name="i-lucide-key-round" class="size-3.5 shrink-0 text-zinc-500" />
        <span class="sr-only">{{ t('aiLaboratory.apiKey') }}</span>
        <input
          v-model="apiKey"
          type="password"
          autocomplete="off"
          :spellcheck="false"
          :placeholder="t('aiLaboratory.apiKey')"
          class="min-w-0 flex-1 bg-transparent text-xs text-zinc-200 outline-none placeholder:text-zinc-500"
        >
      </label>
    </div>
    <!-- 服务端渲染时不执行 Monaco 的浏览器代码。 -->
    <ClientOnly>
      <LazySinUIMonacoEditor v-model="code" :language="language" :api-key="apiKey" />
    </ClientOnly>
  </section>
</template>
