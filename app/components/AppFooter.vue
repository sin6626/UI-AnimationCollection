/**
 * 页脚组件
 * - 读取 app.config.ts 中的 footer 配置
 * - 左侧显示版权信息,右侧显示社交链接按钮
 */

<script setup lang="ts">
// 取全局 app.config.ts 的 footer 配置
const { footer } = useAppConfig()
</script>

<template>
  <UFooter
    class="z-10 bg-default"
    :ui="{ left: 'text-muted text-xs' }"
  >
    <!-- 左侧: 版权 / credits 文案 -->
    <template #left>
      {{ footer.credits }}
    </template>

    <!-- 右侧: 社交媒体按钮列表 (Discord / X / GitHub 等) -->
    <template #right>
      <template v-if="footer?.links">
        <UButton
          v-for="(link, index) of footer?.links"
          :key="index"
          v-bind="{ size: 'xs', color: 'neutral', variant: 'ghost', ...link }"
        />
      </template>
    </template>
  </UFooter>
</template>
