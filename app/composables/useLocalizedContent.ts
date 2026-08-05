import type { Collections } from '@nuxt/content'

export type ContentKind = 'ui' | 'animation'

export function localizedContentCollection(kind: ContentKind, locale: string): keyof Collections {
  return `${kind}_${locale === 'en' ? 'en' : 'zh'}` as keyof Collections
}

export function routeContentPath(path: string): string {
  return path.replace(/^\/en(?=\/|$)/, '')
}

export function queryLocalizedContentList(kind: ContentKind, locale: string) {
  return queryCollection(localizedContentCollection(kind, locale)).order('date', 'ASC').all()
}

export function queryLocalizedContentItem(kind: ContentKind, locale: string, path: string) {
  return queryCollection(localizedContentCollection(kind, locale)).path(routeContentPath(path)).first()
}

export function queryLocalizedContentSurround(kind: ContentKind, locale: string, path: string) {
  return queryCollectionItemSurroundings(localizedContentCollection(kind, locale), routeContentPath(path), {
    fields: ['title', 'description']
  }).order('date', 'ASC')
}
