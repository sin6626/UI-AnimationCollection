import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const itemSchema = z.object({
  title: z.string(),
  date: z.date(),
  description: z.string(),
  src: z.string()
})

const musicSchema = z.object({
  title: z.string(),
  name: z.string(),
  src: z.string(),
  avatar: z.string(),
  lrc: z.string(),
  order: z.number()
})

const rhythmSchema = z.object({
  id: z.string(),
  order: z.number(),
  title: z.string(),
  time: z.string(),
  startHour: z.number(),
  endHour: z.number(),
  icon: z.string(),
  tag: z.string()
})

export default defineContentConfig({
  collections: {
    music: defineCollection({
      type: 'data',
      source: 'music/*.yml',
      schema: musicSchema
    }),
    rhythm_zh: defineCollection({
      type: 'data',
      source: 'zh/rhythm/*.yml',
      schema: rhythmSchema
    }),
    rhythm_en: defineCollection({
      type: 'data',
      source: 'en/rhythm/*.yml',
      schema: rhythmSchema
    }),
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
