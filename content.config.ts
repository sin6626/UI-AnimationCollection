import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const itemSchema = z.object({
  title: z.string(),
  date: z.date(),
  description: z.string(),
  src: z.string()
})

export default defineContentConfig({
  collections: {
    ui_zh: defineCollection({
      type: 'page',
      source: {
        include: 'zh/ui/*.yml',
        prefix: '/ui'
      },
      schema: itemSchema
    }),
    ui_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/ui/*.yml',
        prefix: '/ui'
      },
      schema: itemSchema
    }),
    animation_zh: defineCollection({
      type: 'page',
      source: {
        include: 'zh/animation/*.yml',
        prefix: '/animation'
      },
      schema: itemSchema
    }),
    animation_en: defineCollection({
      type: 'page',
      source: {
        include: 'en/animation/*.yml',
        prefix: '/animation'
      },
      schema: itemSchema
    })
  }
})
