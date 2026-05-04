import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updateDate: z.coerce.date().optional(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Tim Ekalliptus'),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    locale: z.enum(['id', 'en', 'ja', 'ko', 'ru', 'ar', 'tr']).default('id'),
    featured: z.boolean().default(false),
    seo: z.object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      noindex: z.boolean().default(false),
    }).optional(),
  }),
})

export const collections = { blog }
