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
    })
  }
})
