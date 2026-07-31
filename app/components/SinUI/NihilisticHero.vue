<template>
  <!--
    页面布局说明：
    - 整体使用 flex 居中，垂直高度为视口减去顶部导航栏(8rem)的高度，实现"满屏居中"的海报展示效果
    - 海报本身固定宽高比 1259/707（约 16:9），使用 aspect-ratio 保证在不同屏幕下等比缩放
    - 所有内部元素均使用百分比定位，因此海报可以整体缩放而不变形
  -->
  <section class="flex items-center justify-center px-3 py-10">
    <article class="nihilist-poster relative aspect-[1259/707] w-full max-w-6xl overflow-hidden rounded-4xl bg-default text-white shadow-2xl shadow-black/20">
      <!--
        背景层（第一层）：
        - radial-gradient 在画面偏左上(42%, 38%)打出一团柔和的蓝色光晕，模拟远处光雾
        - linear-gradient 在左侧叠加一层轻微的水平渐变，增强画面纵深感
        - 两层渐变叠加后让纯色背景(#314ca8)显得更丰富
      -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_42%_38%,rgba(86,116,210,.42),transparent_36%),linear-gradient(90deg,rgba(25,45,122,.2),transparent_42%)] " />

      <!--
        背景层（第二层）：画面右侧的斜切色块
        - 占据右侧 44% 宽度，色块更浅(加 30% 透明度)
        - clip-path 把矩形裁剪成平行四边形（左侧边斜切），制造"排版错位"的视觉节奏
      -->
      <div class="absolute right-0 top-0 h-full w-[44%] bg-[#243c94]/30 [clip-path:polygon(42%_0,100%_0,100%_100%,0_100%)]" />

      <!--
        背景层（第三层）：右上区域的斜切色块（比上一块更小、更浅）
        - 位于右 5% / 上 19%，宽 32% 高 58%，整体逆时针旋转 2 度
        - clip-path 为左右都斜切的六边形，与前面的平行四边形形成层叠透视感
      -->
      <div class="absolute right-[5%] top-[19%] h-[58%] w-[32%] rotate-[-2deg] bg-[#5e72ca]/16 [clip-path:polygon(28%_0,100%_0,72%_100%,0_100%)]" />

      <!-- 背景层（第四层）：最小的一块斜切色块，逆时针旋转 7 度，进一步叠加层次 -->
      <div class="absolute right-[17%] top-[34%] h-[38%] w-[25%] rotate-[-7deg] bg-[#7e8ee0]/12 [clip-path:polygon(20%_0,100%_0,76%_100%,0_100%)]" />

      <!--
        文字区域（z-20 位于 SVG 之上）：
        - 绝对定位在画面左侧，宽 35%
        - font-poster-serif 使用自定义衬线字体（见 style 中的 @font-face）
      -->
      <section class="absolute left-[5.9%] top-[22.2%] z-20 w-[35%] font-poster-serif text-default">
        <!-- 主标题：使用 cqw 基于海报容器宽度缩放，保证整体等比复刻 -->
        <h1 class="poster-title whitespace-nowrap text-[5.7cqw] font-black leading-none">
          虚无实用主义
        </h1>

        <!--
          副标题行：英文小标题，两侧各一条细横线作为装饰分割线
          - flex-1 让横线均分标题两边的空间，实现"文字居中 + 左右线"效果
        -->
        <div class="mt-[2.6%] flex items-center gap-[1.4cqw] whitespace-nowrap text-[1.75cqw] font-semibold leading-none tracking-[.02em] text-default/88">
          <span class="h-px w-[6.7cqw] bg-white/32" />
          <span>Nihilistic Practicalism</span>
          <span class="h-px w-[6.7cqw] bg-white/32" />
        </div>

        <!--
          装饰行：菱形(旋转45°的正方形)+两侧横线
          - 与上面的标题线形成呼应，做一个小的视觉节点分隔内容
        -->
        <div class="mt-[7.4%] flex items-center justify-center gap-[.9cqw] px-[10%]">
          <span class="h-px flex-1 bg-inverted/46" />
          <span class="size-[.72cqw] rotate-45 bg-inverted/90" />
          <span class="h-px flex-1 bg-inverted/46" />
        </div>

        <!--
          中文正文：海报的核心文案
          - <br> 手动换行控制排版节奏
          - 行高 1.48、字间距 0.08em，营造沉静的阅读感
        -->
        <p class="poster-cn mt-[7.3%] text-[2.35cqw] font-bold leading-[1.62] tracking-[.08em] text-default">
          努力不会背叛自己，<br>
          却会背叛梦想；<br>
          努力的意义，<br>
          只剩自我安慰。
        </p>

        <!-- 中文正文下方的一段短横线，作为与英文段落的分隔 -->
        <div class="mt-[8.3%] h-px w-[14%] bg-(--ui-text)/80" />

        <!--
          英文翻译区：
          - 左侧一个大号"×"作为装饰符号（低透明度，属于纯装饰元素）
          - 右侧为英文小字翻译，字号比中文更小，形成主次对比
        -->
        <div class="mt-[4.5%] grid grid-cols-[2cqw_1fr] gap-[1cqw] text-default/90">
          <span class="mt-[.1cqw] text-[2.2cqw] leading-none text-muted">×</span>
          <p class="poster-en text-[1.25cqw] font-medium leading-[1.28] tracking-[.02em]">
            Efforts won't betray yourself,<br>
            but they'll betray your dreams;<br>
            the meaning of effort is<br>
            only self-comfort.
          </p>
        </div>
      </section>

      <!--
        线条艺术层（z-10，位于背景之上、文字之下）：
        全部由 <path> 绘制，模拟手绘感的散点线条与色块
        - viewBox 固定为 0 0 1259 707，与海报宽高比完全一致
        - 颜色为紫色(#b34ad4 系)与橙色(#f0a150 系)两组，形成冷暖对比
        - 线条粗细 3~9 不等、带圆角端点，增加手绘/涂鸦质感
      -->
      <svg
        class="absolute right-[-3%] bottom-[-5%] z-10 h-full w-full"
        viewBox="0 0 1259 707"
        aria-hidden="true"
      >
        <g opacity=".95">
          <!-- 主折线：画面右侧延伸出的一条粗紫色折线，是最显眼的线条 -->
          <path
            d="M630 588 704 558 754 573 833 530 900 548 1015 495"
            fill="none"
            stroke="#b34ad4"
            stroke-width="9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- 第二条紫色折线：较细，位于画面右上方 -->
          <path
            d="M896 267 946 235 1008 283 1076 255 1120 194"
            fill="none"
            stroke="#9b47ce"
            stroke-width="9"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- 橙色短线：细线(5px)，最右侧顶部区域 -->
          <path
            d="M951 180 1000 145 1018 158 1080 110"
            fill="none"
            stroke="#f0a150"
            stroke-width="5"
            stroke-linecap="round"
          />
          <!-- 橙色长折线：4px 细线，从画面中部延伸到最右侧 -->
          <path
            d="M944 440 985 399 1017 421 1088 360 1221 329"
            fill="none"
            stroke="#e59a51"
            stroke-width="4"
            stroke-linecap="round"
          />
          <!-- 橙色闭合小图形：类似"回形针"形状的填充色块 -->
          <path
            d="M937 228 962 205 957 239 982 252 946 260"
            fill="#eaa458"
          />
          <!-- 紫色小三角色块 -->
          <path
            d="M1072 270 1122 251 1087 305"
            fill="#9c4bd5"
          />
          <!-- 紫色小三角色块 -->
          <path
            d="M1102 207 1163 170 1127 226"
            fill="#8d45d7"
          />
          <!-- 紫色小三角色块 -->
          <path
            d="M1186 158 1213 145 1204 171"
            fill="#d45bcf"
          />
          <!-- 紫色小三角色块（左下区域，主折线起点附近） -->
          <path
            d="M621 516 637 510 629 532"
            fill="#ba4cd2"
          />
          <!-- 橙色小三角色块 -->
          <path
            d="M648 633 660 624 665 637"
            fill="#e49b52"
          />
          <!-- 紫色小三角色块 -->
          <path
            d="M1013 538 1044 518 1032 556"
            fill="#a449ce"
          />
          <!-- 紫色小三角色块 -->
          <path
            d="M1060 588 1101 566 1083 610"
            fill="#b246d6"
          />
          <!-- 橙色描边小图形：右上区域的两条细描边折线，增加细节 -->
          <path
            d="M984 178 1005 192 1018 229 997 209"
            fill="none"
            stroke="#e99d50"
            stroke-width="3"
          />
          <path
            d="M981 211 947 235 971 276"
            fill="none"
            stroke="#e99d50"
            stroke-width="3"
          />
          <!-- 右上角的两条极短竖线，作为涂鸦点缀 -->
          <path
            d="M894 118 899 124"
            stroke="#c653ca"
            stroke-width="5"
            stroke-linecap="round"
          />
          <path
            d="M935 133 938 139"
            stroke="#8e47cf"
            stroke-width="3"
            stroke-linecap="round"
          />
        </g>
      </svg>

      <!-- 人物层：使用裁好的透明 PNG，不再用 CSS/SVG 拼人。 -->
      <!-- object-contain: 保持图片比例, 把整个图全部塞进容器里 -->
      <!-- object-bottom: 控制图片的对比区域, 这里是指容器的底部 -->
      <img
        src="/比企谷.png"
        alt="比企谷人物剪影"
        class="absolute bottom-[-4%] right-[-10%] z-20 h-[108%] w-[87%] object-contain object-bottom"
      >
    </article>
  </section>
</template>

<style scoped>
/* 注册本地字体：思源宋体可变字重版本，用作海报标题/正文的衬线字体 */
@font-face {
  font-family: "Noto Serif SC Poster";
  src: url("~/assets/fonts/NotoSerifSC-Variable.ttf") format("truetype");
  font-display: swap; /* 字体加载期间先用系统字体占位，避免白屏 */
}

/* 衬线字体工具类：优先使用自定义字体，降级到系统衬线字体 */
.font-poster-serif {
  font-family: "Noto Serif SC Poster", "Noto Serif SC", "Songti SC", serif;
}

.nihilist-poster {
  container-type: inline-size;
}

/*
 * 海报文字发光效果：
 * - 0 0 2px 白色描边让文字在深色背景上更清晰
 * - 0 0 8px 更大的模糊光晕增加柔光感
 */
.poster-title,
.poster-cn,
.poster-en {
  text-shadow:
    0 0 2px rgba(255, 255, 255, .65),
    0 0 8px rgba(255, 255, 255, .28);
}
</style>
