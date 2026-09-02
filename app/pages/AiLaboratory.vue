<script setup lang="ts">
import NumberFlow from '@number-flow/vue'

const num = ref(123)
onMounted(() => {
  let id = null as any
  id = setInterval(() => {
    num.value--
    if (num.value === 0) {
      clearTimeout(id)
    }
  }, 1000)
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen w-full gap-4">
    <NumberFlow
      :format="{ notation: 'compact' }"
      :value="num"
      class="text-5xl font-bold"
    />
    <!-- currency是货币, CNY, USD 是国际货币的代码,trailingZeroDisplay:'stripIfInteger', 是经凑型, 整数就正常抹零显示,小数正常显示   -->
    <NumberFlow
      :value="num"
      :format="{ style: 'currency', currency: 'CNY', currencyDisplay: 'narrowSymbol', trailingZeroDisplay: 'stripIfInteger' }"
      suffix="/月"
      class="text-5xl font-bold"
    />
    <!-- 显式的指定语言环境, 不然美元符号前面有US -->
    <NumberFlow
      locales="en-US"
      :value="num"
      :format="{ style: 'currency', currency: 'USD', trailingZeroDisplay: 'stripIfInteger' }"
      suffix="/mo"
      class="text-5xl font-bold"
    />
  </div>
</template>

<style scoped>
number-flow-vue::part(suffix) {
  margin-left: .0625em;
  font-weight: normal;
  font-size: 0.75em;
  color: var(--muted);
}
</style>
