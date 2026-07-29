<script setup lang="ts">

</script>

<template>
  <section
    class="m-auto flex min-h-[46vh] items-center justify-center rounded-3xl bg-default px-6 py-10"
    aria-label="Interactive icon morph animation"
  >
    <div class="flex w-full max-w-3xl justify-center rounded-xl bg-default px-6 py-12">
      <!-- grid-cols-[repeat(4,_55px)] 分成四列, 没列55px的宽度, tailwind规定_是 空格, 写空格的话会被误认为两个css的样式类 -->
      <div class="grid grid-cols-[repeat(4,55px)] items-center justify-center gap-2.5 md:grid-cols-[repeat(4,70px)] md:gap-7.5">
        <!-- 下面的no-rel 是NuxtLink, 加上之后, NuxtLink 生成的a标签中就没有rel="noopener, noreferrer" 就不会给有安全隔离和用户隐私的保护, 一般默认不要写no-rel即可 -->
        <NuxtLink
          to="#"
          class="h-13.75 w-13.75 md:h-17.5 md:w-17.5"
          aria-label="Lien vers mon compte Instagram"
          target="_self"
        >
          <SvgMenuInsta class="icon" />
        </NuxtLink>
        <NuxtLink
          to="#"
          class="h-13.75 w-13.75 md:h-17.5 md:w-17.5"
          aria-label="Lien vers ma chaine YouTube"
          target="_self"
        >
          <SvgMenuYtbe class="icon" />
        </NuxtLink>
        <NuxtLink
          to="#"
          class="h-13.75 w-13.75 md:h-17.5 md:w-17.5"
          aria-label="Lien vers le répertoire GitHub"
          target="_self"
        >
          <SvgMenuGit class="icon" />
        </NuxtLink>
        <NuxtLink
          to="#"
          class="h-13.75 w-13.75 md:h-17.5 md:w-17.5"
          aria-label="Lien vers mon Mail"
          target="_self"
        >
          <SvgMenuMail class="icon" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 社交图标周边文字旋转动画（持续旋转） */
/* 写在外面, 用:deep穿透, 统一管理文字旋转 */
.icon:deep() .spin {
  animation: spin 15s linear infinite;
  transform-origin: center;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
