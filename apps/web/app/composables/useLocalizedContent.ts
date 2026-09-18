import type { PageCollections } from '@nuxt/content'

/**
 * 内容类型枚举
 * - 'ui':        UI 组件相关内容
 * - 'animation': 动画相关内容
 *
 * 该联合类型用于区分"内容种类"，决定要查询哪一组集合。
 */
export type ContentKind = 'ui' | 'animation'

/**
 * 根据内容种类和语言，拼出对应的内容集合名称。
 *
 * 原理：Nuxt Content 会根据内容目录（如 `content/ui/zh`、`content/ui/en`）自动生成
 * 以目录名命名的集合（Collection），集合名的规则为 `${kind}_${locale}`。
 *
 * 例如：
 * - kind='ui',      locale='en' => 'ui_en'
 * - kind='ui',      locale='zh' => 'ui_zh'
 * - kind='animation', locale='en' => 'animation_en'
 * - kind='animation', locale='zh' => 'animation_zh'
 *
 * 由于本项目只支持中文（zh）与英文（en）两种语言，
 * 所以这里只要 locale 不是 'en'，就一律当作 'zh' 处理（默认中文兜底）。
 *
 * @param kind  内容类型（ui | animation）
 * @param locale 当前语言环境，例如 'zh' 或 'en'
 * @returns 对应页面集合的名称（keyof PageCollections 表示它是页面集合键）
 */

// keyof PageCollections: 只允许返回页面集合,避免 music 这类 data collection 混入页面查询类型
export function localizedContentCollection(kind: ContentKind, locale: string): keyof PageCollections {
  // 拼接集合名：`${kind}_${locale}`，其中非 'en' 的 locale 统一规范为 'zh'
  return `${kind}_${locale === 'en' ? 'en' : 'zh'}` as keyof PageCollections
}

/**
 * 将"带语言前缀的路由路径"转换为"集合内存储的标准内容路径"。
 *
 * 项目使用 `/en/xxx` 作为英文路由前缀，但内容集合内部（文档内容的 slug/path）
 * 是不带该前缀的。此函数负责把英文路由前缀 `/en` 去掉，得到真正的内容路径。
 *
 * 正则 `/^\/en(?=\/|$)/` 匹配：
 * - `/en/xxx` -> 去掉前缀后为 `/xxx`
 * - `/en`（恰好是 `/en` 结尾）-> 去掉前缀后为 ``
 * - 若不是以 `/en/` 或 `/en` 开头（如 `/ui/xxx`），则保持不变
 *
 * 使用"零宽断言" (?=\/|$)，确保只匹配 `/en` 紧跟斜杠或字符串结尾的情况，
 * 避免误伤类似 `/english/...` 这种以 "en" 开头的其它路径。
 *
 * @param path 带语言前缀的路由路径，例如 '/en/ui/button'
 * @returns 去掉英文前缀后的内容路径，例如 '/ui/button'
 */
export function routeContentPath(path: string): string {
  return path.replace(/^\/en(?=\/|$)/, '')
}

/**
 * 查询"当前语言下某个类型"的全部分内容列表（按日期升序）。
 *
 * 常用于生成 UI/动画的内容列表页。
 *
 * @param kind   内容类型（ui | animation）
 * @param locale 当前语言代码
 * @returns 一个查询对象，可通过 await 获取该类型全部内容（按 date 升序排列）
 */
export function queryLocalizedContentList(kind: ContentKind, locale: string) {
  return queryCollection(localizedContentCollection(kind, locale)).order('date', 'ASC').all()
}

/**
 * 查询"当前语言下某个类型"的单条内容（根据路由路径精确匹配）。
 *
 * 常用于内容详情页：根据当前路由 path 找出唯一一篇内容。
 * 注意：会根据路由路径去掉语言前缀（routeContentPath）后再去集合中匹配，
 * 以保证中英文共享同一套内容路径、只是分别存于不同集合。
 *
 * @param kind 内容类型（ui | animation）
 * @param locale 当前语言代码
 * @param path 当前路由路径（可能带 /en 前缀）
 * @returns 匹配到的单篇内容（若不存在则为 undefined/null，取决于实现）
 */
export function queryLocalizedContentItem(kind: ContentKind, locale: string, path: string) {
  return queryCollection(localizedContentCollection(kind, locale)).path(routeContentPath(path)).first()
}

/**
 * 查询"当前语言下某篇内容"的上下篇（周围内容），用于详情页的上一篇/下一篇导航。
 *
 * 只取最关键的 title（标题）与 description（描述）两个字段，避免携带过多数据。
 * 同样会先去掉路由中的语言前缀再匹配。
 *
 * @param kind 内容类型（ui | animation）
 * @param locale 当前语言代码
 * @param path 当前路由路径（例如 /en/ui/button）
 * @returns 当前内容的上一篇与下一篇查询结果（按 date 升序排列）
 */
export function queryLocalizedContentSurround(kind: ContentKind, locale: string, path: string) {
  return queryCollectionItemSurroundings(localizedContentCollection(kind, locale), routeContentPath(path), {
    fields: ['title', 'description']
  }).order('date', 'ASC')
}
