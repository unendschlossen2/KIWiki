import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().default(''),
    aliases: z.array(z.string()).optional().default([]),
    category: z.string().default('Allgemein'),
    tags: z.array(z.string()).optional().default([]),
    difficulties: z
      .array(z.enum(['easy', 'medium', 'hard']))
      .optional()
      .default(['easy', 'medium', 'hard']),
  }),
});

const info = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: "./src/content/info" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional().default(''),
  }),
});

export const collections = {
  articles,
  info,
};
