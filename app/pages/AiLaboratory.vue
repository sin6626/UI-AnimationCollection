<script setup lang="ts">
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

const apiUrl = '/api/blog/post'

interface BlogPost {
  id: string
  title: string
  text: string
  summary?: string
  created: string
  modified: string
  tags?: string[]
}

// 1. 使用 useLazyFetch 懒加载请求博客文章数据（非阻塞，路由秒切），并开启 getCachedData 缓存复用
const { data: post, status, error, refresh } = useLazyFetch<BlogPost>(apiUrl, {
  // 开启内存缓存复用：从其他路由切回时直接从 nuxtApp 内存秒取，彻底免除重复网络请求
  getCachedData(key, nuxtApp) {
    return nuxtApp.payload.data[key]
  },
  // 规范化接口返回的 Markdown 换行符（CRLF -> LF），彻底消除客户端与服务端 Hydration text mismatch
  transform(data) {
    if (data && typeof data.text === 'string') {
      data.text = data.text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    }
    return data
  }
})

// 2. 将 Markdown 文本解析为包含 body AST 与 toc 目录树的 Content 数据结构
// 启用 lazy 非阻塞模式与 getCachedData 缓存复用
const { data: parsedPost } = useAsyncData(
  'lab-parsed-blog-post',
  async () => {
    if (!post.value?.text) return null
    return await parseMarkdown(post.value.text, { highlight: false })
  },
  {
    lazy: true,
    watch: [post],
    getCachedData(key, nuxtApp) {
      return nuxtApp.payload.data[key] || nuxtApp.static.data[key]
    }
  }
)
</script>

<template>
  <div class="py-8 px-2 sm:px-4">
    <!-- 加载中状态（当请求中或尚未解析完成时） -->
    <div
      v-if="status === 'pending' || (!parsedPost && !error)"
      class="flex flex-col items-center justify-center py-20 gap-3"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-8 animate-spin text-primary"
      />
      <p class="text-sm text-muted">
        正在拉取并解析博客富文本内容...
      </p>
    </div>

    <!-- 加载失败状态 -->
    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center py-20 gap-4 text-center"
    >
      <UIcon
        name="i-lucide-alert-triangle"
        class="size-10 text-red-500"
      />
      <p class="text-base text-red-500 font-medium">
        请求博客内容失败：{{ error.message }}
      </p>
      <UButton
        color="neutral"
        variant="subtle"
        icon="i-lucide-rotate-ccw"
        @click="refresh()"
      >
        重试
      </UButton>
    </div>

    <!-- 成功渲染：左侧文章正文 + 右侧 TOC 目录树两栏布局 -->
    <div
      v-else-if="post && parsedPost"
      class="flex flex-col lg:flex-row gap-10 items-start"
    >
      <!-- 主体文章区 -->
      <article class="flex-1 min-w-0 flex flex-col gap-8">
        <!-- 文章头部元信息 -->
        <header class="border-b border-muted/40 pb-6 flex flex-col gap-4">
          <h1 class="text-3xl sm:text-4xl font-bold tracking-tight text-highlighted">
            {{ post.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-4 text-sm text-muted">
            <span class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-calendar"
                class="size-4"
              />
              {{ new Date(post.created).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) }}
            </span>

            <span
              v-if="post.tags?.length"
              class="flex items-center gap-2"
            >
              <UIcon
                name="i-lucide-tags"
                class="size-4"
              />
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
              >
                {{ tag }}
              </span>
            </span>
          </div>

          <!-- 摘要引言块 -->
          <blockquote
            v-if="post.summary"
            class="mt-2 pl-4 border-l-2 border-primary/60 text-sm italic text-muted-foreground bg-muted/20 py-2 pr-3 rounded-r-lg"
          >
            💡 <span class="font-medium not-italic text-default">摘要：</span>{{ post.summary }}
          </blockquote>
        </header>

        <!-- 🌟 使用 Nuxt Content 官方 ContentRenderer 渲染富文本正文 -->
        <main class="prose dark:prose-invert max-w-none">
          <ContentRenderer :value="parsedPost" />
        </main>
      </article>
    </div>
  </div>
</template>
