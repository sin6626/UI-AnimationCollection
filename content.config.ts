import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    images: defineCollection({
      type: 'page',
      source: 'images.yml',
      schema: z.object({
        images: z.array(z.object({
          src: z.string(),
          alt: z.string()
        }))
      })
    }),

    index: defineCollection({
      type:'page',
      source:'index.yml',
      schema: z.object({
        events: z.array(z.object({
          category: z.enum(['UI', 'Animation']),
          title: z.string(),
          date: z.date(),
          to: z.string(),
          src: z.string(),
          description: z.string()
        }))
      })

    }),

    ui: defineCollection({
      type:'page',
      source:'ui/*.yml',
      schema: z.object({
        title: z.string(),
        date: z.date(),
        description: z.string()
      })

    })

  }

})
