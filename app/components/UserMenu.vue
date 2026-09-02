<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useAuth } from '~/composables/useAuth'

const { loggedIn, user, loginWithGithub, logout } = useAuth()

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: user.value?.name || user.value?.login || 'GitHub User',
      avatar: {
        src: user.value?.avatar
      },
      type: 'label'
    }
  ],
  [
    {
      label: 'GitHub 主页',
      icon: 'i-lucide-external-link',
      to: user.value?.htmlUrl || (user.value?.login ? `https://github.com/${user.value.login}` : undefined),
      target: '_blank'
    }
  ],
  [
    {
      label: '退出登录',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      onSelect: () => {
        logout()
      }
    }
  ]
])
</script>

<template>
  <ClientOnly>
    <div class="flex items-center">
      <!-- 已登录: 显示用户头像与下拉操作菜单 -->
      <UDropdownMenu
        v-if="loggedIn"
        :items="items"
        :content="{ align: 'center', sideOffset: 8 }"
        :modal="false"
      >
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          class="rounded-full p-0.5 hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer"
        >
          <UAvatar
            :src="user?.avatar"
            :alt="user?.name || user?.login"
            size="xs"
            class="size-6 rounded-full object-cover"
          />
        </UButton>
      </UDropdownMenu>

      <!-- 未登录: 显示 GitHub 登录按钮 -->
      <UButton
        v-else
        icon="i-simple-icons-github"
        label="登录"
        color="neutral"
        variant="ghost"
        size="sm"
        class="rounded-full gap-1.5 px-2.5 py-1 text-xs cursor-pointer"
        @click="loginWithGithub"
      />
    </div>

    <!-- 客户端加载中骨架占位 -->
    <template #fallback>
      <div class="size-6" />
    </template>
  </ClientOnly>
</template>
